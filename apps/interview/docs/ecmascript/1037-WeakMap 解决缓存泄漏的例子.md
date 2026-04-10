# 题目名
用 `WeakMap` 解决缓存泄漏的例子

## 题目描述
为什么用 `Map` 做对象 key 的缓存可能泄漏？`WeakMap` 如何避免？

## 题目答案
- `Map` 会强引用 key 对象，只要 Map 存在，key 与 value 都不会被 GC。
- `WeakMap` key 是弱引用，外部不再引用 key 时条目可被回收。
- 场景：DOM 节点到元信息映射、对象私有数据、memoize 的对象 key 缓存。

