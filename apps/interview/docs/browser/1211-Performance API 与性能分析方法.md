# 题目名
Performance API 与性能分析方法

## 题目描述
浏览器 Performance API 能采集哪些性能信息？如何用 `performance.mark/measure` 做自定义耗时统计？线上与本地分析有什么差异？

## 题目答案
Performance API 能力（概念）：
- Navigation/Resource Timing：页面导航与资源加载时序。
- User Timing：自定义打点（mark/measure）。
- PerformanceObserver：订阅 LCP/CLS/Long Task 等 entry（取决于浏览器支持）。

自定义耗时：
- 在关键点 `performance.mark('start')`、`performance.mark('end')`。
- 用 `performance.measure('metric', 'start', 'end')` 产出 measure 记录。

线上 vs 本地：
- 本地更适合定位单次问题（开发机、无缓存/有缓存对比）。
- 线上需要 RUM（真实用户数据）看分位数与长尾，并按路由/设备/网络分维度。

