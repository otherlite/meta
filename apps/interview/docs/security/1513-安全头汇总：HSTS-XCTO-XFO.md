# 题目名
安全头汇总：HSTS / X-Content-Type-Options / X-Frame-Options

## 题目描述
这些响应头分别解决什么安全问题？上线时有哪些注意事项？

## 题目答案
- HSTS：强制 HTTPS，防 SSL Strip；开启前确认全站 HTTPS。
- `X-Content-Type-Options: nosniff`：防 MIME 嗅探导致脚本执行。
- XFO：防点击劫持（也可用 CSP `frame-ancestors`）。

