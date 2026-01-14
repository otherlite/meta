import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initCommand(argv: any) {
  const targetDir = path.resolve(argv.dir);

  console.log(`Initializing promptcc project in ${targetDir}`);

  try {
    // 创建目录结构
    await fs.mkdir(path.join(targetDir, "pages"), { recursive: true });
    await fs.mkdir(path.join(targetDir, "mcps"), { recursive: true });

    // 创建示例 Prompt.md
    const promptTemplate = `# 用户登录页面

## 配置
标题: 用户登录
布局: default

## 状态
- 用户名: 默认值为空字符串
- 密码: 默认值为空字符串
- 正在登录: 默认值为 false
- 登录错误: 默认值为 null

## 派生状态
- 可以提交: 用户名不为空 且 密码不为空 且 正在登录为 false

## 事件
- 更新用户名: 当用户名输入变化时触发
- 更新密码: 当密码输入变化时触发
- 提交登录: 当点击登录按钮时触发
- 登录成功: 当登录API调用成功时触发
- 登录失败: 当登录API调用失败时触发

## 效果
- 提交登录:
  - 类型: async
  - 触发: 提交登录
  - 条件: 可以提交为 true
  - 操作: 调用 AuthMCP.login
  - 参数: { username: 用户名, password: 密码 }
  - 成功时: 触发登录成功
  - 失败时: 触发登录失败

## 界面
- 容器 (ContainerMCP):
  - 属性: { spacing: 16, direction: 'column' }
  - 子组件: [标题, 表单, 错误提示, 提交按钮]

- 标题 (TextMCP):
  - 属性: { text: '用户登录', variant: 'h1' }

- 表单 (FormMCP):
  - 属性: { layout: 'vertical' }
  - 子组件: [用户名输入, 密码输入]

- 用户名输入 (TextFieldMCP):
  - 属性: { label: '用户名', placeholder: '请输入用户名' }
  - 事件: { onChange: 更新用户名 }

- 密码输入 (TextFieldMCP):
  - 属性: { label: '密码', placeholder: '请输入密码', type: 'password' }
  - 事件: { onChange: 更新密码 }

- 错误提示 (AlertMCP):
  - 属性: { type: 'error', visible: 登录错误不为空 }
  - 条件: 登录错误不为空

- 提交按钮 (ButtonMCP):
  - 属性: { text: '登录', variant: 'primary' }
  - 事件: { onClick: 提交登录 }
  - 禁用: 可以提交为 false`;

    await fs.writeFile(
      path.join(targetDir, "pages/example", "Prompt.md"),
      promptTemplate
    );

    // 创建 package.json 配置
    const packageJson = {
      name: "promptcc-project",
      version: "1.0.0",
      scripts: {
        dev: "promptcc serve --watch",
        build: "promptcc generate ./pages",
      },
      dependencies: {
        promptcc: "latest",
        jotai: "^2.0.0",
      },
    };

    await fs.writeFile(
      path.join(targetDir, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    // 创建配置文件
    const config = {
      projectRoot: targetDir,
      aiProvider: "openai",
      openaiApiKey: process.env.OPENAI_API_KEY || "YOUR_API_KEY_HERE",
    };

    await fs.writeFile(
      path.join(targetDir, "promptcc.config.json"),
      JSON.stringify(config, null, 2)
    );

    console.log("✅ Project initialized successfully!");
    console.log("\nNext steps:");
    console.log("1. cd " + targetDir);
    console.log("2. npm install");
    console.log("3. Set your OPENAI_API_KEY in promptcc.config.json");
    console.log("4. npm run build");
  } catch (error) {
    console.error("Failed to initialize project:", error);
    process.exit(1);
  }
}
