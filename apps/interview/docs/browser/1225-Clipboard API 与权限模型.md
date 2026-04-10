# 题目名
Clipboard API 与权限模型

## 题目描述
现代剪贴板 API 如何使用？为什么必须在用户手势下调用？失败时如何降级？

## 题目答案
- `navigator.clipboard.writeText/readText` 通常要求 HTTPS 与用户手势。
- 权限模型避免网页静默读取/写入剪贴板。
- 降级：使用 `execCommand('copy')`（旧方案）或提示用户手动复制。

