我想开发一个 npm 包，名字叫 promptcc

- 基于 LLM + Jotai + JsonLogic 做一个 AI DSL Compiler
- 可以将 Prompt.md 转化为 MCP-compliant Execution DSL (纯 JSON AST)
- 运行期只用一个 deterministic engine 去执行 DSL，调用 MCP，渲染页面。
- 支持 nextjs 框架的 SSR/CSR 页面

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

## 目录结构

```
promptcc/
├─ src/
│  ├─ cli/                # promptcc cli（基于 Yargs ）
│  │  ├─ mcp-server.ts    # 启动本地 MCP server
│  │  ├─ ai.ts            # 调用 AI 服务(需要配置 API KEY) + 注册本地 MCP server
│  ├─ core/               # DSL types, zod schema, codegen helpers
│  ├─ engine/             # deterministic runtime (Jotai + React hooks + AST evaluator（JsonLogic 支持）)
│  └─ mcp-server/         # local MCP server
│  │  ├─ index.ts         # 启动一个基础的 MCP Server，并注册 local mcp list, 当收到一个请求时动态 import&注册页面 MCP (文件页的 mcp + 工程全局 mcp)，工程目录可以向上查找最近的.ai 文件来确认
│  │  ├─ dsl-workflow.ts  # local mcp list 之一：定义如何从 Prompt.md 生成 DSL.json、DSL.ts 的 prompt
│  │  ├─ validate-dsl.ts  # local mcp list 之一：基于 Zod Schema 校验 DSL.json 是否符合规范，错误则返回 LLM 错误信息继续修正
│  │  ├─ codegen-dsl.ts   # local mcp list 之一：基于 DSL.json 生成 DSL.ts（types、state 等等），import 剪枝，文件创建（页面 MCP 不存在则创建，存在则忽略）等等
├─ examples/
│  └─ demo-page/          # nextjs example
├─ package.json
└─ tsconfig.json
```

请帮我分析分析，一步步教我怎么实现（一个一个模块，类型啥的可以最后），每一步我需要 review 一下，确认是否正确，没问题再给出下一步
