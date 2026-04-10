# 题目名
`Readonly` 与深只读（DeepReadonly）的实现思路

## 题目描述
`Readonly<T>` 做了什么？如何实现递归的 DeepReadonly？需要注意数组与函数吗？

## 题目答案
- `Readonly<T>` 只把第一层属性变为只读。
- DeepReadonly：用映射类型递归处理对象属性。
- 注意：函数通常原样返回；数组要转成只读数组并递归元素类型。

