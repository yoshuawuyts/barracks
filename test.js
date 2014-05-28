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

  describe('.register()', function () {
    it('should save the action', function (done) {
      var dispatcher = Dispatcher();
      dispatcher.register('test', function() {return 3});
      dispatcher.callbacks[0].action.should.equal('test');
      done();
    });

    it('should save the callback', function (done) {
      var dispatcher = Dispatcher();
      dispatcher.register('test', function() {return 3});
      dispatcher.callbacks[0].callback.call().should.equal(3);
      done();      
    });
  });

  describe('.dispatch()', function () {
    describe('with only one item stored', function () {
      it('should trigger the callback when called', function (done) {
        var dispatcher = Dispatcher();
        var count = 0;

        dispatcher.callbacks = [
          {action: 'trigger', callback: function(arg) {count += arg}}
        ];

        dispatcher.dispatch('nothing', 3);
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

        dispatcher.callbacks = [
          {action: 'trigger', callback: function(arg) {count += arg}},
          {action: 'finger', callback: function(arg) {count += arg}},
          {action: 'finger', callback: function(arg) {count += arg}}
        ];

        dispatcher.dispatch('nothing', 3);
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