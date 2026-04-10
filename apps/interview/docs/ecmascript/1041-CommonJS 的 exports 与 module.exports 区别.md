# 题目名
CommonJS 的 `exports` 与 `module.exports` 区别

## 题目描述
为什么给 `exports = ...` 赋值常常不生效？正确导出方式是什么？

## 题目答案
- `exports` 是 `module.exports` 的引用别名。
- 直接给 `exports` 重新赋值只会改变量绑定，不会改 `module.exports`。
- 正确：
  - `module.exports = value` 或 `exports.xxx = ...`。

