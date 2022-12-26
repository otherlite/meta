const { exec, echo, exit, ShellString } = require("shelljs");
const { code, stdout, stderr } = exec(
  "pnpm list --filter=...[refs/remotes/origin/main] --json",
  {
    silent: true,
  }
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
