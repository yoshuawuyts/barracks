# Barracks

[![Build Status](https://travis-ci.org/yoshuawuyts/barracks.svg)](https://travis-ci.org/yoshuawuyts/barracks)
[![Coverage Status](https://coveralls.io/repos/yoshuawuyts/barracks/badge.png?branch=master)](https://coveralls.io/r/yoshuawuyts/barracks?branch=master)

An event dispatcher for the [flux architecture](http://facebook.github.io/react/blog/2014/05/06/flux.html).

## API
__Initialize a dispatcher:__
````js
var Dispatcher = require('barracks');
var dispatcher = Dispatcher();
````

__Register a new object:__
````js
var callbackFunction = function(arg) {/*side effect goes here*/};

dispatcher.register('eventName', callbackFunction);
````

__Dispatch the registered callbacks:__
````js
dispatcher.dispatch('eventName');
````

## License
[MIT](https://tldrlegal.com/license/mit-license) © [Yoshua Wuyts](yoshuawuyts.com)