import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import PromptToDSLWorkflow from "./PromptToDSLWorkflow";

const server = new McpServer({
  name: "promptcc",
  version: "0.1.0",
});

server.registerTool(
  PromptToDSLWorkflow.name,
  PromptToDSLWorkflow.config,
  PromptToDSLWorkflow.handler,
);

(async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Prompt MCP server running on stdio");
})().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
