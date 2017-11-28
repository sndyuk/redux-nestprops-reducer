# redux-nestprops-reducer v1.0.6

It makes a complex reducer simpler.

If you want to change the `disabled` flag of a one of the comments of the state below to `true`,
```js
{
  articles: Map([
    ['Sea', { title: '...', comments: List([{ id: 1, disabled: false  }, { id: 2, disabled: false }]) }],
    ['Sports', { title: '...', comments: List([{ id: 1, disabled: false }, { id: 2, disabled: false }]) }]
  ])
}
```

define the reducer
```js
const DISABLE = 'DISABLE';
const commentReducer = (state = {}, action) => {
  switch(action.type) {
    case DISABLE:
      return {
        ...state,
        disabled: true,
      };
    default:
      return state;
  }
};

...

combineReducers({
  articles: nestpropsReducer(commentReducer, [ENABLE, DISABLE])(
    (state, action) => state.findKey((v, k) => k === action.category),
    'comments',
    (state, action) => state.findIndex(s => s.id === action.id),
  ),
}),

...
// then dispatch the action
store.dispatch({ type: DISABLE, category: 'Sea', id: 2 });
/*
{
  articles: Map([
    ['Sea', { title: '...', comments: List([{ id: 1, disabled: false  }, { id: 2, disabled: true }]) }],
    ['Sports', { title: '...', comments: List([{ id: 1, disabled: false }, { id: 2, disabled: false }]) }]
  ])
}
*/
```

## Installation

Using npm:
```shell
$ npm i --save redux-nestprops-reducer
```

## Usage

```js
import nestpropsReducer from 'redux-nestprops-reducer';
// < ES6: var nestpropsReducer = require('redux-nestprops-reducer');


/**
・whitelist actions are actions of the reducer.
・identifiers can be string, number, or function. The function must return an identifier of the parent object.
*/
const reducer = nestpropsReducer(reducer, [whitelist actions], initialState)(identifiers);
```


### Case: use a reducer for multiple objects.
```js
const nestpropsReducer = require('redux-nestprops-reducer');
const createStore = require('redux').createStore;
const combineReducers = require('redux').combineReducers;

//--- Sample state
const complexState = {
  allArticles: [
    { id: 1, value: 1 },
    { id: 2, value: 2, popular: false },
    { id: 3, value: 3 },
  ],
  popularArticles: [
    { id: 2, value: 2, popular: false },
  ],
};

//--- Sample reducer
const SET_POPULAR = 'SET_POPULAR';
const articleReducer = (state = {}, action) => {
  switch(action.type) {
    case SET_POPULAR:
      return {
        ...state,
        popular: action.popular,
      };
    default:
      return state;
  }
};

const articlesReducer = nestpropsReducer(articleReducer, [SET_POPULAR])
  ((state, action) => state.findIndex(f => f.id === action.id));

const store = createStore(combineReducers({
    allArticles: articleReducer,
    popularArticles: articleReducer,
}), complexState);


const action = { type: SET_POPULAR, id: 2, popular: true };
store.dispatch(action);

console.log(store.getState());
/*
{
  allArticles: [
    { id: 1, value: 1 },
    { id: 2, value: 2, popular: true },
    { id: 3, value: 3 },
  ],
  popularArticlues: [
    { id: 2, value: 2, popular: true },
  ],
};
*/
```

### Case: Nested list.
```js
const complexState = {
  categories: [
    {
      category: 'Sea',
      popularArticlues: [{ id: 2, value: 2, popular: false }],
    },
    {
      category: 'Sports',
      popularArticlues: [{ id: 2, value: 2, popular: false }],
    },
  ]
};

//--- Sample reducer
const SET_POPULAR = 'SET_POPULAR';
const articleReducer = (state = {}, action) => {
  switch(action.type) {
    case SET_POPULAR:
      return {
        ...state,
        popular: action.popular,
      };
    default:
      return state;
  }
};
const articlesReducer = nestpropsReducer(articleReducer, [SET_POPULAR]);

const store = createStore(
  combineReducers({
    categories: articlesReducer(
      (state, action) => state.findIndex(s => s.category === action.category),
      'popularArticlues',
      (state, action) => state.findIndex(s => s.id === action.id)
    ),
  }),
complexState);
const action = { type: SET_POPULAR, category: 'Sports', id: 2, popular: true };
store.dispatch(action);
console.log(store.getState());
/*
{
  categories: [
    {
      category: 'Sea',
      popularArticlues: [{ id: 2, value: 2, popular: false }],
    },
    {
      category: 'Sports',
      popularArticlues: [{ id: 2, value: 2, popular: true }],
    },
  ]
}
*/

// Identifier can be null:
const store = createStore(
  combineReducers({
    categories: articlesReducer(
      null, // null indicates that the list('categories list') may need to be applied an action.
      'popularArticlues',
      (state, action) => state.findIndex(f => f.id === action.id)
    ),
  });
});
const action = { type: SET_POPULAR, category: 'Sports', id: 2, popular: true };
store.dispatch(action);
console.log(store.getState());
/*
{
  categories: [
    {
      category: 'Sea',
      popularArticlues: [{ id: 2, value: 2, popular: true }],
    },
    {
      category: 'Sports',
      popularArticlues: [{ id: 2, value: 2, popular: true }],
    },
  ]
}
*/
```

### Case: Immutable map and list
```js
const complexState = {
  articles: Map([
    ['Sea', { title: '...', comments: List([{ id: 1, disabled: false  }, { id: 2, disabled: false }]) }],
    ['Sports', { title: '...', comments: List([{ id: 1, disabled: false }, { id: 2, disabled: false }]) }],
  ]),
};

const COMMENT_DISABLED = 'COMMENT_DISABLED';
const commentReducer = (state = {}, action) => {
  switch(action.type) {
    case COMMENT_DISABLED:
      return {
        ...state,
        disabled: true,
      };
    default:
      return state;
  }
};

const articlesReducer = nestpropsReducer(commentReducer, [COMMENT_DISABLED]);
const store = createStore(
  combineReducers({
    articles: articlesReducer(
      'Sea',
      'comments',
      (state, action) => state.findIndex(s => s.id === action.id),
    ),
  }),
  complexState,
);
const action = { type: COMMENT_DISABLED, id: 2 };
store.dispatch(action);
console.log(store.getState());
/*
{
  articles: Map([
    ['Sea', { title: '...', comments: List([{ id: 1, disabled: false  }, { id: 2, disabled: true }]) }],
    ['Sports', { title: '...', comments: List([{ id: 1, disabled: false }, { id: 2, disabled: false }]) }],
  ]),
}
*/
```
