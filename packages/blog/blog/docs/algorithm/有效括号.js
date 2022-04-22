var validBracket = function (str) {
  if (!str) return false
  const stack = []
  const map = { '{': '}', '(': ')', '[': ']' }
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    if (char === '[' || char === '(' || char === '{') {
      stack.push(map[char])
      continue
    }
    if (char === ']' || char === ')' || char === '}') {
      const leftBracket = stack.pop()
      if (leftBracket !== char) return false
    }
  }
  return stack.length === 0
}

console.log(validBracket('(123)'))
console.log(validBracket('(12{}3)'))
console.log(validBracket('(12{1111[]}3)'))
console.log(validBracket('(12{1231[123123]23}3)'))
console.log(validBracket('(12{1231[123123]23}3'))
