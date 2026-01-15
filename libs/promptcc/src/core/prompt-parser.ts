import { ParsedPrompt } from "types/prompt";

export function parsePrompt(content: string): ParsedPrompt {
  const lines = content.split("\n");
  const sections: ParsedPrompt["sections"] = {};
  let currentSection: keyof typeof sections | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    // 检查是否为标题行
    if (line.match(/^#+\s+(.+)/)) {
      // 保存上一个章节的内容
      if (currentSection && currentContent.length > 0) {
        sections[currentSection] = currentContent.join("\n").trim();
        currentContent = [];
      }

      const title = line.replace(/^#+\s+/, "").toLowerCase();
      currentSection = mapSectionTitle(title);
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // 保存最后一个章节
  if (currentSection && currentContent.length > 0) {
    sections[currentSection] = currentContent.join("\n").trim();
  }

  return {
    sections,
    rawText: content,
  };
}

function mapSectionTitle(title: string): keyof ParsedPrompt["sections"] | null {
  const mapping: Record<string, keyof ParsedPrompt["sections"]> = {
    状态: "states",
    state: "states",
    派生状态: "derivedStates",
    "derived state": "derivedStates",
    事件: "events",
    event: "events",
    效果: "effects",
    effect: "effects",
    界面: "view",
    view: "view",
    配置: "config",
    configuration: "config",
  };

  return mapping[title] || null;
}

export function promptToDSL(content: string): any {
  const parsed = parsePrompt(content);
  const dsl: any = {
    metadata: {
      name: "auto-generated",
      version: "1.0.0",
      createdAt: new Date().toISOString(),
    },
    states: [],
    events: [],
    effects: [],
    view: {
      root: "",
      components: {},
    },
  };

  // 解析状态
  if (parsed.sections.states) {
    dsl.states = parseStates(parsed.sections.states);
  }

  // 解析派生状态
  if (parsed.sections.derivedStates) {
    dsl.derivedStates = parseDerivedStates(parsed.sections.derivedStates);
  }

  // 解析事件
  if (parsed.sections.events) {
    dsl.events = parseEvents(parsed.sections.events);
  }

  // 解析效果
  if (parsed.sections.effects) {
    dsl.effects = parseEffects(parsed.sections.effects);
  }

  // 解析界面
  if (parsed.sections.view) {
    const viewResult = parseView(parsed.sections.view);
    dsl.view = viewResult.view;

    // 从界面中提取未定义的事件
    const extractedEvents = extractEventsFromView(viewResult.view);
    dsl.events = [...dsl.events, ...extractedEvents];
  }

  return dsl;
}

function parseStates(content: string): any[] {
  const states: any[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("-")) {
      continue;
    }

    // 匹配模式：状态名: 默认值
    const match = trimmed.match(/^-\s*([^:]+):\s*(.+)/);
    if (match) {
      const [, name, defaultValue] = match;
      const stateName = name.trim();
      let value = defaultValue.trim();

      // 尝试解析默认值
      try {
        value = JSON.parse(value);
      } catch {
        // 保持为字符串
      }

      states.push({
        id: stateName,
        defaultValue: value,
        description: "",
      });
    }
  }

  return states;
}

function parseDerivedStates(content: string): any[] {
  const derivedStates: any[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("-")) {
      continue;
    }

    // 匹配模式：派生状态名 = 表达式
    const match = trimmed.match(/^-\s*([^=]+)=(.+)/);
    if (match) {
      const [, name, expression] = match;
      const derivedStateName = name.trim();
      const logicExpression = expression.trim();

      // 提取依赖的状态
      const dependencies = extractDependencies(logicExpression);

      // 构建 JsonLogic 表达式
      const logic = buildJsonLogic(logicExpression);

      derivedStates.push({
        id: derivedStateName,
        logic,
        dependencies,
        description: "",
      });
    }
  }

  return derivedStates;
}

function parseEvents(content: string): any[] {
  const events: any[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("-")) {
      continue;
    }

    // 匹配模式：事件名: 描述
    const match = trimmed.match(/^-\s*([^:]+):\s*(.+)/);
    if (match) {
      const [, name, description] = match;
      events.push({
        id: name.trim(),
        description: description.trim(),
      });
    }
  }

  return events;
}

