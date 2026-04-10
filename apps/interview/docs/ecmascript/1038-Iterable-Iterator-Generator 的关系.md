# 题目名
Iterable / Iterator / Generator 的关系

## 题目描述
什么是可迭代对象与迭代器？Generator 在其中扮演什么角色？

## 题目答案
- Iterable：实现 `Symbol.iterator`，可被 `for...of` 遍历。
- Iterator：具有 `next()`，返回 `{ value, done }`。
- Generator：生成器函数返回一个同时是 Iterable + Iterator 的对象，便于按需产出值。

