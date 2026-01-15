import { DSL, EffectDefinition } from "types/dsl";
import { Logger, EngineEffect, EngineContext, MCPClient } from "types/engine";
import { evaluateJsonLogic } from "core/jsonlogic";

export class EffectExecutor {
  private dsl: DSL;
  private mcpClient: MCPClient;
  private logger: Logger;
  private stateManager: any;
  private runningEffects: Map<string, EngineEffect> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private effectQueue: Array<{
    effectId: string;
    params: Record<string, any>;
    context: any;
  }> = [];
  private isProcessingQueue: boolean = false;

  constructor(
    dsl: DSL,
    mcpClient: MCPClient,
    stateManager: any,
    logger?: Logger
  ) {
    this.dsl = dsl;
    this.mcpClient = mcpClient;
    this.stateManager = stateManager;
    this.logger = logger || this.createDefaultLogger();
  }

  private createDefaultLogger(): Logger {
    return {
      log: (msg, data) => console.log(`[EFFECT] ${msg}`, data),
      info: (msg, data) => console.info(`[EFFECT] ${msg}`, data),
      warn: (msg, data) => console.warn(`[EFFECT] ${msg}`, data),
      error: (msg, data) => console.error(`[EFFECT] ${msg}`, data),
      debug: (msg, data) => console.debug(`[EFFECT] ${msg}`, data),
    };
  }

