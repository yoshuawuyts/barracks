# Barracks

[![Build Status](https://travis-ci.org/yoshuawuyts/barracks.svg)](https://travis-ci.org/yoshuawuyts/barracks)
[![Coverage Status](https://coveralls.io/repos/yoshuawuyts/barracks/badge.png?branch=master)](https://coveralls.io/r/yoshuawuyts/barracks?branch=master)

An event dispatcher for the [flux architecture](http://facebook.github.io/react/blog/2014/05/06/flux.html). Best used with [browserify](https://github.com/substack/node-browserify).

## Installation
````
npm i --save barracks
````

## Usage
````js
/**
 * Initialize barracks.
 */

var Dispatcher = require('barracks');
var dispatcher = Dispatcher();

/**
 * Register a new object.
 */

var callbackFunction = function(arg) {
  console.log(arg + ' got triggered');
};
dispatcher.register('eventName', callbackFunction);

/**
 * Dispatch registered callbacks for 'eventName'.
 */

dispatcher.dispatch('eventName', 'Loki');
// -> 'Loki got triggered'
````

## API
#### .register()
Register a new object to the store. Takes a `{String} action` that determines the
message it should respond to, and a `{Function} callback` that executes the response.
````js
dispatcher.register('eventName', function(arg) {return arg});
dispatcher.register('otherEvent', function() {return 'hi')});
````

#### .dispatch()
Trigger all callbacks corresponding to `{String} action` and provide them an
argument of `{Mixed} data`.
````js
dispatcher.dispatch('eventName', 12);
// -> 12

dispatcher.dispatch('eventName');
// -> throw Error

dispatcher.dispatch('otherEvent', null);
// -> 'hi'
````


## License
[MIT](https://tldrlegal.com/license/mit-license) © [Yoshua Wuyts](yoshuawuyts.com)