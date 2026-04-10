# 题目名
Web Vitals 指标与采集方案

## 题目描述
什么是 Web Vitals？请解释 FCP/LCP/CLS/TTFB/INP 等指标含义与优化方向。线上如何采集这些指标并用于性能治理？

## 题目答案
Web Vitals 是一组衡量用户体验的关键性能指标。

常见指标：
- TTFB（Time To First Byte）：首字节时间，反映网络与后端响应能力。
- FCP（First Contentful Paint）：首次内容绘制，反映首屏“有内容”的速度。
- LCP（Largest Contentful Paint）：最大内容绘制，反映主要内容可见的速度。
- CLS（Cumulative Layout Shift）：累计布局偏移，反映页面稳定性（避免抖动）。
- INP（Interaction to Next Paint）：交互到下一次绘制的延迟，反映交互响应性（新一代核心交互指标）。

优化方向（抓主因）：
- TTFB：CDN、缓存、服务端性能、连接复用。
- FCP/LCP：关键资源优先级（preload）、减少 render-blocking 资源、图片优化（尺寸/格式/懒加载）、减少主线程阻塞。
- CLS：为图片/广告/嵌入内容预留尺寸，避免插入内容顶起；避免在首屏同步注入字体造成闪动。
- INP：减少长任务（Long Task），拆分计算、避免频繁 layout，合理节流，提升渲染与事件处理效率。

线上采集：
- 用浏览器 Performance API（如 `PerformanceObserver`）监听相关 entry。
- 在合适时机上报（`visibilitychange`、`pagehide`）避免丢数据。
- 维度：路由、设备、网络、版本、首屏资源、用户分群。
- 治理方式：设定 SLO/告警阈值，结合真实用户数据（RUM）定位回归与长尾。

