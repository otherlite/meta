# 题目名
`Object.create` 的用途与陷阱

## 题目描述
`Object.create(proto)` 做了什么？它与 `new` 有什么区别？常见使用场景是什么？

## 题目答案
- `Object.create` 创建一个新对象，并把其原型指向 `proto`，不会执行构造函数。
- `new` 会执行构造函数并处理返回值规则。
- 场景：寄生组合继承（`Child.prototype = Object.create(Parent.prototype)`）。
- 注意：`Object.create(null)` 创建无原型对象，无法直接使用 `hasOwnProperty`。

