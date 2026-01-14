import { DSL } from "../types/dsl";

export function generateTypeScript(dsl: DSL): string {
  const imports = `
import { atom, useAtom } from 'jotai';
import { executeJsonLogic } from 'json-logic-js';
`;

  // 生成状态原子
  const stateAtoms = dsl.states
    .map(
      (state) =>
        `export const ${state.id}Atom = atom(${JSON.stringify(
          state.defaultValue
        )});`
    )
    .join("\n");

  // 生成派生状态
  const derivedStates =
    dsl.derivedStates
      ?.map((derived) => {
        const deps = derived.dependencies.map((dep) => `${dep}Atom`).join(", ");
        return `
export const ${derived.id}Atom = atom((get) => {
  const data = {
    ${derived.dependencies
      .map((dep) => `${dep}: get(${dep}Atom)`)
      .join(",\n    ")}
  };
  return executeJsonLogic(${JSON.stringify(derived.logic)}, data);
});
      `.trim();
      })
      .join("\n\n") || "";

  // 生成事件处理器
  const eventHandlers = dsl.events
    .map((event) => {
      return `
export function use${event.id}() {
  const [value, setValue] = useAtom(${event.id}Atom);
  // TODO: Implement event handler
  return {
    value,
    setValue
  };
}
      `.trim();
    })
    .join("\n\n");

  // 生成组件渲染器
  const componentRenderers = Object.values(dsl.view.components)
    .map((component: any) => {
      return `
export function ${component.id}Component() {
  const properties = ${JSON.stringify(component.properties, null, 2)};
  
  return (
    <div data-mcp="${component.type}" data-id="${component.id}">
      {/* Render ${component.type} component */}
      <pre>{JSON.stringify(properties, null, 2)}</pre>
    </div>
  );
}
      `.trim();
    })
    .join("\n\n");

  // 生成根组件
  const rootComponent = `
export function App() {
  return (
    <div className="app">
      ${
        dsl.view.root
          ? `<${dsl.view.root}Component />`
          : "<!-- No root component -->"
      }
    </div>
  );
}
  `.trim();

  return `${imports}\n\n${stateAtoms}\n\n${derivedStates}\n\n${eventHandlers}\n\n${componentRenderers}\n\n${rootComponent}`;
}
