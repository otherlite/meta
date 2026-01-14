export interface MCPOperation {
  name: string;
  description: string;
  parameters: Record<
    string,
    {
      type: string;
      description?: string;
      required?: boolean;
      default?: any;
    }
  >;
}

export interface MCPDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  operations: Record<string, MCPOperation>;
}

export interface MCPRequest {
  id?: string;
  mcp: string;
  operation: string;
  parameters: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface MCPResponse {
  id?: string;
  success: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
  metadata?: Record<string, any>;
}

export interface MCPContext {
  projectRoot: string;
  filePath?: string;
  aiClient?: any;
  state?: Record<string, any>;
  logger?: Logger;
}

export interface LocalMCP {
  definition: MCPDefinition;
  execute: (
    operation: string,
    parameters: Record<string, any>,
    context: MCPContext
  ) => Promise<any>;
  validate?: (request: MCPRequest) => { valid: boolean; errors?: string[] };
}

export interface Logger {
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

export interface MCPServerConfig {
  projectRoot?: string;
  logger?: Logger;
  autoLoadMCPs?: boolean;
}
