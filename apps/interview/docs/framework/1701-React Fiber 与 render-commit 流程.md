# 题目名
React Fiber 与 render/commit 流程

## 题目描述
什么是 React Fiber？React 一次更新大致经历哪些阶段？为什么要把渲染拆成 render 与 commit？

## 题目答案
Fiber 是 React 的一种内部数据结构与调度模型，用来把“可中断的渲染工作”拆成小任务，从而在需要时让出主线程给更高优先级的任务（如用户输入、动画）。

一次更新的大致阶段（概念层面）：
- render（也称协调/调和阶段）：
  - 计算新的 Fiber 树，找出需要变更的部分（diff），生成 effect 列表。
  - 这个阶段可以被中断、被恢复、被丢弃重做（并发特性相关）。
- commit（提交阶段）：
  - 把 effect 应用到真实 DOM（或其他宿主环境），执行生命周期/副作用。
  - 这个阶段需要保证一致性，通常不可中断。

为什么拆阶段：
- 把“可计算的工作”（render）变成可切片任务，提升响应性。
- 把“必须一次性完成的副作用”（commit）集中处理，避免中途 DOM 不一致。

面试加分点：
- 并发渲染下，render 可能执行多次，但 commit 只会对最终结果生效。
- effect（如 `useEffect`）在 commit 后异步执行，layout effect（`useLayoutEffect`）更接近同步，影响布局测量。

