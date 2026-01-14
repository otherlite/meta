import jsonLogic from "json-logic-js";

export interface JsonLogicContext {
  states: Record<string, any>;
  derived: Record<string, any>;
  event?: any;
}

export function evaluateJsonLogic(
  expression: any,
  context: JsonLogicContext
): any {
  try {
    // 创建数据对象，将状态和派生状态合并
    const data = {
      ...context.states,
      ...context.derived,
    };

    // 如果有事件数据，也添加进去
    if (context.event) {
      data["event"] = context.event;
    }

    return jsonLogic.apply(expression, data);
  } catch (error) {
    console.error("JsonLogic evaluation error:", error);
    throw new Error(
      `Failed to evaluate JsonLogic expression: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export function validateJsonLogic(expression: any): boolean {
  try {
    // 尝试用空数据执行，只检查语法
    jsonLogic.apply(expression, {});
    return true;
  } catch {
    return false;
  }
}
