const barracks = require('./')
const xtend = require('xtend')
const noop = require('noop2')
const tape = require('tape')

tape('api: store = barracks(handlers)', (t) => {
  t.test('should validate input types', (t) => {
    t.plan(3)
    t.doesNotThrow(barracks, 'no args does not throw')
    t.doesNotThrow(barracks.bind(null, {}), 'object does not throw')
    t.throws(barracks.bind(null, 123), 'non-object throws')
  })

  t.test('should validate hook types', (t) => {
    t.plan(3)
    t.throws(barracks.bind(null, { onError: 123 }), /function/, 'onError throws')
    t.throws(barracks.bind(null, { onAction: 123 }), /function/, 'onAction throws')
    t.throws(barracks.bind(null, { onStateChange: 123 }), /function/, 'onStateChange throws')
  })
})

tape('api: store.model()', (t) => {
  t.test('should validate input types', (t) => {
    t.plan(2)
    const store = barracks()
    t.throws(store.model.bind(null, 123), /object/, 'non-obj should throw')
    t.doesNotThrow(store.model.bind(null, {}), 'obj should not throw')
  })
})

tape('api: store.use()', (t) => {
  t.test('should allow model injection', (t) => {
    t.plan(1)
    const store = barracks()
    store.model({
      state: { accessed: false }
    })
    store.use({
      models: [{
        namespace: 'namespaced',
        state: { 'accessed': false },
        reducers: { update: (state, data) => data }
      }, {
        state: {},
        reducers: { update: (state, data) => data }
      }]
    })
    const createSend = store.start()
    const send = createSend('test', true)
    send('namespaced:update', { accessed: true })
    send('update', { accessed: true })

    setTimeout(function () {
      const expected = { accessed: true, namespaced: { accessed: true } }
      t.deepEqual(store.state(), expected, 'models can be injected')
    }, 100)
  })

  t.test('should call multiples', (t) => {
    t.plan(1)
    const store = barracks()
    const called = { first: false, second: false }

    store.use({
      onAction: (state, data, name, caller, createSend) => {
        called.first = true
      }
    })

    store.use({
      onAction: (state, data, name, caller, createSend) => {
        called.second = true
      }
    })

    store.model({
      state: {
        count: 0
      },
      reducers: {
        foo: (state, data) => ({ count: state.count + 1 })
      }
    })

    const createSend = store.start()
    const send = createSend('test', true)
    send('foo', { count: 3 })

    setTimeout(function () {
      const expected = { first: true, second: true }
      t.deepEqual(called, expected, 'all hooks were called')
    }, 100)
  })
})

tape('api: createSend = store.start(opts)', (t) => {
  t.test('should validate input types', (t) => {
    t.plan(3)
    const store = barracks()
    t.throws(store.start.bind(null, 123), /object/, 'non-obj should throw')
    t.doesNotThrow(store.start.bind(null, {}), /object/, 'obj should not throw')
    t.doesNotThrow(store.start.bind(null), 'undefined should not throw')
  })

  t.test('opts.state = false should not register state', (t) => {
    t.plan(1)
    const store = barracks()
    store.model({ state: { foo: 'bar' } })
    store.start({ state: false })
    const state = store.state()
    t.deepEqual(state, {}, 'no state returned')
  })

  t.test('opts.effects = false should not register effects', (t) => {
    t.plan(1)
    const store = barracks()
    store.model({ effects: { foo: noop } })
    store.start({ effects: false })
    const effects = Object.keys(store._effects)
    t.deepEqual(effects.length, 0, 'no effects registered')
  })

  t.test('opts.reducers = false should not register reducers', (t) => {
    t.plan(1)
    const store = barracks()
    store.model({ reducers: { foo: noop } })
    store.start({ reducers: false })
    const reducers = Object.keys(store._reducers)
    t.deepEqual(reducers.length, 0, 'no reducers registered')
  })

  t.test('opts.subscriptions = false should not register subs', (t) => {
    t.plan(1)
    const store = barracks()
    store.model({ subscriptions: { foo: noop } })
    store.start({ subscriptions: false })
    const subscriptions = Object.keys(store._subscriptions)
    t.deepEqual(subscriptions.length, 0, 'no subscriptions registered')
  })
})

