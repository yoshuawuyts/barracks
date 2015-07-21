const barracks = require('barracks')

// This is an example of using multiple
// delegations with `barracks`.
const d = barracks()

d.on('foo', (data, wait) => {
  console.log('foo')
  wait(['bin', 'baz', 'bar'], () => console.log('all done!'))
})

d.on('bin', (data, wait) => {
  console.log('bin')
  wait('baz')
})

d.on('baz', () => console.log('baz'))
d.on('bar', () => console.log('bar'))

d('foo')
// => 'foo'
// => 'bin'
// => 'baz'
// => 'baz'
// => 'bar'
// => 'all done!
