# 题目名
React `useEffect` 与 `useLayoutEffect` 的差异

## 题目描述
二者的执行时机有什么区别？为什么 `useLayoutEffect` 可能阻塞渲染？什么时候必须用它？

## 题目答案
- `useEffect`：commit 后异步执行，不阻塞绘制。
- `useLayoutEffect`：commit 后、浏览器绘制前同步执行，可能阻塞首帧。
- 场景：需要测量 DOM 并立刻同步更新布局（避免闪烁）时用 layoutEffect；其他情况优先 useEffect。

