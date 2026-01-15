import { DSL } from "types/dsl";
import { JotaiStateManager } from "./state-manager";
import { EffectExecutor } from "./effect-executor";
import {
  EngineConfig,
  EngineState,
  EngineResult,
  EngineHooks,
  MCPClient,
  Logger,
  EngineContext,
} from "types/engine";
import { evaluateJsonLogic } from "core/jsonlogic";

export class DeterministicEngine {
  private config: EngineConfig;
  private dsl: DSL;
  private stateManager: JotaiStateManager;
  private effectExecutor: EffectExecutor;
  private logger: Logger;
  private hooks: EngineHooks = {};
  private isInitialized: boolean = false;
  private mcpClient: MCPClient;
  private eventSubscriptions: Array<() => void> = [];

  constructor(config: EngineConfig) {
    this.config = {
      devMode: false,
      initialState: {},
      ...config,
    };

    this.dsl = config.dsl;
    this.logger = config.logger || this.createDefaultLogger();
    this.mcpClient = config.mcpClient || this.createDefaultMCPClient();

    // 初始化状态管理器
    this.stateManager = new JotaiStateManager(this.dsl, this.logger);

    // 初始化效果执行器
    this.effectExecutor = new EffectExecutor(
      this.dsl,
      this.mcpClient,
      this.stateManager,
      this.logger
    );

    // 设置钩子
    if (config.logger) {
      this.hooks = {
        onStateChange: (state) => {
          this.logger.debug("State changed", state);
        },
        onEvent: (event) => {
          this.logger.debug("Event triggered", event);
        },
        onEffectStart: (effect) => {
          this.logger.info("Effect started", effect);
        },
        onEffectComplete: (effect) => {
          this.logger.info("Effect completed", effect);
        },
        onEffectError: (effect, error) => {
          this.logger.error("Effect error", { effect, error });
        },
        onDerivedStateChange: (stateId, value) => {
          this.logger.debug("Derived state changed", { stateId, value });
        },
      };
    }
  }

  private createDefaultLogger(): Logger {
    return {
      log: (msg, data) => console.log(`[ENGINE] ${msg}`, data),
      info: (msg, data) => console.info(`[ENGINE] ${msg}`, data),
      warn: (msg, data) => console.warn(`[ENGINE] ${msg}`, data),
      error: (msg, data) => console.error(`[ENGINE] ${msg}`, data),
      debug: (msg, data) => console.debug(`[ENGINE] ${msg}`, data),
    };
  }

  private createDefaultMCPClient(): MCPClient {
    return {
      execute: async (request) => {
        this.logger.warn(
          "Using default MCP client - no actual MCP operations will be performed",
          request
        );
        return {
          id: request.id,
          success: true,
          data: { message: "Mock MCP response", request },
          metadata: { timestamp: Date.now(), mock: true },
        };
      },
    };
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.logger.info("Initializing deterministic engine...");

    // 应用初始状态
    if (this.config.initialState) {
      Object.entries(this.config.initialState).forEach(([stateId, value]) => {
        try {
          this.stateManager.setState(stateId, value);
        } catch (error) {
          this.logger.warn(`Failed to set initial state ${stateId}:`, error);
        }
      });
    }

    // 设置事件监听
    this.setupEventListeners();

    this.isInitialized = true;
    this.logger.info("Engine initialized successfully");
  }

  private setupEventListeners(): void {
    // 监听状态变化事件
    const unsubscribeState = this.stateManager.subscribe(
      "state:change",
      (data) => {
        this.hooks.onStateChange?.({
          current: this.stateManager.getSnapshot(),
          previous: data.oldValue, // 注意：这里需要改进以记录完整的前一个状态
          derived: this.getDerivedStates(),
          events: [],
          effects: [],
          history: [],
          lastUpdated: Date.now(),
        });
      }
    );

    this.eventSubscriptions.push(unsubscribeState);

    // 监听派生状态变化
    const unsubscribeDerived = this.stateManager.subscribe(
      "derived:*",
      (data) => {
        // 解析 stateId 从 topic
        const topic = "derived:*";
        const stateId = topic.replace("derived:", "");
        this.hooks.onDerivedStateChange?.(stateId, data.value);
      }
    );

    this.eventSubscriptions.push(unsubscribeDerived);
  }

  public async dispatchEvent(
    eventId: string,
    payload?: any
  ): Promise<EngineResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.logger.info(`Dispatching event: ${eventId}`, { payload });

