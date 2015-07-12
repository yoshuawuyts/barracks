# barracks
[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

Action dispatcher for unidirectional data flows. Provides action composition
and checks for circular dependencies with a small interface of only 3
functions.

## Installation
```sh
$ npm install barracks
```

## Usage
````js
const barracks = require('barracks')

const dispatcher = barracks()
const store = []

dispatcher.on('error', err => console.log(err))
dispatcher.on('insert', data => store.push(data.name))
dispatcher.on('upsert', (data, wait) => {
  const index = store.indexOf(data.prevName)
  if (index !== -1) return wait('insert')
  store[index] = data.newName
})

dispatcher('insert', {name: 'Loki'})
dispatcher('upsert', {name: 'Loki', newName: 'Tobi'})
````

## API
### dispatcher = barracks()
Initialize a new `barracks` instance.

### dispatcher.on(action, cb(data, wait))
Register a new action. Checks for circular dependencies when dispatching.  The
callback receives the passed in data and a `wait(actions[, cb])` function that
can be used to call other actions internally. `wait()` accepts a single action
or an array of actions and an optional callback as the final argument.

### dispatcher(event[, data])
Call an action and execute the corresponding callback. Alias:
`dispatcher.emit(event[, data])`.

## Events
### .on('error', cb(err))
Handle errors. Warns if circular dependencies exists.

## FAQ
### What is an "action dispatcher"?
An action dispatcher gets data from one place to another without tightly
coupling the code. The best known use case for this is in the `flux` pattern.
Say you want to update a piece of data (for example a user's name), instead of
directly calling the update logic inside the view the action calls a function
that updates the user's name for you. Now all the views that need to update a
user's name can call the same action and pass in the relevant data.  This
pattern tends to make views more robust and easier to maintain.

### Why did you build this?
Passing messages around should not be complicated. Many `flux` implementations
casually throw around framework specific terminology making new users feel
silly for not following along. I don't like that. `barracks` is a package that
takes node's familiar `EventEmitter` interface and adapts it for use as an
action dispatcher.

### I want to start using barracks, but I'm not sure how to use it
That's fine, that means this readme needs to be improved. Would you mind
opening an [issue](https://github.com/yoshuawuyts/barracks/issues) and explain
what you don't understand?  I want `barracks` to be comprehensive for
developers of any skill level, so don't hesitate to ask questions if you're
unsure about something.

### Why didn't you include feature X?
An action dispatcher doesn't a lot of features to pass a message from A to B.
`barracks` was built for flexibility. If you feel you're repeating yourself a
lot with `barracks` or are missing a feature, feel free to wrap and extend it
however you like.

### What data store do you recommend using with barracks?
In flux it's common to store your application state in a data store.I think a
data store should be immutable, single-instance and allow data access through
cursors / lenses.  At the moment of writing I haven't found a data store I'm
pleased with, so I'll probably end up writing one in the near future.

## See Also
- [wayfarer](https://github.com/yoshuawuyts/wayfarer) -  composable trie based route

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
