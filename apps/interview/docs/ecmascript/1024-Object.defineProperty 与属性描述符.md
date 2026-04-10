# 题目名
`Object.defineProperty` 与属性描述符

## 题目描述
什么是属性描述符（writable/configurable/enumerable/get/set）？它们分别影响什么？

## 题目答案
- 数据属性：`value` + `writable` 控制能否改值。
- 可枚举：`enumerable` 决定是否出现在 `for...in/Object.keys`。
- 可配置：`configurable` 决定能否 delete 或重新定义描述符。
- 访问器：`get/set` 用于拦截读取/写入（Vue2 响应式的基础）。