    try {
      // 触发事件
      this.stateManager.triggerEvent(eventId, payload);

      // 通知钩子
      this.hooks.onEvent?.({
        id: `${eventId}_${Date.now()}`,
        type: eventId,
        payload,
        timestamp: Date.now(),
      });

      // 查找并执行关联的效果
      const effects = this.dsl.effects.filter((effect) =>
        effect.triggers?.includes(eventId)
      );

      const executedEffects = [];
      for (const effectDef of effects) {
        try {
          const context = this.createContext();
          const effect = await this.effectExecutor.executeEffect(
            effectDef.id,
            payload,
            context
          );
          executedEffects.push(effect);
        } catch (error) {
          this.logger.error(`Failed to execute effect ${effectDef.id}:`, error);
        }
      }

      return {
        success: true,
        state: this.getEngineState(),
        events: [
          {
            id: `${eventId}_${Date.now()}`,
            type: eventId,
            payload,
            timestamp: Date.now(),
          },
        ],
        effects: executedEffects,
      };
    } catch (error) {
      this.logger.error(`Failed to dispatch event ${eventId}:`, error);

      return {
        success: false,
        state: this.getEngineState(),
        events: [],
        effects: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  public async executeEffect(
    effectId: string,
    params?: Record<string, any>
  ): Promise<EngineResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.logger.info(`Executing effect: ${effectId}`, { params });

    try {
      const context = this.createContext();
      const effect = await this.effectExecutor.executeEffect(
        effectId,
        params,
        context
      );

      return {
        success: effect.status === "completed",
        state: this.getEngineState(),
        events: [],
        effects: [effect],
        error: effect.error,
      };
    } catch (error) {
      this.logger.error(`Failed to execute effect ${effectId}:`, error);

      return {
        success: false,
        state: this.getEngineState(),
        events: [],
        effects: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  public getState<T = any>(stateId: string): T {
    return this.stateManager.getState(stateId);
  }

  public setState(stateId: string, value: any): void {
    this.stateManager.setState(stateId, value);
  }

  public getDerivedState<T = any>(derivedId: string): T {
    return this.stateManager.getDerivedState(derivedId);
  }

  public getEngineState(): EngineState {
    return {
      current: this.stateManager.getSnapshot(),
      previous: {}, // 需要实现状态历史记录
      derived: this.getDerivedStates(),
      events: [],
      effects: this.effectExecutor.getRunningEffects(),
      history: [],
      lastUpdated: Date.now(),
    };
  }

  private getDerivedStates(): Record<string, any> {
    const derived: Record<string, any> = {};

    if (this.dsl.derivedStates) {
      this.dsl.derivedStates.forEach((derivedDef) => {
        try {
          derived[derivedDef.id] = this.stateManager.getDerivedState(
            derivedDef.id
          );
        } catch (error) {
          this.logger.warn(
            `Failed to get derived state ${derivedDef.id}:`,
            error
          );
        }
      });
    }

    return derived;
  }

  private createContext(): EngineContext {
    return {
      state: this.getEngineState(),
      config: this.config,
      mcpClient: this.mcpClient,
      logger: this.logger,
      hooks: this.hooks,
      isRunning: true,
    };
  }

  public subscribe<T = any>(
    topic: string,
    callback: (data: T) => void
  ): () => void {
    return this.stateManager.subscribe(topic, callback);
  }

  public getStore(): any {
    return this.stateManager.getStore();
  }

  public getStateManager(): JotaiStateManager {
    return this.stateManager;
  }

  public getEffectExecutor(): EffectExecutor {
    return this.effectExecutor;
  }

  public evaluateExpression(
    expression: any,
    context?: Record<string, any>
  ): any {
    try {
      return evaluateJsonLogic(expression, {
        states: this.stateManager.getSnapshot(),
        derived: this.getDerivedStates(),
        ...context,
      });
    } catch (error) {
      this.logger.error("Failed to evaluate expression:", {
        expression,
        error,
      });
      return null;
    }
  }

  public reset(): void {
    this.logger.info("Resetting engine state");
    this.stateManager.reset();
    this.effectExecutor.cancelAllEffects();
  }

  public destroy(): void {
    this.logger.info("Destroying engine");

    // 取消所有订阅
    this.eventSubscriptions.forEach((unsubscribe) => unsubscribe());
    this.eventSubscriptions = [];

    // 取消所有效果
    this.effectExecutor.cancelAllEffects();

    // 重置状态
    this.reset();

    this.isInitialized = false;
  }

  public exportState(): {
    states: Record<string, any>;
    derivedStates: Record<string, any>;
    timestamp: number;
  } {
    return this.stateManager.export();
  }

  public importState(data: {
    states?: Record<string, any>;
    derivedStates?: Record<string, any>;
  }): void {
    this.stateManager.import(data);
  }

  public batchUpdate(updates: Array<{ stateId: string; value: any }>): void {
    this.stateManager.batchUpdate(updates);
  }

  public queueEffect(effectId: string, params?: Record<string, any>): void {
    const context = this.createContext();
    this.effectExecutor.queueEffect(effectId, params, context);
  }

  public getRunningEffects() {
    return this.effectExecutor.getRunningEffects();
  }

  public getQueuedEffects() {
    return this.effectExecutor.getQueuedEffects();
  }

  public clearEffectQueue(): void {
    this.effectExecutor.clearQueue();
  }
}

// 工厂函数
export function createEngine(config: EngineConfig): DeterministicEngine {
  return new DeterministicEngine(config);
}

// 工具函数：从 DSL 创建引擎
export async function createEngineFromDSL(
  dsl: DSL,
  options?: {
    mcpClient?: MCPClient;
    logger?: Logger;
    initialState?: Record<string, any>;
    hooks?: EngineHooks;
  }
): Promise<DeterministicEngine> {
  const engine = new DeterministicEngine({
    dsl,
    mcpClient: options?.mcpClient,
    logger: options?.logger,
    initialState: options?.initialState,
    devMode: process.env.NODE_ENV !== "production",
  });

  // 设置钩子
  if (options?.hooks) {
    engine["hooks"] = { ...engine["hooks"], ...options.hooks };
  }

  await engine.initialize();
  return engine;
}
