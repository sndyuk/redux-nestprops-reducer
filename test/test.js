const assert = require('assert');
const nestpropsReducer = require('../index');
const List = require('immutable').List;
const Map = require('immutable').Map;

const ACTION_A = 'A';
const ACTION_B = 'B';
const ACTION_C = 'C';
const ACTION_IGNORE = 'IGNORE';

const simpleReducer = (state, action) => {
  switch(action.type) {
    case ACTION_A:
      return 0;
    case ACTION_B:
      return {
        ...state,
        value: '000',
      };
    case ACTION_C:
      return state;
    default:
      return state;
  }
};


const reducer = nestpropsReducer(simpleReducer, [
  ACTION_A,
  ACTION_B,
  ACTION_C,
]);

it('simple premitive array', function() {
  const state = {
    array: [1, 2, 3],
    decoy: 1,
  };
  const listReducer = reducer(['array', 2]);
  const action = { type: ACTION_A };
  assert.deepEqual(listReducer(state, action),
  { 
    array: [1, 2, 0],
    decoy: 1,
  });
});

it('array in object', function() {
  const state = {
    obj: {
      array: [1, 2, 3],
      decoy: 1,
    },
    decoy: 1,
  };

  const listReducer = reducer(['obj', 'array', 2]);
  const action = { type: ACTION_A };
  assert.deepEqual(listReducer(state, action),
  {
    obj: {
      array: [1, 2, 0],
      decoy: 1,
    },
    decoy: 1,
  });
});

it('object in array', function() {
  const state = {
    array: [{ id: 1, value: '100' }, { id: 2, value: '101' }, { id: 3, value: '102' }],
    decoy: 1,
  };

  const listReducer = reducer(['array', 1]);
  const action = { type: ACTION_B };
  assert.deepEqual(listReducer(state, action),
  {
    array: [{ id: 1, value: '100' }, { id: 2, value: '000' }, { id: 3, value: '102' }],
    decoy: 1,
  });
});

it('syntax suger: non array arguments', function() {
  const state = {
    array: [{ id: 1, value: '100' }, { id: 2, value: '101' }, { id: 3, value: '102' }],
    decoy: 1,
  };

  const listReducer = reducer('array', 1);
  const action = { type: ACTION_B };
  assert.deepEqual(listReducer(state, action),
  {
    array: [{ id: 1, value: '100' }, { id: 2, value: '000' }, { id: 3, value: '102' }],
    decoy: 1,
  });
});

it('key as function', function() {
  const state = {
    array: [1, 2, 3],
    decoy: 1,
  };

  const listReducer = reducer('array', () => 1);
  const action = { type: ACTION_A };
  assert.deepEqual(listReducer(state, action),
  {
    array: [1, 0, 3],
    decoy: 1,
  });
});

it('null value', function() {
  const state = {
    array: null,
    decoy: 1,
  };

  const listReducer = reducer('array', 1);
  const action = { type: ACTION_A };
  assert.deepEqual(listReducer(state, action),
  {
    array: null,
    decoy: 1,
  });
});

it('immutable list', function() {
  const state = {
    list: List([1, 2, 3]),
    decoy: 1,
  };

  const listReducer = reducer('list', 1);
  const action = { type: ACTION_A };
  assert.deepEqual(JSON.stringify(listReducer(state, action)),
  JSON.stringify({
    list: List([1, 0, 3]),
    decoy: 1,
  }));
});

it('immutable map', function() {
  const state = {
    map: Map([['key1', 1], ['key2', 2], ['key3', 3]]),
    decoy: 1,
  };

  const listReducer = reducer('map', 'key2');
  const action = { type: ACTION_A };
  assert.equal(JSON.stringify(listReducer(state, action)),
  JSON.stringify({
    map: Map([['key1', 1], ['key2', 0], ['key3', 3]]),
    decoy: 1,
  }));
});


it('nothing changed', function() {
  const state = {
    array: [0, 1, 2],
    decoy: 1,
  };

  const listReducer = reducer('array', 1);
  const action = { type: ACTION_C };
  assert.equal(listReducer(state, action), state);
});

it('ignored action', function() {
  const state = {
    array: [0, 1, 2],
    decoy: 1,
  };

  const listReducer = reducer('array', 1);
  const action = { type: ACTION_IGNORE };
  assert.equal(listReducer(state, action), state);
});

it('apply all to first prop', function() {
  const state = [{ key: 1 }, { key: 2 }, { key: 3 }];

  const listReducer = reducer(null, 'key');
  const action = { type: ACTION_A };
  assert.deepEqual(listReducer(state, action),
    [{ key: 0 }, { key: 0 }, { key: 0 }]
  );
});

it('apply all to last prop', function() {
  const state = {
    array: [1, 2, 3],
    decoy: 1,
  };

  const listReducer = reducer('array', null);
  const action = { type: ACTION_A };
  assert.deepEqual(listReducer(state, action),
  {
    array: [0, 0, 0],
    decoy: 1,
  });
});

it('apply all to intermediate prop', function() {
  const state = {
    array: [{ key: 1 }, { key: 2 }, { key: 3 }],
    decoy: 1,
  };

  const listReducer = reducer('array', null, 'key');
  const action = { type: ACTION_A };
  assert.deepEqual(listReducer(state, action),
  {
    array: [{ key: 0 }, { key: 0 }, { key: 0 }],
    decoy: 1,
  });
});
