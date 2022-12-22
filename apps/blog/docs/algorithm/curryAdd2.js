var curryAdd = function (num) {
  if (num === undefined) throw '需要至少一个数'

  const createAdd = function (arr) {
    return function (num2) {
      if (num2 === undefined) {
        return arr.reduce((pre, curr) => pre + curr)
      } else {
        return createAdd([...arr, num2])
      }
    }
  }

  return createAdd([num])
}

console.log(curryAdd(1)())
console.log(curryAdd(1)(2)())
console.log(curryAdd(1)(2)(3)())
