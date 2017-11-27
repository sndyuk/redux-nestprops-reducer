const hasValue = v => v !== null && typeof v !== 'undefined';
const extractKey = (key, value, action) => typeof key === 'function' ? key(value, action) : key;
const isImmutable = v => !!v['@@__IMMUTABLE_ITERABLE__@@'];

const apply = (reducer, state, action, key) => {
  if (!hasValue(key)) {
    return reducer(state, action);
  }
  if (!hasValue(state)) return state;
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
  return {
    ...state,
    [key]: newValue,
  };
};

const dig = (state, action, parentKey, rest) => (applyer) => {
  const value = hasValue(parentKey) ? (hasValue(state) ? state[extractKey(parentKey, state, action)] : state) : state;
  if (rest.length === 1) return applyer(extractKey(rest[0], value, action), value);
  const newValue = dig(value, action, rest[0], rest.slice(1))(applyer);
  if (value === newValue) return value;
  return apply(() => newValue, value, null, extractKey(rest[0], newValue, action));
};

const nestedReducer = (reducer, acceptActions) => (...args) => {
  const keys = hasValue(args[0].reduce) ? args[0] : [...args];
  debugger
  return (state, action) => {
    if (!acceptActions.includes(action.type)) return state;
    return dig(state, action, null, keys)((k, v) => apply(reducer, v, action, k));
  };
};

module.exports = exports = nestedReducer;
