// packages/engine/src/index.ts
import { atom, useAtom } from "jotai";
import React, { useMemo, useCallback, useEffect, useRef } from "react";
import { MCPRegistry } from "./mcp-registry";
import { DSL } from "./types";
import { evaluateExpression, resolveValue } from "./utils";

export class PromptCCEngine {
  private stateAtoms: Map<string, any> = new Map();
  private computedAtoms: Map<string, any> = new Map();
  private mcpRegistry: MCPRegistry;
  private pendingEffects: Map<string, NodeJS.Timeout> = new Map();

  constructor(private dsl: DSL, mcps: Record<string, any> = {}) {
    this.mcpRegistry = MCPRegistry.getInstance();

    // 注册 MCPs
    Object.entries(mcps).forEach(([name, mcp]) => {
      this.mcpRegistry.register(name, mcp);
    });

    this.initializeStates();
    this.initializeComputed();
  }

  private initializeStates() {
    Object.entries(this.dsl.states).forEach(([name, def]) => {
      const stateAtom = atom(def.default);
      this.stateAtoms.set(name, stateAtom);
    });
  }

  private initializeComputed() {
    if (!this.dsl.computed) return;

    Object.entries(this.dsl.computed).forEach(([name, expr]) => {
      const dependencies = this.extractDependencies(expr);
      const depAtoms = dependencies
        .map((dep) => this.stateAtoms.get(dep))
        .filter(Boolean);

      if (depAtoms.length > 0) {
        const computedAtom = atom((get) => {
          const context: Record<string, any> = {};
          dependencies.forEach((dep) => {
            const atom = this.stateAtoms.get(dep);
            if (atom) {
              context[dep] = get(atom);
            }
          });
          return evaluateExpression(expr, context);
        });
        this.computedAtoms.set(name, computedAtom);
      }
    });
  }

  private extractDependencies(expr: string): string[] {
    const matches = expr.match(/\b(\w+)\b/g) || [];
    const dependencies = new Set<string>();

    matches.forEach((match) => {
      if (this.stateAtoms.has(match)) {
        dependencies.add(match);
      }
    });

    return Array.from(dependencies);
  }

  getState(name: string): any {
    return this.stateAtoms.get(name);
  }

  getComputed(name: string): any {
    return this.computedAtoms.get(name);
  }

  async dispatch(handlerName: string, event?: any): Promise<void> {
    const actions = this.dsl.handlers?.[handlerName];
    if (!actions) {
      console.warn(`未找到处理器: ${handlerName}`);
      return;
    }

    for (const action of actions) {
      await this.executeAction(action, event);
    }
  }

  private async executeAction(action: any, event?: any): Promise<void> {
    const context = {
      $event: event,
      $state: this.getStateContext(),
      $computed: this.getComputedContext(),
    };

    switch (action.type) {
      case "set": {
        const value = resolveValue(action.value, context);
        this.setState(action.state, value);
        break;
      }

      case "call": {
        const args = action.args ? resolveValue(action.args, context) : {};
        await this.executeAsyncAction(action.action, args);
        break;
      }

      case "emit":
        // 触发自定义事件（可由父组件监听）
        this.emitEvent(action.event, action.payload);
        break;
    }
  }

  private async executeAsyncAction(
    actionName: string,
    args: any
  ): Promise<void> {
    const action = this.dsl.actions?.[actionName];
    if (!action) {
      console.warn(`未找到异步操作: ${actionName}`);
      return;
    }

    // 防抖处理
    if (action.debounce) {
      const key = `${actionName}_${JSON.stringify(args)}`;

      if (this.pendingEffects.has(key)) {
        clearTimeout(this.pendingEffects.get(key));
      }

      return new Promise((resolve) => {
        const timeout = setTimeout(async () => {
          await this.executeMcpAction(action, args);
          this.pendingEffects.delete(key);
          resolve();
        }, action.debounce);

        this.pendingEffects.set(key, timeout);
      });
    }

    // 节流处理
    if (action.throttle) {
      const key = actionName;
      if (this.pendingEffects.has(key)) {
        return;
      }

      this.pendingEffects.set(
        key,
        setTimeout(() => {
          this.pendingEffects.delete(key);
        }, action.throttle)
      );
    }

    await this.executeMcpAction(action, args);
  }

  private async executeMcpAction(action: any, args: any): Promise<void> {
    try {
      const mcp = this.mcpRegistry.get(action.mcp);
      if (!mcp?.operations?.[action.operation]) {
        throw new Error(`MCP ${action.mcp} 未找到操作 ${action.operation}`);
      }

      const result = await mcp.operations[action.operation](args);

      // 执行成功回调
      const successContext = {
        $result: result,
        $state: this.getStateContext(),
        $computed: this.getComputedContext(),
      };

      for (const actionItem of action.onSuccess) {
        await this.executeAction(actionItem, successContext);
      }
    } catch (error) {
      console.error(`执行 MCP 操作失败:`, error);

      // 执行错误回调
      const errorContext = {
        $error: error,
        $state: this.getStateContext(),
        $computed: this.getComputedContext(),
      };

      for (const actionItem of action.onError) {
        await this.executeAction(actionItem, errorContext);
      }
    }
  }

  private setState(name: string, value: any): void {
    const atom = this.stateAtoms.get(name);
    if (!atom) {
      console.warn(`尝试设置不存在的状态: ${name}`);
      return;
    }

    // 这里需要实际更新 atom 的值
    // 由于 jotai 的 atom 是不可变的，我们需要通过 useAtom 的 setter 来更新
    // 这个函数主要在组件内部使用
  }

  private getStateContext(): Record<string, any> {
    const context: Record<string, any> = {};
    this.stateAtoms.forEach((atom, name) => {
      // 注意：这里实际上需要获取 atom 的当前值
      // 在 React 组件中通过 useAtom 获取
      context[name] = undefined; // 占位符，实际值在组件内获取
    });
    return context;
  }

  private getComputedContext(): Record<string, any> {
    const context: Record<string, any> = {};
    this.computedAtoms.forEach((atom, name) => {
      context[name] = undefined; // 占位符
    });
    return context;
  }

  private emitEvent(event: string, payload?: any): void {
    // 事件系统可扩展，这里简单实现
    window.dispatchEvent(
      new CustomEvent(`promptcc:${event}`, { detail: payload })
    );
  }

  destroy(): void {
    // 清理所有定时器
    this.pendingEffects.forEach((timeout) => clearTimeout(timeout));
    this.pendingEffects.clear();
  }
}