tape('api: state = store.state()', (t) => {
  t.test('should return initial state', (t) => {
    t.plan(1)
    const store = barracks()
    store.model({ state: { foo: 'bar' } })
    store.start()
    const state = store.state()
    t.deepEqual(state, { foo: 'bar' })
  })

  t.test('should initialize state with empty namespace object', (t) => {
    t.plan(1)
    const store = barracks()
    store.model({
      namespace: 'beep',
      state: {}
    })
    store.start()
    const state = store.state()
    const expected = {
      beep: {}
    }
    t.deepEqual(expected, state, 'has initial empty namespace object')
  })

  t.test('should return the combined state', (t) => {
    t.plan(1)
    const store = barracks()
    store.model({
      namespace: 'beep',
      state: { foo: 'bar', bin: 'baz' }
    })
    store.model({
      namespace: 'boop',
      state: { foo: 'bar', bin: 'baz' }
    })
    store.model({
      state: { hello: 'dog', welcome: 'world' }
    })
    store.start()
    const state = store.state()
    const expected = {
      beep: { foo: 'bar', bin: 'baz' },
      boop: { foo: 'bar', bin: 'baz' },
      hello: 'dog',
      welcome: 'world'
    }
    t.deepEqual(expected, state, 'initial state of models is combined')
  })

  t.test('object should be frozen by default', (t) => {
    t.plan(1)
    const store = barracks()
    store.model({ state: { foo: 'bar' } })
    store.start()
    const state = store.state()
    state.baz = 'bin'
    const expected = { foo: 'bar' }
    t.deepEqual(state, expected, 'state was frozen')
  })

  t.test('freeze = false should not freeze objects', (t) => {
    t.plan(1)
    const store = barracks()
    store.model({ state: { foo: 'bar' } })
    store.start()
    const state = store.state({ freeze: false })
    state.baz = 'bin'
    const expected = { foo: 'bar', baz: 'bin' }
    t.deepEqual(state, expected, 'state was not frozen')
  })

  t.test('passing a state opts should merge state', (t) => {
    t.plan(1)
    const store = barracks()
    store.model({ state: { foo: 'bar' } })
    store.model({
      namespace: 'beep',
      state: { foo: 'bar', bin: 'baz' }
    })
    store.start()

    const extendedState = {
      woof: 'dog',
      beep: { foo: 'baz' },
      barp: { bli: 'bla' }
    }
    const state = store.state({ state: extendedState })
    const expected = {
      foo: 'bar',
      woof: 'dog',
      beep: { foo: 'baz', bin: 'baz' },
      barp: { bli: 'bla' }
    }
    t.deepEqual(state, expected, 'state was merged')
  })
})

tape('api: send(name, data?)', (t) => {
  t.test('should validate input types', (t) => {
    t.plan(1)
    const store = barracks()
    const createSend = store.start()
    const send = createSend('test')
    t.throws(send.bind(null, 123), /string/, 'non-string should throw')
  })
})

tape('api: stop()', (t) => {
  t.test('should stop executing send() calls', (t) => {
    t.plan(1)
    const store = barracks()
    var count = 0
    store.model({ reducers: { foo: (state, action) => { count += 1 } } })
    const createSend = store.start()
    const send = createSend('test', true)
    send('foo')
    store.stop()
    send('foo')
    setTimeout(() => t.equal(count, 1, 'no actions after stop()'), 10)
  })
})

tape('handlers: reducers', (t) => {
  t.test('should be able to be called', (t) => {
    t.plan(6)
    const store = barracks()
    store.model({
      namespace: 'meow',
      state: { beep: 'boop' },
      reducers: {
        woof: (state, data) => t.pass('meow.woof called')
      }
    })

    store.model({
      state: {
        foo: 'bar',
        beep: 'boop'
      },
      reducers: {
        foo: (state, data) => {
          t.deepEqual(data, { foo: 'baz' }, 'action is equal')
          t.equal(state.foo, 'bar', 'state.foo = bar')
          return { foo: 'baz' }
        },
        sup: (state, data) => {
          t.equal(data, 'nope', 'action is equal')
          t.equal(state.beep, 'boop', 'state.beep = boop')
          return { beep: 'nope' }
        }
      }
    })
    const createSend = store.start()
    const send = createSend('tester', true)
    send('foo', { foo: 'baz' })
    send('sup', 'nope')
    send('meow:woof')
    setTimeout(function () {
      const state = store.state()
      const expected = {
        foo: 'baz',
        beep: 'nope',
        meow: { beep: 'boop' }
      }
      t.deepEqual(state, expected, 'state was updated')
    }, 10)
  })
})

