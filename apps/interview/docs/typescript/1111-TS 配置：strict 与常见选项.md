# 题目名
TS 配置：`strict` 与常见选项

## 题目描述
TypeScript 项目里为什么建议开启 `strict`？`noImplicitAny`、`strictNullChecks`、`noUncheckedIndexedAccess` 等选项分别解决什么问题？如何在存量项目中渐进式开启？

## 题目答案
开启 `strict` 的价值：
- 把更多问题提前到编译期暴露，减少线上不可预期的类型错误。

常见选项含义（简述）：
- `noImplicitAny`：禁止隐式 any，强迫显式标注或推导。
- `strictNullChecks`：把 `null/undefined` 纳入类型系统，避免空值访问。
- `strictFunctionTypes`：让函数参数检查更严格，减少不安全的替换。
- `noUncheckedIndexedAccess`：索引访问返回值带上 `undefined`，逼迫处理越界/缺失。

渐进式开启：
- 先在新代码/新包中开启严格。
- 对历史代码用局部 `unknown` + 收窄、补齐类型声明，逐步消灭 any。
- 用 lint/CI 强制规则，避免回退。

