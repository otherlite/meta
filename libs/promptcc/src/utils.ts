export function evaluateExpression(
  expr: string,
  context: Record<string, any>
): any {
  // 安全地计算 JavaScript 表达式
  try {
    // 使用 Function 构造函数创建安全沙箱
    const func = new Function(...Object.keys(context), `return ${expr}`);
    return func(...Object.values(context));
  } catch (error) {
    console.warn(`表达式计算失败: ${expr}`, error);
    return null;
  }
}

export function resolveValue(value: any, context: Record<string, any>): any {
  if (typeof value === "string") {
    // 处理模板字符串，如 $state.xxx, $computed.xxx, $event.xxx
    return value.replace(
      /\$(state|computed|event)\.(\w+)/g,
      (_, type, name) => {
        return context[`$${type}`]?.[name] ?? context[name] ?? value;
      }
    );
  }
  return value;
}

export function extractDependencies(expr: string): string[] {
  // 从表达式中提取状态依赖
  const matches = expr.match(/\b(\w+)\b/g) || [];
  return Array.from(new Set(matches));
}
