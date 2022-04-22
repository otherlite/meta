var parseUrl = function (str) {
  if (!str) return {}

  const result = {}

  const pairs = str.split('&')

  for (let pair of pairs) {
    const [keys, value = ''] = pair.split('=')

    const keyArr = keys.split(/[\[\]]/).filter((item) => item)

    let temp = result
    let i = 0
    for (; i < keyArr.length - 1; i++) {
      const key = keyArr[i]
      if (!temp[key]) {
        temp[key] = {}
      }
      temp = temp[key]
    }
    temp[keyArr[i]] = value
  }

  return result
}

console.log(JSON.stringify(parseUrl('q=nba&src=home&fr=so')))
console.log(JSON.stringify(parseUrl('q=nba&fe[pro]=news&fe[pid]=result')))
console.log(JSON.stringify(parseUrl('q=nba&fe[pro][aaa]=news&fe[pid]=result')))
