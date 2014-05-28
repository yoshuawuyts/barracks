/**
 * Dispatcher prototype
 */

var dispatcher = Dispatcher.prototype;

/**
 * Exports
 */

module.exports = Dispatcher;

/**
 * Dispatcher
 *
 * Adapted from https://github.com/lipsmack/flux/tree/master/lib/core.
 *
 * @api public
 */

function Dispatcher() {
  if (!(this instanceof Dispatcher)) return new Dispatcher;
  this.callbacks = [];
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
  this.callbacks.push({
    action: action,
    callback: callback
  });
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
  this.getCallbacks(action)
    .map(function(callback) {
      return callback.call(callback, data);
    });
};

/**
 * Return registered callbacks.
 *
 * @param {String} action
 * @return {Function[]}
 * @api private
 */ 

dispatcher.getCallbacks = function(action) {
  return this.callbacks
    .filter(function(callback) {
      return callback.action === action;
    })
    .map(function(callback) {
      return callback.callback;
    });
};