tape('handlers: effects', (t) => {
  t.test('should be able to be called', (t) => {
    t.plan(5)
    const store = barracks()

    store.model({
      namespace: 'meow',
      effects: {
        woof: (state, data, send, done) => {
          t.pass('woof called')
        }
      }
    })

    store.model({
      state: { bin: 'baz', beep: 'boop' },
      reducers: {
        bar: (state, data) => {
          t.pass('reducer was called')
          return { beep: data.beep }
        }
      },
      effects: {
        foo: (state, data, send, done) => {
          t.pass('effect was called')
          send('bar', { beep: data.beep }, () => {
            t.pass('effect callback was called')
            done()
          })
        }
      }
    })
    const createSend = store.start()
    const send = createSend('tester', true)
    send('foo', { beep: 'woof' })
    send('meow:woof')

    setTimeout(function () {
      const state = store.state()
      const expected = { bin: 'baz', beep: 'woof' }
      t.deepEqual(state, expected, 'state was updated')
    }, 10)
  })

  t.test('should be able to nest effects and return data', (t) => {
    t.plan(12)
    const store = barracks()
    store.model({
      effects: {
        foo: (state, data, send, done) => {
          t.pass('foo was called')
          send('bar', { beep: 'boop' }, () => {
            t.pass('foo:bar effect callback was called')
            send('baz', (err, res) => {
              t.ifError(err, 'no error')
              t.equal(res, 'yay', 'res is equal')
              t.pass('foo:baz effect callback was called')
              done()
            })
          })
        },
        bar: (state, data, send, done) => {
          t.pass('bar was called')
          t.deepEqual(data, { beep: 'boop' }, 'action is equal')
          send('baz', (err, res) => {
            t.ifError(err, 'no error')
            t.equal(res, 'yay', 'res is equal')
            t.pass('bar:baz effect callback was called')
            done()
          })
        },
        baz: (state, data, send, done) => {
          t.pass('baz effect was called')
          done(null, 'yay')
        }
      }
    })
    const createSend = store.start()
    const send = createSend('tester', true)
    send('foo')
  })

  t.test('should be able to propagate nested errors', (t) => {
    t.plan(7)
    const store = barracks()
    store.model({
      effects: {
        foo: (state, data, send, done) => {
          t.pass('foo was called')
          send('bar', (err, res) => {
            t.ok(err, 'error detected')
            t.pass('foo:bar effect callback was called')
            done()
          })
        },
        bar: (state, data, send, done) => {
          t.pass('bar was called')
          send('baz', (err, res) => {
            t.ok(err, 'error detected')
            t.pass('bar:baz effect callback was called')
            done(err)
          })
        },
        baz: (state, data, send, done) => {
          t.pass('baz effect was called')
          done(new Error('oh noooo'))
        }
      }
    })
    const createSend = store.start()
    const send = createSend('tester', true)
    send('foo')
  })
})

tape('handlers: subscriptions', (t) => {
  t.test('should be able to call', (t) => {
    t.plan(9)
    const store = barracks()
    store.model({
      namespace: 'foo',
      subscriptions: {
        mySub: (send, done) => {
          t.pass('namespaced sub initiated')
        }
      }
    })

    store.model({
      reducers: {
        bar: () => t.pass('reducer called')
      },
      effects: {
        foo: (state, data, send, done) => {
          t.pass('foo was called')
          done(new Error('oh no!'), 'hello')
        }
      },
      subscriptions: {
        mySub: (send, done) => {
          t.pass('mySub was initiated')
          send('foo', (err, res) => {
            t.ok(err, 'error detected')
            t.equal(res, 'hello', 'res was passed')
            t.pass('mySub:foo effect callback was called')
            send('bar', (err, res) => {
              t.error(err, 'no error detected')
              t.pass('mySub:bar effect callback was called')
            })
          })
        }
      }
    })
    store.start()
  })

  t.test('should be able to emit an error', (t) => {
    t.plan(4)
    const store = barracks({
      onError: (err, state, createSend) => {
        t.equal(err.message, 'oh no!', 'err was received')
        t.equal((state || {}).a, 1, 'state was passed')
        t.equal(typeof createSend, 'function', 'createSend is a function')
      }
    })

    store.model({
      state: { a: 1 },
      subscriptions: {
        mySub: (send, done) => {
          t.pass('sub initiated')
          done(new Error('oh no!'))
        }
      }
    })
    store.start()
  })
})

