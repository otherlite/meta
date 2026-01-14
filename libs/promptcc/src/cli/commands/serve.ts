import { createLocalMCPServer } from "../../mcp-server";
import ora from "ora";
import chalk from "chalk";

export async function serveCommand(argv: any) {
  const spinner = ora("Initializing Local MCP Server...").start();

  try {
    const server = await createLocalMCPServer({
      projectRoot: process.cwd(),
      logger: {
        info: (msg) => spinner.info(chalk.blue(msg)),
        warn: (msg) => spinner.warn(chalk.yellow(msg)),
        error: (msg) => spinner.fail(chalk.red(msg)),
        debug: (msg) => spinner.info(chalk.gray(`[DEBUG] ${msg}`)),
      },
    });

    spinner.succeed(chalk.green("Local MCP Server initialized!"));

    // List available MCPs
    const mcps = await server.listMCPs();
    console.log("\n" + chalk.bold("Available MCPs:"));
    mcps.forEach((mcp) => {
      console.log(`  ${chalk.cyan(mcp.name)} (${chalk.gray(mcp.type)})`);
      console.log(`    ${chalk.gray(mcp.description)}`);
      console.log(`    Operations: ${mcp.operations.join(", ")}`);
      console.log("");
    });

    console.log(chalk.green("✅ MCP Server is ready!"));
    console.log(
      chalk.gray("Use the server.execute() method to run MCP operations.")
    );

    if (argv.interactive) {
      await startInteractiveMode(server);
    } else {
      // Keep the process alive
      console.log(chalk.gray("\nPress Ctrl+C to exit."));
      await new Promise(() => {});
    }

    // Return the server instance for programmatic use
    return server;
  } catch (error) {
    spinner.fail(
      `Failed to initialize MCP Server: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    process.exit(1);
  }
}

async function startInteractiveMode(server: any) {
  console.log("\n" + chalk.yellow("Interactive mode:"));
  console.log(chalk.gray('Type "help" for commands, "exit" to quit.'));

  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  while (true) {
    const input = await question("\nmcp> ");

    if (input === "exit" || input === "quit") {
      break;
    }

    if (input === "help") {
      console.log(chalk.bold("Commands:"));
      console.log("  list - List all available MCPs");
      console.log("  info <mcp> - Show details about an MCP");
      console.log(
        "  run <mcp> <operation> <json_params> - Run an MCP operation"
      );
      console.log("  exit - Exit interactive mode");
      continue;
    }

    if (input === "list") {
      const mcps = await server.listMCPs();
      mcps.forEach((mcp: any) => {
        console.log(`${chalk.cyan(mcp.name)} (${mcp.id}) - ${mcp.description}`);
      });
      continue;
    }

    if (input.startsWith("info ")) {
      const mcpId = input.substring(5).trim();
      const definition = server.getMCPDefinition(mcpId);
      if (definition) {
        console.log(JSON.stringify(definition, null, 2));
      } else {
        console.log(chalk.red(`MCP not found: ${mcpId}`));
      }
      continue;
    }

    if (input.startsWith("run ")) {
      const parts = input.substring(4).trim().split(" ");
      if (parts.length < 2) {
        console.log(chalk.red("Usage: run <mcp> <operation> <json_params>"));
        continue;
      }

      const mcp = parts[0];
      const operation = parts[1];
      let params = {};

      if (parts.length > 2) {
        try {
          params = JSON.parse(parts.slice(2).join(" "));
        } catch {
          console.log(chalk.red("Invalid JSON parameters"));
          continue;
        }
      }

      try {
        const result = await server.execute({
          mcp,
          operation,
          parameters: params,
        });

        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.log(
          chalk.red(
            `Error: ${error instanceof Error ? error.message : String(error)}`
          )
        );
      }
      continue;
    }

    console.log(chalk.red('Unknown command. Type "help" for commands.'));
  }

  rl.close();
  console.log(chalk.gray("Goodbye!"));
}
