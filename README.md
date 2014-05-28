# Barracks

[![Build Status](https://travis-ci.org/yoshuawuyts/barrakcs.svg)](https://travis-ci.org/yoshuawuyts/barracks)
[![Coverage Status](https://coveralls.io/repos/yoshuawuyts/barracks/badge.png)](https://coveralls.io/r/yoshuawuyts/barracks)

An event dispatcher for the [flux architecture](http://facebook.github.io/react/blog/2014/05/06/flux.html).

## API
Initialize a dispatcher
````js
var Dispatcher = require('barracks');
var dispatcher = Dispatcher();
````

Register a new object
````js
var callbackFunction = function(arg) {/*side effect goes here*/};

dispatcher.register('eventName', callbackFunction);
````

Dispatch the registered callbacks
````js
dispatcher.dispatch('eventName');
````

## License
[MIT](https://tldrlegal.com/license/mit-license) © [Yoshua Wuyts](yoshuawuyts.com)