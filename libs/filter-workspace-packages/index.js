const { exec, echo, exit } = require("shelljs");

console.log(process.env.GITHUB_PULL_REQUEST_BASE_SHA);
console.log(process.env.GITHUB_EVENT_BEFORE);

const lastCommitId =
  process.env.GITHUB_PULL_REQUEST_BASE_SHA ||
  process.env.GITHUB_EVENT_BEFORE ||
  "refs/remotes/origin/main";

const execCommand = `pnpm list --filter=...[${lastCommitId}] --json`;
console.log(execCommand);
const { code, stdout, stderr } = exec(execCommand);

if (code !== 0) {
  echo("Error: pnpm list failed");
  echo("Program stderr:", stderr);
  exit(1);
}

const execCommand2 = `echo "packages=${JSON.stringify(
  JSON.parse(stdout)
    .map((item) => item.name)
    .filter((item) => item)
).replace(/\"/g, '\\"')}" >> $GITHUB_OUTPUT`;
console.log(execCommand2);
exec(execCommand2);
