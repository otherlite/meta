import { DSLSchema } from "./schema";

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export function validateDSL(dsl: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // 使用 Zod schema 验证
    DSLSchema.parse(dsl);
  } catch (error: any) {
    errors.push(
      `Schema 验证失败: ${error.errors.map((e: any) => e.message).join(", ")}`
    );
    return { valid: false, errors };
  }

  // 检查状态引用
  if (dsl.computed) {
    for (const [name, expr] of Object.entries(dsl.computed)) {
      if (typeof expr !== "string") {
        errors.push(`计算属性 "${name}" 必须是字符串表达式`);
      }
    }
  }

  // 检查处理器中的状态引用
  if (dsl.handlers) {
    for (const [name, actions] of Object.entries(
      dsl.handlers as Record<string, any[]>
    )) {
      actions.forEach((action, index) => {
        if (action.type === "set" && !dsl.states[action.state]) {
          warnings.push(
            `处理器 "${name}" 中的操作 ${index} 引用了不存在的状态: ${action.state}`
          );
        }
        if (action.type === "call" && !dsl.actions?.[action.action]) {
          warnings.push(
            `处理器 "${name}" 中的操作 ${index} 引用了不存在的操作: ${action.action}`
          );
        }
      });
    }
  }

  // 检查 UI 中的引用
  if (dsl.ui) {
    const checkProp = (prop: any, path: string) => {
      if (typeof prop === "string") {
        if (prop.startsWith("$state.") || prop.startsWith("$computed.")) {
          const ref = prop.substring(prop.indexOf(".") + 1);
          if (prop.startsWith("$state.") && !dsl.states[ref]) {
            warnings.push(`UI 属性 ${path} 引用了不存在的状态: ${ref}`);
          }
          if (prop.startsWith("$computed.") && !dsl.computed?.[ref]) {
            warnings.push(`UI 属性 ${path} 引用了不存在的计算属性: ${ref}`);
          }
        }
      } else if (Array.isArray(prop)) {
        prop.forEach((item, i) => checkProp(item, `${path}[${i}]`));
      } else if (typeof prop === "object" && prop !== null) {
        Object.entries(prop).forEach(([key, value]) =>
          checkProp(value, `${path}.${key}`)
        );
      }
    };

    const traverseUI = (components: any[], path: string = "ui") => {
      components.forEach((comp, i) => {
        const compPath = `${path}[${i}]`;
        if (comp.props) {
          Object.entries(comp.props).forEach(([key, value]) => {
            checkProp(value, `${compPath}.props.${key}`);
          });
        }
        if (comp.children) {
          traverseUI(comp.children, `${compPath}.children`);
        }
      });
    };

    traverseUI(dsl.ui);
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
