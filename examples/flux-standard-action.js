const isFsa = require('flux-standard-action').isFSA
const barracks = require('barracks')
const assert = require('assert')

// This is an example of how to use
// `flux-standard-action` with `barracks`.
// You can use any library to create FSA's.
// https://github.com/acdlite/flux-standard-action

const d = barracks()

module.exports = fsaWrap

d.on('foo', () => console.log('something'))
d.on('bar', () => console.log('something else'))

// consume `flux standard actions`
// obj -> null
function fsaWrap (action) {
  assert.ok(isFsa(action), action + ' is not a flux standard action')
  d(action.type, action)
}
