# 题目名
React 状态管理选型：Context / Redux / Store

## 题目描述
在 React 项目中什么时候用 Context 就够了？什么时候需要 Redux（或其他 store）？如何避免 Context 导致的过度渲染？

## 题目答案
Context 适合：
- 低频变更、全局读取的配置类数据：主题、语言、权限点、依赖注入（service）。
- 局部范围的共享状态：某个页面/模块内部共享。

Redux/Store 适合：
- 状态复杂且跨页面/跨组件大量共享。
- 需要可预测的数据流、可调试能力（时间旅行、action 追踪）、中间件扩展。
- 需要把业务状态与 UI 解耦，便于测试与协作。

避免 Context 过度渲染：
- 拆分 Context：把高频变更与低频变更拆开，避免一个 Provider 变更让大树重渲。
- 传递稳定引用：用 `useMemo` 保证 value 不在无关渲染时变化。
- 使用选择器机制：通过自建 selector 或使用支持 selector 的库，做到按需订阅。

