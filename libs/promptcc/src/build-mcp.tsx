// packages/engine/src/builtin-mcps.tsx
import React from "react";
import { MCP } from "@promptcc/core";

export const builtinMcps: Record<string, MCP> = {
  // Fetch MCP - 网络请求
  Fetch: {
    name: "Fetch",
    version: "1.0.0",
    operations: {
      async get(url: string, options?: RequestInit) {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      },

      async post(url: string, data: any, options?: RequestInit) {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
          body: JSON.stringify(data),
          ...options,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      },

      async put(url: string, data: any, options?: RequestInit) {
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
          body: JSON.stringify(data),
          ...options,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      },

      async delete(url: string, options?: RequestInit) {
        const response = await fetch(url, {
          method: "DELETE",
          ...options,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      },
    },
  },

  // Storage MCP - 本地存储
  Storage: {
    name: "Storage",
    version: "1.0.0",
    operations: {
      get(key: string) {
        try {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        } catch (error) {
          console.error("Storage get error:", error);
          return null;
        }
      },

      set(key: string, value: any) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (error) {
          console.error("Storage set error:", error);
          return false;
        }
      },

      remove(key: string) {
        try {
          localStorage.removeItem(key);
          return true;
        } catch (error) {
          console.error("Storage remove error:", error);
          return false;
        }
      },

      clear() {
        try {
          localStorage.clear();
          return true;
        } catch (error) {
          console.error("Storage clear error:", error);
          return false;
        }
      },
    },
  },

  // Router MCP - 路由控制
  Router: {
    name: "Router",
    version: "1.0.0",
    operations: {
      navigate(path: string) {
        if (typeof window !== "undefined") {
          window.history.pushState({}, "", path);
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      },

      replace(path: string) {
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", path);
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      },

      go(delta: number) {
        if (typeof window !== "undefined") {
          window.history.go(delta);
        }
      },

      back() {
        if (typeof window !== "undefined") {
          window.history.back();
        }
      },

      forward() {
        if (typeof window !== "undefined") {
          window.history.forward();
        }
      },
    },
  },

  // UI 组件 MCPs
  Card: {
    name: "Card",
    version: "1.0.0",
    Component: ({ children, ...props }: any) =>
      React.createElement(
        "div",
        {
          style: {
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            ...props.style,
          },
          ...props,
        },
        children
      ),
  },

  Header: {
    name: "Header",
    version: "1.0.0",
    Component: ({ children, ...props }: any) =>
      React.createElement(
        "header",
        {
          style: {
            padding: "16px",
            backgroundColor: "#f5f5f5",
            borderBottom: "1px solid #ddd",
            ...props.style,
          },
          ...props,
        },
        children
      ),
  },

  Footer: {
    name: "Footer",
    version: "1.0.0",
    Component: ({ children, ...props }: any) =>
      React.createElement(
        "footer",
        {
          style: {
            padding: "16px",
            backgroundColor: "#f5f5f5",
            borderTop: "1px solid #ddd",
            ...props.style,
          },
          ...props,
        },
        children
      ),
  },

  // 表单组件
  Select: {
    name: "Select",
    version: "1.0.0",
    Component: ({ options = [], value, onChange, ...props }: any) => {
      const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange?.({ value: e.target.value });
      };

      return React.createElement(
        "select",
        {
          value: value || "",
          onChange: handleChange,
          style: {
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            ...props.style,
          },
          ...props,
        },
        options.map((option: any) =>
          React.createElement(
            "option",
            { key: option.value, value: option.value },
            option.label
          )
        )
      );
    },
  },

  Checkbox: {
    name: "Checkbox",
    version: "1.0.0",
    Component: ({ checked, onChange, label, ...props }: any) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.({ checked: e.target.checked });
      };

      return React.createElement(
        "label",
        { style: { display: "flex", alignItems: "center", gap: "8px" } },
        React.createElement("input", {
          type: "checkbox",
          checked: !!checked,
          onChange: handleChange,
          ...props,
        }),
        label && React.createElement("span", null, label)
      );
    },
  },

  Radio: {
    name: "Radio",
    version: "1.0.0",
    Component: ({ checked, onChange, label, ...props }: any) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.({ checked: e.target.checked });
      };

      return React.createElement(
        "label",
        { style: { display: "flex", alignItems: "center", gap: "8px" } },
        React.createElement("input", {
          type: "radio",
          checked: !!checked,
          onChange: handleChange,
          ...props,
        }),
        label && React.createElement("span", null, label)
      );
    },
  },
};
