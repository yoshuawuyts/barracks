/**
 * Module dependencies.
 */

var store = require('simple-store');

/**
 * Initialize the store with value 0.
 */

var count = store(0);

/**
 * Exports.
 *
 * Simple-store provides .get
 * and .update methods, so that's
 * already being exported for us.
 */

module.exports = count;
