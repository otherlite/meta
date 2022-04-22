const flat = function (arr, depth = Infinity) {
  if (!Array.isArray(arr)) return arr
  if (depth === 0) return arr
  let result = []
  for (let item of arr) {
    result = result.concat(flat(item, depth - 1))
  }

  return result
}

console.log(JSON.stringify(flat([[1, 2, 3], 4, 5, [1, 2, 3, [6, 7, 8]]], 1)))
console.log(JSON.stringify(flat([[1, 2, 3], 4, 5, [1, 2, 3, [6, 7, 8]]], 2)))
console.log(JSON.stringify(flat([[1, 2, 3], 4, 5, [1, 2, 3, [6, 7, 8]]])))
