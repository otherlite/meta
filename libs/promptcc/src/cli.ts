// packages/cli/src/index.ts
#!/usr/bin/env node

import { Command } from 'commander'
import { Compiler, MockLLMAdapter, OpenAIAdapter } from '@promptcc/compiler'
import { watch } from 'chokidar'
import fs from 'fs/promises'
import path from 'path'
import { startDevServer } from './dev-server'

const program = new Command()

program
  .name('promptcc')
  .description('AI DSL Compiler for Prompt-based Development')
  .version('0.1.0')

program
  .command('compile <input>')
  .description('编译 Prompt.md 文件为 DSL')
  .option('-o, --output <dir>', '输出目录', '.')
  .option('-k, --api-key <key>', 'OpenAI API Key')
  .option('-m, --model <model>', '使用的模型', 'gpt-3.5-turbo')
  .option('--mock', '使用模拟的 LLM（用于测试）')
  .action(async (input, options) => {
    try {
      console.log(`📄 正在编译: ${input}`)
      
      // 读取 Prompt.md
      const content = await fs.readFile(input, 'utf-8')
      
      // 创建编译器
      const llmAdapter = options.mock
        ? new MockLLMAdapter()
        : new OpenAIAdapter(options.apiKey || process.env.OPENAI_API_KEY!, {
            model: options.model
          })
      
      const compiler = new Compiler(llmAdapter)
      
      // 编译
      const result = await compiler.compile(content)
      
      // 确保输出目录存在
      await fs.mkdir(options.output, { recursive: true })
      
      // 保存 DSL.json
      const dslPath = path.join(options.output, 'DSL.json')
      await fs.writeFile(dslPath, JSON.stringify(result.dsl, null, 2))
      console.log(`✅ 生成 DSL.json: ${dslPath}`)
      
      // 保存 DSL.ts
      const tsPath = path.join(options.output, 'DSL.ts')
      await fs.writeFile(tsPath, result.typescript)
      console.log(`✅ 生成 DSL.ts: ${tsPath}`)
      
      // 如果有警告，显示它们
      if (result.warnings?.length) {
        console.log('\n⚠️  警告:')
        result.warnings.forEach(warning => console.log(`  - ${warning}`))
      }
      
      console.log('\n🎉 编译完成!')
    } catch (error: any) {
      console.error('❌ 编译失败:', error.message)
      process.exit(1)
    }
  })

program
  .command('dev')
  .description('启动开发服务器，监听文件变化')
  .option('-p, --port <port>', '服务器端口', '3000')
  .option('-k, --api-key <key>', 'OpenAI API Key')
  .option('--mock', '使用模拟的 LLM（用于测试）')
  .action(async (options) => {
    console.log('🚀 启动 PromptCC 开发服务器...')
    
    // 检查是否有 Prompt.md 文件
    const promptPath = path.join(process.cwd(), 'Prompt.md')
    try {
      await fs.access(promptPath)
    } catch {
      console.log(`❌ 未找到 Prompt.md 文件，请在当前目录创建`)
      process.exit(1)
    }
    
    // 监听 Prompt.md 文件变化
    const watcher = watch(promptPath, {
      persistent: true,
      ignoreInitial: true
    })
    
    watcher.on('change', async () => {
      console.log('🔄 Prompt.md 发生变化，重新编译...')
      try {
        await program.parseAsync(['compile', 'Prompt.md', '--output', '.', 
          options.apiKey ? `--api-key=${options.apiKey}` : '',
          options.mock ? '--mock' : ''
        ])
        console.log('✅ 重新编译完成')
      } catch (error) {
        console.error('❌ 重新编译失败:', error)
      }
    })
    
    // 启动开发服务器
    await startDevServer(parseInt(options.port))
  })

