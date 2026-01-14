import React from "react";

export interface DSL {
  name: string;
  states: Record<string, StateDef>;
  computed?: Record<string, string>;
  handlers?: Record<string, Action[]>;
  actions?: Record<string, AsyncAction>;
  ui: UIComponent[];
}

export interface StateDef {
  type: "string" | "number" | "boolean" | "object" | "array";
  default: any;
  description?: string;
}

export type Action =
  | { type: "set"; state: string; value: any }
  | { type: "call"; action: string; args?: Record<string, any> }
  | { type: "emit"; event: string; payload?: any };

export interface AsyncAction {
  mcp: string;
  operation: string;
  args?: Record<string, any>;
  onSuccess: Action[];
  onError: Action[];
  debounce?: number;
  throttle?: number;
}

export interface UIComponent {
  component: string;
  props?: Record<string, any>;
  children?: UIComponent[];
  condition?: string;
}

export interface MCP {
  name: string;
  version: string;
  Component?: React.ComponentType<any>;
  operations?: Record<string, Function>;
  config?: any;
}
