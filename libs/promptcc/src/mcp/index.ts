import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import PromptToDSLWorkflow from "./PromptToDSLWorkflow";
import DSLValidate from "./DSLValidate";
import DSLCodeGen from "./DSLCodeGen";

/** 启动服务 */
const server = new McpServer({
  name: "promptcc",
  version: "0.1.0",
});

server.registerTool(
  PromptToDSLWorkflow.name,
  PromptToDSLWorkflow.config,
  PromptToDSLWorkflow.handler,
);

server.registerTool(DSLValidate.name, DSLValidate.config, DSLValidate.handler);

server.registerTool(DSLCodeGen.name, DSLCodeGen.config, DSLCodeGen.handler);

/** Stdio 连接 */
(async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Prompt MCP server running on stdio");
})().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
