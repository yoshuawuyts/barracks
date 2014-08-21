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
 *   dispatcher({
 *     users: {
 *       add: function() {},
 *       remove: function() {}
 *     },
 *     courses: {
 *       get: function() {},
 *       put: function() {done()}
 *     }
 *   });
 *
 * @return {Object}
 * @api public
 */

function Dispatcher(actions) {

  if (!(this instanceof Dispatcher)) return new Dispatcher(actions);

  var existError = 'An \'actions\' object should be passed as an argument';
  var nestedError = 'Namespaces should not be nested';
  var functionError = 'Action should be a function';
  var objectError = 'Actions should be an object';

  assert('undefined' != typeof actions, existError);
  assert('object' == typeof actions, objectError);
  Object.keys(actions).forEach(function(key) {
    var action = actions[key];
    if ('object' == typeof action) {
      Object.keys(action).forEach(function(nestedKey) {
        var nestedAction = action[nestedKey];
        assert('object' != typeof nestedAction, nestedError);
        assert('function' == typeof nestedAction, functionError)
      });
    } else assert('function' == typeof actions[key], functionError);
  });

  this.actions = actions;
};

/**
 * Dispatch event to stores.
 *
 *   dispatcher.dispatch('course_update', {id: 123, title: 'Tobi'});
 *
 * @param {String} action
 * @param {Object | Object[]} data
 * @return {Function[]}
 * @api public
 */

dispatcher.dispatch = function(action, data) {
  assert('string' == typeof action, 'Action should be a string');
  var accessor = action.split('_');

  switch(accessor.length) {
    case 1:
      var fn = this.actions[accessor[0]];
      break;

    case 2:
      var fn = this.actions[accessor[0]][accessor[1]];
      break;

    default:
      throw new Error('Namespaces should not be nested');
  }

  assert('function' == typeof fn, 'Action \'' + action + '\' is not registered');
  debug('Dispatched action \'' + action + '\'.');
  return fn(data);
};
