# 题目名
实现 `call` / `apply` / `bind` 的核心思路

## 题目描述
请说明如何手写实现 `Function.prototype.call`、`apply`、`bind` 的核心逻辑：如何绑定 `this`、如何传参、如何处理返回值？`bind` 与 `new` 同时使用时优先级如何处理？

## 题目答案
核心思想：
- `call/apply`：把函数临时挂到目标对象上作为方法调用，从而让调用点的 `this` 指向该对象，然后删除临时属性。

实现要点：
- 处理 `thisArg`：`null/undefined` 在非严格模式下会变成全局对象；工程上一般显式转为 `globalThis` 或保持原语义。
- 参数：
  - `call` 接受离散参数。
  - `apply` 接受参数数组。
- 返回值：返回被调用函数的返回值。
- 临时 key：用 `Symbol` 避免覆盖对象已有属性。

`bind`：
- 返回一个新函数 `boundFn`，调用时会以绑定的 `thisArg`（以及预置参数）执行原函数。
- 关键：支持部分应用（预置一部分参数，后续调用再补充）。

`bind` 与 `new`：
- `new (fn.bind(x))()` 时，`new` 绑定优先级更高，`this` 应指向新创建的实例，而不是 `x`。
- 因此 `bind` 实现需要判断是否作为构造函数调用（例如 `this instanceof boundFn`），并在这种情况下忽略 `thisArg`。