tape('hooks: onStateChange', (t) => {
  t.test('should be called whenever state changes', (t) => {
    t.plan(4)
    const store = barracks({
      onStateChange: (state, data, prev, caller, createSend) => {
        t.deepEqual(data, { count: 3 }, 'action is equal')
        t.deepEqual(state, { count: 4 }, 'state is equal')
        t.deepEqual(prev, { count: 1 }, 'prev is equal')
        t.equal(caller, 'increment', 'caller is equal')
      }
    })

    store.model({
      state: { count: 1 },
      reducers: {
        increment: (state, data) => ({ count: state.count + data.count })
      }
    })

    const createSend = store.start()
    const send = createSend('test', true)
    send('increment', { count: 3 })
  })

  t.test('should allow triggering other actions', (t) => {
    t.plan(2)
    const store = barracks({
      onStateChange: function (state, data, prev, caller, createSend) {
        t.pass('onStateChange called')
        const send = createSend('test:onStateChange', true)
        send('foo')
      }
    })

    store.model({
      state: { count: 1 },
      effects: {
        foo: (state, data, send, done) => {
          t.pass('called')
          done()
        }
      },
      reducers: {
        increment: (state, data) => ({ count: state.count + data.count })
      }
    })

    const createSend = store.start()
    const send = createSend('test', true)
    send('increment', { count: 3 })
  })

  t.test('previous state should not be mutated', (t) => {
    t.plan(2)
    const storeNS = barracks({
      onStateChange: (state, data, prev, caller, createSend) => {
        t.equal(state.ns.items.length, 3, 'state was updated')
        t.equal(prev.ns.items.length, 0, 'prev was left as-is')
      }
    })

    storeNS.model({
      namespace: 'ns',
      state: { items: [] },
      reducers: {
        add: (_, state) => ({ items: [1, 2, 3] })
      }
    })

    const createSendNS = storeNS.start()
    const sendNS = createSendNS('testNS', true)
    sendNS('ns:add')
  })
})

tape('hooks: onAction', (t) => {
  t.test('should be called whenever an action is emitted', (t) => {
    t.plan(5)
    const store = barracks({
      onAction: (state, data, actionName, caller, createSend) => {
        t.deepEqual(data, { count: 3 }, 'action is equal')
        t.deepEqual(state, { count: 1 }, 'state is equal')
        t.deepEqual(actionName, 'foo', 'actionName is equal')
        t.equal(caller, 'test', 'caller is equal')
      }
    })

    store.model({
      state: { count: 1 },
      effects: {
        foo: (state, data, send, done) => {
          t.pass('effect called')
          done()
        }
      }
    })

    const createSend = store.start()
    const send = createSend('test', true)
    send('foo', { count: 3 })
  })
})

tape('hooks: onError', (t) => {
  t.test('should have a default err handler')
  t.test('should not call itself')
})

tape('wrappers: wrapSubscriptions')
tape('wrappers: wrapReducers')
tape('wrappers: wrapEffects')

tape('wrappers: wrapInitialState', (t) => {
  t.test('should wrap initial state in start', (t) => {
    t.plan(2)
    const store = barracks()
    store.use({
      wrapInitialState: (state) => {
        t.deepEqual(state, { foo: 'bar' }, 'initial state is correct')
        return xtend(state, { beep: 'boop' })
      }
    })

    store.model({
      state: { foo: 'bar' }
    })

    store.start()
    process.nextTick(() => {
      const state = store.state()
      t.deepEqual(state, { foo: 'bar', beep: 'boop' }, 'wrapped state correct')
    })
  })

  t.test('should wrap initial state in getState', (t) => {
    t.plan(1)
    const store = barracks()
    store.use({
      wrapInitialState: (state) => {
        return xtend(state, { beep: 'boop' })
      }
    })

    store.model({
      state: { foo: 'bar' }
    })

    process.nextTick(() => {
      const opts = {
        state: { bin: 'baz' }
      }
      const expected = {
        foo: 'bar',
        beep: 'boop',
        bin: 'baz'
      }
      const state = store.state(opts)
      t.deepEqual(state, expected, 'wrapped state correct')
    })
  })
})
