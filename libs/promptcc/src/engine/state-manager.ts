import { atom, createStore } from "jotai";
import { DSL } from "types/dsl";
import { evaluateJsonLogic } from "core/jsonlogic";
import { Logger } from "types/mcp";
import { Subscriber } from "types/engine";

export class JotaiStateManager {
  private store: ReturnType<typeof createStore>;
  private stateAtoms: Map<string, ReturnType<typeof atom>> = new Map();
  private derivedStateAtoms: Map<string, ReturnType<typeof atom>> = new Map();
  private eventAtoms: Map<string, ReturnType<typeof atom>> = new Map();
  private subscribers: Map<string, Subscriber[]> = new Map();
  private logger: Logger;
  private dsl: DSL;

  constructor(dsl: DSL, logger?: Logger) {
    this.dsl = dsl;
    this.logger = logger || this.createDefaultLogger();
    this.store = createStore();

    this.initializeStates();
    this.initializeDerivedStates();
    this.initializeEvents();
  }

  private createDefaultLogger(): Logger {
    return {
      log: (msg, data) => console.log(`[STATE] ${msg}`, data),
      info: (msg, data) => console.info(`[STATE] ${msg}`, data),
      warn: (msg, data) => console.warn(`[STATE] ${msg}`, data),
      error: (msg, data) => console.error(`[STATE] ${msg}`, data),
      debug: (msg, data) => console.debug(`[STATE] ${msg}`, data),
    };
  }

  private initializeStates(): void {
    this.dsl.states.forEach((stateDef) => {
      const stateAtom = atom(stateDef.defaultValue);

      // 添加状态更新拦截器
      const interceptedAtom = atom(
        (get) => get(stateAtom),
        (get, set, update: any) => {
          const oldValue = get(stateAtom);
          const newValue =
            typeof update === "function" ? update(oldValue) : update;

          this.logger.debug(`State ${stateDef.id} changing`, {
            from: oldValue,
            to: newValue,
            timestamp: Date.now(),
          });

          // 调用状态更新前的订阅器
          this.notifySubscribers(`state:before:${stateDef.id}`, {
            oldValue,
            newValue,
            stateId: stateDef.id,
          });

          set(stateAtom, newValue);

          // 调用状态更新后的订阅器
          this.notifySubscribers(`state:after:${stateDef.id}`, {
            oldValue,
            newValue,
            stateId: stateDef.id,
          });

          // 通知全局状态变化
          this.notifySubscribers("state:change", {
            stateId: stateDef.id,
            oldValue,
            newValue,
            timestamp: Date.now(),
          });
        }
      );

      this.stateAtoms.set(stateDef.id, interceptedAtom);
      this.logger.debug(`Initialized state atom: ${stateDef.id}`);
    });
  }

  private initializeDerivedStates(): void {
    if (!this.dsl.derivedStates) return;

    this.dsl.derivedStates.forEach((derivedDef) => {
      // 创建依赖状态列表
      const dependencyAtoms = derivedDef.dependencies.map((depId) => {
        const atom = this.stateAtoms.get(depId);
        if (!atom) {
          throw new Error(
            `Dependency state not found: ${depId} for derived state ${derivedDef.id}`
          );
        }
        return atom;
      });

      // 创建派生状态原子
      const derivedAtom = atom((get) => {
        // 收集依赖状态的值
        const dependencies: Record<string, any> = {};
        derivedDef.dependencies.forEach((depId, index) => {
          dependencies[depId] = get(dependencyAtoms[index]);
        });

        try {
          // 使用 JsonLogic 计算派生状态
          const result = evaluateJsonLogic(derivedDef.logic, {
            states: dependencies,
            derived: {}, // 目前不支持派生状态引用其他派生状态
          });

          this.logger.debug(`Derived state ${derivedDef.id} computed`, {
            dependencies,
            logic: derivedDef.logic,
            result,
            timestamp: Date.now(),
          });

          // 通知派生状态变化
          this.notifySubscribers(`derived:${derivedDef.id}`, {
            value: result,
            dependencies,
            timestamp: Date.now(),
          });

          return result;
        } catch (error) {
          this.logger.error(
            `Failed to compute derived state ${derivedDef.id}:`,
            {
              error,
              dependencies,
              logic: derivedDef.logic,
            }
          );
          return null;
        }
      });

      this.derivedStateAtoms.set(derivedDef.id, derivedAtom);
      this.logger.debug(`Initialized derived state atom: ${derivedDef.id}`);
    });
  }

  private initializeEvents(): void {
    this.dsl.events.forEach((eventDef) => {
      const eventAtom = atom<{
        type: string;
        payload?: any;
        timestamp?: number;
      } | null>(null);
      this.eventAtoms.set(eventDef.id, eventAtom);
      this.logger.debug(`Initialized event atom: ${eventDef.id}`);
    });
  }

  // 公共 API
  public getState<T = any>(stateId: string): T {
    const atom = this.stateAtoms.get(stateId);
    if (!atom) {
      throw new Error(`State not found: ${stateId}`);
    }
    return this.store.get(atom);
  }

