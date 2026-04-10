# 题目名
`Record` 的正确用法与陷阱

## 题目描述
`Record<K, V>` 适合什么场景？为什么 `Record<string, V>` 往往比你想象的更宽？

## 题目答案
- `Record` 常用于“键集合已知”的映射（如枚举/字面量联合到值）。
- `Record<string, V>` 表示任意字符串键都存在 `V`，这通常过强；实际更像 `Partial<Record<...>>`。
- 需要“可能不存在”时让索引返回 `V | undefined` 或用 `noUncheckedIndexedAccess`。

