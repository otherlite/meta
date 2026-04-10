# 题目名
Generator 的典型应用场景

## 题目描述
Generator 有哪些实际用途？与 async/await 相比如何选择？

## 题目答案
- 迭代：按需生成序列（分页、惰性计算）。
- 协程：用 `yield` 暂停/恢复，历史上用于控制异步流程（如 redux-saga）。
- 选择：业务异步更推荐 async/await；需要可暂停的流程编排/流式迭代可用 Generator。