function parseEffects(content: string): any[] {
  const effects: any[] = [];
  const lines = content.split("\n");
  let currentEffect: any = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (currentEffect) {
        effects.push(currentEffect);
        currentEffect = null;
      }
      continue;
    }

    if (trimmed.startsWith("- ")) {
      // 新效果
      if (currentEffect) {
        effects.push(currentEffect);
      }

      const effectName = trimmed.replace(/^-\s*/, "").replace(/:/, "");
      currentEffect = {
        id: effectName,
        type: "async", // 默认类型
        action: {
          mcp: "",
          operation: "",
          parameters: {},
        },
      };
    } else if (currentEffect && trimmed.includes(":")) {
      // 效果属性
      const [key, value] = trimmed.split(":").map((s) => s.trim());

      switch (key) {
        case "类型":
        case "type":
          currentEffect.type = value;
          break;
        case "延迟":
        case "delay":
        case "debounce":
          currentEffect.debounceMs = parseInt(value);
          break;
        case "触发":
        case "trigger":
          currentEffect.triggers = value.split(",").map((s) => s.trim());
          break;
        case "操作":
        case "action":
          // 解析 MCP 调用
          const actionMatch = value.match(/调用\s+(\w+)(?:\.(\w+))?/);
          if (actionMatch) {
            currentEffect.action.mcp = actionMatch[1];
            currentEffect.action.operation = actionMatch[2] || "execute";
          }
          break;
        case "参数":
        case "parameters":
          try {
            currentEffect.action.parameters = JSON.parse(value);
          } catch {
            // 简单键值对解析
            const params: Record<string, any> = {};
            value.split(",").forEach((param) => {
              const [k, v] = param.split(":").map((s) => s.trim());
              if (k && v) {
                params[k] = v;
              }
            });
            currentEffect.action.parameters = params;
          }
          break;
        case "成功时":
        case "on success":
          currentEffect.onSuccess = [value];
          break;
        case "失败时":
        case "on failure":
          currentEffect.onFailure = [value];
          break;
      }
    }
  }

  if (currentEffect) {
    effects.push(currentEffect);
  }

  return effects;
}

function parseView(content: string): { view: any; events: any[] } {
  const view: any = {
    root: "",
    components: {},
  };

  const events: any[] = [];
  const lines = content.split("\n");
  let currentComponent: any = null;
  let indentLevel = 0;
  const componentStack: any[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    // 检查缩进级别
    const leadingSpaces = line.match(/^(\s*)/)?.[1].length || 0;
    const currentIndentLevel = Math.floor(leadingSpaces / 2); // 假设每级缩进2空格

    // 弹出栈直到匹配当前缩进
    while (componentStack.length > currentIndentLevel) {
      componentStack.pop();
    }

    // 匹配组件行：- 组件名 (MCP类型):
    const componentMatch = trimmed.match(/^-\s*([^(]+)\s*\((\w+)\):/);
    if (componentMatch) {
      const [, name, type] = componentMatch;
      const componentId = name.trim();

      currentComponent = {
        id: componentId,
        type: type.trim(),
        properties: {},
        events: {},
      };

      view.components[componentId] = currentComponent;

      // 设置父组件关系
      if (componentStack.length > 0) {
        const parent = componentStack[componentStack.length - 1];
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(componentId);
      } else {
        // 第一个组件作为根
        if (!view.root) {
          view.root = componentId;
        }
      }

      componentStack.push(currentComponent);
      continue;
    }

    // 匹配属性行：属性名: 值
    if (currentComponent && trimmed.includes(":")) {
      const [key, value] = trimmed.split(":").map((s) => s.trim());

      if (key === "事件" || key === "event") {
        // 解析事件绑定：{ eventName: 事件id }
        try {
          const eventObj = JSON.parse(value);
          currentComponent.events = eventObj;
        } catch {
          // 简单格式：事件名: 事件id
          const eventMatch = value.match(/(\w+):\s*([\w-]+)/);
          if (eventMatch) {
            const [, eventName, eventId] = eventMatch;
            currentComponent.events = { [eventName]: eventId };
          }
        }
      } else if (key === "属性" || key === "property") {
        // 解析属性对象
        try {
          const props = JSON.parse(value);
          currentComponent.properties = {
            ...currentComponent.properties,
            ...props,
          };
        } catch {
          // 忽略解析错误
        }
      } else if (key === "禁用" || key === "disabled") {
        // 条件属性
        currentComponent.properties.disabled = value;
      } else {
        // 直接作为属性
        currentComponent.properties[key] = value;
      }
    }
  }

  return { view, events };
}

function extractEventsFromView(view: any): any[] {
  const events: any[] = [];
  const eventIds = new Set<string>();

  Object.values(view.components).forEach((component: any) => {
    if (component.events) {
      Object.values(component.events).forEach((eventId: any) => {
        if (!eventIds.has(eventId)) {
          eventIds.add(eventId);
          events.push({
            id: eventId,
            description: `Auto-generated from component ${component.id}`,
          });
        }
      });
    }
  });

  return events;
}

function extractDependencies(expression: string): string[] {
  const dependencies: string[] = [];
  const tokens = expression.split(/\s+/);

  // 简单的依赖提取：假设状态名不包含特殊字符
  tokens.forEach((token) => {
    if (
      token.match(/^[\u4e00-\u9fa5\w-]+$/) &&
      !["且", "和", "或", "not", "and", "or", "不为", "为"].includes(token)
    ) {
      dependencies.push(token);
    }
  });

  return [...new Set(dependencies)];
}

function buildJsonLogic(expression: string): any {
  // 简单的表达式转换
  if (expression.includes("不为空")) {
    const state = expression.replace("不为空", "").trim();
    return { "!": { var: state } };
  }

  if (expression.includes("且")) {
    const parts = expression.split("且").map((p) => p.trim());
    return { and: parts.map(buildJsonLogic) };
  }

  if (expression.includes("为")) {
    const [state, value] = expression.split("为").map((p) => p.trim());
    return {
      "==": [
        { var: state },
        value === "true" ? true : value === "false" ? false : value,
      ],
    };
  }

  // 默认：返回状态值
  return { var: expression.trim() };
}
