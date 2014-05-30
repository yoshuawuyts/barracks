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
  if (!this.callbacks[action]) this.callbacks[action] = [];
  this.callbacks[action].push(callback);
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
  if (undefined === data) throw new Error(
    'Dispatcher.dispatch: no data provided.'
  );

  if (undefined == this.callbacks[action]) throw new Error(
    'Dispatcher.dispatch: action is not registered'
  );

  this.callbacks[action]
    .forEach(function(callback) {
      callback.call(callback, data);
    });
};