program
  .command('init')
  .description('初始化 PromptCC 项目')
  .action(async () => {
    console.log('🚀 初始化 PromptCC 项目...')
    
    // 创建目录结构
    const dirs = ['pages', 'components', 'mcps']
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true })
      console.log(`📁 创建目录: ${dir}`)
    }
    
    // 创建示例 Prompt.md
    const examplePrompt = `# 用户注册表单

## 状态
- 用户名: 字符串，默认空
- 邮箱: 字符串，默认空
- 密码: 字符串，默认空
- 确认密码: 字符串，默认空
- 提交中: 布尔值，默认 false
- 错误信息: 字符串，默认空

## 计算
- 表单有效 = 用户名不为空 且 邮箱包含@ 且 密码长度>=6 且 密码===确认密码
- 可提交 = 表单有效 且 非提交中

## 事件
输入用户名 -> 更新用户名 = 事件值
输入邮箱 -> 更新邮箱 = 事件值
输入密码 -> 更新密码 = 事件值
输入确认密码 -> 更新确认密码 = 事件值
点击提交 -> 设置提交中为true，调用注册用户

## 异步操作
注册用户:
  - 调用: Fetch.post
  - 参数: { url: "/api/register", data: { 用户名, 邮箱, 密码 } }
  - 成功: 跳转到欢迎页面，重置表单
  - 失败: 设置错误信息，设置提交中为false

## 界面
- 标题: "用户注册"
- 用户名输入框: 标签="用户名", 值=用户名, 变化时=输入用户名
- 邮箱输入框: 标签="邮箱", 值=邮箱, 变化时=输入邮箱
- 密码输入框: 类型=密码, 标签="密码", 值=密码, 变化时=输入密码
- 确认密码输入框: 类型=密码, 标签="确认密码", 值=确认密码, 变化时=输入确认密码
- 提交按钮: 文字="注册", 禁用=可提交, 点击=点击提交
- 错误提示: 显示=错误信息, 颜色=红色
`
    
    await fs.writeFile('Prompt.md', examplePrompt)
    console.log('📄 创建示例 Prompt.md')
    
    // 创建示例页面
    const examplePage = `import React from 'react'
import { useDSL } from './DSL'

export default function HomePage() {
  const { render, states, computed } = useDSL()
  
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      {render()}
      
      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
        <h4>调试信息:</h4>
        <pre>
          用户名: {states.userName()}
          邮箱: {states.email()}
          密码长度: {states.password()?.length || 0}
          表单有效: {computed.formValid()?.toString()}
          提交中: {states.isSubmitting()?.toString()}
        </pre>
      </div>
    </div>
  )
}
`
    
    await fs.writeFile('pages/index.tsx', examplePage)
    console.log('📄 创建示例页面: pages/index.tsx')
    
    // 创建 package.json 配置
    const packageJson = {
      name: "my-promptcc-app",
      version: "0.1.0",
      scripts: {
        "dev": "promptcc dev",
        "build": "promptcc compile Prompt.md --output .",
        "start": "next start"
      },
      dependencies: {
        "@promptcc/core": "^0.1.0",
        "@promptcc/engine": "^0.1.0",
        "react": "^18.0.0",
        "react-dom": "^18.0.0"
      },
      devDependencies: {
        "@promptcc/cli": "^0.1.0",
        "@promptcc/compiler": "^0.1.0",
        "@types/node": "^20.0.0",
        "@types/react": "^18.0.0",
        "typescript": "^5.0.0"
      }
    }
    
    // 检查是否已有 package.json
    try {
      const existingPackage = JSON.parse(await fs.readFile('package.json', 'utf-8'))
      // 合并 scripts
      packageJson.scripts = { ...existingPackage.scripts, ...packageJson.scripts }
      // 合并 dependencies
      packageJson.dependencies = { ...existingPackage.dependencies, ...packageJson.dependencies }
      packageJson.devDependencies = { ...existingPackage.devDependencies, ...packageJson.devDependencies }
    } catch {
      // 没有 package.json，创建新的
    }
    
    await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2))
    console.log('📄 更新 package.json')
    
    console.log('\n🎉 初始化完成!')
    console.log('\n下一步:')
    console.log('1. 编辑 Prompt.md 文件描述你的应用')
    console.log('2. 运行: npm run dev')
    console.log('3. 打开浏览器访问 http://localhost:3000')
  })

program.parse()