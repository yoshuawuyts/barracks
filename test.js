/**
 * Module dependencies
 */

var should = require('should');
var Dispatcher = require('./index.js');

/**
 * Test
 */

describe('#dispatcher()', function () {
  describe('when initialized', function () {
    it('should have empty properties', function (done) {
      var dispatcher = Dispatcher();
      dispatcher.callbacks.should.be.empty;
      done();
    });
  });
  describe('when a faulty action is provided', function () {
    it('should throw', function (done) {
      var dispatcher = Dispatcher();
      dispatcher.register.bind(123, function() {return 3})
        .should.throw('dispatcher.register: action must be a string');
      done();
    });
  });
  describe('when a faulty callback is provided', function () {
    it('should throw', function (done) {
      var dispatcher = Dispatcher();
      dispatcher.register.bind('hello', 'not a function')
        .should.throw('dispatcher.register: callback must be a function');
      done();
    });
  });

  describe('.register()', function () {
    it('should save the action', function (done) {
      var dispatcher = Dispatcher();
      dispatcher.register('test', function() {return 3});
      dispatcher.callbacks['test'].should.exist;
      done();
    });

    it('should save the callback', function (done) {
      var dispatcher = Dispatcher();
      dispatcher.register('test', function() {return 3});
      dispatcher.callbacks['test'][0].call().should.equal(3);
      done();      
    });
  });
    it('should allow for function composition', function() {
      var dispatcher = Dispatcher();
      dispatcher
        .register('test', function() {return 3})
        .register('derp', function() {return 4});

      dispatcher.callbacks['test'][0]().should.eql(3);
      dispatcher.callbacks['derp'][0]().should.eql(4);
    });

  describe('.dispatch()', function () {
    describe('when the action is not found', function () {
      it('should throw', function (done) {
        var dispatcher = Dispatcher();
        dispatcher.dispatch.bind(dispatcher, 'something', {})
          .should.throw('dispatcher.dispatch: action is not registered');
          
        done();
      });
    });
    describe('with only one item stored', function () {
      it('should trigger the callback when called', function (done) {
        var dispatcher = Dispatcher();
        var count = 0;

        dispatcher.callbacks = {
          'trigger': [function(arg) {count += arg}]
        };

        dispatcher.dispatch.bind(dispatcher, 'nothing', 3).should.throw();
        count.should.eql(0);

        dispatcher.dispatch('trigger', 3);
        count.should.eql(3);

        done();
      });
    });

    describe('with multiple items stored', function () {
      it('should trigger the correct callback when called', function (done) {
        var dispatcher = Dispatcher();
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

        done();
      });
    });
  });
});