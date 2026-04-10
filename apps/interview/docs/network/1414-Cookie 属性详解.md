# 题目名
Cookie 属性详解

## 题目描述
解释 `Domain/Path/Expires/Max-Age/HttpOnly/Secure/SameSite` 的作用与安全意义。

## 题目答案
- `Domain/Path` 控制发送范围。
- `Expires/Max-Age` 控制生命周期。
- `HttpOnly` 防 XSS 读取。
- `Secure` 仅 HTTPS 发送。
- `SameSite` 控制跨站携带，降低 CSRF 风险。

