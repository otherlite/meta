// packages/engine/src/mcp-registry.ts
import { MCP } from "@promptcc/core";

export class MCPRegistry {
  private static instance: MCPRegistry;
  private mcps: Map<string, MCP> = new Map();
  private fallbackMcps: Map<string, MCP> = new Map();

  private constructor() {
    // 初始化内置 fallback MCPs
    this.initializeFallbackMcps();
  }

  static getInstance(): MCPRegistry {
    if (!MCPRegistry.instance) {
      MCPRegistry.instance = new MCPRegistry();
    }
    return MCPRegistry.instance;
  }

  private initializeFallbackMcps() {
    // 简单的文本显示组件
    this.fallbackMcps.set("Text", {
      name: "Text",
      version: "1.0.0",
      Component: ({ children, ...props }) =>
        React.createElement("span", props, children),
    });

    // 容器组件
    this.fallbackMcps.set("Container", {
      name: "Container",
      version: "1.0.0",
      Component: ({ children, ...props }) =>
        React.createElement("div", props, children),
    });

    // 按钮组件
    this.fallbackMcps.set("Button", {
      name: "Button",
      version: "1.0.0",
      Component: ({ children, onPress, ...props }) =>
        React.createElement(
          "button",
          {
            ...props,
            onClick: onPress,
          },
          children
        ),
    });

    // 输入框组件
    this.fallbackMcps.set("TextField", {
      name: "TextField",
      version: "1.0.0",
      Component: ({ value, onChange, ...props }) =>
        React.createElement("input", {
          ...props,
          value: value || "",
          onChange: (e) => onChange?.({ value: e.target.value }),
        }),
    });
  }

  register(name: string, mcp: MCP): void {
    this.mcps.set(name, mcp);
  }

  get(name: string): MCP | undefined {
    return this.mcps.get(name) || this.fallbackMcps.get(name);
  }

  has(name: string): boolean {
    return this.mcps.has(name) || this.fallbackMcps.has(name);
  }

  list(): string[] {
    return Array.from(
      new Set([...this.mcps.keys(), ...this.fallbackMcps.keys()])
    );
  }

  unregister(name: string): boolean {
    return this.mcps.delete(name);
  }
}
