const barracks = require('barracks')

// This is an example of how to use
// `flux-standard-action` with `barracks`.
// FSA's can only have 4 properties:
// 'type', 'payload', 'error', 'meta'
// You can use any library to create FSA's.
// https://github.com/acdlite/flux-standard-action

const d = barracks()

d.on('foo', (action) => console.log(action.error || action.payload))

d({
  type: 'foo',
  payload: { bin: 'baz' }
})
// => {bin: 'baz'}

d({
  type: 'foo',
  payload: { bin: 'baz' },
  error: 'oh no, something went wrong!'
})
// => 'oh no, something went wrong!'