  public async executeEffect(
    effectId: string,
    params: Record<string, any> = {},
    context: EngineContext
  ): Promise<EngineEffect> {
    const effectDef = this.dsl.effects.find((e) => e.id === effectId);
    if (!effectDef) {
      throw new Error(`Effect not found: ${effectId}`);
    }

    // 检查条件是否满足
    if (effectDef.dependsOn) {
      const canExecute = this.checkDependencies(effectDef.dependsOn, context);
      if (!canExecute) {
        throw new Error(`Dependencies not met for effect: ${effectId}`);
      }
    }

    // 创建效果实例
    const effect: EngineEffect = {
      id: `${effectId}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      type: effectDef.type,
      status: "pending",
      operation: {
        mcp: effectDef.action.mcp,
        operation: effectDef.action.operation,
        parameters: this.resolveParameters(
          effectDef.action.parameters,
          params,
          context
        ),
      },
      metadata: {
        effectId,
        definition: effectDef,
        params,
        startedAt: Date.now(),
      },
    };

    // 处理不同类型的效果
    switch (effectDef.type) {
      case "async":
        return await this.executeAsyncEffect(effect, effectDef, context);
      case "debounce":
        return await this.executeDebounceEffect(effect, effectDef, context);
      case "sync":
        return await this.executeSyncEffect(effect, effectDef, context);
      default:
        throw new Error(`Unknown effect type: ${effectDef.type}`);
    }
  }

  private async executeAsyncEffect(
    effect: EngineEffect,
    effectDef: EffectDefinition,
    context: EngineContext
  ): Promise<EngineEffect> {
    this.logger.info(`Starting async effect: ${effect.id}`, {
      operation: effect.operation,
      effectDef,
    });

    effect.status = "running";
    effect.startedAt = Date.now();
    this.runningEffects.set(effect.id, effect);

    // 通知开始
    context.hooks?.onEffectStart?.(effect);

    try {
      // 执行 MCP 操作
      const result = await this.mcpClient.execute(effect.operation);

      effect.status = "completed";
      effect.completedAt = Date.now();
      effect.result = result;

      this.logger.info(`Async effect completed: ${effect.id}`, {
        duration: effect.completedAt - effect.startedAt!,
        result,
      });

      // 处理成功事件
      if (effectDef.onSuccess && effectDef.onSuccess.length > 0) {
        await this.handleSuccessEvents(
          effectDef.onSuccess,
          result.data,
          context
        );
      }

      // 通知完成
      context.hooks?.onEffectComplete?.(effect);
    } catch (error) {
      effect.status = "failed";
      effect.completedAt = Date.now();
      effect.error = error instanceof Error ? error.message : String(error);

      this.logger.error(`Async effect failed: ${effect.id}`, {
        error,
        duration: effect.completedAt - effect.startedAt!,
      });

      // 处理失败事件
      if (effectDef.onFailure && effectDef.onFailure.length > 0) {
        await this.handleFailureEvents(effectDef.onFailure, error, context);
      }

      // 通知错误
      context.hooks?.onEffectError?.(effect, error as Error);
    } finally {
      this.runningEffects.delete(effect.id);
    }

    return effect;
  }

  private async executeDebounceEffect(
    effect: EngineEffect,
    effectDef: EffectDefinition,
    context: EngineContext
  ): Promise<EngineEffect> {
    const debounceKey = `${effectDef.id}_${JSON.stringify(
      effect.operation.parameters
    )}`;

    // 清除现有的定时器
    if (this.debounceTimers.has(debounceKey)) {
      clearTimeout(this.debounceTimers.get(debounceKey)!);
      this.debounceTimers.delete(debounceKey);
    }

    this.logger.debug(`Scheduling debounce effect: ${effect.id}`, {
      debounceKey,
      debounceMs: effectDef.debounceMs,
    });

    return new Promise((resolve) => {
      const timer = setTimeout(async () => {
        try {
          // 执行异步效果
          const executedEffect = await this.executeAsyncEffect(
            effect,
            effectDef,
            context
          );
          resolve(executedEffect);
        } catch (error) {
          effect.status = "failed";
          effect.error = error instanceof Error ? error.message : String(error);
          resolve(effect);
        } finally {
          this.debounceTimers.delete(debounceKey);
        }
      }, effectDef.debounceMs || 300);

      this.debounceTimers.set(debounceKey, timer);
      effect.status = "pending";
    });
  }

  private async executeSyncEffect(
    effect: EngineEffect,
    effectDef: EffectDefinition,
    context: EngineContext
  ): Promise<EngineEffect> {
    this.logger.info(`Executing sync effect: ${effect.id}`, {
      operation: effect.operation,
    });

    effect.status = "running";
    effect.startedAt = Date.now();

    // 通知开始
    context.hooks?.onEffectStart?.(effect);

    try {
      // 同步执行 MCP 操作
      const result = await this.mcpClient.execute(effect.operation);

      effect.status = "completed";
      effect.completedAt = Date.now();
      effect.result = result;

      this.logger.info(`Sync effect completed: ${effect.id}`, {
        duration: effect.completedAt - effect.startedAt!,
        result,
      });

      // 处理成功事件
      if (effectDef.onSuccess && effectDef.onSuccess.length > 0) {
        await this.handleSuccessEvents(
          effectDef.onSuccess,
          result.data,
          context
        );
      }

      // 通知完成
      context.hooks?.onEffectComplete?.(effect);
    } catch (error) {
      effect.status = "failed";
      effect.completedAt = Date.now();
      effect.error = error instanceof Error ? error.message : String(error);

      this.logger.error(`Sync effect failed: ${effect.id}`, {
        error,
        duration: effect.completedAt - effect.startedAt!,
      });

      // 处理失败事件
      if (effectDef.onFailure && effectDef.onFailure.length > 0) {
        await this.handleFailureEvents(effectDef.onFailure, error, context);
      }

      // 通知错误
      context.hooks?.onEffectError?.(effect, error as Error);
    }

    return effect;
  }

  private async handleSuccessEvents(
    eventIds: string[],
    data: any,
    context: EngineContext
  ): Promise<void> {
    for (const eventId of eventIds) {
      try {
        this.logger.debug(`Triggering success event: ${eventId}`, { data });
        // 这里应该触发状态管理器中的事件
        // 假设状态管理器有一个 triggerEvent 方法
        if (this.stateManager && this.stateManager.triggerEvent) {
          this.stateManager.triggerEvent(eventId, data);
        }
        context.hooks?.onEvent?.({
          id: `${eventId}_${Date.now()}`,
          type: eventId,
          payload: data,
          timestamp: Date.now(),
        });
      } catch (error) {
        this.logger.error(`Failed to trigger success event ${eventId}:`, error);
      }
    }
  }

  private async handleFailureEvents(
    eventIds: string[],
    error: any,
    context: EngineContext
  ): Promise<void> {
    for (const eventId of eventIds) {
      try {
        this.logger.debug(`Triggering failure event: ${eventId}`, { error });
        // 这里应该触发状态管理器中的事件
        if (this.stateManager && this.stateManager.triggerEvent) {
          this.stateManager.triggerEvent(eventId, { error });
        }
        context.hooks?.onEvent?.({
          id: `${eventId}_${Date.now()}`,
          type: eventId,
          payload: { error },
          timestamp: Date.now(),
        });
      } catch (error) {
        this.logger.error(`Failed to trigger failure event ${eventId}:`, error);
      }
    }
  }

  private checkDependencies(
    dependencies: string[],
    context: EngineContext
  ): boolean {
    // 这里需要检查状态依赖是否满足
    // 简单实现：总是返回 true，实际项目中需要根据具体依赖检查
    return true;
  }

  private resolveParameters(
    parameters: Record<string, any>,
    effectParams: Record<string, any>,
    context: EngineContext
  ): Record<string, any> {
    const resolved: Record<string, any> = {};

    Object.entries(parameters).forEach(([key, value]) => {
      if (
        typeof value === "string" &&
        value.startsWith("${") &&
        value.endsWith("}")
      ) {
        // 模板字符串解析
        const expression = value.slice(2, -1).trim();
        resolved[key] = this.resolveExpression(
          expression,
          effectParams,
          context
        );
      } else if (typeof value === "object" && value !== null) {
        // 递归处理对象
        resolved[key] = this.resolveParameters(value, effectParams, context);
      } else {
        // 直接值
        resolved[key] = value;
      }
    });

    // 合并 effect 参数
    return { ...resolved, ...effectParams };
  }

  private resolveExpression(
    expression: string,
    effectParams: Record<string, any>,
    context: EngineContext
  ): any {
    // 简单表达式解析，可以扩展为完整的表达式引擎
    if (expression.startsWith("state.")) {
      const stateId = expression.slice(6);
      return this.stateManager.getState(stateId);
    } else if (expression.startsWith("derived.")) {
      const derivedId = expression.slice(8);
      return this.stateManager.getDerivedState(derivedId);
    } else if (expression.startsWith("params.")) {
      const paramKey = expression.slice(7);
      return effectParams[paramKey];
    } else {
      // 尝试作为 JsonLogic 表达式
      try {
        const logic = JSON.parse(expression);
        return evaluateJsonLogic(logic, {
          states: this.stateManager.getSnapshot(),
          derived: this.stateManager.getDerivedSnapshot?.(),
          params: effectParams,
        });
      } catch {
        // 返回原始表达式
        return expression;
      }
    }
  }

  public queueEffect(
    effectId: string,
    params: Record<string, any> = {},
    context: EngineContext
  ): void {
    this.effectQueue.push({ effectId, params, context });
    this.logger.debug(`Effect queued: ${effectId}`, {
      params,
      queueLength: this.effectQueue.length,
    });

    if (!this.isProcessingQueue) {
      this.processQueue(context);
    }
  }

  private async processQueue(context: EngineContext): Promise<void> {
    if (this.isProcessingQueue || this.effectQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.effectQueue.length > 0) {
      const item = this.effectQueue.shift();
      if (item) {
        try {
          await this.executeEffect(item.effectId, item.params, context);
        } catch (error) {
          this.logger.error(
            `Error processing queued effect ${item.effectId}:`,
            error
          );
        }
      }
    }

    this.isProcessingQueue = false;
  }

  public cancelEffect(effectId: string): boolean {
    if (this.runningEffects.has(effectId)) {
      const effect = this.runningEffects.get(effectId)!;
      effect.status = "cancelled";
      effect.completedAt = Date.now();
      this.runningEffects.delete(effectId);

      this.logger.info(`Effect cancelled: ${effectId}`);
      return true;
    }
    return false;
  }

  public cancelAllEffects(): void {
    this.runningEffects.forEach((effect, effectId) => {
      effect.status = "cancelled";
      effect.completedAt = Date.now();
    });
    this.runningEffects.clear();

    // 清除所有防抖定时器
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();

    // 清空队列
    this.effectQueue = [];

    this.logger.info("All effects cancelled");
  }

  public getRunningEffects(): EngineEffect[] {
    return Array.from(this.runningEffects.values());
  }

  public getQueuedEffects(): number {
    return this.effectQueue.length;
  }

  public clearQueue(): void {
    this.effectQueue = [];
    this.logger.info("Effect queue cleared");
  }
}
