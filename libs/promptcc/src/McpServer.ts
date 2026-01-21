import { Server } from "@modelcontextprotocol/sdk/server/index";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types";
import { PromptToDSLWorkflow } from "./mcp/PromptToDSLWorkflow";
import { DSLValidator } from "./mcp/DSLValidate";
import { DSLCodeGenerator } from "./mcp/DSLCodeGen";

export class PromptCCMCPServer {
  private server: Server;
  private workflow: PromptToDSLWorkflow;

  constructor() {
    this.server = new Server(
      {
        name: "promptcc",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.workflow = new PromptToDSLWorkflow();

    this.setupHandlers();
  }

  private setupHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "prompt_to_dsl",
            description: "Convert Prompt.md to DSL JSON",
            inputSchema: {
              type: "object",
              properties: {
                prompt: {
                  type: "string",
                  description: "Prompt.md content",
                },
                validate: {
                  type: "boolean",
                  description: "Whether to validate the DSL",
                },
                generateCode: {
                  type: "boolean",
                  description: "Whether to generate code",
                },
              },
              required: ["prompt"],
            },
          },
          {
            name: "validate_dsl",
            description: "Validate DSL JSON",
            inputSchema: {
              type: "object",
              properties: {
                dsl: {
                  type: "object",
                  description: "DSL JSON to validate",
                },
              },
              required: ["dsl"],
            },
          },
          {
            name: "generate_code",
            description: "Generate code from DSL",
            inputSchema: {
              type: "object",
              properties: {
                dsl: {
                  type: "object",
                  description: "DSL JSON",
                },
                outputDir: {
                  type: "string",
                  description: "Output directory",
                },
              },
              required: ["dsl"],
            },
          },
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case "prompt_to_dsl": {
            const args = request.params.arguments as {
              prompt: string;
              validate?: boolean;
              generateCode?: boolean;
            };

            const result = await this.workflow.process(args.prompt, {
              validate: args.validate ?? true,
              generateCode: args.generateCode ?? true,
            });

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case "validate_dsl": {
            const args = request.params.arguments as { dsl: any };
            const validator = new DSLValidator();
            const validation = validator.validateDSL(args.dsl);

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(validation, null, 2),
                },
              ],
            };
          }

          case "generate_code": {
            const args = request.params.arguments as {
              dsl: any;
              outputDir?: string;
            };
            const codegen = new DSLCodeGenerator();
            const code = await codegen.generateFiles(
              args.dsl,
              args.outputDir || "./",
            );

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(code, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("PromptCC MCP server running on stdio");
  }
}

const server = new PromptCCMCPServer();
server.run().catch(console.error);
