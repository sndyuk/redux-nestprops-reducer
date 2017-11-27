# redux-nestprops-reducer v1.0.2

It makes a complex reducer simpler.

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
const reducer = nestpropsReducer(reducer, [whitelist actions])(identifiers);
```


### Case: use a reducer for multiple objects.
```js
//--- Sample state
const complexState = {
  allArticles: [
    { id: 1, value: 1 },
    { id: 2, value: 2, popular: false },
    { id: 3, value: 3 },
  ],
  popularArticlues: [
    { id: 2, value: 2, popular: false },
  ],
};

//--- Sample reducer
const SET_POPULAR = 'SET_POPULAR';
const articlueReducer = (state, action) => {
  switch(action.type) {
    SET_POPULAR:
      return {
        ...state,
        popular: action.popular,
      };
    default:
      return state;
  }
};

const articlesReducer = nestpropsReducer(articlueReducer, [SET_POPULAR])
  ((state, action) => state.findIndex(f => f.id === action.id));

/* store would be like this:
const store = createStore(
  combineReducers({
    allArticles: articlueReducer,
    popularArticles: articlueReducer,
  });
});
*/

// In this case if the action is dispatched.
dispatch({ type: SET_POPULAR, id: 2, popular: true });
// the state is going to be:
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

const articleReducer = nestpropsReducer(articlueReducer, [SET_POPULAR]);

const store = createStore(
  combineReducers({
    categories: articlueReducer(
      (state, action) => state.findIndex(s => s.category === action.category),
      (state, action) => state.findIndex(s => s.id === action.id)
    ),
  });
});



// Identifier can be null:
const store = createStore(
  combineReducers({
    categories: articlueReducer(
      null, // null indicates that the list('categories list') may need to be applied an action.
      (state, action) => state.findIndex(f => f.id === action.id)
    ),
  });
});
```

### Case: Immutable map and list
```js
const complexState = {
  articles: Map([
    [1, { title: '...', comments: List(['...', '...']) }],
    [2, { title: '...', comments: List(['...', '...']) }],
    [3, { title: '...', comments: List(['...', '...']) }],
  ]),
};

const articleReducer = nestpropsReducer(articlueReducer, [SET_POPULAR]);
const store = createStore(
  combineReducers({
    articles: articlueReducer(
      null, // null indicates that the list('categories list') may need to be applied an action.
      (state, action) => state.findIndex(f => f.id === action.id)
    ),
  });
});
```
