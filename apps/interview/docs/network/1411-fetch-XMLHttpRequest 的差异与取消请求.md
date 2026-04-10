# 题目名
`fetch` 与 `XMLHttpRequest` 的差异与取消请求

## 题目描述
对比 `fetch` 与 XHR：API 设计、默认行为、错误处理、进度事件、取消请求分别有什么差异？如何在 `fetch` 中取消请求？

## 题目答案
差异点：
- API 风格：
  - XHR 是事件回调式。
  - fetch 基于 Promise，更易组合。
- 错误处理：
  - fetch 只有网络错误才 reject；HTTP 4xx/5xx 仍 resolve，需要手动判断 `response.ok/status`。
- 进度：
  - XHR 原生支持上传/下载进度事件。
  - fetch 需要通过 Streams/ReadableStream 自行处理（更复杂）。

取消请求：
- fetch 用 `AbortController`：创建 controller，把 `signal` 传入 fetch；需要取消时调用 `controller.abort()`。

工程建议：
- 统一封装请求层：处理错误码、超时、取消、重试、鉴权等。

