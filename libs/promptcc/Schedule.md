我想开发一个能力，名字叫 promptcc

- 基于 LLM + Jotai + 自定义 Rule-Combined + zod 做一个 AI DSL Compiler
- 可以将 Prompt.md 转化为 DSL (纯 JSON AST)、useDSL.tsx、type.ts 等等
- 运行期直接引用 useDSL.tsx 获取执行 DSL 结果，选择想要渲染的部分
- 支持 nextjs 框架的 SSR/CSR 页面

# 流程

## Prompt.md

AI-assisted DSL(装饰器模式)

- @states
- @derived
- @events
- @effects
- @ui
- @ui2

例如

```md
@searchParams

- query（字符串，默认空字符串）
- category（字符串，默认全部）

@state

- input（字符串，默认空字符串）
- date（日期，默认当前日期）

@memo

- isSubmitAllowed（input 和 date 都不为空）

@callback

- onInputChange（输入变化）
- onSubmit（点击提交）

@effect

- fetchUserInfo（获取用户信息）

@ui

- textField:
  - 绑定 input
- datePicker:
  - 绑定 date
- button
  - 显示 "提交"
  - 禁用: 当 isSubmitAllowed 为 false
  - 点击: onSubmit

@ui2

- button:
  - 显示 "提交"
  - 禁用: 当 isSubmitAllowed 为 false
  - 点击: onSubmit
```

## Prompt.md -> DSL.json + useDSL.tsx + type.ts

> LLM 只负责“结构填充”、Schema 负责“格式正确”

Input: 页面 Prompt.md
Engine: LLM
Output: DSL (纯 JSON AST)、useDSL.tsx、type.ts 等等
MCP:

- 校验: 基于 Zod 校验 DSL.json 是否符合规范，如果报错，可以把错误信息传回给 LLM，让 LLM 重新修正（或者由本地脚本提示用户手动修正）
- CodeGen: 生成 useDSL.tsx（types、state 等等），import 剪枝等等

## Page

```ts
import useDSL from "./useDSL";

export const Page = () => {
  const { ui, ui2 } = useDSL();
  return ui;
};
```

- engine 支持 hook 调用执行
- 在 SSR/CSR page 里根据返回结果，自行选择想要渲染的部分

# 架构

## Local MCP

基于 @modelcontextprotocol/sdk-typescript 实现，符合标准 MCP 协议

- PromptToDSLWorkflow: Prompt MCP，描述完整任务（采样、校验、纠错、代码生成等等，调用 Local MCP 完成）
  - 输入：Prompt.md
  - 输出：DSL.json/DSL.ts/type.ts 等等
- PromptToDSLSampling：负责将 Prompt.md 转化为 DSL.json
  - 输入：Prompt.md
  - 输出：DSL.json
- DSLValidate：负责校验 DSL.json 是否符合 MCP 规范
  - 输入：DSL.json
  - 输出：校验结果（通过/失败）
- DSLCodeGen：负责生成 DSL.ts（types、state 等等），import 剪枝，页面 MCP Tool 创建（不存在则创建，存在则忽略）等等
  - 输入：DSL.json
  - 输出：DSL.ts/type.ts 等等

## Customize Decorator

- 可以自定义装饰器，例如：@searchParams、@state、@derived、@events、@effects、@ui、@ui2 等等
- 可以自定义装饰器的参数，例如：@searchParams(query: string, category: string) 等等

Decorator 插件化（官方内置 + 用户自定义）CodeGen、Runtime、Validate 三端共享同一套类型语义，例如 @searchParams

- 定义 input Schema / output Schema，例如：@searchParams(query: string, category: string) -> { query: string, category: string }
- 实现 codegen 逻辑

可以内置一部分常用的装饰器，例如 @searchParams、@state、@derived、@events、@effects、@ui、@ui2 等等
开放自定义装饰器的能力，用户可以根据需要自定义装饰器

# 项目结构

```
promptcc
├── src/
│   ├── PromptToDSLWorkflow.ts
│   ├── PromptToDSLSampling.ts
│   ├── DSLValidate.ts
│   ├── DSLCodeGen.ts
│   ├── index.ts
├── McpServer.ts
├── package.json
```

帮我实现
