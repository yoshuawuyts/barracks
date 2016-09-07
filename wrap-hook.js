module.exports = wrapHook

// fold an array of wrappers around a function recursively
// (fn, arr) -> fn
function wrapHook (fn, arr) {
  arr.forEach(function (cb) {
    fn = cb(fn)
  })
  return fn
}
