# 题目名
key remapping 与映射类型

## 题目描述
映射类型如何批量改属性？什么是 key remapping（`as` 重映射键）？能做哪些工程化类型生成？

## 题目答案
- 映射类型：`{ [K in keyof T]: ... }`。
- key remapping：`{ [K in keyof T as NewKey<K>]: ... }`，可过滤/改名。
- 场景：把接口字段转成 getter、把 snake_case 转 camelCase（类型层面）、生成事件映射等。

