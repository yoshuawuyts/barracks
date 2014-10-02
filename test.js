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
      .should.throw('an \'actions\' object should be passed as an argument');

    barracks.bind(barracks, 123)
      .should.throw('actions should be an object');

    barracks.bind(barracks, {users: 123})
      .should.throw('action should be a function');

    barracks.bind(barracks, {users: {add: 123}})
      .should.throw('action should be a function');
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
      .should.throw('action \'[object Object]\' should be a string');

    dispatcher.bind(dispatcher, 'something')
      .should.throw('action \'something\' is not registered');

    dispatcher.bind(dispatcher, 'foo_bar')
      .should.throw('action \'foo_bar\' is not registered');

    dispatcher.bind(dispatcher, 'foo_bar_baz_err')
      .should.throw('action \'foo_bar_baz_err\' is not registered');
  });

  it('should call actions', function(done) {

    var dispatcher = barracks({
      users: {
        add: function() {},
        remove: function() {}
      },
      courses: {
        get: function() {},
        put: function() {this.payload()}
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
        put: function() {this.payload()}
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
        put: function() {
          dispatcher.bind(this, 'users_add')
            .should.throw('cannot dispatch \'users_add\' in the middle of a dispatch');
          this.payload();
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
        put: function() {
          dispatcher.bind(this, 'courses_get')
            .should.throw('cannot dispatch \'courses_get\' in the middle of a dispatch');
          this.payload();
        }
      }
    });

    dispatcher('courses_put', done);
  });

  it('should wait for subcalls to nextish', function(done) {

    var count = 0;
    var dispatcher = barracks({
      users: {
        init: function(next) {
          this.waitFor(['users_foo', 'users_bar'], function() {
            count.should.eql(2);
            this.payload();
          });
        },
        foo: function(next) {
          setTimeout(function() {
            count++;
            next();
          }, 10);
        },
        bar: function(next) {
          setTimeout(function() {
            count++;
            next();
          }, 5);
        }
      }
    });

    dispatcher('users_init', done);
  });

  it('should catch circular dependencies', function(done) {
    var dispatcher = barracks({
      courses: {
        foo: function(next) {
          this.waitFor('courses_get', function() {
            this.locals.fn();
          });
        },
        get: function(next) {
          this.locals.fn = done;
          next();
        },
        put: function(next) {

          this.waitFor.bind(this, 'courses_put')
            .should.throw('circular dependency detected while waiting for \'courses_put\'');
          next();
        }
      }
    });

    dispatcher('courses_put');
    dispatcher('courses_foo');
  });

  it('should not throw if a fn has already been called', function(done) {
    var dispatcher = barracks({
      courses: {
        get: function(next) {
          next();
        },
        foo: function(next) {
          this.waitFor('courses_get', function() {
            next();
          });
        },
        bar: function(next) {
          this.waitFor(['courses_get', 'courses_get', 'courses_foo'], function() {
            done();
            next();
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
        get: function(next) {
          this.locals.done = this.payload;
          next();
        },
        put: function(next) {
          this.payload.should.be.of.type('function');
          this.waitFor('courses_get', function() {
            this.locals.done();
          });
        }
      }
    });

    dispatcher('courses_put', done);
  });
})
