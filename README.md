# Barracks
[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

An event dispatcher for the [flux architecture][flux]. Best used with
[browserify][browserify].

## Installation
```bash
$ npm i --save barracks
```

## Overview
````js
/**
 * Initialize a dispatcher.
 */

var barracks = require('barracks');
var dispatcher = barracks({
  users: {
    add: function(usr) {console.log(usr + ' got added')},
    remove: function() {}
  },
  courses: {
    get: function() {},
    put: function() {}
  }
});

/**
 * Dispatch an event.
 */

dispatcher('users_add', 'Loki');
// => 'Loki got added'
````

## API
#### barracks(actions)
Initialize a new `barracks` instance. The `actions` object should contain
functions, namespaced at most one level deep. Returns a function.
```js
// Initialize without namespaces.
var dispatcher = barracks({
  user: function() {},
  group: function() {}
});

// Initialize with namespaces.
var dispatcher = barracks({
  users: {
    add: function() {},
    remove: function() {}
  },
  courses: {
    get: function() {},
    put: function() {}
  }
});
```

#### barracks(actions)(event, data)
`barracks()` returns a dispatcher function which can be called to dispatch an
action. By dispatching an action you call the corresponding function from
the dispatcher and pass it the data. You can think of it as just calling a
function.

In order to access namespaced functions you can delimit your string with
underscores. So to access `courses.get` you'd dispatch the string `courses_get`.

Keep in mind that since you can only namespace 1 level deep, your dispatched
actions should have no more than one underscore in them.
````js
// Call a non-namespaced action.
dispatcher('group', [123, 'hello']);

// Call a namespaced action.
dispatcher('users_add', {foo: 'bar'});
````

## License
[MIT](https://tldrlegal.com/license/mit-license) © [Yoshua Wuyts](yoshuawuyts.com)

[npm-image]: https://img.shields.io/npm/v/barracks.svg?style=flat-square
[npm-url]: https://npmjs.org/package/barracks
[travis-image]: https://img.shields.io/travis/yoshuawuyts/barracks.svg?style=flat-square
[travis-url]: https://travis-ci.org/yoshuawuyts/barracks
[coveralls-image]: https://img.shields.io/coveralls/yoshuawuyts/barracks.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/yoshuawuyts/barracks?branch=master

[flux]: http://facebook.github.io/react/blog/2014/05/06/flux.html
[browserify]: https://github.com/substack/node-browserify
