# 题目名
实现 `compose` / `pipe` 的核心

## 题目描述
函数组合 `compose`（从右到左）与 `pipe`（从左到右）是什么？如何实现支持多函数组合的版本？

## 题目答案
- `compose(f, g, h)(x) = f(g(h(x)))`。
- `pipe(f, g, h)(x) = h(g(f(x)))`。
- 实现：用 `reduceRight`（compose）或 `reduce`（pipe）把函数链折叠。

