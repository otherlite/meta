# 题目名
Range 请求与断点续传

## 题目描述
什么是 Range 请求？`206 Partial Content` 代表什么？它在大文件下载与视频播放中如何使用？

## 题目答案
- 客户端用 `Range: bytes=start-end` 请求部分内容。
- 服务器返回 `206` 与 `Content-Range`。
- 场景：断点续传、分片下载、流媒体按需加载。

