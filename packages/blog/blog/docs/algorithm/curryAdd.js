var add = function (a, b, c) {
  return a + b + c
}

var curry = function (func, ...args) {
  if (args.length < func.length) {
    return function (...restArgs) {
      return curry(add, ...args, ...restArgs)
    }
  } else {
    return func(...args)
  }
}

var curryAdd = curry(add)

console.log(curryAdd(1)(2)(3))
