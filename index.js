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
  this._payload = null;

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
    var fn = _handleDispatch.call(this, arr);
  } catch (e) {
    this._payload = null;
    this._isDispatching = false;
    throw e;
  }

  debug('Dispatched action \'%s\'.', this._action);
  fn.call(this, this._payload, this._cb, function() {
    this._payload = null;
    this._isDispatching = false;
  });
};

/**
 * Expose a delegation method to the registered actions.
 *
 * @param {String[] |} ids
 * @param {Function} done
 * @api public
 */

dispatcher.waitFor = function(ids, done) {
  assert(!done || 'function' == typeof done, 'Callback should be a function');

  if ('[object Array]' != toString.call(ids)) ids = [ids];

  var arr = ids.map(function(id) {
    assert('string' == typeof id, '.waitFor(): requires a string or array of strings');
    var actArr = id.split('_');
    return _handleDispatch.call(this, actArr);
  }.bind(this));

  debug('Waiting for actions', ids);
  var nwArr = arr.concat(done);
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
 * Handle the dispatched action. Traverses the call stack
 * recursively until a function is found.
 *
 * @param {String[]} arr
 * @return {Function}
 * @api private
 */

function _handleDispatch(arr, index) {
  index == index || 0;
  var val = arr[index];

  if ('object' == typeof val) return _handleDispatch.call(this, arr, index++);

  var fn = this._actions;
  arr.forEach(function(obj, i) {
    assert(fn[arr[i]], 'Action \'' + this._action + '\' is not registered');
    fn = fn[arr[i]];
  }.bind(this));

  assert('function' == typeof fn, 'Action \'' + this._action + '\' is not registered');
  return fn;
}
