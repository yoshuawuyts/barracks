const test = require('tape')
const barracks = require('./index.js')

test('.on() should assert input arguments', function (t) {
  t.plan(2)
  const d = barracks()
  t.throws(d.on.bind(null), /string/)
  t.throws(d.on.bind(null, ''), /function/)
})

test('.on() should bind functions', function (t) {
  t.plan(3)
  const d = barracks()
  const key = 'foo'
  d.on(key, noop)
  t.ok(Array.isArray(d._actions[key]), 'is array')
  t.equal(d._actions[key].length, 1)
  d.on('foo', noop)
  t.equal(d._actions[key].length, 2)
})

test('.emit() should assert action exists', function (t) {
  t.plan(1)
  const d = barracks()
  t.throws(d.bind(null, 'yo'), /action/)
})

test('.emit() should call a function', function (t) {
  t.plan(2)
  const d = barracks()
  d.on('foo', function () {
    t.pass('is called')
  })
  d('foo')
  d.on('bar', function (data) {
    t.equal(data, 'hello you')
  })
  d('bar', 'hello you')
})

test('wait() should be able to chain 2 functions', function (t) {
  t.plan(4)
  const d = barracks()
  d.on('foo', function (data, wait) {
    t.pass('is called')
    t.equal(typeof wait, 'function')
    wait('bar')
  })
  d.on('bar', function (data) {
    t.pass('is called')
    t.equal(data, 'hello me')
  })
  d('foo', 'hello me')
})

test('wait should be able to chain 4 functions', function (t) {
  t.plan(10)
  const d = barracks()
  d.on('foo', function (data, wait) {
    t.pass('is called')
    return wait(['bar', 'bin', 'baz'])
  })
  d.on('bar', cbFn)
  d.on('bin', cbFn)
  d.on('baz', cbFn)
  d('foo', 'hello me')
  function cbFn (data, wait) {
    t.pass('is called')
    t.equal(data, 'hello me')
    t.equal(typeof wait, 'function')
    wait()
  }
})

test('wait() should call a callback on end', function (t) {
  t.plan(2)
  const d = barracks()
  var i = 0
  d.on('foo', function (data, wait) {
    return wait('bar', function () {
      t.equal(i, 1)
    })
  })
  d.on('bar', function (data) {
    t.pass('is called')
    i++
  })
  d('foo', 'hello me')
})

test('wait() should be able to call functions 4 levels deep', function (t) {
  t.plan(16)
  const d = barracks()
  var n = 0
  d.on('foo', function (data, wait) {
    t.pass('is called')
    t.equal(data, 'hello me')
    t.equal(typeof wait, 'function')
    t.equal(n++, 0)
    return wait('bar')
  })
  d.on('bar', function (data, wait) {
    t.pass('is called')
    t.equal(data, 'hello me')
    t.equal(typeof wait, 'function')
    t.equal(n++, 1)
    return wait('bin')
  })
  d.on('bin', function (data, wait) {
    t.pass('is called')
    t.equal(data, 'hello me')
    t.equal(typeof wait, 'function')
    t.equal(n++, 2)
    return wait('bon')
  })
  d.on('bon', function (data, wait) {
    t.pass('is called')
    t.equal(data, 'hello me')
    t.equal(typeof wait, 'function')
    t.equal(n++, 3)
  })
  d('foo', 'hello me')
})

test('.emit() should emit `error` on circular dependencies', function (t) {
  t.plan(1)
  const d = barracks()
  d.on('bin', function (data, wait) {
    return wait('bar')
  })
  d.on('bar', function (data, wait) {
    return wait('bin')
  })
  d.on('error', function (err) {
    t.equal(err, 'circular dependency detected')
  })
  d('bin')
})

function noop () {}
noop()
