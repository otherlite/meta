const lastCommitId =
  process.env.GITHUB_PULL_REQUEST_BASE_SHA ||
  process.env.GITHUB_EVENT_BEFORE ||
  "refs/remotes/origin/main";
const { exec, echo, exit } = require("shelljs");
const { code, stdout, stderr } = exec(
  `pnpm list --filter=...[${lastCommitId}] --json`
);

if (code !== 0) {
  echo("Error: pnpm list failed");
  echo("Program stderr:", stderr);
  exit(1);
}

exec(
  `echo "packages=${JSON.stringify(
    JSON.parse(stdout)
      .map((item) => item.name)
      .filter((item) => item)
  ).replace(/\"/g, '\\"')}" >> $GITHUB_OUTPUT`
);
