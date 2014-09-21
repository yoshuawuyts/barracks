/**
 * Module dependences
 */

var debug = require('debug')('barracks');
var assert = require('assert');

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
  this._pendingPayload = null;

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

  var arr = action.split('_');

  this._isDispatching = true;
  this._payload = payload;
  this._action = action;

  try {
    var fn = _handleDispatch.call(this, arr, 0);
  } catch (e) {
    this._pendingPayload = null;
    this._isDispatching = false;
    throw e;
  }

  fn.call(this, this._payload, this._cb, function() {
    this._pendingPayload = null;
    this._isDispatching = false;
  });
};

/**
 * Expose a delegation method to the registered actions.
 *
 * @param {String[]} ids
 * @param {Function} done
 * @api public
 */

dispatcher.waitFor = function(id, done) {
  assert(this._isDispatching, '.waitFor() can only be invoked while dispatching');

  if (this._isPending[id]) assert(this._isHandled[id]);
  assert(this._actions[id]);

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
 * Handle the dispatched action. Traverses the call stack
 * recursively until a function is found, then calls it with
 * the given arguments.
 *
 * @param {String[]} arr
 * @param {Number} index
 * @api private
 */

function _handleDispatch(arr, index) {

  var val = arr[index];
  if ('object' == typeof val) return _handleDispatch.call(this, arr, index++);

  var fn = this._actions;
  arr.forEach(function(obj, i) {
    assert(fn[arr[i]], 'Action \'' + this._action + '\' is not registered');
    fn = fn[arr[i]];
  }.bind(this));

  assert('function' == typeof fn, 'Action \'' + this._action + '\' is not registered');
  debug('Dispatched action \'%s\'.', this._action);
  return fn;
}
