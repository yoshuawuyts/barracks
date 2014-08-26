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
    var dispatcher = barracks({});

    dispatcher.dispatch.bind(dispatcher, {})
      .should.throw('Action should be a string');

    dispatcher.dispatch.bind(dispatcher, 'something_is_odd')
      .should.throw('Namespaces should not be nested');

    dispatcher.dispatch.bind(dispatcher, 'something')
      .should.throw('Action \'something\' is not registered');
  });

  it('should call actions', function(done) {

    var dispatcher = barracks({
      users: {
        add: function() {},
        remove: function() {}
      },
      courses: {
        get: function() {},
        put: function(fn) {fn()}
      }
    });

    dispatcher.dispatch('courses_put', done);
  });

  it('should call a callback when done', function(done) {

    var dispatcher = barracks({
      users: {
        add: function() {},
        remove: function() {}
      },
      courses: {
        get: function() {},
        put: function(value, cb) {cb(value)}
      }
    });

    dispatcher.dispatch('courses_put', done, doneHandler);

    function doneHandler(fn) {
      fn();
    }
  });
});
