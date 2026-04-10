# 题目名
层叠上下文与 `z-index` 的工作原理

## 题目描述
为什么 `z-index` 有时不生效？什么是层叠上下文（stacking context）？哪些属性会创建新的层叠上下文？

## 题目答案
`z-index` 的前提：元素需要在同一个层叠上下文中比较层级，否则跨上下文无法直接“压住”对方。

层叠上下文：
- 一个独立的层级体系，内部元素的 z-index 只在该体系内比较。

常见创建层叠上下文的条件（部分）：
- `position` 非 static 且设置了 `z-index`
- `opacity < 1`
- `transform` 非 none
- `filter` 非 none
- `will-change` 指定会创建层的属性（浏览器可能创建）
- `isolation: isolate`

排查思路：
- 先确认元素是否处在同一层叠上下文。
- 查看祖先元素是否因为 `transform/opacity` 等创建了新的上下文。

