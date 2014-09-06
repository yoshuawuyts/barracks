/**
 * Module dependencies.
 */

var countStore = require('../stores/count');
var dispatcher = require('barracks');

/**
 * Update the count store.
 *
 * @param {Number} arg
 */

exports.update = function(arg) {
  var val = countStore.get();
  countStore.update(val + arg);
};

/**
 * Get current count.
 *
 * @param {String} namespace
 */

exports.get = function(namespace) {
  countStore.get(namespace);
};
