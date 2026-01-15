import { DSL } from "./dsl";
import { MCPRequest, MCPResponse } from "../types/mcp";

export interface EngineConfig {
  dsl: DSL;
  mcpClient?: MCPClient;
  initialState?: Record<string, any>;
  logger?: Logger;
  devMode?: boolean;
}

export interface EngineState {
  current: Record<string, any>;
  previous: Record<string, any>;
  derived: Record<string, any>;
  events: EngineEvent[];
  effects: EngineEffect[];
  history: StateSnapshot[];
  lastUpdated: number;
}

export interface EngineEvent {
  id: string;
  type: string;
  payload?: any;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface EngineEffect {
  id: string;
  type: "async" | "debounce" | "sync";
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  operation: MCPRequest;
  result?: MCPResponse;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface StateSnapshot {
  timestamp: number;
  state: Record<string, any>;
  event?: EngineEvent;
  effects: EngineEffect[];
}

export interface EngineResult {
  success: boolean;
  state: EngineState;
  events: EngineEvent[];
  effects: EngineEffect[];
  error?: string;
}

export interface MCPClient {
  execute: (request: MCPRequest) => Promise<MCPResponse>;
  batchExecute?: (requests: MCPRequest[]) => Promise<MCPResponse[]>;
}

export interface Logger {
  log: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;
  debug: (message: string, data?: any) => void;
}

export interface EngineHooks {
  onStateChange?: (state: EngineState) => void;
  onEvent?: (event: EngineEvent) => void;
  onEffectStart?: (effect: EngineEffect) => void;
  onEffectComplete?: (effect: EngineEffect) => void;
  onEffectError?: (effect: EngineEffect, error: Error) => void;
  onDerivedStateChange?: (stateId: string, value: any) => void;
}

export interface EngineContext {
  state: EngineState;
  config: EngineConfig;
  mcpClient: MCPClient;
  logger: Logger;
  hooks: EngineHooks;
  isRunning: boolean;
}

// 用于 React 绑定的类型
export interface ComponentProps {
  id: string;
  type: string;
  properties: Record<string, any>;
  events: Record<string, string>;
  children?: string[];
  layout?: Record<string, any>;
}

export interface ComponentInstance {
  id: string;
  type: string;
  props: ComponentProps;
  render: () => any; // 返回 React 元素或虚拟 DOM
  updateProps: (newProps: Record<string, any>) => void;
  triggerEvent: (eventName: string, payload?: any) => Promise<void>;
}

// 状态机类型
export interface StateMachine {
  currentState: string;
  states: Record<
    string,
    {
      onEnter?: () => void;
      onExit?: () => void;
      transitions: Record<
        string,
        {
          target: string;
          condition?: (context: any) => boolean;
          actions?: Array<() => void>;
        }
      >;
    }
  >;
  transition: (event: string, payload?: any) => void;
}

// 订阅器接口
export interface Subscriber<T = any> {
  id: string;
  callback: (value: T) => void;
}

// 可订阅的 Store 接口
export interface Store<T = any> {
  getState: () => T;
  setState: (newState: T | ((prev: T) => T)) => void;
  subscribe: (callback: (state: T) => void) => () => void;
  getSnapshot: () => T;
}
