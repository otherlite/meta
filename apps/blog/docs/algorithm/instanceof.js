var instanceof2 = function (L, R) {
  while (L) {
    if (L === R.prototype) {
      return true
    }
    L = L.__proto__
  }

  return false
}

var A = function () {}

instanceof2({}, Object)
instanceof2(new A(), A)
instanceof2(new A(), Object)
