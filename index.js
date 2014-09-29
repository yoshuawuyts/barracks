/**
 * Module dependences
 */

var debug = require('debug')('barracks');
var assert = require('assert');
var async = require('async');

/**
 * Exports
 */

module.exports = Dispatcher;

/**
 * Dispatcher prototype
 */

var dispatcher = Dispatcher.prototype;

/**
 * Initialize the dispatcher with an
 * 'actions' object.
 *
 * @return {Object}
 * @api public
 */

function Dispatcher(actions) {

  if (!(this instanceof Dispatcher)) return new Dispatcher(actions);

  assert(actions, 'An \'actions\' object should be passed as an argument');
  assert('object' == typeof actions, 'Actions should be an object');
  _assertActionsObject(actions);

  this._isPending = {};
  this._isHandled = {};
  this._actions = actions;
  this._isDispatching = false;

  return this.dispatch.bind(this);
};

/**
 * Dispatch event to stores.
 *
 * @param {String} action
 * @param {Object | Object[]} data
 * @return {Function[]}
 * @api public
 */

dispatcher.dispatch = function(action, payload) {

  assert('string' == typeof action, 'Action \'' + action + '\' should be a string');
  assert(!this._isDispatching, 'Cannot dispatch \'' + action + '\' in the middle of a dispatch');

  this._isDispatching = true;

  this._isPending = {};
  this._isPending[action] = true;

  this._isHandled = {};
  this._isHandled[action] = false;

  this.locals = {};
  this.locals.payload = payload;

  try {
    var fn = _getAction.call(this, action);
  } catch (e) {
    _stopDispatching.call(this);
    throw e;
  }

  debug('dispatch \'%s\'', action);
  fn.call(this, this.locals.payload, _stopDispatching.bind(this));
};

/**
 * Expose a delegation method to the registered actions. Calls `async.series()`
 * under the hood. Sets a 'pending' state to
 *
 * @param {String[] |} ids
 * @param {Function} done
 * @api public
 */

dispatcher.waitFor = function(actions, done) {
  done = done || function() {};
  assert('function' == typeof done, 'Callback should be a function');

  actions = Array.isArray(actions) ? actions : [actions];

  var arr = actions.map(function(action) {

    var fn = _getAction.call(this, action);
    var nwFn = _thunkify.call(this, fn, action);
    return nwFn.bind(this);

  }.bind(this));

  var nwArr = arr.concat(done.bind(this));
  async.series(nwArr);
};

/**
 * Deep assert if the passed actions object is correct.
 *
 * @param {Object} actions
 * @api private
 */

function _assertActionsObject(actions) {
  Object.keys(actions).forEach(function(key) {
    var action = actions[key];
    if ('object' == typeof action) return _assertActionsObject(action);
    assert('function' == typeof action, 'Action should be a function');
  });
}

/**
 * Thunkify a function to properly set
 * `this._isHandled[action] = true` when
 * done executing.
 *
 * @param {Function} fn
 * @param {Function} isHandled
 * @return {Function}
 */

function _thunkify(fn, action) {

  return function(done) {
    try {
      assert('string' == typeof action, '.waitFor(): requires a string or array of strings');
      if (this._isPending[action]) {
        assert(this._isHandled[action], 'Circular dependency detected while waiting for \'' + action + '\'');
      }
    } catch(e) {
      _stopDispatching.call(this);
      throw e;
    }

    this._isPending[action] = true;
    this._isHandled[action] = false;

    function fin() {
      this._isHandled[action] = true;
      done();
    }

    debug('wait for \'' + action + '\'');
    fn(this.locals.payload, fin.bind(this));

  }
}

/**
 * Get the dispatched action. Traverses the call stack
 * recursively until a function is found.
 *
 * @param {String[]} arr
 * @param {String} action
 * @return {Function}
 * @api private
 */

function _getAction(action, arr, index) {
  arr = arr || action.split('_');
  index = index || 0;
  var val = arr[index];

  if ('object' == typeof val) return _getAction.call(this, action, arr, index++);

  var fn = this._actions;
  arr.forEach(function(obj, i) {
    assert(fn[arr[i]], 'Action \'' + action + '\' is not registered');
    fn = fn[arr[i]];
  }.bind(this));

  assert('function' == typeof fn, 'Action \'' + action + '\' is not registered');
  return fn.bind(this);
}

/**
 * Clear bookkeeping.
 *
 * @api private
 */

function _stopDispatching() {
  this._isDispatching = false;
  this._isPending = {};
  this._isHandled = {};
  this.locals = null;
}
