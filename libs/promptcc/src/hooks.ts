// packages/engine/src/hooks.tsx
import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useAtom } from "jotai";
import { DSL } from "@promptcc/core";
import { PromptCCEngine } from "./index";
import { MCPRegistry } from "./mcp-registry";
import { builtinMcps } from "./builtin-mcps";

export function usePromptCC(dsl: DSL, customMcps: Record<string, any> = {}) {
  // 合并内置 MCP 和自定义 MCP
  const allMcps = useMemo(() => ({ ...builtinMcps, ...customMcps }), [
    customMcps,
  ]);

  // 创建引擎实例
  const engine = useMemo(() => {
    return new PromptCCEngine(dsl, allMcps);
  }, [dsl, allMcps]);

  // 清理函数
  useEffect(() => {
    return () => {
      engine.destroy();
    };
  }, [engine]);

  // 状态 hooks
  const stateHooks = useMemo(() => {
    const hooks: Record<string, () => any> = {};

    Object.keys(dsl.states).forEach((name) => {
      const atom = engine.getState(name);
      if (atom) {
        hooks[name] = () => {
          const [value] = useAtom(atom);
          return value;
        };
      }
    });

    return hooks;
  }, [engine, dsl.states]);

  // 计算属性 hooks
  const computedHooks = useMemo(() => {
    const hooks: Record<string, () => any> = {};

    if (dsl.computed) {
      Object.keys(dsl.computed).forEach((name) => {
        const atom = engine.getComputed(name);
        if (atom) {
          hooks[name] = () => {
            const [value] = useAtom(atom);
            return value;
          };
        }
      });
    }

    return hooks;
  }, [engine, dsl.computed]);

  // 事件分发器
  const handlers = useMemo(() => {
    const handlers: Record<string, Function> = {};

    if (dsl.handlers) {
      Object.keys(dsl.handlers).forEach((name) => {
        handlers[name] = (event?: any) => {
          engine.dispatch(name, event);
        };
      });
    }

    return handlers;
  }, [engine, dsl.handlers]);

  // 渲染函数
  const render = useCallback(() => {
    const renderComponent = (component: any, key?: string): React.ReactNode => {
      // 检查条件渲染
      if (component.condition) {
        const shouldRender = evaluateCondition(
          component.condition,
          stateHooks,
          computedHooks
        );
        if (!shouldRender) return null;
      }

      const mcpRegistry = MCPRegistry.getInstance();
      const mcp = mcpRegistry.get(component.component);

      if (!mcp?.Component) {
        console.warn(`未找到组件: ${component.component}`);
        return React.createElement("div", { key }, `[${component.component}]`);
      }

      // 解析 props
      const props = resolveProps(
        component.props || {},
        stateHooks,
        computedHooks,
        handlers
      );

      // 渲染子组件
      const children = component.children?.map((child: any, index: number) =>
        renderComponent(child, `${key}-${index}`)
      );

      return React.createElement(mcp.Component, { key, ...props }, children);
    };

    return dsl.ui.map((component, index) =>
      renderComponent(component, `ui-${index}`)
    );
  }, [dsl.ui, stateHooks, computedHooks, handlers]);

  return {
    // 状态获取
    states: stateHooks,
    computed: computedHooks,

    // 事件处理
    handlers,

    // 渲染
    render,

    // 工具函数
    getState: (name: string) => {
      const hook = stateHooks[name];
      return hook ? hook() : undefined;
    },

    getComputed: (name: string) => {
      const hook = computedHooks[name];
      return hook ? hook() : undefined;
    },

    // 手动触发事件
    dispatch: (handlerName: string, event?: any) => {
      engine.dispatch(handlerName, event);
    },
  };
}

function evaluateCondition(
  condition: string,
  states: Record<string, () => any>,
  computed: Record<string, () => any>
): boolean {
  try {
    const context: Record<string, any> = {};

    // 收集所有可能的状态和计算属性
    Object.keys(states).forEach((name) => {
      context[name] = states[name]();
    });

    Object.keys(computed).forEach((name) => {
      context[name] = computed[name]();
    });

    // 安全地计算条件
    const func = new Function(...Object.keys(context), `return ${condition}`);
    return func(...Object.values(context));
  } catch (error) {
    console.warn(`条件计算失败: ${condition}`, error);
    return false;
  }
}

function resolveProps(
  props: Record<string, any>,
  states: Record<string, () => any>,
  computed: Record<string, () => any>,
  handlers: Record<string, Function>
): Record<string, any> {
  const resolved: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === "string") {
      // 处理 $state.xxx 引用
      if (value.startsWith("$state.")) {
        const stateName = value.substring(7);
        const hook = states[stateName];
        if (hook) {
          resolved[key] = hook();
        }
      }
      // 处理 $computed.xxx 引用
      else if (value.startsWith("$computed.")) {
        const computedName = value.substring(10);
        const hook = computed[computedName];
        if (hook) {
          resolved[key] = hook();
        }
      }
      // 处理事件处理器引用
      else if (key.startsWith("on") && handlers[value]) {
        resolved[key] = handlers[value];
      }
      // 其他字符串值保持不变
      else {
        resolved[key] = value;
      }
    } else {
      resolved[key] = value;
    }
  }

  return resolved;
}
