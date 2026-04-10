# 题目名
前端错误监控：上报与 SourceMap 还原

## 题目描述
线上 JS 报错如何采集与上报？如何把压缩后的堆栈还原到源码（SourceMap）？上线时如何保护 SourceMap 不泄露？

## 题目答案
采集方式：
- 运行时错误：监听 `window.onerror`、`unhandledrejection`。
- 资源加载错误：监听 `error` 捕获阶段（如脚本/图片加载失败）。
- 框架错误边界：React Error Boundary、Vue errorHandler 等。

上报内容（最小集）：
- message、stack、url、行列号、用户/路由、版本号、设备/网络信息。
- 关键：要有“版本维度”，否则无法回溯到对应构建产物。

SourceMap 还原：
- 线上上报的是压缩堆栈（minified stack）。
- 在服务端/平台用对应版本的 SourceMap 做反解，得到源码位置。

保护 SourceMap：
- 不把 SourceMap 公开托管（避免暴露源码）；上传到监控平台或私有存储。
- 构建产物中可仅保留 `//# sourceMappingURL` 为受控地址，或在生产移除映射注释并单独保存映射文件。

