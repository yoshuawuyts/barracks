/**
 * Module dependencies.
 */

var dispatcher = require('barracks');
var count = require('./count');

/**
 * Create the dispatcher.
 */

module.exports = dispatcher({
  user: {
    update: count.update,
    get: count.get
  }
});
