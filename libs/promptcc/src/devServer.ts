// packages/cli/src/dev-server.ts
import { createServer } from "http";
import { parse } from "url";
import fs from "fs/promises";
import path from "path";

export async function startDevServer(port: number = 3000): Promise<void> {
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url || "/", true);
    let filePath = parsedUrl.pathname || "/";

    // 默认页面
    if (filePath === "/") {
      filePath = "/index.html";
    }

    try {
      // 尝试从当前目录读取文件
      const fullPath = path.join(process.cwd(), filePath);

      // 如果请求的是 DSL.ts，动态生成
      if (filePath === "/DSL.ts") {
        const dslJson = await fs.readFile(
          path.join(process.cwd(), "DSL.json"),
          "utf-8"
        );
        const dsl = JSON.parse(dslJson);

        // 生成 TypeScript 代码
        const tsCode = generateDevDSL(dsl);

        res.writeHead(200, { "Content-Type": "text/typescript" });
        res.end(tsCode);
        return;
      }

      // 如果请求的是 DSL.json，直接返回
      if (filePath === "/DSL.json") {
        const content = await fs.readFile(fullPath, "utf-8");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(content);
        return;
      }

      // 静态文件
      const content = await fs.readFile(fullPath);
      const ext = path.extname(fullPath);

      const mimeTypes: Record<string, string> = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
      };

      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
      res.end(content);
    } catch (error) {
      // 如果文件不存在，返回开发页面
      if ((error as any).code === "ENOENT") {
        const devPage = await generateDevPage();
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(devPage);
      } else {
        res.writeHead(500);
        res.end("服务器错误: " + (error as any).message);
      }
    }
  });

  server.listen(port, () => {
    console.log(`🌐 开发服务器运行在 http://localhost:${port}`);
    console.log("📝 编辑 Prompt.md 文件，保存后会自动重新编译");
  });
}

