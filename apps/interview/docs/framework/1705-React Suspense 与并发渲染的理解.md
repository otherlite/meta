# 题目名
React Suspense 与并发渲染的理解

## 题目描述
Suspense 解决什么问题？它与并发渲染（Concurrent Rendering）是什么关系？使用时有哪些边界与注意点？

## 题目答案
Suspense 的目标：把“等待某些异步依赖”抽象成可组合的 UI 边界（fallback），让加载态与错误态更结构化。

与并发渲染的关系：
- 并发渲染让 React 能在 render 阶段做可中断计算，必要时让出主线程。
- Suspense 作为机制让 React 在“数据/代码未就绪”时可以暂停当前子树的渲染，并展示 fallback，同时保持 UI 一致性。

常见使用：
- 代码分割：`React.lazy` + `<Suspense fallback>`。
- 数据请求：需要配合支持 Suspense 的数据层（或框架）来抛出 promise。

注意点：
- fallback 的粒度要合适：边界太大可能导致整个页面频繁闪烁。
- 错误处理要配合 Error Boundary（Suspense 不负责捕获错误）。
- 并发相关特性需要理解“render 可能执行多次”，避免在 render 阶段写副作用。

