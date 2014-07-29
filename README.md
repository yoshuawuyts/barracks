# Barracks
[![NPM version][npm-image]][npm-url] 
[![build status][travis-image]][travis-url] 
[![Test coverage][coveralls-image]][coveralls-url]

An event dispatcher for the [flux architecture](http://facebook.github.io/react/blog/2014/05/06/flux.html). Best used with [browserify](https://github.com/substack/node-browserify).

## Installation
````
npm i --save barracks
````

## Overview
````js
/**
 * Initialize barracks.
 */

var barracks = require('barracks');
var dispatcher = barracks();

/**
 * Register a new callback.
 */

dispatcher.register('eventName', function(arg) {
  return arg + ' got triggered';
});

/**
 * Dispatch registered callbacks for 'eventName'.
 */

dispatcher.dispatch('eventName', 'Loki');
// => 'Loki got triggered'
````

## API
#### .register()
Register a new object to the store. Takes a `{String} action` that determines the
message it should respond to, and a `{Function} callback` that executes the response.
````js
dispatcher.register('eventName', function(arg) {
  return arg;
});

dispatcher.register('otherEvent', function() {
  return 'hi';
)});
````

#### .dispatch()
Trigger all callbacks corresponding to `{String} action` and provide them an
argument of `{Mixed} data`.
````js
dispatcher.dispatch('eventName', 12);
// => 12

dispatcher.dispatch('otherEvent');
// => 'hi'
````

## License
[MIT](https://tldrlegal.com/license/mit-license) © [Yoshua Wuyts](yoshuawuyts.com)

[npm-image]: https://img.shields.io/npm/v/barracks.svg?style=flat
[npm-url]: https://npmjs.org/package/barracks
[travis-image]: https://img.shields.io/travis/yoshuawuyts/barracks.svg?style=flat
[travis-url]: https://travis-ci.org/yoshuawuyts/barracks
[coveralls-image]: https://img.shields.io/coveralls/yoshuawuyts/barracks.svg?style=flat
[coveralls-url]: https://coveralls.io/r/yoshuawuyts/barracks?branch=master