function generateDevPage(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>PromptCC 开发预览</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/jotai@2.0.0/umd/index.development.js"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    .preview { border: 2px dashed #ccc; padding: 20px; margin: 20px 0; min-height: 200px; }
    .code { background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: 'Monaco', monospace; overflow-x: auto; }
    .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
    .success { background: #d4edda; color: #155724; }
    .error { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="container">
    <h1>PromptCC 开发预览</h1>
    <p>编辑 <code>Prompt.md</code> 文件并保存，页面会自动刷新。</p>
    
    <div id="status"></div>
    <div id="preview" class="preview"></div>
    
    <h3>当前 DSL:</h3>
    <pre id="dsl" class="code"></pre>
  </div>

  <script type="text/babel">
    const { useState, useEffect, useMemo } = React
    const { atom, useAtom } = jotai
    
    // 从 @promptcc/engine 中导入必要的函数
    // 注意：这里简化了，实际使用时应该导入完整的模块
    const { usePromptCC } = (() => {
      // 简化的引擎实现，用于演示
      const MCPRegistry = {
        instance: null,
        getInstance() {
          if (!this.instance) {
            this.instance = new MCPRegistryImpl()
          }
          return this.instance
        }
      }
      
      class MCPRegistryImpl {
        constructor() {
          this.mcps = new Map()
          this.initializeFallbackMcps()
        }
        
        initializeFallbackMcps() {
          // 基础组件
          this.register('Container', {
            Component: ({ children, ...props }) => 
              React.createElement('div', props, children)
          })
          
          this.register('TextField', {
            Component: ({ value, onChange, label, ...props }) => 
              React.createElement('div', { style: { marginBottom: '10px' } },
                label && React.createElement('label', { style: { display: 'block', marginBottom: '5px' } }, label),
                React.createElement('input', {
                  type: 'text',
                  value: value || '',
                  onChange: (e) => onChange?.({ value: e.target.value }),
                  style: { width: '100%', padding: '8px', boxSizing: 'border-box' },
                  ...props
                })
              )
          })
          
          this.register('Button', {
            Component: ({ text, disabled, onPress, ...props }) =>
              React.createElement('button', {
                disabled: disabled,
                onClick: onPress,
                style: { 
                  padding: '10px 20px', 
                  backgroundColor: disabled ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: disabled ? 'not-allowed' : 'pointer'
                },
                ...props
              }, text)
          })
        }
        
        register(name, mcp) {
          this.mcps.set(name, mcp)
        }
        
        get(name) {
          return this.mcps.get(name)
        }
      }
      
      const evaluateExpression = (expr, context) => {
        try {
          const func = new Function(...Object.keys(context), 'return ' + expr)
          return func(...Object.values(context))
        } catch (error) {
          console.warn('表达式计算失败:', expr, error)
          return null
        }
      }
      
      const usePromptCC = (dsl) => {
        const [version, setVersion] = useState(0)
        const mcpRegistry = useMemo(() => MCPRegistry.getInstance(), [])
        
        // 状态管理
        const states = useMemo(() => {
          const result = {}
          Object.entries(dsl.states || {}).forEach(([name, def]) => {
            const stateAtom = atom(def.default)
            result[name] = () => {
              const [value] = useAtom(stateAtom)
              return value
            }
          })
          return result
        }, [dsl, version])
        
        // 计算属性
        const computed = useMemo(() => {
          const result = {}
          Object.entries(dsl.computed || {}).forEach(([name, expr]) => {
            result[name] = () => {
              const context = {}
              Object.keys(dsl.states || {}).forEach(stateName => {
                context[stateName] = states[stateName]?.() || dsl.states[stateName].default
              })
              return evaluateExpression(expr, context)
            }
          })
          return result
        }, [dsl, states, version])
        
        // 事件处理器
        const handlers = useMemo(() => {
          const result = {}
          Object.entries(dsl.handlers || {}).forEach(([handlerName, actions]) => {
            result[handlerName] = (event) => {
              console.log('处理事件:', handlerName, event)
              // 简化的实现
              actions.forEach(action => {
                if (action.type === 'set') {
                  // 更新状态
                  console.log('设置状态:', action.state, action.value)
                }
              })
            }
          })
          return result
        }, [dsl, version])
        
        // 渲染函数
        const render = () => {
          const renderComponent = (comp, key) => {
            const mcp = mcpRegistry.get(comp.component)
            if (!mcp?.Component) {
              return React.createElement('div', { key }, '[' + comp.component + ']')
            }
            
            const props = {}
            Object.entries(comp.props || {}).forEach(([propName, propValue]) => {
              if (typeof propValue === 'string') {
                if (propValue.startsWith('$state.')) {
                  const stateName = propValue.substring(7)
                  props[propName] = states[stateName]?.() || dsl.states[stateName]?.default
                } else if (propValue.startsWith('$computed.')) {
                  const computedName = propValue.substring(10)
                  props[propName] = computed[computedName]?.()
                } else if (propName.startsWith('on')) {
                  props[propName] = handlers[propValue]
                } else {
                  props[propName] = propValue
                }
              } else {
                props[propName] = propValue
              }
            })
            
            const children = comp.children?.map((child, idx) => 
              renderComponent(child, key + '-' + idx)
            )
            
            return React.createElement(mcp.Component, { key, ...props }, children)
          }
          
          return dsl.ui?.map((comp, idx) => renderComponent(comp, 'ui-' + idx)) || []
        }
        
        return { render, states, computed, handlers }
      }
      
      return { usePromptCC }
    })()
    
    function App() {
      const [dsl, setDsl] = useState(null)
      const [error, setError] = useState(null)
      const [loading, setLoading] = useState(true)
      
      const loadDSL = async () => {
        try {
          setLoading(true)
          const response = await fetch('/DSL.json')
          if (!response.ok) throw new Error('加载 DSL 失败')
          
          const data = await response.json()
          setDsl(data)
          setError(null)
          
          // 更新显示
          document.getElementById('dsl').textContent = JSON.stringify(data, null, 2)
          document.getElementById('status').innerHTML = 
            '<div class="status success">✅ DSL 加载成功</div>'
        } catch (err) {
          setError(err.message)
          document.getElementById('status').innerHTML = 
            '<div class="status error">❌ ' + err.message + '</div>'
        } finally {
          setLoading(false)
        }
      }
      
      useEffect(() => {
        loadDSL()
        
        // 监听文件变化
        const eventSource = new EventSource('/_events')
        eventSource.onmessage = (event) => {
          if (event.data === 'reload') {
            loadDSL()
          }
        }
        
        return () => eventSource.close()
      }, [])
      
      if (loading) {
        return React.createElement('div', null, '加载中...')
      }
      
      if (error || !dsl) {
        return React.createElement('div', null, 
          '加载失败: ', error || 'DSL 为空'
        )
      }
      
      const Preview = () => {
        const { render } = usePromptCC(dsl)
        return React.createElement('div', null, render())
      }
      
      return React.createElement(Preview)
    }
    
    ReactDOM.render(React.createElement(App), document.getElementById('preview'))
  </script>
</body>
</html>`;
}

function generateDevDSL(dsl: any): string {
  return `// Auto-generated by PromptCC Dev Server
export const dsl = ${JSON.stringify(dsl, null, 2)}

// 简化的 hook 用于开发预览
export function useDSL() {
  const { useState, useEffect, useMemo } = require('react')
  const { atom, useAtom } = require('jotai')
  
  // 简化的实现...
  return {
    render: () => null,
    states: {},
    computed: {},
    handlers: {}
  }
}
`;
}
