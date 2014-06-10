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
 * Dispatcher
 *
 * @return {Object}
 * @api public
 */

function Dispatcher() {
  if (!(this instanceof Dispatcher)) return new Dispatcher;
  this.callbacks = {};
};

/**
 * Register a new store.
 *
 *   dispatcher.register('update_course', callbackFunction);
 *
 * @param {String} action
 * @param {Function} callback
 * @api public
 */

dispatcher.register = function(action, callback) {
  assert('string' == typeof action, 'dispatcher.register: action must be a string');
  assert('function' == typeof callback, 'dispatcher.register: callback must be a function');
  debug('Registered action \'' + action + '\'.');
  
  if (!this.callbacks[action]) this.callbacks[action] = [];
  this.callbacks[action].push(callback);

  return this;
};

/**
 * Dispatch event to stores.
 *
 *   dispatcher.dispatch('update_course', {id: 123, title: 'Tobi'});
 *
 * @param {String} action
 * @param {Object | Object[]} data
 * @return {Function[]}
 * @api public
 */

dispatcher.dispatch = function(action, data) {
  assert(undefined !== data, 'dispatcher.dispatch: no data provided');
  assert(undefined != this.callbacks[action], 'dispatcher.dispatch: action is not registered');
  debug('Dispatched action: \'' + action + '\'.');

  this.callbacks[action]
    .forEach(function(callback) {
      callback.call(callback, data);
    });
};