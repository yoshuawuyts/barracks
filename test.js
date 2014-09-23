/**
 * Module dependencies
 */

var barracks = require('./index.js');

/**
 * Test
 */

describe('dispatcher = barracks()', function() {

  it('should assert argument types', function() {

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

  it('should assert argument types', function() {
    var dispatcher = barracks({
      foo: {bar: {baz: function(){}}}
    });

    dispatcher.bind(dispatcher, {})
      .should.throw('Action should be a string');

    dispatcher.bind(dispatcher, 'something')
      .should.throw('Action \'something\' is not registered');

    dispatcher.bind(dispatcher, 'foo_bar')
      .should.throw('Action \'foo_bar\' is not registered');

    dispatcher.bind(dispatcher, 'foo_bar_baz_err')
      .should.throw('Action \'foo_bar_baz_err\' is not registered');
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
        put: function(cb) {cb()}
      }
    });

    dispatcher('courses_put', done);
  });

  it('should throw if called while in progress', function(done) {

    var dispatcher = barracks({
      users: {
        add: function() {},
        remove: function() {}
      },
      courses: {
        get: function() {},
        put: function(cb) {
          dispatcher.bind(this, 'users_add')
            .should.throw('Cannot dispatch in the middle of a dispatch');
          cb();
        }
      }
    });

    dispatcher('courses_put', done);
  });
});

describe('dispatcher.waitFor()', function() {
  it('should assert argument types', function(done) {

    var dispatcher = barracks({
      courses: {
        get: function() {},
        put: function(cb) {
          dispatcher.bind(this, 'courses_get')
            .should.throw('Cannot dispatch in the middle of a dispatch');
          cb();
        }
      }
    });

    dispatcher('courses_put', done);
  });

  it('should wait for subcalls to finish', function(done) {

    var count = 0;
    var dispatcher = barracks({
      users: {
        init: function(val, fin) {
          this.waitFor(['users_foo', 'users_bar'], function() {
            count.should.eql(2);
            val();
          });
        },
        foo: function(val, fin) {
          setTimeout(function() {
            count++;
            fin();
          }, 10);
        },
        bar: function(val, fin) {
          setTimeout(function() {
            count++;
            fin();
          }, 5);
        }
      }
    });

    dispatcher('users_init', done);
  });

  it('should catch circular dependencies', function(done) {
    var dispatcher = barracks({
      courses: {
        foo: function(val, cb) {
          this.waitFor('courses_get', function() {
            this.locals.fn();
          });
        },
        get: function(val, cb) {
          this.locals.fn = done, cb()
        },
        put: function(val, cb) {

          this.waitFor.bind(this, 'courses_put')
            .should.throw('Circular dependency detected while waiting for \'courses_put\'');
          cb();
        }
      }
    });

    dispatcher('courses_put');
    dispatcher('courses_foo');
  });

  it('should not throw if a fn has already been called', function(done) {
    var dispatcher = barracks({
      courses: {
        get: function(val, cb) {
          cb();
        },
        foo: function(val, cb) {
          this.waitFor('courses_get', function() {
            cb();
          });
        },
        bar: function(val, cb) {
          this.waitFor(['courses_get', 'courses_get', 'courses_foo'], function() {
            done();
            cb();
          });
        }
      }
    });

    dispatcher('courses_bar');
  });
});

describe('ctx.locals', function() {
  it('should exist in a shared context', function(done) {
    var dispatcher = barracks({
      courses: {
        get: function(val, next) {
          this.locals.done = this.locals.payload;
          next();
        },
        put: function(val, next) {
          this.locals.payload.should.be.of.type('function');
          this.waitFor('courses_get', function() {
            this.locals.done();
          });
        }
      }
    });

    dispatcher('courses_put', done);
  });
})
