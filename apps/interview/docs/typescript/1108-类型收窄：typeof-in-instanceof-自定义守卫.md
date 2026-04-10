# 题目名
类型收窄：`typeof` / `in` / `instanceof` / 自定义守卫

## 题目描述
TypeScript 的类型收窄有哪些常用手段？`typeof`、`in`、`instanceof`、判别联合（discriminated union）分别适用于什么场景？如何写自定义 type guard？

## 题目答案
类型收窄：把宽泛类型（如联合、unknown）在控制流中缩小为更具体的类型。

常用手段：
- `typeof`：适合原始类型（string/number/boolean/bigint/symbol/undefined/function）。
- `in`：判断对象是否包含某属性，适合对象联合。
- `instanceof`：判断原型链，适合类实例。
- 判别联合：用一个稳定字段（如 `type`）区分联合成员，`switch(type)` 可做穷尽。

自定义 type guard：
- 通过返回类型谓词 `x is T` 告诉编译器在 true 分支里 `x` 是 `T`。
- 注意：守卫函数内部要尽量贴近真实运行时检查，否则会出现“类型正确但运行时错误”。

