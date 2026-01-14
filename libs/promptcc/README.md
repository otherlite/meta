我想开发一个工具，名字叫 promptcc

- 基于 LLM + Jotai + JsonLogic 做一个 AI DSL Compiler
- 可以将 Prompt.md 转化为 MCP-compliant Execution DSL (纯 JSON AST)
- 运行期只用一个 deterministic engine 去执行 DSL，调用 MCP，渲染页面。

# 流程

## Prompt.md

AI-assisted DSL(UI + State Machine + Side Effects 的声明式语言，支持 全局 MCP/本页 MCP 调用)

- States
- Events
- Effects (async / debounce)
- Derived State
- View Structure (组件树 + 组件对应的 MCP + 每个组件需要的数据)

例如

```md
# 状态

用户输入，默认 空
用户信息，默认 null
提交状态，默认 false

# 派生状态

是否允许提交 = 用户输入 不为空 且 提交状态 为 false

# 事件与行为

输入变化 -> 更新用户输入
点击提交 -> 设置提交状态为 true 并调用获取用户信息

# Effect

获取用户信息：调用 FetchMcp
接口：/get-user
成功：更新用户信息，并设置提交状态为 false
失败：设置提交状态为 false，显示提示

# 界面

文本框（TextFieldMCP） 绑定 用户输入
按钮（ButtonMCP） 显示 "提交"，禁用 当 不允许提交，点击 点击提交
```

## Prompt.md -> DSL.json + DSL.ts

> LLM 只负责“结构填充”、Schema 负责“格式正确”

Input: 页面 Prompt.md
Engine: LLM
Output: MCP-compliant Execution DSL (纯 JSON AST)
MCP:

- 全局 MCP：在 /mcps 目录下的 MCP，例如 FetchMcp
- 本页 MCP：在本页目录下的 MCP，例如 TextFieldMCP、ButtonMCP
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

# 工程化

## npm 包

promptcc

```bash
- DSL types
- Zod schema
- AST evaluator（JsonLogic 支持）
- engine interfaces、shared utils
- deterministic engine 实现（Jotai + React hooks glue）
- runtime helpers (renderers, dispatch)
- cli: promptcc dsl, 自定义 AI 配置，根据 Prompt.md 生成 DSL.json（需要配置API KEY）
- cli: promptcc mcpserver, 启动本地 MCP server，用于 IDE 配置 MCP server
```

请帮我给出一个简单的 MVP 版本，一步步教我怎么实现（比如先给出 DSL type，然后给出 Schema），，每一步我需要 review 一下，确认是否正确，没问题再给出下一步
