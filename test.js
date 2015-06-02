const test = require('tape')
const barracks = require('./index.js')

test('barracks() should assert argument types', function (t) {
  t.plan(4)
  t.throws(barracks.bind(barracks), /object should be passed as/)
  t.throws(barracks.bind(barracks, 123), /actions should be an object/)
  t.throws(barracks.bind(barracks, {users: 123}), 'action should be an function')
  t.throws(barracks.bind(barracks, {users: {add: 123}}), 'action should be an function')
})

test('dispatcher = barracks() should return a function', function (t) {
  t.plan(1)

  const dispatcher = barracks({
    users: {
      add: function () {},
      remove: function () {}
    },
    courses: {
      get: function () {},
      put: function () {}
    }
  })

  t.equal(typeof dispatcher, 'function')
})

test('dispatcher() should assert argument types', function (t) {
  t.plan(4)

  const dispatcher = barracks({
    foo: {bar: {baz: function () {}}}
  })

  t.throws(dispatcher.bind(dispatcher, {}), /should be a string/)
  t.throws(dispatcher.bind(dispatcher, 'something'), /is not registered/)
  t.throws(dispatcher.bind(dispatcher, 'foo_bar'), /is not registered/)
  t.throws(dispatcher.bind(dispatcher, 'foo_bar_baz_err'), /is not registered/)
})

test('dispatcher() should call a cb when done', function (t) {
  t.plan(1)

  const dispatcher = barracks({
    users: {
      add: function () {},
      remove: function () {}
    },
    courses: {
      get: function () {},
      put: function () {this.payload()}
    }
  })

  dispatcher('courses_put', function () {
    t.ok(true, 'cb called')
  })
})

test('dispatcher should throw if called while in progress', function (t) {
  t.plan(2)
  const dispatcher = barracks({
    users: {
      add: function () {t.fails()},
      remove: function () {t.fails()}
    },
    courses: {
      get: function () {t.fails()},
      put: function () {
        t.throws(dispatcher.bind(this, 'users_add'), /in the middle of a dispatch/)
        this.payload()
      }
    }
  })

  dispatcher('courses_put', function () {t.ok(true, 'end')})
})

test('dispatcher.waitFor() should assert input', function (t) {
  t.plan(2)
  const dispatcher = barracks({
    courses: {
      get: function () {t.fail()},
      put: function () {
        t.throws(dispatcher.bind(this, 'courses_get'), /in the middle of a dispatch/)
        this.payload()
      }
    }
  })

  dispatcher('courses_put', function () {
    t.ok(true, 'end')
  })
})

test('dispatcher.waitFor should wat for subcalls to next', function (t) {
  t.plan(2)

  var count = 0

  const dispatcher = barracks({
    users: {
      init: function (next) {
        this.waitFor(['users_foo', 'users_bar'], function () {
          t.equal(count, 2)
          this.payload()
        })
      },
      foo: function (next) {
        setTimeout(function () {
          count++
          next()
        }, 10)
      },
      bar: function (next) {
        setTimeout(function () {
          count++
          next()
        }, 5)
      }
    }
  })

  dispatcher('users_init', function () {
    t.ok(true, 'end')
  })
})

test('dispatcher.waitFor() should catch circular dependencies', function (t) {
  t.plan(2)
  const dispatcher = barracks({
    courses: {
      foo: function (next) {
        this.waitFor('courses_get', function () {
          this.locals.fn(true, 'done')
        })
      },
      get: function (next) {
        this.locals.fn = t.ok
        next()
      },
      put: function (next) {
        t.throws(this.waitFor.bind(this, 'courses_put'), /circular dependency/)
        next()
      }
    }
  })

  dispatcher('courses_put')
  dispatcher('courses_foo')
})

test('dispatcher.waitFor() should not throw if a fn has already been called', function (t) {
  t.plan(1)

  const dispatcher = barracks({
    courses: {
      get: function (next) {
        next()
      },
      foo: function (next) {
        this.waitFor('courses_get', function () {
          next()
        })
      },
      bar: function (next) {
        this.waitFor(['courses_get', 'courses_get', 'courses_foo'], function () {
          t.ok(true, 'end')
          next()
        })
      }
    }
  })

  dispatcher('courses_bar')
})

test('ctx.locals should exist in a shared context', function (t) {
  t.plan(2)

  const dispatcher = barracks({
    courses: {
      get: function (next) {
        this.locals.done = this.payload
        next()
      },
      put: function (next) {
        t.equal(typeof this.payload, 'function')
        this.waitFor('courses_get', function () {
          this.locals.done(true, 'end')
        })
      }
    }
  })

  dispatcher('courses_put', t.ok)
})
