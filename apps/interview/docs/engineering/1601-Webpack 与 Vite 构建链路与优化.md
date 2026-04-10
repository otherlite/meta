# 题目名
Webpack 与 Vite 构建链路与优化

## 题目描述
Webpack 与 Vite 的核心差异是什么？它们各自适合什么场景？构建/开发阶段常见性能瓶颈在哪里，如何优化？

## 题目答案
核心差异（思路层面）：
- Webpack：以“打包”为中心，开发时也先把依赖图构建出来（bundle-based）。
- Vite：开发时以原生 ESM 为基础，按需编译与加载（dev server 以 ESM 模块请求为单位），生产构建通常用 Rollup 打包（bundle for production）。

适用场景：
- Webpack：生态成熟、可高度定制；适合复杂的历史项目、需要大量 loader/plugin 能力的场景。
- Vite：开发启动快、HMR 快；适合现代 ESM 项目与对开发体验要求高的团队。

常见性能瓶颈：
- 依赖图过大、重复编译
- Babel/TS 编译耗时、loader 链过长
- 低效的 source map 策略
- 大量小文件 I/O、缓存未命中

优化思路（方向）：
- 开发：减少不必要的转译范围（include/exclude）、启用持久化缓存、升级到更快的编译器（如 swc/esbuild，按项目约束选择）。
- 构建：
  - code splitting（路由/组件级别拆包）
  - 减少 chunk 数量与重复依赖
  - 合理使用压缩与 source map（按环境区分）
  - 依赖预构建/锁定依赖版本，减少不可控变动

