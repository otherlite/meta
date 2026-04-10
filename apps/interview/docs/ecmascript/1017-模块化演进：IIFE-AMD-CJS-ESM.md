# 题目名
模块化演进：IIFE / AMD / CJS / ESM

## 题目描述
前端模块化从 IIFE、AMD、CommonJS 到 ESM 的演进脉络是什么？它们分别解决了什么问题，又带来了哪些限制？

## 题目答案
IIFE（Immediately Invoked Function Expression）：
- 通过函数作用域隔离变量，避免全局污染。
- 问题：依赖管理困难、无法按需加载。

AMD（如 RequireJS）：
- 解决浏览器端异步加载依赖的问题，支持按需加载。
- 问题：语法与生态逐渐式微，和现代打包/ESM 体系割裂。

CommonJS（Node）：
- 用 `require/exports` 实现模块化。
- 问题：同步加载更适合服务器，不利于浏览器按需与静态分析。

ESM（现代标准）：
- 语言层支持 `import/export`，可静态分析，利于 Tree Shaking。
- 同时支持动态 `import()`。

总体：
- 演进目标是“更好的依赖管理、可组合性、可优化性（静态分析）与更好的加载策略”。

