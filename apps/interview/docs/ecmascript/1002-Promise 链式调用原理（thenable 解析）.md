# 题目名
Promise 链式调用原理（thenable 解析）

## 题目描述
`Promise.prototype.then` 为什么能链式调用？请说明返回值的“解析规则”（包括返回普通值、返回 Promise、返回 thenable、抛出异常时分别发生什么）。

## 题目答案
`then` 的核心是：无论当前 Promise 成功/失败，`then` 都会返回一个新的 Promise（记为 `p2`），并把回调执行结果“解析（resolve）”到 `p2` 上。

解析规则（与 Promises/A+ 规范一致）：

1. 回调返回普通值 `x`：
   - `p2` 变为 fulfilled，值为 `x`。
2. 回调返回 Promise `x`：
   - `p2` 的状态“跟随”`x`（x fulfilled 则 p2 fulfilled；x rejected 则 p2 rejected）。
3. 回调返回 thenable（形如 `{ then(resolve, reject) {} }` 的对象/函数）：
   - 需要“展开”thenable：取出 `then` 并以 `x` 作为 this 调用，传入两个一次性回调 `resolvePromise`/`rejectPromise`。
   - 目的是兼容不同实现的 Promise-like 对象。
4. 回调执行时抛出异常 `e`：
   - `p2` 变为 rejected，reason 为 `e`。
5. 关键的循环引用保护：
   - 若回调返回值 `x` 与 `p2` 是同一个对象（`x === p2`），必须 reject（TypeError），避免无限递归。

链式调用之所以成立，是因为每次 `then` 都生成一个新的 Promise，把“上一段的输出”作为“下一段的输入”，并把异常/拒绝沿链路传播。

面试加分点：
- `then` 回调永远异步执行（进入微任务队列），即使当前 Promise 已经 fulfilled。
- `catch` 等价于 `then(undefined, onRejected)`。

