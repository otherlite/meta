# 题目名
实现 `Promise.all` 与 `Promise.race` 的关键点

## 题目描述
手写 `Promise.all` / `Promise.race` 需要注意哪些关键点？如何处理非 Promise 值、顺序保持、空数组、以及失败短路？

## 题目答案
`Promise.all(iterable)`：
- 返回一个新 Promise。
- 对每一项用 `Promise.resolve(item)` 归一化（兼容非 Promise 值与 thenable）。
- 成功：
  - 需要保持结果顺序与输入顺序一致（用 index 填坑）。
  - 计数器记录已完成数量，全部完成才 resolve。
- 失败：
  - 任意一个 reject，整体立刻 reject（短路），后续结果忽略。
- 空输入：应立即 resolve 为 `[]`。

`Promise.race(iterable)`：
- 返回一个新 Promise。
- 对每一项 `Promise.resolve` 后，谁先 settle（resolve 或 reject）就以该结果 settle。

边界注意：
- iterable 可能不是数组，应该可遍历。
- `all` 在短路后可能仍有异步在跑，但不会改变已 settle 的状态。

