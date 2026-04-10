# 题目名
async/await 的错误处理与并发控制

## 题目描述
`async/await` 与 Promise 的关系是什么？如何做错误处理？如何控制并发（例如同时跑 5 个请求）？

## 题目答案
关系：`async` 函数返回一个 Promise；`await x` 等价于把后续逻辑放进 `then` 中，并把异常用 `reject` 传播。

错误处理：
- 用 `try/catch` 捕获 `await` 处抛出的异常（包括 Promise reject）。
- 对并行任务：`await Promise.all([...])` 只要有一个 reject 整体就 reject；想“尽量都返回”用 `Promise.allSettled`。

并发控制（思路）：
- 不要一次性 `Promise.all` 发出成百上千请求；用“任务队列 + worker”或“信号量”限制在 `limit` 个并发。
- 核心：维持一个正在执行的 Promise 集合，完成一个就补一个，直到任务耗尽。

工程加分点：
- 需要取消请求时，配合 `AbortController`。
- 对耗时操作增加超时封装（`Promise.race([task, timeout])`），并在超时后取消底层任务（若支持）。

