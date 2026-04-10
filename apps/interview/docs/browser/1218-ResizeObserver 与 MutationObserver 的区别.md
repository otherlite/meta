# 题目名
`ResizeObserver` 与 `MutationObserver` 的区别

## 题目描述
二者分别监听什么？回调触发时机有什么差异？使用时有哪些性能注意点？

## 题目答案
- MutationObserver：监听 DOM 结构/属性变化，回调在微任务队列中批量触发。
- ResizeObserver：监听元素尺寸变化，适合布局自适应。
- 注意：观察范围过大或回调做重工作会造成性能问题，需限制监听对象与节流。

