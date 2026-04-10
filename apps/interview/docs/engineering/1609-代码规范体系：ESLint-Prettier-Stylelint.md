# 题目名
代码规范体系：ESLint / Prettier / Stylelint

## 题目描述
ESLint、Prettier、Stylelint 分别解决什么问题？它们如何配合避免冲突？在大型团队里如何落地“可执行的规范”？

## 题目答案
职责划分：
- ESLint：关注 JS/TS 代码质量与潜在错误（未使用变量、错误的依赖、复杂度等）。
- Prettier：关注代码格式化（排版），尽量不做语义规则。
- Stylelint：关注 CSS/样式规范与错误。

避免冲突：
- 让 Prettier 负责格式化，ESLint/Stylelint 负责语义与最佳实践。
- 通过集成配置关闭与 Prettier 冲突的格式类规则。

团队落地：
- 统一配置（共享 eslint-config/stylelint-config）。
- CI 强制检查（lint/format）避免“只靠自觉”。
- 对规则做分级：error（必须）/warn（建议），循序渐进。

