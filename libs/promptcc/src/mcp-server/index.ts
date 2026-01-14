import path from "path";
import { promises as fs } from "fs";
import {
  MCPServerConfig,
  MCPRequest,
  MCPResponse,
  MCPContext,
  LocalMCP,
  Logger,
  MCPDefinition,
} from "./types";
import { registerLocalMCPs } from "./local-mcps";
import { loadMCP, discoverProjectMCPs } from "./mcp-loader";

export class LocalMCPServer {
  private config: MCPServerConfig;
  private localMCPs: Map<string, LocalMCP> = new Map();
  private projectMCPs: Map<string, LocalMCP> = new Map();
  private context: MCPContext;
  private logger: Logger;

  constructor(config: MCPServerConfig = {}) {
    this.config = {
      projectRoot: process.cwd(),
      autoLoadMCPs: true,
      ...config,
    };

    this.logger = this.config.logger || this.createDefaultLogger();
    this.context = {
      projectRoot: this.config.projectRoot!,
      logger: this.logger,
      state: {},
    };
  }

  private createDefaultLogger(): Logger {
    return {
      info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
      warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
      error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
      debug: (message, ...args) => console.debug(`[DEBUG] ${message}`, ...args),
    };
  }

  public async initialize(): Promise<void> {
    this.logger.info("Initializing Local MCP Server...");
    this.logger.info(`Project root: ${this.context.projectRoot}`);

    // Register built-in MCPs
    this.registerBuiltinMCPs();
    this.logger.info(`Registered ${this.localMCPs.size} built-in MCPs`);

    // Auto-discover project MCPs if enabled
    if (this.config.autoLoadMCPs) {
      await this.discoverAndLoadProjectMCPs();
    }

    this.logger.info("Local MCP Server initialized successfully");
  }

  private registerBuiltinMCPs(): void {
    const builtinMCPs = registerLocalMCPs();
    builtinMCPs.forEach((mcp) => {
      this.localMCPs.set(mcp.definition.id, mcp);
      this.logger.debug(`Registered built-in MCP: ${mcp.definition.name}`);
    });
  }

  private async discoverAndLoadProjectMCPs(): Promise<void> {
    try {
      const mcps = await discoverProjectMCPs(this.context.projectRoot);
      mcps.forEach((mcp) => {
        this.projectMCPs.set(mcp.definition.id, mcp);
        this.logger.debug(`Loaded project MCP: ${mcp.definition.name}`);
      });
      this.logger.info(`Loaded ${this.projectMCPs.size} project MCPs`);
    } catch (error) {
      this.logger.warn(
        `Failed to discover project MCPs: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  public async execute(request: MCPRequest): Promise<MCPResponse> {
    const startTime = Date.now();
    const requestId =
      request.id ||
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      this.logger.debug(`Executing MCP request: ${requestId}`, {
        mcp: request.mcp,
        operation: request.operation,
        parameters: request.parameters,
      });

      // Find the MCP handler
      const mcp = await this.findMCP(request.mcp);
      if (!mcp) {
        return {
          id: requestId,
          success: false,
          error: `MCP not found: ${request.mcp}`,
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          },
        };
      }

      // Check if operation exists
      if (!mcp.definition.operations[request.operation]) {
        return {
          id: requestId,
          success: false,
          error: `Operation not found: ${
            request.operation
          }. Available operations: ${Object.keys(
            mcp.definition.operations
          ).join(", ")}`,
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          },
        };
      }

      // Validate parameters if MCP has validation
      if (mcp.validate) {
        const validation = mcp.validate(request);
        if (!validation.valid) {
          return {
            id: requestId,
            success: false,
            error: `Invalid parameters: ${validation.errors?.join(", ")}`,
            metadata: {
              executionTime: Date.now() - startTime,
              timestamp: new Date().toISOString(),
            },
          };
        }
      }

      // Execute the operation
      const result = await mcp.execute(
        request.operation,
        request.parameters,
        this.context
      );

      const endTime = Date.now();
      this.logger.debug(`MCP request completed: ${requestId}`, {
        success: true,
        executionTime: endTime - startTime,
      });

      return {
        id: requestId,
        success: true,
        data: result,
        metadata: {
          executionTime: endTime - startTime,
          timestamp: new Date().toISOString(),
          mcp: request.mcp,
          operation: request.operation,
        },
      };
    } catch (error) {
      const endTime = Date.now();
      this.logger.error(`MCP request failed: ${requestId}`, error);

      return {
        id: requestId,
        success: false,
        error: `Execution failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        metadata: {
          executionTime: endTime - startTime,
          timestamp: new Date().toISOString(),
          mcp: request.mcp,
          operation: request.operation,
        },
      };
    }
  }

  public async batchExecute(requests: MCPRequest[]): Promise<MCPResponse[]> {
    const results = await Promise.all(
      requests.map((request) => this.execute(request))
    );
    return results;
  }

  private async findMCP(mcpId: string): Promise<LocalMCP | null> {
    // Check built-in MCPs first
    const builtin = this.localMCPs.get(mcpId);
    if (builtin) return builtin;

    // Check already loaded project MCPs
    const project = this.projectMCPs.get(mcpId);
    if (project) return project;

    // Try to dynamically load from project
    try {
      const loaded = await loadMCP(mcpId, this.context.projectRoot);
      if (loaded) {
        this.projectMCPs.set(mcpId, loaded);
        this.logger.debug(`Dynamically loaded MCP: ${mcpId}`);
        return loaded;
      }
    } catch (error) {
      this.logger.warn(`Failed to dynamically load MCP ${mcpId}:`, error);
    }

    return null;
  }

  public async listMCPs(): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      operations: string[];
      type: "builtin" | "project";
      version: string;
    }>
  > {
    const builtinList = Array.from(this.localMCPs.values()).map((mcp) => ({
      id: mcp.definition.id,
      name: mcp.definition.name,
      description: mcp.definition.description,
      operations: Object.keys(mcp.definition.operations),
      type: "builtin" as const,
      version: mcp.definition.version,
    }));

    const projectList = Array.from(this.projectMCPs.values()).map((mcp) => ({
      id: mcp.definition.id,
      name: mcp.definition.name,
      description: mcp.definition.description,
      operations: Object.keys(mcp.definition.operations),
      type: "project" as const,
      version: mcp.definition.version,
    }));

    return [...builtinList, ...projectList];
  }

  public getMCPDefinition(mcpId: string): MCPDefinition | null {
    const mcp = this.localMCPs.get(mcpId) || this.projectMCPs.get(mcpId);
    return mcp ? mcp.definition : null;
  }

  public registerMCP(mcp: LocalMCP): void {
    this.localMCPs.set(mcp.definition.id, mcp);
    this.logger.info(`Registered custom MCP: ${mcp.definition.name}`);
  }

  public setContext(newContext: Partial<MCPContext>): void {
    this.context = { ...this.context, ...newContext };
  }

  public getContext(): MCPContext {
    return { ...this.context };
  }
}

// Convenience function to create and initialize server
export async function createLocalMCPServer(
  config?: MCPServerConfig
): Promise<LocalMCPServer> {
  const server = new LocalMCPServer(config);
  await server.initialize();
  return server;
}
