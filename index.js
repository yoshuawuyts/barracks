/*eslint no-underscore-dangle:0 */

const debug  = require('debug')('barracks')
const assert = require('assertf')
const async  = require('async')

module.exports = Dispatcher

const dispatcher = Dispatcher.prototype

// Initialize the dispatcher with an
// 'actions' object.
// @return {Object}
function Dispatcher(actions) {

  if (!(this instanceof Dispatcher)) return new Dispatcher(actions)

  assert(actions, 'an \'actions\' object should be passed as an argument')
  assert.equal(typeof actions, 'object', 'actions should be an object')
  _assertActionsObject(actions)

  this.locals  = {}
  this.payload = null

  this._current       = []
  this._isPending     = {}
  this._isHandled     = {}
  this._actions       = actions
  this._isDispatching = false

  return this.dispatch.bind(this)
}

// Dispatch event to stores.
// @param {String} action
// @param {Object | Object[]} data
// @return {Function[]}
dispatcher.dispatch = function(action, payload) {

  assert.equal(typeof action, 'string', 'action \'%s\' should be a string', action)
  assert(!this._isDispatching, 'cannot dispatch \'%s\' in the middle of a dispatch', action)

  this._current.push(action)
  this._isDispatching = true

  this._isPending         = {}
  this._isPending[action] = true

  this._isHandled         = {}
  this._isHandled[action] = false

  this.locals  = {}
  this.payload = payload

  try {
    const fn = _getAction.call(this, action)
  } catch (e) {
    _stopDispatching.call(this)
    throw e
  }

  debug('dispatch \'%s\'', action)
  fn.call(this, _stopDispatching.bind(this))
}

// Expose a delegation method to the registered
// actions. Calls `async.series()` under the hood.
// @param {String | String[]} actions
// @param {Function} done
dispatcher.waitFor = function(actions, done) {
  done = done || function() {}
  assert.equal(typeof done, 'function', 'callback should be a function')

  actions = Array.isArray(actions) ? actions : [actions]
  const ctx = this

  const arr = actions.map(function(action) {
    const fn = _getAction.call(ctx, action)
    const nwFn = _thunkify.call(ctx, fn, action)
    return nwFn.bind(ctx)
  })

  const nwArr = arr.concat(done.bind(this))
  async.series(nwArr)
}

// Deep assert if the passed actions object is correct.
// @param {Object} actions
function _assertActionsObject(actions) {
  Object.keys(actions).forEach(function(key) {
    const action = actions[key]
    if ('object' == typeof action) return _assertActionsObject(action)
    assert.equal(typeof action, 'function', 'action should be a function')
  })
}

// Thunkify a function to properly set
// `this._isHandled[action] = true` when
// done executing.
// @param {Function} fn
// @param {Function} isHandled
// @return {Function}
function _thunkify(fn, action) {

  return function(done) {
    try {
      assert.equal(typeof action, 'string', '.waitFor(): requires a string or array of strings')
      if (this._isPending[action]) {
        assert(this._isHandled[action], 'circular dependency detected while waiting for \'%s\'', action)
      }
    } catch(e) {
      _stopDispatching.call(this)
      throw e
    }

    this._isPending[action] = true
    this._isHandled[action] = false

    function fin() {
      this._current.pop()
      this._isHandled[action] = true
      done()
    }

    this._current.push(action)
    debug('\'%s\' -> \'%s\'', this._current[this._current.length - 2], action)
    fn(fin.bind(this))
  }
}

// Get the dispatched action. Traverses the call stack
// recursively until a function is found.
// @param {String[]} arr
// @param {String} action
// @return {Function}
function _getAction(action, arr, index) {
  arr = arr || action.split('_')
  index = index || 0
  const val = arr[index]

  if ('object' == typeof val) return _getAction.call(this, action, arr, index++)

  var fn = this._actions
  arr.forEach(function(obj, i) {
    assert(fn[arr[i]], 'action \'%s\' is not registered', action)
    fn = fn[arr[i]]
  })

  assert.equal(typeof fn, 'function', 'action \'%s\' is not registered', action)
  return fn.bind(this)
}

// Clear bookkeeping.
function _stopDispatching() {
  this._isDispatching = false
  this._isPending = {}
  this._isHandled = {}
  this.payload = null
  this._current = []
  this.locals = {}
}
