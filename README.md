# barracks
[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

Event dispatcher for the [flux architecture][flux]. Provides event composition
through `this.waitFor()` and checks for circular dependencies with a small
interface of only 3 functions.

```
╔═════╗        ╔════════════╗       ╔════════╗       ╔═════════════════╗
║ API ║<──────>║ Middleware ║──────>║ Stores ║──────>║ View Components ║
╚═════╝        ╚════════════╝       ╚════════╝       ╚═════════════════╝
                     ^                                        │
                     │                                        │
               ╔════════════╗                                 │
               ║ Dispatcher ║                                 │
               ╚════════════╝                                 │
                     ^                                        │
                     └────────────────────────────────────────┘
```

## Installation
```sh
npm install barracks
```

## Overview
````js
var barracks = require('barracks');

// Initialize dispatcher.

var dispatcher = barracks({
  users: {
    add: function(next) {
      console.log(user + ' got added');
      next();
    }
  },
  courses: {
    get: function(next) {
      console.log('Get ' + this.payload);
      next();
    },
    set: function(next) {
      console.log('Set ' + this.payload);
      next();
    }
  }
});

// Dispatch an event.

dispatcher('users_add', 'Loki');
// => 'Loki got added'
````

## API
#### dispatcher = barracks(actions)
Initialize a new `barracks` instance. Returns a function.
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

#### dispatcher(action, data)
`barracks()` returns a dispatcher function which can be called to dispatch an
action. By dispatching an action you call the corresponding function from
the dispatcher and pass it data. You can think of it as just calling a
function.

In order to access namespaced functions you can delimit your string with
underscores. So to access `courses.get` you'd dispatch the string `courses_get`.
````js
// Call a non-namespaced action.
dispatcher('group', [123, 'hello']);

// Call a namespaced action.
dispatcher('users_add', {foo: 'bar'});
````

#### ctx.waitFor(action)
Execute another function within the dispatcher before proceeding. Registered
callbacks are always bound to the scope of the dispatcher, so you can just
call `this.waitFor` to access the function from within a registered callback.
```js
var dispatcher = barracks({
  init: function(next) {
    this.waitFor(['add', 'listen'], function() {
      console.log('3');
      next();
    });
  },
  add: function(next) {
    setTimeout(function() {
      console.log('2');
      done();
    }, 10);
  },
  listen: function(next) {
    console.log('3');
    next();
  }
});

dispatcher('init');
// => 1 2 3
```

#### ctx.payload
`this.payload` contains the data provided by `dispatcher()`.
```js
var dispatcher = barracks({
  init: function(next) {
    console.log(this.payload);
  }
});

dispatcher('init', 'fooBar');
// -> console.log: 'fooBar'
```

#### ctx.locals=
`this.locals` is shared between all (delegated) function calls and acts as the
location to share data between function calls. For example when you retrieve
a token from a store and want to make it available to all subsequent functions.

The payload provided by `dispatcher()` is available under `this.locals.payload`.
```js
var request = require('request');

// Initialize dispatcher.

var dispatcher = barracks({
  add: function(next) {
    request('myapi.co/api/auth', function(err, res) {
      this.locals.token = res.token;
      next();
    });
  },
  fetch: function(next) {
    this.waitFor(['add'], function() {
      var url = 'myapi.co/me?token=' + this.locals.token;
      request(url, handleRequest);
    });

    function handleRequest(err, res) {
      console.log(res);
      next();
    }
  }
});

// Get user data from server.

dispatcher('fetch');
```

## License
[MIT](https://tldrlegal.com/license/mit-license)

[npm-image]: https://img.shields.io/npm/v/barracks.svg?style=flat-square
[npm-url]: https://npmjs.org/package/barracks
[travis-image]: https://img.shields.io/travis/yoshuawuyts/barracks.svg?style=flat-square
[travis-url]: https://travis-ci.org/yoshuawuyts/barracks
[coveralls-image]: https://img.shields.io/coveralls/yoshuawuyts/barracks.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/yoshuawuyts/barracks?branch=master
[downloads-image]: http://img.shields.io/npm/dm/barracks.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/barracks

[flux]: http://facebook.github.io/react/blog/2014/05/06/flux.html
[browserify]: https://github.com/substack/node-browserify
