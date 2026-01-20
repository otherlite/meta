import { DSLNode, DSLRoot, CustomDecoratorConfig, UIComponent } from "./types";

export class DSLCodeGenerator {
  private customDecorators: Map<string, CustomDecoratorConfig> = new Map();

  constructor(customDecorators: CustomDecoratorConfig[] = []) {
    customDecorators.forEach((decorator) => {
      this.customDecorators.set(decorator.name, decorator);
    });
  }

  generateTypeScriptTypes(dsl: DSLRoot): string {
    const typeDefinitions: string[] = [];

    // 生成 SearchParams 类型
    const searchParams = dsl.decorators.searchParams;
    if (searchParams && searchParams.length > 0) {
      const searchParamsType = searchParams
        .map((param) => {
          return `  ${param.name}: ${this.mapTypeToTS(param.params.type)};`;
        })
        .join("\n");

      typeDefinitions.push(
        `export interface SearchParams {\n${searchParamsType}\n}`
      );
    }

    // 生成 State 类型
    const states = dsl.decorators.state;
    if (states && states.length > 0) {
      const stateType = states
        .map((state) => {
          return `  ${state.name}: ${this.mapTypeToTS(state.params.type)};`;
        })
        .join("\n");

      typeDefinitions.push(
        `export interface ComponentState {\n${stateType}\n}`
      );
    }

    // 生成 Memo 类型
    const memos = dsl.decorators.memo;
    if (memos && states && states.length > 0) {
      typeDefinitions.push(`export type MemoValues = {
        ${memos.map((memo) => `${memo.name}: boolean;`).join("\n  ")}
      };`);
    }

    // 生成 Callbacks 类型
    const callbacks = dsl.decorators.callback;
    if (callbacks && callbacks.length > 0) {
      const callbackType = callbacks
        .map((cb) => {
          return `  ${cb.name}: () => void;`;
        })
        .join("\n");

      typeDefinitions.push(
        `export interface ComponentCallbacks {\n${callbackType}\n}`
      );
    }

    // 生成 Props 类型（结合所有外部输入）
    typeDefinitions.push(`export interface ComponentProps {
      searchParams?: Partial<SearchParams>;
      initialState?: Partial<ComponentState>;
    }`);

    // 生成完整的 Hook 返回值类型
    typeDefinitions.push(`export interface UseDSLReturn {
      state: ComponentState;
      searchParams: SearchParams;
      memo: MemoValues;
      callbacks: ComponentCallbacks;
      ui: Record<string, React.ReactNode>;
      ui2: Record<string, React.ReactNode>;
      effects: Record<string, () => void>;
    }`);

    return typeDefinitions.join("\n\n");
  }

  generateReactHook(dsl: DSLRoot): string {
    const imports = [
      "import { useState, useEffect, useCallback, useMemo } from 'react';",
      "import { useAtom } from 'jotai';",
      "import { atom } from 'jotai';",
      ...(dsl.imports || []),
    ];

    const stateAtoms: string[] = [];
    const memoDefinitions: string[] = [];
    const callbackDefinitions: string[] = [];
    const effectDefinitions: string[] = [];
    const uiRenderers: string[] = [];
    const ui2Renderers: string[] = [];

    // 处理 state
    const states = dsl.decorators.state || [];
    states.forEach((state) => {
      const atomName = `${state.name}Atom`;
      stateAtoms.push(
        `const ${atomName} = atom(${JSON.stringify(
          state.params.defaultValue
        )});`
      );
    });

    // 处理 memo
    const memos = dsl.decorators.memo || [];
    memos.forEach((memo) => {
      memoDefinitions.push(`
        const ${memo.name} = useMemo(() => {
          // ${memo.params.condition || "自定义条件"}
          return ${this.generateMemoCondition(memo)};
        }, [${this.extractDependencies(memo).join(", ")}]);
      `);
    });

    // 处理 callback
    const callbacks = dsl.decorators.callback || [];
    callbacks.forEach((cb) => {
      callbackDefinitions.push(`
        const ${cb.name} = useCallback(() => {
          // ${cb.params.description || "回调函数"}
          console.log('${cb.name} triggered');
        }, []);
      `);
    });

    // 处理 effect
    const effects = dsl.decorators.effect || [];
    effects.forEach((effect) => {
      effectDefinitions.push(`
        useEffect(() => {
          ${effect.name}();
        }, [${(effect.params.dependencies || []).join(", ")}]);
        
        const ${effect.name} = useCallback(async () => {
          // ${effect.params.description || "副作用函数"}
          console.log('${effect.name} executed');
        }, [${(effect.params.dependencies || []).join(", ")}]);
      `);
    });

    // 处理 UI 渲染
    const uiNodes = dsl.decorators.ui || [];
    uiNodes.forEach((node, index) => {
      if (node.ui) {
        const uiRenderer = this.generateUIComponent(node.ui, `ui${index}`);
        uiRenderers.push(uiRenderer);
      }
    });

    const ui2Nodes = dsl.decorators.ui2 || [];
    ui2Nodes.forEach((node, index) => {
      if (node.ui) {
        const ui2Renderer = this.generateUIComponent(node.ui, `ui2${index}`);
        ui2Renderers.push(ui2Renderer);
      }
    });

    const hookCode = `
${imports.join("\n")}

${stateAtoms.join("\n")}

export const useDSL = (props: ComponentProps = {}) => {
  // State management with Jotai
  ${states
    .map((state) => {
      const atomName = `${state.name}Atom`;
      return `const [${state.name}, set${
        state.charAt(0).toUpperCase() + state.slice(1)
      }] = useAtom(${atomName});`;
    })
    .join("\n  ")}

  // Search params
  const searchParams = {
    ${(dsl.decorators.searchParams || [])
      .map(
        (sp) =>
          `${sp.name}: props.searchParams?.${sp.name} || ${JSON.stringify(
            sp.params.defaultValue
          )}`
      )
      .join(",\n    ")}
  };

  // Memoized values
  ${memoDefinitions.join("\n  ")}

  // Callbacks
  ${callbackDefinitions.join("\n  ")}

  // Effects
  ${effectDefinitions.join("\n  ")}

  // UI components
  const ui = {
    ${uiRenderers.join(",\n    ")}
  };

  const ui2 = {
    ${ui2Renderers.join(",\n    ")}
  };

  return {
    state: { ${states.map((s) => s.name).join(", ")} },
    searchParams,
    memo: { ${memos.map((m) => m.name).join(", ")} },
    callbacks: { ${callbacks.map((c) => c.name).join(", ")} },
    effects: { ${effects.map((e) => e.name).join(", ")} },
    ui,
    ui2
  };
};
`;

    return hookCode;
  }

