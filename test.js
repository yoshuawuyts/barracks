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

    barracks.bind(barracks)
      .should.throw('An \'actions\' object should be passed as an argument');

    var arg = 123;
    barracks.bind(barracks, arg)
      .should.throw('Actions should be an object');

    arg = {users: 123};
    barracks.bind(barracks, arg)
      .should.throw('Action should be a function');

    arg = {users: {add: 123}}
    barracks.bind(barracks, arg)
      .should.throw('Action should be a function');

    arg = {users: {add: {veryMuch: 123}}}
    barracks.bind(barracks, arg)
      .should.throw('Namespaces should not be nested');
  });

  it('should save actions', function(done) {
    var dispatcher = barracks({
      users: {
        add: function() {},
        remove: function() {}
      },
      courses: {
        get: function() {},
        put: function() {done()}
      }
    });

    dispatcher.actions.users.should.be.an.object;
    dispatcher.actions.users.add.should.be.a.function;
    dispatcher.actions.users.remove.should.be.a.function;
    dispatcher.actions.courses.get.should.be.a.function;
    dispatcher.actions.courses.put.should.be.a.function;
    dispatcher.actions.courses.put()
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
