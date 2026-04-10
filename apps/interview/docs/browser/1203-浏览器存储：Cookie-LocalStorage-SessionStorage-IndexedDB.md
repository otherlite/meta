# 题目名
浏览器存储：Cookie / LocalStorage / SessionStorage / IndexedDB

## 题目描述
对比 Cookie、LocalStorage、SessionStorage、IndexedDB 的容量、生命周期、访问方式、是否随请求携带、适用场景与安全注意点。

## 题目答案
Cookie：
- 容量小（通常 KB 级），每次同域请求会自动携带（增加请求开销）。
- 可设置过期时间、路径、域。
- 安全相关：`HttpOnly`（防 JS 读取）、`Secure`、`SameSite`。
- 场景：会话标识（session id）、需要服务端识别的状态。

LocalStorage：
- 容量相对大（通常 5~10MB 级，取决于浏览器）。
- 永久存储（除非主动清理），同步 API。
- 不随请求携带。
- 风险：容易被 XSS 读取，因此不应存放敏感凭证。
- 场景：非敏感的持久化配置、缓存。

SessionStorage：
- 与 LocalStorage 类似，但生命周期是“标签页会话级”，关闭标签页即清。
- 同步 API，不随请求携带。
- 场景：一次会话内的临时状态。

IndexedDB：
- 面向对象的本地数据库，容量更大，异步 API。
- 支持索引、事务、游标，适合结构化大量数据。
- 场景：离线数据、较大缓存（如资源/业务数据）、PWA。

总体建议：
- 敏感凭证优先放 Cookie 并配合 `HttpOnly/SameSite/Secure`，避免暴露给 JS。
- 需要大量结构化数据时选 IndexedDB。

