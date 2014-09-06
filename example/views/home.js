/**
 * Module dependencies.
 */

var react = require('react');
var dispatcher = require('../dispatcher/dispatcher');
var countStore = require('../stores/count');
var dom = react.DOM;

/**
 * Home class.
 */

module.exports = react.createClass({
  displayName: 'homeView',
  componentWillMount: handleComponentWillMount,
  render: render
});

/**
 * Handle component will mount.
 */

function handleComponentWillMount() {

  // Listen for `get` events. This stricly
  // isn't needed since the `change` event
  // already provides the new value. But for the
  // sake of example we're doing it the hard way.

  countStore.on('get:home', function() {
    if (this.isMounted()) this.setState({
      count: count
    });
  }.bind(this));

  countStore.on('change', function() {
    dispatcher('count_get', 'home');
  });

  dispatcher('count_update', 0);
}

/**
 * Render.
 */

function render() {
  return dom.section(null,
    dom.h1(null, this.state.count),
    dom.button({onClick: handleClick.bind(this)})
  );
}

/**
 * Handle click. Updates the count by 1.
 */

function handleClick() {
  dispatcher('count_update', 1);
}
