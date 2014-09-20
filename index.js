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

  Object.keys(actions).forEach(function(key) {
    var action = actions[key];
    if ('object' == typeof action) {
      Object.keys(action).forEach(function(nestedKey) {
        var nestedAction = action[nestedKey];
        assert('object' != typeof nestedAction, 'Namespaces should not be nested');
        assert('function' == typeof nestedAction, 'Action should be a function');
      });
    } else assert('function' == typeof actions[key], 'Action should be a function');
  });

  this.actions = actions;

  return dispatch.bind(this);
};

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

  var fn = this.actions;
  for (i = 0, j = arr.length; i < j; i++) fn = fn[arr[i]];

  assert('function' == typeof fn, 'Action \'' + this._action + '\' is not registered');
  debug('Dispatched action \'' + this._action + '\'.');

  fn(this._payload, this._cb);
}
