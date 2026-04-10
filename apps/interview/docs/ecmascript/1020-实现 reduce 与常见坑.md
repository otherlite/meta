# 题目名
实现 `Array.prototype.reduce` 与常见坑

## 题目描述
请说明 `reduce` 的行为规则，并手写一个简化版 `reduce`。需要覆盖：初始值缺省、空数组、稀疏数组（hole）的处理。

## 题目答案
`reduce` 的语义：把数组从左到右“折叠”成一个值。

规则要点：
- 如果提供 `initialValue`：
  - accumulator 初始为 `initialValue`，从 index=0 开始遍历。
- 如果不提供 `initialValue`：
  - accumulator 初始为数组中第一个“存在的元素”（跳过 hole），遍历从下一个 index 开始。
  - 若数组为空或全是 hole，则抛 `TypeError`。
- 对稀疏数组：遍历时会跳过不存在的索引（即只对 `k in array` 为 true 的元素调用回调）。

实现关键点：
- 参数校验（callback 必须是函数）。
- 处理 `thisArg`（原生 reduce 没有 thisArg，但回调第三参是 array，本题可忽略或按规范实现）。

