// const debug = require('debug')('barracks')
const series = require('run-series')
const assert = require('assert')

module.exports = dispatcher

// initialize a new barracks instance
// null -> obj
function dispatcher () {
  const actions = {}

  emit._actions = actions
  emit.emit = emit
  emit.on = on
  return emit

  // register a new action
  // (str, fn) -> obj
  function on (action, cb) {
    assert.equal(typeof action, 'string')
    assert.equal(typeof cb, 'function')

    actions[action] = actions[action] ? actions[action] : []
    actions[action].push(cb)

    return emit
  }

  // call an action and
  // execute the corresponding callback
  // (str, obj?) -> prom
  function emit (action, data) {
    assert.ok(Array.isArray(actions[action]), 'action exists')
    const fn = actions[action][0]
    const stack = [action]

    return fn(data, wait)

    // internal 'wait()' function
    // ([str], fn) -> prom
    function wait (action, cb) {
      action = Array.isArray(action) ? action : [action]
      cb = cb || function () {}

      // retrieve actions
      const arr = action.map(function (name) {
        const actExists = Array.isArray(actions[name])
        assert.ok(actExists, 'action ' + name + ' does not exist')
        const fn = actions[name][0]
        return createDone(name, fn)
      })

      return series(arr, cb)

      // wrap an action with a `done()` method
      // for usage in `series()`
      // (str, fn(any, (str, fn)) -> fn
      function createDone (name, fn) {
        return function (done) {
          const index = stack.indexOf(name)
          if (index !== -1) return emitErr('circular dependency detected')
          stack.push(name)

          if (fn.length === 2) return fn(data, retFn)
          fn(data)
          end()

          // execute `wait()` and `done()`
          // to both delegate new `series()` calls
          // handle cb's, and exit once done
          // (str, fn) -> null
          function retFn (action, cb) {
            if (action) return wait(action, endWrap)
            endWrap()

            function endWrap () {
              if (cb) cb()
              end()
            }
          }

          // pop name from stack
          // and exit series call
          // null -> null
          function end () {
            stack.pop()
            done()
          }
        }
      }
    }

    // emit an error
    // any -> null
    function emitErr (err) {
      const emitter = actions.error ? actions.error[0] : function () {}
      emitter(err)
    }
  }
}
