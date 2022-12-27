---
group:
  title: 监控
  order: 9
---

# 监控

## 前端监控系统有哪些功能？

https://juejin.cn/post/6987681953424080926

- 采集（js 错误、资源错误、performance）
- 日志存储：如何上报(gif)，采样控制(Math.random)
- 日志切分&计算：错误聚合(错误标识)
- 数据分析
- 告警

## 如何实现用户行为的动态采集与分析？

https://www.infoq.cn/article/ygoh38xjpydtkmjjzjoh

https://juejin.cn/post/6844903826256822279

https://segmentfault.com/a/1190000014672384

## 资源加载失败如何监控？

http://www.alloyteam.com/2021/01/15358/

## 怎么录制页面并回放页面？

开源库[rrweb](https://github.com/rrweb-io/rrweb)录制（并不是真的在录制视频，而是将页面 DOM 序列化后记录下来，再利用反序列化还原成 DOM 来回放。），上报采用视频压缩[pako](https://github.com/nodeca/pako)

## 怎么检查当前用户电脑 CPU 的性能？

https://juejin.cn/post/7015517011799179301

## 如何监控单页的性能呢？

https://cloud.tencent.com/developer/article/1440345

## 如何精确统计页面停留时长？

https://zhuanlan.zhihu.com/p/166402090

## 什么因数会导致 FCP、FMP 等等指标的变化？

https://zhuanlan.zhihu.com/p/98880815

## 怎么优化 FCP 这个性能指标？

https://juejin.cn/post/7025935054014513166

## Long Task 指标怎么监控？

https://liximomo.github.io/page-performance-metrics
