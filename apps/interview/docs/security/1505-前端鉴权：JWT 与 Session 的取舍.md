# 题目名
前端鉴权：JWT 与 Session 的取舍

## 题目描述
JWT 与基于 Session 的鉴权有什么差异？各自优缺点是什么？如何处理登出、续期与安全风险（XSS/CSRF）？

## 题目答案
Session（传统 Cookie + 服务端会话）：
- 服务端保存会话状态（session store），客户端通常只存 session id（Cookie）。
- 优点：
  - 易做登出/失效（服务端删除会话即可）。
  - token 不暴露给 JS（若用 HttpOnly Cookie）。
- 缺点：
  - 分布式需要共享会话存储或粘性会话。
  - 扩展性与跨域场景需要更多工程配套。

JWT（自包含 token）：
- 服务端不一定保存会话（无状态），token 内含声明与签名。
- 优点：
  - 更易水平扩展（无需中心会话存储）。
  - 适合多端/微服务间传递身份。
- 缺点：
  - 难做即时登出（除非维护黑名单/短 token + refresh token）。
  - token 泄漏后风险大（需控制有效期与存储方式）。

安全要点：
- 防 XSS：避免把长期有效 token 放 LocalStorage；更推荐 HttpOnly Cookie + CSRF 防护。
- 防 CSRF：若使用 Cookie 鉴权，配合 SameSite + CSRF Token。
- 续期：短期 access token + refresh token（刷新 token 更严格的存储与轮换策略）。

