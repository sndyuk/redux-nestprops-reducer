const hasValue = v => v !== null && typeof v !== 'undefined';
const isImmutable = v => !!v['@@__IMMUTABLE_ITERABLE__@@'];
const extractKey = (key, value, action) => typeof key === 'function' ? key(value, action) : key;
const extractValue = (state, key) => {
  if (!hasValue(key) || !hasValue(state)) return state;
  if (isImmutable(state)) return state.get(key);
  return state[key];
};

const apply = (reducer, state, action, key) => {
  if (!hasValue(key)) {
    if (state && state.map) {
      return state.map(v => reducer(v, action));
    }
    return reducer(state, action);
  }
  if (key === -1 || !hasValue(state)) return state;
  if (state.constructor === Array) {
    const newValue = reducer(state[key], action);
    if (state[key] === newValue) return state;
    const copy = state.slice(0);
    copy[key] = newValue;
    return copy;
  }
  if (isImmutable(state)) {
    const newValue = reducer(state.get(key), action);
    if (state.get(key) === newValue) return state;
    return state.set(key, newValue);
  }
  const newValue = reducer(state[key], action);
  if (state[key] === newValue) return state;
  return Object.assign({}, state, { [key]: newValue });
};

const dig = (state, action, kfn, rest) => (applyer) => {
  if (!hasValue(state) && rest.length >= 1) return state;
  const key = extractKey(kfn, state, action);
  if (rest.length === 0) return applyer(key, state);
  if (!hasValue(key)) {
    if (state && state.map) {
      let modified = false;
      const newState = state.map(v => {
        const newState = dig(v, action, rest[0], rest.slice(1))(applyer);
        if (!modified && v !== newState) modified = true;
        return newState;
      });
      return modified ? newState : state;
    }
    return state;
  } else {
    const newState = dig(extractValue(state, key), action, rest[0], rest.slice(1))(applyer);
    if (state === newState) return state;
    return apply(() => newState, state, null, key);
  }
};

const nestedReducer = (reducer, acceptActions, initialState = null) => (...args) => {
  const keys = hasValue(args[0] && args[0].reduce) ? args[0] : [...args];
  return (state = initialState, action) => {
    if (!acceptActions.includes(action.type)) return state;
    return dig(state, action, keys[0], keys.slice(1))((k, state) => apply(reducer, state, action, k));
  };
};

module.exports = exports = nestedReducer;
module.exports.reduceReducers = (...reducers) => (prev, curr) => reducers.reduce(
  (p, r) => r(p, curr),
  prev,
);
