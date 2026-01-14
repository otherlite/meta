import { z } from "zod";
import { DSL, DSLSchema, DSLValidationResult } from "../types/dsl";

export function validateDSL(dsl: unknown): DSLValidationResult {
  try {
    const result = DSLSchema.safeParse(dsl);

    if (result.success) {
      // 额外验证：检查引用的状态、事件是否存在
      const warnings: string[] = [];
      const data = result.data;

      // 检查派生状态的依赖是否存在
      if (data.derivedStates) {
        data.derivedStates.forEach((derived) => {
          derived.dependencies.forEach((dep) => {
            if (!data.states.some((s) => s.id === dep)) {
              warnings.push(
                `Derived state "${derived.id}" depends on unknown state "${dep}"`
              );
            }
          });
        });
      }

      // 检查效果依赖的状态是否存在
      data.effects.forEach((effect) => {
        if (effect.dependsOn) {
          effect.dependsOn.forEach((dep) => {
            if (!data.states.some((s) => s.id === dep)) {
              warnings.push(
                `Effect "${effect.id}" depends on unknown state "${dep}"`
              );
            }
          });
        }
      });

      // 检查视图中的组件引用的状态和事件是否存在
      Object.values(data.view.components).forEach((component) => {
        if (component.events) {
          Object.values(component.events).forEach((eventId) => {
            if (!data.events.some((e) => e.id === eventId)) {
              warnings.push(
                `Component "${component.id}" references unknown event "${eventId}"`
              );
            }
          });
        }
      });

      return {
        success: true,
        data,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } else {
      // 使用 issues 而不是 errors
      const errors = result.error.issues.map((err) => {
        const path = err.path.join(".");
        return path ? `${path}: ${err.message}` : err.message;
      });
      return {
        success: false,
        errors,
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        `Unexpected error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
    };
  }
}

// 辅助函数：获取 Zod 错误的详细信息
export function formatZodError(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

// 深度验证 DSL，包括自定义规则
export function deepValidateDSL(dsl: DSL): DSLValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // 检查状态 ID 是否唯一
  const stateIds = new Set<string>();
  dsl.states.forEach((state) => {
    if (stateIds.has(state.id)) {
      errors.push(`Duplicate state ID: ${state.id}`);
    }
    stateIds.add(state.id);
  });

  // 检查事件 ID 是否唯一
  const eventIds = new Set<string>();
  dsl.events.forEach((event) => {
    if (eventIds.has(event.id)) {
      errors.push(`Duplicate event ID: ${event.id}`);
    }
    eventIds.add(event.id);
  });

  // 检查效果 ID 是否唯一
  const effectIds = new Set<string>();
  dsl.effects.forEach((effect) => {
    if (effectIds.has(effect.id)) {
      errors.push(`Duplicate effect ID: ${effect.id}`);
    }
    effectIds.add(effect.id);
  });

  // 检查组件 ID 是否唯一
  const componentIds = new Set<string>();
  Object.values(dsl.view.components).forEach((component) => {
    if (componentIds.has(component.id)) {
      errors.push(`Duplicate component ID: ${component.id}`);
    }
    componentIds.add(component.id);
  });

  // 检查根组件是否存在
  if (!dsl.view.components[dsl.view.root]) {
    errors.push(`Root component "${dsl.view.root}" not found in components`);
  }

  // 检查组件树是否有循环引用
  const visited = new Set<string>();
  const stack = new Set<string>();

  function detectCycles(componentId: string): boolean {
    if (stack.has(componentId)) {
      return true;
    }
    if (visited.has(componentId)) {
      return false;
    }

    visited.add(componentId);
    stack.add(componentId);

    const component = dsl.view.components[componentId];
    if (component.children) {
      for (const childId of component.children) {
        if (!dsl.view.components[childId]) {
          warnings.push(
            `Component "${componentId}" references unknown child component "${childId}"`
          );
          continue;
        }
        if (detectCycles(childId)) {
          return true;
        }
      }
    }

    stack.delete(componentId);
    return false;
  }

  if (detectCycles(dsl.view.root)) {
    errors.push("Component tree contains cycles");
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: dsl,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// 验证 DSL 并自动修复常见问题
export function validateAndFixDSL(dsl: unknown): DSLValidationResult {
  const validationResult = validateDSL(dsl);
  const warnings: string[] = [];
  const errors: string[] = [];

  if (validationResult.success && validationResult.data) {
    // 应用自动修复
    const fixedDSL = { ...validationResult.data };

    // 确保所有组件都有唯一的 ID
    const componentIds = new Set<string>();
    Object.keys(fixedDSL.view.components).forEach((id) => {
      componentIds.add(id);
    });

    // 确保所有组件都有 id 属性
    Object.entries(fixedDSL.view.components).forEach(([key, component]) => {
      if (!component.id) {
        component.id = key;
      }
    });

    // 确保视图根组件存在
    if (!fixedDSL.view.components[fixedDSL.view.root]) {
      // 尝试使用第一个组件作为根
      const firstComponent = Object.keys(fixedDSL.view.components)[0];
      if (firstComponent) {
        warnings.push(
          `Root component "${fixedDSL.view.root}" not found, using "${firstComponent}" instead`
        );
        fixedDSL.view.root = firstComponent;
      } else {
        errors.push("No components defined in view");
        return {
          success: false,
          errors,
        };
      }
    }

    const deepResult = deepValidateDSL(fixedDSL);
    if (deepResult.success) {
      return {
        success: true,
        data: fixedDSL,
        warnings: [
          ...(validationResult.warnings || []),
          ...(deepResult.warnings || []),
          ...warnings,
        ].filter(Boolean),
      };
    } else {
      return deepResult;
    }
  }

  return validationResult;
}
