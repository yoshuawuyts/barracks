# barracks
[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

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
```bash
$ npm i --save barracks
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

In the example below `users_initalize` will delegate execution to `user_add` and
`user_listen` before proceeding to execute its own code.
```js
var userStore = require('simple-store')('user');
var socket = require('sockjs-client');
var request = require('request');

// Initialize dispatcher.

var dispatcher = barracks({
  users: {
    initialize: function(next) {
      var arr = ['user_add', 'user_listen'];
      this.waitFor(arr, function() {
        console.log('initialized');
        next();
      });
    },
    add: function(next) {
      request('myapi.co/api/users', function(err, res) {
        userStore.set(res);
        next();
      });
    },
    listen: function(next) {
      var sock = new socket('myapi.co/api/socket');
      sock.onMessage(console.log);
      next();
    }
  }
});

// Initialize the users store.

dispatcher('users_initialize');
```

#### ctx.payload
`ctx.payload` contains the data provided by `dispatcher()`.
```js
var dispatcher = barracks({
  users: {
    init: function(next) {
      console.log(this.payload);
    }
  }
});

// Initialize the users store.

dispatcher('users_init', 'fooBar');
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
  users: {
    add: function(next) {
      request('myapi.co/api/auth', function(err, res) {
        this.locals.token = res.token;
        next();
      });
    },
    fetch: function(next) {
      this.waitFor(['user_add'], function() {
        var url = 'myapi.co/me?token=' + this.locals.token;
        request(url, handleRequest);
      });

      function handleRequest(err, res) {
        console.log(res);
        next();
      }
    }
  }
});

// Get user data from server.

dispatcher('user_fetch');
```

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
