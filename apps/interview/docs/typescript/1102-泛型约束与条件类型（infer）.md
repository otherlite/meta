# 题目名
泛型约束与条件类型（infer）

## 题目描述
请解释 TypeScript 的泛型约束（`extends`）与条件类型（`T extends U ? X : Y`）。`infer` 的作用是什么？给一个工程中常见的类型推导例子。

## 题目答案
泛型约束（`extends`）：
- 限制泛型参数必须满足某个结构，从而可以安全地访问其属性。
- 例：`function len<T extends { length: number }>(x: T) { return x.length }`

条件类型：
- 根据类型关系做分支推导：`T extends U ? X : Y`。
- 常见用途：联合类型的映射与过滤（分布式条件类型）。当 `T` 是联合类型时，条件类型会对联合的每一项分别计算再合并。

`infer`：
- 只允许出现在条件类型中，用于在匹配结构时“抓取”某部分类型并命名。

工程常见例子：提取 Promise 的 resolved 类型：
- 思路：若 `T` 能匹配 `Promise<Something>`，就用 `infer` 把 `Something` 抓出来。
- 类似能力在标准库里以 `Awaited<T>` 的形式提供。

面试加分点：
- 分布式条件类型的触发条件是 `T` 直接作为 `extends` 左边（裸类型参数）。
- 可用元组包裹阻止分布：`[T] extends [U] ? ...`。