  private generateUIComponent(
    components: UIComponent[],
    prefix: string
  ): string {
    const componentRenderers = components.map((component, index) => {
      const componentName = `${prefix}_${component.type}_${index}`;

      let props = "";
      if (component.props) {
        props = Object.entries(component.props)
          .map(([key, value]) => {
            if (key === "disabled" && component.condition) {
              return `${key}: ${component.condition}`;
            }
            if (typeof value === "string" && value.startsWith("$")) {
              // 绑定状态
              const stateName = value.slice(1);
              return `${key}: ${stateName}`;
            }
            return `${key}: ${JSON.stringify(value)}`;
          })
          .join(", ");
      }

      let children = "";
      if (component.children && component.children.length > 0) {
        children = `, ${this.generateUIComponent(
          component.children,
          `${componentName}_child`
        )}`;
      }

      let eventHandlers = "";
      if (component.event) {
        eventHandlers = Object.entries(component.event)
          .map(([event, handler]) => `${event}: ${handler}`)
          .join(", ");
      }

      return `
    ${componentName}: (${props ? `{ ${props} }` : ""}) => (
      <div key="${componentName}">
        {/* ${component.type} component */}
        ${children}
      </div>
    )`.trim();
    });

    return componentRenderers.join(",\n");
  }

  private mapTypeToTS(type: string): string {
    const typeMap: Record<string, string> = {
      string: "string",
      number: "number",
      boolean: "boolean",
      date: "Date",
      array: "any[]",
      object: "Record<string, any>",
    };
    return typeMap[type.toLowerCase()] || "any";
  }

  private generateMemoCondition(memo: any): string {
    if (memo.params.condition) {
      return memo.params.condition;
    }
    // 默认条件：所有依赖的状态都不为空
    const deps = this.extractDependencies(memo);
    if (deps.length > 0) {
      return deps.map((dep) => `${dep} != null`).join(" && ");
    }
    return "true";
  }

  private extractDependencies(node: any): string[] {
    const deps: string[] = [];

    // 从条件字符串中提取依赖
    if (node.params.condition) {
      const regex = /[a-zA-Z_$][a-zA-Z0-9_$]*/g;
      const matches = node.params.condition.match(regex);
      if (matches) {
        deps.push(
          ...matches.filter(
            (m: string) => !["true", "false", "null", "undefined"].includes(m)
          )
        );
      }
    }

    // 从配置中提取依赖
    if (node.params.dependencies && Array.isArray(node.params.dependencies)) {
      deps.push(...node.params.dependencies);
    }

    return [...new Set(deps)]; // 去重
  }

  async generateFiles(dsl: DSLRoot, outputDir: string): Promise<void> {
    const typesContent = this.generateTypeScriptTypes(dsl);
    const hookContent = this.generateReactHook(dsl);
    const dslJson = JSON.stringify(dsl, null, 2);

    // 这里应该写入文件系统，简化版本返回内容
    return {
      types: typesContent,
      hook: hookContent,
      dsl: dslJson,
    };
  }
}
