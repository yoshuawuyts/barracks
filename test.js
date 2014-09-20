/**
 * Module dependencies
 */

var should = require('should');
var barracks = require('./index.js');

/**
 * Test
 */

describe('dispatcher = barracks()', function() {

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
  });

  it('should return a function', function() {
    var dispatcher = barracks({
      users: {
        add: function() {},
        remove: function() {}
      },
      courses: {
        get: function() {},
        put: function() {}
      }
    });

    dispatcher.should.be.type('function');
  });
});

describe('dispatcher()', function() {

  it('should catch errors', function() {
    var dispatcher = barracks({});

    dispatcher.bind(dispatcher, {})
      .should.throw('Action should be a string');

    dispatcher.bind(dispatcher, 'something')
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

    dispatcher('courses_put', done);
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

    dispatcher('courses_put', done, doneHandler);

    function doneHandler(fn) {
      fn();
    }
  });
});
