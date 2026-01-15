我想开发一个能力，名字叫 promptcc

- 基于 LLM + Jotai + JsonLogic 做一个 AI DSL Compiler
- 可以将 Prompt.md 转化为 MCP-compliant Execution DSL (纯 JSON AST)、DSL.ts/type.ts 等等
- 运行期只用一个 deterministic engine 去执行 DSL.ts，调用 MCP Tool，渲染页面。
- 支持 nextjs 框架的 SSR/CSR 页面

# 流程

## Prompt.md

AI-assisted DSL(UI + State Machine + Side Effects 的声明式语言，支持 全局 MCP Tool /本页 MCP Tool 调用)

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
- 校验: 基于 Zod 校验 DSL.json 是否符合规范，如果报错，可以把错误信息传回给 LLM，让 LLM 重新修正（或者由本地脚本提示用户手动修正
- CodeGen: 生成 DSL.ts（types、state 等等），import 剪枝，页面 MCP Tool 创建（不存在则创建，存在则忽略）等等

## deterministic engine

在 SSR/CSR page 里 import DSL.ts 并调用 deterministic engine 执行
读取 state、effect 等，生成基于 jotai 的状态机 + react hooks 调用 + 页面 MCP Tool 调用
可以参考 OpenManus Engine + JsonLogic 实现

- 支持状态机的执行
- 支持 页面 MCP Tool 的调用
- 支持 Effects 的执行
- 支持 Derived State 的计算
- 支持 View Structure 的渲染

## 页面 MCP Tool

基于 @modelcontextprotocol/sdk-typescript 实现，符合标准 MCP 协议
只面向状态机，只有读行为+绑定事件+组件渲染(例如 Input MCP Tool)，或者独立的逻辑（比如 Fetch MCP Tool），是安全沙箱

# 架构

## Local MCP

基于 @modelcontextprotocol/sdk-typescript 实现，符合标准 MCP 协议

- PromptToDSLMCP Prompt: Prompt MCP，描述完整任务（采样、校验、转换等等），LLM 来调用其他 MCP
  - 输入：Prompt.md
  - 输出：DSL.json/DSL.ts/type.ts 等等
- PromptToDSLMCP Sampling：负责将 Prompt.md 转化为 DSL.json
  - 输入：Prompt.md
  - 输出：DSL.json
- DSLValidateMCP Tool：负责校验 DSL.json 是否符合 MCP 规范
  - 输入：DSL.json
  - 输出：校验结果（通过/失败）
- DSLCodeGenMCP Tool：负责生成 DSL.ts（types、state 等等），import 剪枝，页面 MCP Tool 创建（不存在则创建，存在则忽略）等等
  - 输入：DSL.json
  - 输出：DSL.ts/type.ts 等等

## DeterministicEngineMCP

- 没有 LLM 参与，负责执行 DSL.ts，调用页面 MCP Tool，渲染页面。
- 目前只有 jotai + react + nextjs 版本，未来会支持更多框架。

## helpers

放一些公共的类型、函数、常量等，例如：

- 页面 MCP Tool 调用的参数类型
- 页面 MCP Tool 调用的返回值类型
- 状态机的状态类型
- 状态机的事件类型
- 状态机的效果类型
- 状态机的派生状态类型
- 状态机的视图结构类型

# 项目结构

```
promptcc-mcp
├── src/
│   ├── PromptToDSLWorkflow.ts
│   ├── PromptToDSLSampling.ts
│   ├── DSLValidate.ts
│   ├── DSLCodeGen.ts
│   ├── PageMcpLoader.ts
├── McpServer.ts // 负责加载全局 MCP Tool
├── README.md
├── package.json
promptcc-engine-react
├── src/
│   ├── index.ts
├── README.md
├── package.json
promptcc-helpers
├── src/
│   ├── DSLTypes.ts
├── README.md
├── package.json
```

帮我实现，尽量函数式编程(不要 Class)