  public setState(stateId: string, value: any): void {
    const atom = this.stateAtoms.get(stateId);
    if (!atom) {
      throw new Error(`State not found: ${stateId}`);
    }
    this.store.set(atom, value);
  }

  public updateState(stateId: string, updater: (prev: any) => any): void {
    const atom = this.stateAtoms.get(stateId);
    if (!atom) {
      throw new Error(`State not found: ${stateId}`);
    }
    const current = this.store.get(atom);
    this.store.set(atom, updater(current));
  }

  public getDerivedState<T = any>(derivedId: string): T {
    const atom = this.derivedStateAtoms.get(derivedId);
    if (!atom) {
      throw new Error(`Derived state not found: ${derivedId}`);
    }
    return this.store.get(atom);
  }

  public triggerEvent(eventId: string, payload?: any): void {
    const atom = this.eventAtoms.get(eventId);
    if (!atom) {
      throw new Error(`Event not found: ${eventId}`);
    }

    this.store.set(atom, {
      type: eventId,
      payload,
      timestamp: Date.now(),
    });

    this.logger.debug(`Event triggered: ${eventId}`, {
      payload,
      timestamp: Date.now(),
    });

    // 通知事件订阅者
    this.notifySubscribers(`event:${eventId}`, {
      type: eventId,
      payload,
      timestamp: Date.now(),
    });

    // 通知通用事件
    this.notifySubscribers("event:triggered", {
      eventId,
      payload,
      timestamp: Date.now(),
    });
  }

  public subscribe<T = any>(
    topic: string,
    callback: (data: T) => void
  ): () => void {
    const subscriberId = `sub_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const subscriber: Subscriber<T> = {
      id: subscriberId,
      callback,
    };

    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }

    this.subscribers.get(topic)!.push(subscriber as Subscriber);
    this.logger.debug(`Subscribed to topic: ${topic}`, { subscriberId });

    // 返回取消订阅函数
    return () => {
      const subscribers = this.subscribers.get(topic);
      if (subscribers) {
        const index = subscribers.findIndex((s) => s.id === subscriberId);
        if (index !== -1) {
          subscribers.splice(index, 1);
          this.logger.debug(`Unsubscribed from topic: ${topic}`, {
            subscriberId,
          });
        }
      }
    };
  }

  public notifySubscribers(topic: string, data: any): void {
    const subscribers = this.subscribers.get(topic);
    if (subscribers && subscribers.length > 0) {
      subscribers.forEach((subscriber) => {
        try {
          subscriber.callback(data);
        } catch (error) {
          this.logger.error(
            `Error in subscriber callback for topic ${topic}:`,
            error
          );
        }
      });
    }
  }

  public getSnapshot(): Record<string, any> {
    const snapshot: Record<string, any> = {};

    // 收集所有状态值
    this.stateAtoms.forEach((atom, stateId) => {
      snapshot[stateId] = this.store.get(atom);
    });

    // 收集所有派生状态值
    this.derivedStateAtoms.forEach((atom, derivedId) => {
      snapshot[derivedId] = this.store.get(atom);
    });

    return snapshot;
  }

  public getStore(): ReturnType<typeof createStore> {
    return this.store;
  }

  public getStateAtom(stateId: string) {
    return this.stateAtoms.get(stateId);
  }

  public getDerivedStateAtom(derivedId: string) {
    return this.derivedStateAtoms.get(derivedId);
  }

  public getEventAtom(eventId: string) {
    return this.eventAtoms.get(eventId);
  }

  // 批量操作
  public batchUpdate(updates: Array<{ stateId: string; value: any }>): void {
    this.store.batch(() => {
      updates.forEach(({ stateId, value }) => {
        this.setState(stateId, value);
      });
    });
  }

  // 重置状态
  public reset(): void {
    this.dsl.states.forEach((stateDef) => {
      this.setState(stateDef.id, stateDef.defaultValue);
    });
  }

  // 导出为可序列化的对象
  public export(): {
    states: Record<string, any>;
    derivedStates: Record<string, any>;
    timestamp: number;
  } {
    const states: Record<string, any> = {};
    const derivedStates: Record<string, any> = {};

    this.stateAtoms.forEach((atom, stateId) => {
      states[stateId] = this.store.get(atom);
    });

    this.derivedStateAtoms.forEach((atom, derivedId) => {
      derivedStates[derivedId] = this.store.get(atom);
    });

    return {
      states,
      derivedStates,
      timestamp: Date.now(),
    };
  }

  // 导入状态
  public import(data: {
    states?: Record<string, any>;
    derivedStates?: Record<string, any>;
  }): void {
    if (data.states) {
      Object.entries(data.states).forEach(([stateId, value]) => {
        if (this.stateAtoms.has(stateId)) {
          this.setState(stateId, value);
        }
      });
    }

    // 注意：派生状态是计算得到的，不能直接导入
    // 但我们可以触发重新计算
    if (data.derivedStates) {
      this.logger.warn(
        "Derived states cannot be directly imported, they will be recomputed"
      );
    }
  }
}
