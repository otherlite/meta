#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { generateCommand } from "./commands/generate";
import { serveCommand } from "./commands/serve";
import { initCommand } from "./commands/init";

yargs(hideBin(process.argv))
  .command(
    "init [dir]",
    "Initialize a new promptcc project",
    (yargs) => {
      return yargs.positional("dir", {
        describe: "Directory to initialize",
        default: ".",
      });
    },
    initCommand
  )
  .command(
    "generate <input>",
    "Generate DSL from Prompt.md",
    (yargs) => {
      return yargs
        .positional("input", {
          describe: "Path to Prompt.md file",
          type: "string",
          demandOption: true,
        })
        .option("output", {
          alias: "o",
          describe: "Output directory",
          default: "./",
        })
        .option("llm", {
          describe: "Use LLM for generation",
          type: "boolean",
          default: false,
        });
    },
    generateCommand
  )
  .command(
    "serve",
    "Start the local MCP server",
    (yargs) => {
      return yargs
        .option("port", {
          alias: "p",
          describe: "Port to run the server on",
          default: 3001,
        })
        .option("watch", {
          alias: "w",
          describe: "Watch for changes",
          type: "boolean",
          default: false,
        })
        .option("interactive", {
          alias: "i",
          describe: "Start in interactive mode",
          type: "boolean",
          default: false,
        });
    },
    serveCommand
  )
  .demandCommand(1, "You need to specify a command")
  .help()
  .parse();
