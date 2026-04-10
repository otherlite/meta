# 题目名
WebSocket 与 SSE 的取舍

## 题目描述
WebSocket 与 SSE（Server-Sent Events）有什么差异？各自适合哪些实时场景？

## 题目答案
- WebSocket：全双工，适合双向实时交互（IM、协作）。
- SSE：服务端单向推送，基于 HTTP，重连友好，适合通知/实时数据流。
- 选型看：是否需要双向、代理/负载均衡支持、消息量与可靠性需求。

