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
  this._actions = actions;

  return dispatch.bind(this);
};

/**
 * Assert if the passed actions object is correct.
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
 * Dispatch event to stores.
 *
 * @param {String} action
 * @param {Object | Object[]} data
 * @return {Function[]}
 * @api public
 */

function dispatch(action, payload, cb) {

  assert('string' == typeof action, 'Action should be a string');
  assert(!cb || 'function' == typeof cb, 'Callback should be a function');

  this._cb = cb || function() {};
  this._payload = payload;
  this._action = action;

  var arr = action.split('_');

  _handleDispatch.call(this, arr, 0);
};

/**
 * Handle the dispatched action. Traverses the call stack
 * recursively until a function is found calling it with
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
  for (i = 0, j = arr.length; i < j; i++) fn = fn[arr[i]];

  assert(fn, 'Action \'' + this._action + '\' is not registered');
  debug('Dispatched action \'' + this._action + '\'.');

  fn(this._payload, this._cb);
}
