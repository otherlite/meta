# 题目名
CSS Modules / Scoped CSS 的隔离原理

## 题目描述
CSS Modules 是如何实现样式隔离的？与 BEM、Scoped CSS（Vue）相比有什么差异？在组件库里如何避免样式泄漏与选择器冲突？

## 题目答案
CSS Modules 原理：
- 构建阶段把类名映射成带哈希的唯一标识（如 `.button` → `.button__hash`）。
- JS 导入的是一个映射对象，通过映射拿到真实类名。

与 BEM：
- BEM 是命名约定，需要人工遵守；CSS Modules 是工具级隔离。

与 Scoped CSS（Vue）：
- Vue Scoped 常通过给 DOM 节点加作用域属性（如 `data-v-xxx`）并在选择器上附加限定来实现。

组件库实践：
- 默认用局部作用域（Modules/Scoped），对外暴露少量可定制变量/主题入口。
- 避免使用全局选择器污染（如 `*`、`body`）除非是明确的 reset。

