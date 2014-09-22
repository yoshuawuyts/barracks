/**
 * Module dependences
 */

var debug = require('debug')('barracks');
var assert = require('assert');
var async = require('async');
var toString = Object.prototype.toString;

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

  assert('string' == typeof action, 'Action should be a string');
  assert(!this._isDispatching, 'Cannot dispatch in the middle of a dispatch');

  this._payload = payload;
  this._isHandled = {};
  this._isPending = {};
  this._isPending[action] = true;
  this._isDispatching = true;

  try {
    var fn = _getAction.call(this, action);
  } catch (e) {
    _stopDispatching.call(this);
    throw e;
  }

  debug('Dispatched action \'%s\'.', action);
  fn.call(this, this._payload, _stopDispatching.bind(this));
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
  assert(!done || 'function' == typeof done, 'Callback should be a function');

  if ('[object Array]' != toString.call(actions)) actions = [actions];

  var arr = actions.map(function(action) {
    assert('string' == typeof action, '.waitFor(): requires a string or array of strings');
    try {
      assert(!this._isPending[action], 'Circular dependency detected while waiting for \'' + action + '\'');
    } catch(e) {
      _stopDispatching.call(this);
      throw e;
    }

    this._isPending[action] = true;
    this._isHandled[action] = false;

    var nwAction = _getAction.call(this, action);
    return nwAction.bind(this, this._payload)
  }.bind(this));

  debug('Waiting for actions', actions);
  var nwArr = arr.concat(done);

  // Call all functions in series and set their handled
  // state to `true` when finished.

  async.series(nwArr, cb);

  function cb() {
    actions.forEach(function(action) {
      this._isHandled[action] = true;
    }.bind(this));
  }
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
  index == index || 0;
  var val = arr[index];

  if ('object' == typeof val) return _getAction.call(this, action, arr, index++);

  var fn = this._actions;
  arr.forEach(function(obj, i) {
    assert(fn[arr[i]], 'Action \'' + action + '\' is not registered');
    fn = fn[arr[i]];
  }.bind(this));

  assert('function' == typeof fn, 'Action \'' + action + '\' is not registered');
  this._isPending[action] = true;
  return fn;
}

/**
 * Clear bookkeeping.
 *
 * @api private
 */

function _stopDispatching() {
  this._isDispatching = false;
  this._payload = null;
  this._isPending = {};
  this._isHandled = {};
}
