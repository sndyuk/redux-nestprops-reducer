'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var hasValue = function hasValue(v) {
  return v !== null && typeof v !== 'undefined';
};
var isImmutable = function isImmutable(v) {
  return !!v['@@__IMMUTABLE_ITERABLE__@@'];
};
var extractKey = function extractKey(key, value, action) {
  return typeof key === 'function' ? key(value, action) : key;
};
var extractValue = function extractValue(state, key) {
  if (!hasValue(key) || !hasValue(state)) return state;
  if (isImmutable(state)) return state.get(key);
  return state[key];
};

var apply = function apply(reducer, state, action, key) {
  if (!hasValue(key)) {
    if (state && state.map) {
      return state.map(function (v) {
        return reducer(v, action);
      });
    }
    return reducer(state, action);
  }
  if (key === -1 || !hasValue(state)) return state;
  if (state.constructor === Array) {
    var _newValue = reducer(state[key], action);
    if (state[key] === _newValue) return state;
    var copy = state.slice(0);
    copy[key] = _newValue;
    return copy;
  }
  if (isImmutable(state)) {
    var _newValue2 = reducer(state.get(key), action);
    if (state.get(key) === _newValue2) return state;
    return state.set(key, _newValue2);
  }
  var newValue = reducer(state[key], action);
  if (state[key] === newValue) return state;
  return _extends({}, state, _defineProperty({}, key, newValue));
};

var dig = function dig(state, action, kfn, rest) {
  return function (applyer) {
    if (!hasValue(state) && rest.length >= 1) return state;
    var key = extractKey(kfn, state, action);
    if (rest.length === 0) return applyer(key, state);
    if (!hasValue(key)) {
      if (state && state.map) {
        var modified = false;
        var newState = state.map(function (v) {
          var newState = dig(v, action, rest[0], rest.slice(1))(applyer);
          if (!modified && v !== newState) modified = true;
          return newState;
        });
        return modified ? newState : state;
      }
      return state;
    } else {
      var _newState = dig(extractValue(state, key), action, rest[0], rest.slice(1))(applyer);
      if (state === _newState) return state;
      return apply(function () {
        return _newState;
      }, state, null, key);
    }
  };
};

var nestedReducer = function nestedReducer(reducer, acceptActions) {
  var initialState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var keys = hasValue(args[0] && args[0].reduce) ? args[0] : [].concat(args);
    return function () {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
      var action = arguments[1];

      if (!acceptActions.includes(action.type)) return state;
      return dig(state, action, keys[0], keys.slice(1))(function (k, state) {
        return apply(reducer, state, action, k);
      });
    };
  };
};

module.exports = exports = nestedReducer;
module.exports.reduceReducers = function () {
  for (var _len2 = arguments.length, reducers = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    reducers[_key2] = arguments[_key2];
  }

  return function (prev, curr) {
    return reducers.reduce(function (p, r) {
      return r(p, curr);
    }, prev);
  };
};
