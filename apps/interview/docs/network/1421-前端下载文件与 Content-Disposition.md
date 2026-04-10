# 题目名
前端下载文件与 `Content-Disposition`

## 题目描述
浏览器下载文件时 `Content-Disposition` 有什么作用？如何处理中文文件名？

## 题目答案
- `Content-Disposition: attachment; filename=...` 触发下载并指定文件名。
- 中文文件名常用 `filename*`（RFC 5987）编码。
- 前端用 blob/url 下载时也要注意跨域与响应头暴露（CORS）。

