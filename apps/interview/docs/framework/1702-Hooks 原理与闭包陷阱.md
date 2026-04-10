# 题目名
Hooks 原理与闭包陷阱

## 题目描述
Hooks 为什么必须“按固定顺序调用”？闭包陷阱是什么？如何写出不会踩坑的 `useEffect`/`useCallback`？

## 题目答案
Hooks 按固定顺序调用的原因：
- React 在运行时用“链表/数组”之类的结构按调用顺序存储每个 Hook 的状态。
- 如果在条件分支/循环中调用 Hook，会导致本次渲染与上次渲染的 Hook 序列对不上，从而读写错位。

闭包陷阱：
- 函数组件每次渲染都会创建新的函数与新的闭包。
- 如果 effect/callback 依赖了某个 state/props，但依赖数组没写全，就可能捕获到旧值（stale closure），导致逻辑不符合预期。

实践建议：
- `useEffect`：依赖数组写全（以“用到什么依赖什么”为原则），必要时把计算提到 effect 内或用 `useMemo/useCallback` 稳定引用。
- 对需要“读最新值但不触发重新订阅/重新创建”的场景：
  - 用 `useRef` 存最新值（在 effect 内更新 ref），回调读取 ref。
- 避免过度 `useCallback`：它是性能优化手段，不是语义工具；过度使用会让依赖关系更难维护。

面试加分点：
- React 的 lint 规则（hooks/exhaustive-deps）能帮助发现遗漏依赖，但仍需理解依赖的语义。

