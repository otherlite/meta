# 题目名
ES 模块与 CommonJS 的区别

## 题目描述
请对比 ES Module（ESM）与 CommonJS（CJS）的核心差异：语法、加载时机（静态/动态）、导入导出行为（值拷贝/引用）、循环依赖表现，以及对 Tree Shaking 的影响。

## 题目答案
核心差异可以从“静态性、加载方式、绑定语义、生态与构建”来回答。

1) 语法与运行环境
- ESM：`import/export`，浏览器与现代 Node 原生支持。
- CJS：`require/module.exports`，Node 传统模块体系。

2) 加载时机与静态分析
- ESM：静态结构，`import` 语句在编译期可分析；支持 `import()` 作为动态加载。
- CJS：`require` 是运行时调用，路径可动态拼接，编译期难以完全确定依赖图。

3) 绑定语义（面试重点）
- ESM：导入的是“实时绑定（live binding）”，导出值变了，导入方读到的也会变（本质是引用到导出绑定）。
- CJS：导入到的是 `module.exports` 的“快照值”（更准确地说：拿到的是 `exports` 对象的引用，但对导出成员的重新赋值不会像 ESM 那样形成 live binding）。

4) 循环依赖
- ESM：由于有静态依赖图与 live binding，能够在一定程度上更好地处理循环依赖（但仍可能出现未初始化访问的时序问题）。
- CJS：循环依赖更容易拿到“未完全初始化的 exports”，常见表现是某些导出为 `undefined`。

5) Tree Shaking
- ESM：静态 `import/export` 让构建器可做可靠静态分析，天然更利于 Tree Shaking。
- CJS：由于 `require` 动态特性与顶层副作用不易判定，Tree Shaking 更难或需要额外约束。

工程结论：
- 生产构建链路尽量保持 ESM 形态交给打包器做优化；不要过早把模块转成 CJS。

