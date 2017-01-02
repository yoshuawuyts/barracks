# barracks
[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

Action dispatcher for unidirectional data flows. Creates tiny models of data
that can be accessed with actions through a small API.

## Usage
````js
const barracks = require('barracks')

const store = barracks()

store.use({
  onError: (err, state, createSend) => {
    console.error(`error: ${err}`)
  },
  onAction: (state, data, name, caller, createSend) => {
    console.log(`data: ${data}`)
  },
  onStateChange: (state, data, prev, caller, createSend) => {
    console.log(`state: ${prev} -> ${state}`)
  }
})

store.model({
  namespace: 'cakes',
  state: {},
  effects: {},
  reducers: {},
  subscriptions: {}
})

const createSend = store.start({ subscriptions: true })
const send = createSend('myDispatcher', true)
document.addEventListener('DOMContentLoaded', () => {
  store.start() // fire up subscriptions
  const state = store.state()
  send('foo:start', { name: 'Loki' })
})
````

## API
### store = barracks(hooks?)
Initialize a new `barracks` instance. Takes an optional object of hooks which
is passed to `.use()`.

### store.use(hooks)
Register new hooks on the store. Hooks are little plugins that can extend
behavior or perform actions at specific points in the life cycle. The following
hooks are possible:
- __models:__ an array of models that will be merged with the store.
- __onError(err, state, createSend):__ called when an `effect` or
  `subscription` emit an error; if no hook is passed, the default hook will
  `throw` on each error
- __onAction(state, data, name, caller, createSend):__ called when an `action`
  is fired
- __onStateChange(state, data, prev, caller, createSend):__ called after a
  reducer changes the `state`.
- __wrapSubscriptions(fn):__ wraps a `subscription` to add custom behavior
- __wrapReducers(fn):__ wraps a `reducer` to add custom behavior
- __wrapEffects(fn):__ wraps an `effect` to add custom behavior
- __wrapInitialState(obj):__ mutate the initial `state` to add custom
  behavior - useful to mutate the state before starting up

`createSend()` is a special function that allows the creation of a new named
`send()` function. The first argument should be a string which is the name, the
second argument is a boolean `callOnError` which can be set to `true` to call
the `onError` hook instead of a provided callback. It then returns a
`send(actionName, data?)` function.

The `wrap*` hooks are synchronously resolved when the `store.start()` method is
called, and the corresponding values from the models are loaded. All wrap hooks
(or wrappers) are passed the argument that would usually be called, so it can
be wrapped or modified. Say we want to make all our `reducers` print `'golden
pony'` every time they're run, we'd do:
```js
const barracks = require('barracks')
const store = barracks()

store.use({
  wrapReducers: function wrapConstructor (reducer) {
    return function wrapper (state, data) {
      console.log('golden pony')
      return reducer(state, data)
    }
  }
})
```

Hooks should be used with care, as they're the most powerful interface into
the state. For application level code, it's generally recommended to delegate to
actions inside models using the `send()` call, and only shape the actions
inside the hooks.

### store.model()
Register a new model on the store. Models are optionally namespaced objects
with an initial `state` and handlers for dealing with data:
- __namespace:__ namespace the model so that it cannot access any properties
  and handlers in other models
- __state:__ initial values of `state` inside the model
- __reducers:__ synchronous operations that modify state; triggered by `actions`
- __effects:__ asynchronous operations that don't modify state directly;
  triggered by `actions`, can call `actions`
- __subscriptions:__ asynchronous read-only operations that don't modify state
  directly; can call `actions`

`state` within handlers is immutable through `Object.freeze()` and thus cannot
be modified. Return data from `reducers` to modify `state`. See [handler
signatures](#handler-signatures) for more info on the handlers.

For debugging purposes, internal references to values can be inspected through a
series of private accessors:
- `store._subscriptions`
- `store._reducers`
- `store._effects`
- `store._models`

### state = store.state(opts)
Get the current state from the store. Opts can take the following values:
- __freeze:__ default: true; set to false to not freeze state in handlers
  using `Object.freeze()`; useful for optimizing performance in production
  builds
- __state:__ pass in a state object that will be merged with the state returned
  from the store; useful for rendering in Node

### send = createSend(name) = store.start(opts)
Start the store and get a `createSend(name)` function. Pass a unique `name` to
`createSend()` to get a `send()` function. Opts can take the following values:
- __subscriptions:__ default: true; set to false to not register
  `subscriptions` when starting the application; useful to delay `init`
  functions until the DOM has loaded
- __effects:__ default: true; set to `false` to not register `effects` when
  starting the application; useful when only wanting the initial `state`
- __reducers:__ default: true; set to false to not register `reducers` when
  starting the application; useful when only wanting the initial `state`

If the store has disabled any of the handlers (e.g. `{ reducers: false }`),
calling `store.start()` a second time will register the remaining values. This
is useful if not everything can be started at the same time (e.g. have
`subscriptions` wait for the `DOMContentLoaded` event).

### send(name, data?)
Send a new action to the models with optional data attached. Namespaced models
can be accessed by prefixing the name with the namespace separated with a `:`,
e.g. `namespace:name`.

### store.stop()

After an app is "stopped" all subsequent `send()` calls become no-ops.

```js
store.stop()
send('trimBeard') // -> does not call a reducer/effect
```

## Handler signatures
These are the signatures for the properties that can be passed into a model.

### namespace
An optional string that causes `state`, `effects` and `reducers` to be
prefixed.

```js
app.model({
  namespace: 'users'
})
```

### state
State can either be a value or an object of values that is used as the initial
state for the application. If namespaced the values will live under
`state[namespace]`.
```js
app.model({
  namespace: 'hey',
  state: { foo: 'bar' }
})
app.model({
  namespace: 'there',
  state: { bin: [ 'beep', 'boop' ] }
})
app.model({
  namespace: 'people',
  state: 'oi'
}})
```

### reducers
Reducers are synchronous functions that return a value synchronously. No
eventual values, just values that are relevant for the state. It takes two
arguments of `data` and `state`. `data` is the data that was emitted, and
`state` is the current state. Each action has a name that can be accessed
through `send(name)`, and when under a namespace can be accessed as
`send(namespace:name)`. When operating under a namespace, reducers only have
access to the state within the namespace.
```js
// some model
app.model({
  namespace: 'plantcake',
  state: {
    enums: [ 'veggie', 'potato', 'lettuce' ]
    paddie: 'veggie'
  }
})

// so this model can't access anything in the 'plantcake' namespace
app.model({
  namespace: 'burlybeardos',
  state: { count: 1 },
  reducers: {
    feedPlantcake: (state, data) => {
      return { count: state.count + 1 }
    },
    trimBeard: (state, data) => ({ count: state.count - 1 })
  }
})
```

### effects
`effects` are asynchronous methods that can be triggered by `actions` in
`send()`. They never update the state directly, but can instead do thing
asynchronously, and then call `send()` again to trigger a `reducer` that can
update the state. `effects` can also trigger other `effects`, making them fully
composable. Generally, it's recommended to only have `effects` without a
`namespace` call other `effects`, as to keep namespaced models as isolated as
possible.

When an `effect` is done executing, or encounters an error, it should call the
final `done(err)` callback. If the `effect` was called by another `effect` it
will call the callback of the caller. When an error propagates all the way to
the top, the `onError` handler will be called, registered in
`barracks(handlers)`. If no callback is registered, errors will `throw`.

Having callbacks in `effects` means that error handling can be formalized
without knowledge of the rest of the application leaking into the model. This
also causes `effects` to become fully composable, which smooths parallel
development in large teams, and keeps the mental overhead low when developing a
single model.

```js
const http = require('xhr')
const app = barracks({
  onError: (state, data, prev, send) => send('app:error', data)
})

app.model({
  namespace: 'app',
  effects: {
    error: (state, data, send, done) => {
      // if doing http calls here be super sure not to get lost
      // in a recursive error handling loop: remember this IS
      // the error handler
      console.error(data.message)
      done()
    }
  }
})

app.model({
  namespace: 'foo',
  state: { foo: 1 },
  reducers: {
    moreFoo: (state, data) => ({ foo: state.foo + data.count })
  }
  effects: {
    fetch: (state, data, send, done) => {
      http('foobar.com', function (err, res, body) {
        if (err || res.statusCode !== 200) {
          return done(new Error({
            message: 'error accessing server',
            error: err
          }))
        } else {
          send('moreFoo', { count: foo.count }, done)
        }
      })
    }
  }
})
```

### subscriptions
`subscriptions` are read-only sources of data. This means they cannot be
triggered by actions, but can emit actions themselves whenever they want. This
is useful for stuff like listening to keyboard events or incoming websocket
data. They should generally be started when the application is loaded, using
the `DOMContentLoaded` listener.

```js
app.model({
  subscriptions: {
    emitWoofs: (send, done) => {
      // emit a woof every second
      setInterval(() =>  send('printWoofs', { woof: 'meow?' }, done), 1000)
    }
  },
  effects: {
    printWoofs: (state, data) => console.log(data.woof)
  }
})
```
`done()` is passed as the final argument so if an error occurs in a subscriber,
it can be communicated to the `onError` hook.

## FAQ
### What is an "action dispatcher"?
An action dispatcher gets data from one place to another without tightly
coupling code. The best known use case for this is in the `flux` pattern. Say
you want to update a piece of data (for example a user's name), instead of
directly calling the update logic inside the view, the action calls a function
that updates the user's name for you. Now all the views that need to update a
user's name can call the same action and pass in the relevant data. This
pattern tends to make views more robust and easier to maintain.

### Why did you build this?
Passing messages around should not be complicated. Many `flux` implementations
casually throw restrictions at users without having a clear architecture. I
don't like that. `barracks` is a package that creates a clear flow of data within an
application, concerning itself with state, code separation, and data flow. I
believe that having strong opinions and being transparent in them makes for
better architectures than sprinkles of opinions left and right, without a cohesive
story as to _why_.

### How is this different from choo?
`choo` is a framework that handles views, data and all problems related to
that. This is a package that only concerns itself with data flow, without being
explicitly tied to the DOM.

### This looks like more than five functions!
Welllll, no. It's technically five functions with a high arity, hah. Nah,
you're right - but five functions _sounds_ good. Besides: you don't need to
know all options and toggles to get this working; that only relevant once you
start hitting edge cases like we did in `choo` :sparkles:

## See Also
- [choo](https://github.com/yoshuawuyts/choo) - sturdy frontend framework
- [sheet-router](https://github.com/yoshuawuyts/sheet-router) - fast, modular
  client-side router
- [yo-yo](https://github.com/maxogden/yo-yo) - template string based view
  framework
- [send-action](https://github.com/sethvincent/send-action) - unidirectional
  action emitter

## Installation
```sh
$ npm install barracks
```

## License
[MIT](https://tldrlegal.com/license/mit-license)

[npm-image]: https://img.shields.io/npm/v/barracks.svg?style=flat-square
[npm-url]: https://npmjs.org/package/barracks
[travis-image]: https://img.shields.io/travis/yoshuawuyts/barracks/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/yoshuawuyts/barracks
[coveralls-image]: https://img.shields.io/coveralls/yoshuawuyts/barracks.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/yoshuawuyts/barracks?branch=master
[downloads-image]: http://img.shields.io/npm/dm/barracks.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/barracks

[flux]: http://facebook.github.io/react/blog/2014/05/06/flux.html
[browserify]: https://github.com/substack/node-browserify
