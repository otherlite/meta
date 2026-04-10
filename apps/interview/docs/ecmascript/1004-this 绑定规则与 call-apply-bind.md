# 题目名
this 绑定规则与 call/apply/bind

## 题目描述
请总结 `this` 的绑定规则与优先级，并说明 `call`、`apply`、`bind` 的差异与典型使用场景。

## 题目答案
`this` 不是词法作用域变量（箭头函数除外），它在调用时确定。

绑定规则（常见 4 类）：
1. 默认绑定：普通函数直接调用，非严格模式下 `this` 指向 `window`；严格模式下为 `undefined`。
2. 隐式绑定：`obj.fn()`，`this` 指向调用点的“左侧对象”`obj`。
3. 显式绑定：`fn.call(ctx, ...args)` / `fn.apply(ctx, argsArray)`，强制指定 `this`。
4. new 绑定：`new Fn()`，`this` 指向新创建的实例对象。

优先级（从高到低，记忆版）：
- `new` 绑定 > 显式绑定（call/apply/bind）> 隐式绑定 > 默认绑定

箭头函数例外：
- 箭头函数没有自己的 `this`，它的 `this` 来自定义时的外层作用域（词法绑定），无法被 `call/apply/bind/new` 改变。

`call` / `apply` / `bind`：
- `call(thisArg, ...args)`：立即调用，参数逐个传。
- `apply(thisArg, argsArray)`：立即调用，参数以数组传。
- `bind(thisArg, ...args)`：返回一个“绑定后的新函数”，不会立即调用；可做部分应用（预置参数）。

典型场景：
- 借用方法（如借用数组方法处理类数组对象）。
- 回调函数丢失 `this` 时显式绑定。
- 事件处理里用 `bind` 固定上下文，或用箭头函数规避 `this`。

