import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAtom } from "jotai";
import { DeterministicEngine } from "./index";
import { ComponentProps, ComponentInstance } from "types/engine";

// React Context
const EngineContext = createContext<DeterministicEngine | null>(null);

// Provider 组件
export interface EngineProviderProps {
  engine: DeterministicEngine;
  children: React.ReactNode;
}

export const EngineProvider: React.FC<EngineProviderProps> = ({
  engine,
  children,
}) => {
  return (
    <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>
  );
};

// Hook: 使用引擎
export function useEngine(): DeterministicEngine {
  const engine = useContext(EngineContext);
  if (!engine) {
    throw new Error("useEngine must be used within an EngineProvider");
  }
  return engine;
}

// Hook: 使用状态
export function useEngineState<T = any>(
  stateId: string
): [T, (value: T) => void] {
  const engine = useEngine();
  const stateManager = engine.getStateManager();
  const stateAtom = stateManager.getStateAtom(stateId);

  if (!stateAtom) {
    throw new Error(`State not found: ${stateId}`);
  }

  const [value, setValue] = useAtom(stateAtom);

  const setState = (newValue: T) => {
    engine.setState(stateId, newValue);
  };

  return [value as T, setState];
}

// Hook: 使用派生状态
export function useDerivedState<T = any>(derivedId: string): T {
  const engine = useEngine();
  const stateManager = engine.getStateManager();
  const derivedAtom = stateManager.getDerivedStateAtom(derivedId);

  if (!derivedAtom) {
    throw new Error(`Derived state not found: ${derivedId}`);
  }

  const [value] = useAtom(derivedAtom);
  return value as T;
}

// Hook: 使用事件分发
export function useEventDispatcher() {
  const engine = useEngine();

  return {
    dispatch: (eventId: string, payload?: any) => {
      return engine.dispatchEvent(eventId, payload);
    },
    queueEffect: (effectId: string, params?: Record<string, any>) => {
      engine.queueEffect(effectId, params);
    },
  };
}

// Hook: 订阅引擎事件
export function useEngineSubscription<T = any>(
  topic: string,
  callback: (data: T) => void,
  deps: React.DependencyList = []
): void {
  const engine = useEngine();

  useEffect(() => {
    const unsubscribe = engine.subscribe(topic, callback);
    return () => unsubscribe();
  }, [engine, topic, ...deps]);
}

// Hook: 使用效果执行器
export function useEffectExecutor() {
  const engine = useEngine();

  return {
    execute: (effectId: string, params?: Record<string, any>) => {
      return engine.executeEffect(effectId, params);
    },
    cancel: (effectId: string) => {
      const effectExecutor = engine.getEffectExecutor();
      return effectExecutor.cancelEffect(effectId);
    },
    cancelAll: () => {
      const effectExecutor = engine.getEffectExecutor();
      effectExecutor.cancelAllEffects();
    },
  };
}

// 组件工厂
export function createComponentFactory(engine: DeterministicEngine) {
  return function ComponentFactory(props: ComponentProps): ComponentInstance {
    const { id, type, properties, events, children, layout } = props;

    const componentInstance: ComponentInstance = {
      id,
      type,
      props: { id, type, properties, events, children, layout },

      render: () => {
        // 基于类型渲染不同的组件
        // 这里返回一个简单的占位符，实际项目中应该注册组件映射
        return (
          <div
            key={id}
            data-component-id={id}
            data-component-type={type}
            style={layout}
          >
            <div
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <strong>{type}</strong>
              <pre style={{ fontSize: "12px", margin: "8px 0" }}>
                {JSON.stringify(properties, null, 2)}
              </pre>
              {children && (
                <div style={{ marginLeft: "16px" }}>
                  {children.map((childId) => (
                    <div key={childId}>Child: {childId}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      },

      updateProps: (newProps: Record<string, any>) => {
        componentInstance.props.properties = {
          ...componentInstance.props.properties,
          ...newProps,
        };
      },

      triggerEvent: async (eventName: string, payload?: any) => {
        const eventId = events?.[eventName];
        if (eventId) {
          await engine.dispatchEvent(eventId, payload);
        } else {
          console.warn(`Event ${eventName} not bound for component ${id}`);
        }
      },
    };

    return componentInstance;
  };
}

// 组件渲染器
export function ComponentRenderer({
  component,
}: {
  component: ComponentInstance;
}) {
  return component.render();
}

// 视图渲染器
export function ViewRenderer({ view }: { view: any }) {
  const engine = useEngine();
  const factory = useMemo(() => createComponentFactory(engine), [engine]);

  const renderComponent = (componentId: string): React.ReactNode => {
    const componentDef = view.components[componentId];
    if (!componentDef) {
      console.error(`Component not found: ${componentId}`);
      return null;
    }

    const component = factory({
      id: componentDef.id,
      type: componentDef.type,
      properties: componentDef.properties || {},
      events: componentDef.events || {},
      children: componentDef.children,
      layout: componentDef.layout,
    });

    return <ComponentRenderer key={componentId} component={component} />;
  };

  if (!view || !view.root || !view.components) {
    return <div>Invalid view configuration</div>;
  }

  return <>{renderComponent(view.root)}</>;
}

// 引擎状态监视器（开发工具）
export function EngineMonitor() {
  const engine = useEngine();
  const [state, setState] = useState(() => engine.getEngineState());

  useEngineSubscription("state:change", () => {
    setState(engine.getEngineState());
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "300px",
        height: "100vh",
        background: "#1a1a1a",
        color: "#fff",
        padding: "16px",
        overflow: "auto",
        fontSize: "12px",
        zIndex: 9999,
      }}
    >
      <h3 style={{ marginTop: 0 }}>Engine Monitor</h3>

      <div style={{ marginBottom: "16px" }}>
        <strong>Running Effects:</strong> {engine.getRunningEffects().length}
        <br />
        <strong>Queued Effects:</strong> {engine.getQueuedEffects()}
      </div>

      <div>
        <strong>States:</strong>
        <pre
          style={{
            background: "#2a2a2a",
            padding: "8px",
            borderRadius: "4px",
            fontSize: "10px",
            maxHeight: "200px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(state.current, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: "16px" }}>
        <strong>Derived States:</strong>
        <pre
          style={{
            background: "#2a2a2a",
            padding: "8px",
            borderRadius: "4px",
            fontSize: "10px",
            maxHeight: "200px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(state.derived, null, 2)}
        </pre>
      </div>

      <button
        onClick={() => engine.reset()}
        style={{
          marginTop: "16px",
          padding: "8px 16px",
          background: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Reset Engine
      </button>
    </div>
  );
}
