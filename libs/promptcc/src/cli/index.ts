#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { generateCommand } from "./commands/generate";
import { serveCommand } from "./commands/serve";

yargs(hideBin(process.argv))
  .command(generateCommand)
  .command(serveCommand)
  .demandCommand(1, "You need to specify a command")
  .help()
  .parse();
