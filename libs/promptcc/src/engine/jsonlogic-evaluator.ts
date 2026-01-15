import jsonLogic from "json-logic-js";
import { Logger } from "types/engine";

export interface ExtendedJsonLogicOptions {
  customOperations?: Record<string, (...args: any[]) => any>;
  stateGetter?: () => Record<string, any>;
  derivedStateGetter?: () => Record<string, any>;
  logger?: Logger;
}

export class ExtendedJsonLogicEvaluator {
  private customOperations: Map<string, (...args: any[]) => any> = new Map();
  private stateGetter?: () => Record<string, any>;
  private derivedStateGetter?: () => Record<string, any>;
  private logger?: Logger;

  constructor(options: ExtendedJsonLogicOptions = {}) {
    if (options.customOperations) {
      Object.entries(options.customOperations).forEach(([name, fn]) => {
        this.registerOperation(name, fn);
      });
    }

    this.stateGetter = options.stateGetter;
    this.derivedStateGetter = options.derivedStateGetter;
    this.logger = options.logger;
  }

  public registerOperation(
    name: string,
    operation: (...args: any[]) => any
  ): void {
    this.customOperations.set(name, operation);
    this.logger?.debug(`Registered custom JsonLogic operation: ${name}`);
  }

  public evaluate(expression: any, data: Record<string, any> = {}): any {
    try {
      // 合并数据
      const mergedData = {
        ...data,
        ...(this.stateGetter ? { states: this.stateGetter() } : {}),
        ...(this.derivedStateGetter
          ? { derived: this.derivedStateGetter() }
          : {}),
      };

      // 应用自定义操作
      const customJsonLogic = this.extendJsonLogic();

      return customJsonLogic.apply(expression, mergedData);
    } catch (error) {
      this.logger?.error("JsonLogic evaluation error:", {
        expression,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private extendJsonLogic() {
    const extendedJsonLogic = { ...jsonLogic };

    // 添加自定义操作
    this.customOperations.forEach((operation, name) => {
      if (!extendedJsonLogic.operations) {
        extendedJsonLogic.operations = {};
      }
      extendedJsonLogic.operations[name] = operation;
    });

    // 添加内置扩展操作

    // 状态访问操作
    if (!extendedJsonLogic.operations?.getState) {
      extendedJsonLogic.operations.getState = (stateId: string) => {
        if (this.stateGetter) {
          const states = this.stateGetter();
          return states[stateId];
        }
        return undefined;
      };
    }

    // 派生状态访问操作
    if (!extendedJsonLogic.operations?.getDerived) {
      extendedJsonLogic.operations.getDerived = (derivedId: string) => {
        if (this.derivedStateGetter) {
          const derived = this.derivedStateGetter();
          return derived[derivedId];
        }
        return undefined;
      };
    }

    // 字符串操作
    if (!extendedJsonLogic.operations?.concat) {
      extendedJsonLogic.operations.concat = (...args: any[]) => {
        return args.join("");
      };
    }

    if (!extendedJsonLogic.operations?.includes) {
      extendedJsonLogic.operations.includes = (str: string, search: string) => {
        return str.includes(search);
      };
    }

    // 数组操作
    if (!extendedJsonLogic.operations?.map) {
      extendedJsonLogic.operations.map = (arr: any[], fn: any) => {
        if (!Array.isArray(arr)) return [];
        return arr.map(fn);
      };
    }

    if (!extendedJsonLogic.operations?.filter) {
      extendedJsonLogic.operations.filter = (arr: any[], fn: any) => {
        if (!Array.isArray(arr)) return [];
        return arr.filter(fn);
      };
    }

    if (!extendedJsonLogic.operations?.reduce) {
      extendedJsonLogic.operations.reduce = (
        arr: any[],
        fn: any,
        initial: any
      ) => {
        if (!Array.isArray(arr)) return initial;
        return arr.reduce(fn, initial);
      };
    }

    // 日期操作
    if (!extendedJsonLogic.operations?.now) {
      extendedJsonLogic.operations.now = () => {
        return Date.now();
      };
    }

    if (!extendedJsonLogic.operations?.formatDate) {
      extendedJsonLogic.operations.formatDate = (
        timestamp: number,
        format: string = "iso"
      ) => {
        const date = new Date(timestamp);
        if (format === "iso") return date.toISOString();
        if (format === "locale") return date.toLocaleString();
        return date.toString();
      };
    }

    // 数学操作
    if (!extendedJsonLogic.operations?.round) {
      extendedJsonLogic.operations.round = (
        num: number,
        decimals: number = 0
      ) => {
        const factor = Math.pow(10, decimals);
        return Math.round(num * factor) / factor;
      };
    }

    if (!extendedJsonLogic.operations?.ceil) {
      extendedJsonLogic.operations.ceil = (num: number) => {
        return Math.ceil(num);
      };
    }

    if (!extendedJsonLogic.operations?.floor) {
      extendedJsonLogic.operations.floor = (num: number) => {
        return Math.floor(num);
      };
    }

    // 逻辑操作
    if (!extendedJsonLogic.operations?.if) {
      extendedJsonLogic.operations.if = (
        condition: any,
        then: any,
        otherwise: any
      ) => {
        return condition ? then : otherwise;
      };
    }

    if (!extendedJsonLogic.operations?.switch) {
      extendedJsonLogic.operations.switch = (
        value: any,
        cases: Record<string, any>,
        defaultCase?: any
      ) => {
        return cases[value] !== undefined ? cases[value] : defaultCase;
      };
    }

    return extendedJsonLogic;
  }

  public validate(expression: any): { valid: boolean; error?: string } {
    try {
      // 尝试用空数据执行，只检查语法
      this.evaluate(expression, {});
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  public compile(expression: any): (data: Record<string, any>) => any {
    try {
      const customJsonLogic = this.extendJsonLogic();
      return (data: Record<string, any>) => {
        const mergedData = {
          ...data,
          ...(this.stateGetter ? { states: this.stateGetter() } : {}),
          ...(this.derivedStateGetter
            ? { derived: this.derivedStateGetter() }
            : {}),
        };
        return customJsonLogic.apply(expression, mergedData);
      };
    } catch (error) {
      this.logger?.error("Failed to compile expression:", {
        expression,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  public getSupportedOperations(): string[] {
    const builtInOperations = Object.keys(jsonLogic.operations || {});
    const customOperations = Array.from(this.customOperations.keys());
    const extendedOperations = [
      "getState",
      "getDerived",
      "concat",
      "includes",
      "map",
      "filter",
      "reduce",
      "now",
      "formatDate",
      "round",
      "ceil",
      "floor",
      "if",
      "switch",
    ];

    return [...builtInOperations, ...customOperations, ...extendedOperations];
  }
}

// 默认导出单例
let defaultEvaluator: ExtendedJsonLogicEvaluator | null = null;

export function getDefaultEvaluator(
  options?: ExtendedJsonLogicOptions
): ExtendedJsonLogicEvaluator {
  if (!defaultEvaluator) {
    defaultEvaluator = new ExtendedJsonLogicEvaluator(options);
  }
  return defaultEvaluator;
}

// 便捷函数
export function evaluateExpression(
  expression: any,
  data?: Record<string, any>,
  options?: ExtendedJsonLogicOptions
): any {
  const evaluator = getDefaultEvaluator(options);
  return evaluator.evaluate(expression, data);
}

export function validateExpression(
  expression: any,
  options?: ExtendedJsonLogicOptions
): { valid: boolean; error?: string } {
  const evaluator = getDefaultEvaluator(options);
  return evaluator.validate(expression);
}

export function compileExpression(
  expression: any,
  options?: ExtendedJsonLogicOptions
): (data: Record<string, any>) => any {
  const evaluator = getDefaultEvaluator(options);
  return evaluator.compile(expression);
}
