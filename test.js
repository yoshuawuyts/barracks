/**
 * Module dependencies
 */

var should = require('should');
var barracks = require('./index.js');

/**
 * Test
 */

describe('#dispatcher()', function() {
  it('should catch errors', function() {
    var dispatcher = barracks();

    dispatcher.register.bind(123, function() {return 3})
      .should.throw('Action should be a string');
    dispatcher.register.bind('hello', 'not a function')
      .should.throw('Callback should be a function');
  });
  it('should initialize empty properties', function() {
    var dispatcher = barracks();
    dispatcher.callbacks.should.be.empty;
  });
});

describe('.register()', function() {
  it('should catch errors', function() {
    var dispatcher = barracks();

    dispatcher.register.bind(null, 123)
      .should.throw('Action should be a string');

    dispatcher.register.bind(null, 'hi', 123)
      .should.throw('Callback should be a function');
  });
  it('should save actions', function() {
    var dispatcher = barracks();

    dispatcher.register('test', function() {return 3});
    dispatcher.callbacks['test'].should.exist;
  });
  it('should save callbacks', function() {
    var dispatcher = barracks();

    dispatcher.register('test', function() {return 3});
    dispatcher.callbacks['test'][0]().should.equal(3);   
  });
  it('should allow for function composition', function() {
    var dispatcher = barracks();
    dispatcher
      .register('test', function() {return 3})
      .register('derp', function() {return 4});

    dispatcher.callbacks['test'][0]().should.eql(3);
    dispatcher.callbacks['derp'][0]().should.eql(4);
  });
});

describe('.dispatch()', function() {
  it('should catch errors', function() {
    var dispatcher = barracks();

    dispatcher.dispatch.bind(dispatcher, 'something', {})
      .should.throw('Action is not registered');
  });
  it('should trigger the callback when called with n=1', function() {
    var dispatcher = barracks();
    var count = 0;
    dispatcher.callbacks = {
      'trigger': [function(arg) {count += arg}]
    };

    dispatcher.dispatch.bind(dispatcher, 'nothing', 3).should.throw();
    count.should.eql(0);
    dispatcher.dispatch('trigger', 3);
    count.should.eql(3);
  });
  it('should trigger the correct callback when called with n>1', function() {
    var dispatcher = barracks();
    var count = 0;
    dispatcher.callbacks = {
      'trigger': [function(arg) {count += arg}],
      'finger': [
        function(arg) {count += arg},
        function(arg) {count += arg}
      ]
    };

    dispatcher.dispatch.bind(dispatcher, 'nothing', 3).should.throw();
    count.should.eql(0);
    dispatcher.dispatch('trigger', 3);
    count.should.eql(3);
    count=0;
    dispatcher.dispatch('finger', 4);
    count.should.eql(8);
  });
});