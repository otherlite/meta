# 题目名
任务调度：`setTimeout` / `MessageChannel` / `queueMicrotask`

## 题目描述
三者分别把回调放到哪里？常见使用场景与注意事项是什么？

## 题目答案
- `queueMicrotask`：微任务，适合在当前宏任务结束后立刻执行收尾逻辑。
- `MessageChannel`：宏任务（task），延迟更稳定，常用于调度/分片。
- `setTimeout`：宏任务且受最小延迟限制与节流影响。
- 注意：不要用大量微任务做大计算，会阻塞渲染。

