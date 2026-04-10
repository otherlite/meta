# 题目名
Service Worker 的缓存策略与离线化

## 题目描述
Service Worker 能做什么？常见缓存策略（Cache First、Network First、Stale-While-Revalidate）分别适用于什么场景？上线时如何处理版本更新与缓存失效？

## 题目答案
Service Worker（SW）是运行在浏览器后台的脚本，可拦截网络请求，实现离线能力、缓存加速、推送通知等。

常见缓存策略：
- Cache First：
  - 优先读缓存，缓存没有再走网络。
  - 适用：静态资源（带内容哈希）、不常变更的资源。
- Network First：
  - 优先走网络，失败再回退缓存。
  - 适用：数据接口、强一致性要求更高的内容。
- Stale-While-Revalidate：
  - 先返回缓存（可能是旧的），同时后台请求更新缓存。
  - 适用：对“首屏速度”敏感且允许短暂过期的数据/页面壳。

版本更新与失效：
- 资源使用内容哈希命名，天然具备精准失效。
- SW 升级时：
  - `install` 阶段预缓存新版本
  - `activate` 阶段清理旧 cache
  - 通过 `skipWaiting`/`clientsClaim` 控制生效时机（要谨慎，避免中途切换导致页面资源不一致）

