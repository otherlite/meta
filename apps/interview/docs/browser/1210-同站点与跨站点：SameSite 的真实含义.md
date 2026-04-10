# 题目名
同站点与跨站点：SameSite 的真实含义

## 题目描述
SameSite 说的是“同源”还是“同站点”？`Lax/Strict/None` 的差异是什么？在登录态与第三方登录回跳场景下如何选择？

## 题目答案
SameSite 关注的是“站点（site）”而非严格的“源（origin）”。
- 站点通常以 eTLD+1（可注册域）为核心判定，例如 `a.example.com` 与 `b.example.com` 通常视为同站点。

三种模式：
- `Strict`：跨站请求不携带 Cookie，最安全，但会影响许多跨站跳转后的登录态。
- `Lax`：大多数跨站子资源请求不带 Cookie，但顶级导航（如点击链接跳转）在部分情况下会携带，兼容性更好。
- `None`：允许跨站携带 Cookie，必须配合 `Secure`。

实践选择：
- 普通站点登录态：优先 `Lax` 或 `Strict`（结合业务）。
- 第三方登录/跨站嵌入：可能需要 `None; Secure`，并配合 CSRF Token 等防护。

