var deepClone = function (target) {
  const map = new Map()
  const deepCloneWithLoop = function (target) {
    if (typeof target !== 'object' || target === null) return target
    let existObj = map.get(target)
    if (existObj) return existObj

    existObj = Array.isArray(target) ? [] : {}
    map.set(target, existObj)

    for (let key in target) {
      existObj[key] = deepCloneWithLoop(target[key])
    }

    return existObj
  }
  return deepCloneWithLoop(target)
}

var target = {
  field1: 1,
  field2: undefined,
  field3: {
    child: 'child',
  },
  field4: [2, 4, 8],
}
target.target = target
target.field3.target = target

deepClone(target)
