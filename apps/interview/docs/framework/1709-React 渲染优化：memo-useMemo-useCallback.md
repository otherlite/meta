# 题目名
React 渲染优化：`memo`/`useMemo`/`useCallback`

## 题目描述
这三个工具分别优化什么？如何组合使用避免“优化反而更慢”？

## 题目答案
- `memo`：跳过子组件重渲（依赖 props 浅比较）。
- `useMemo`：缓存计算值。
- `useCallback`：缓存函数引用。
- 组合：先定位重渲原因，再在边界处稳定 props 引用；避免在每个组件里无脑套用。

