promptcc

- 基于 OpenAI + Jotai DSL 做一个 AI DSL Compiler
- 可以将 Prompt.md 转化为 MCP-compliant Execution DSL (纯 JSON AST)
- 运行期只用一个 deterministic engine 去执行 DSL，调用 MCP，渲染页面。

# 流程

## Prompt.md

AI-assisted DSL(UI + State Machine + Side Effects 的声明式语言)

- States
- Events
- Transitions
- Effects (async / debounce)
- Derived State
- View Structure (组件树 + 组件对应的 MCP + 每个组件需要的数据)

例如

```md
# 状态

用户输入，默认空
用户信息，默认 null
提交状态，默认 false

# 派生状态

是否允许提交 = 用户输入 不为空 且 提交状态 为 false

# 事件与行为

输入变化 -> 更新用户输入
点击提交 -> 设置提交状态为 true 并调用获取用户信息

# Effect

获取用户信息：异步调用 Fetch.getUser(用户输入)
成功：更新用户信息，并设置提交状态为 false
失败：设置提交状态为 false，显示提示

# 界面

文本框 绑定 用户输入
按钮 显示 "提交"，禁用 当 不允许提交，点击 点击提交
```

## Prompt.md -> DSL.json + DSL.ts

> LLM 只负责“结构填充”、Schema 负责“格式正确”

Input: 页面 Prompt.md
Engine: LLM (OpenAI Function Calling)
Output: MCP-compliant Execution DSL (纯 JSON AST)
MCP:

- 校验: 基于 Zod 校验 DSL.json 是否符合 MCP 规范，如果报错，可以把错误信息传回给 LLM，让 LLM 重新修正（或者由本地脚本提示用户手动修正
- CodeGen: 生成 DSL.ts（types、state 等等），import 剪枝，MCP 创建（不存在则创建，存在则忽略）等等

## deterministic engine

在 SSR/CSR page 里 import DSL.ts 并调用 deterministic engine 执行
读取 state、effect 等，生成基于 jotai 的状态机 + react hooks 调用 + MCP 调用
可以参考 OpenManus Engine + JsonLogic 实现

- 支持状态机的执行
- 支持 MCP 的调用
- 支持 Effects 的执行
- 支持 Derived State 的计算
- 支持 View Structure 的渲染

## MCP

只面向状态机，只有读行为+绑定事件+组件渲染(例如 Input MCP)，或者独立的逻辑（比如 Fetch MCP），是安全沙箱

# 文件与目录结构（Next.js）

/ <-- 项目根目录
/configs <-- 全局配置
/mcps <-- 全局 MCP
/Fetch
/TextField
/Number
/Kyc
/Address
/Banner
/pages
/home
index.tsx <-- 本页渲染函数（Deterministic Engine 调用 DSL.ts 输出结果）
Prompt.md <-- 本页 Prompt
DSL.json <-- 本页 DSL.json（根据 Prompt.md 生成）
DSL.ts <-- 本页 DSL（根据 DSL.json 生成）
/other
index.tsx <-- 本页渲染函数（Deterministic Engine 调用 DSL.ts 输出结果）
Prompt.md <-- 本页 Prompt
DSL.json <-- 本页 DSL.json（根据 Prompt.md 生成）
DSL.ts <-- 本页 DSL（根据 DSL.json 生成）
.ai <-- ai 配置（全局 MCP 位置）

# 工程化

## npm 包

```bash
@promptcc/core       # DSL types、Zod schema、AST evaluator（JsonLogic 支持）、engine interfaces、shared utils
@promptcc/compile    # Prompt.md → DSL.json 的 glue
@promptcc/engine     # deterministic engine 实现（Jotai + React hooks glue），runtime helpers (renderers, dispatch)
@promptcc/cli        # CLI（promptcc compile, promptcc serve-mcp, promptcc validate），可配置 API key，用于批量编译/本地 dev server
```
