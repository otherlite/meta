# 题目名
浏览器缓存位置：Memory / Disk / Service Worker

## 题目描述
浏览器缓存大致有哪些层级（内存缓存、磁盘缓存、Service Worker Cache、HTTP 缓存）？它们的优先级与适用场景是什么？

## 题目答案
- Memory Cache：进程内存中，命中快但生命周期短（页面/进程级）。
- Disk Cache：持久化到磁盘，命中慢于内存但可跨会话。
- SW Cache：应用可控缓存（Cache Storage），可做离线与策略化更新。
- HTTP 缓存策略由响应头决定；SW 可拦截并覆盖默认策略。

