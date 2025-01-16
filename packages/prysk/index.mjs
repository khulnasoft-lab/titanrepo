import { execSync } from "child_process";
import path from "node:path";
import fs from "node:fs";

// TODO: make this customizable?
const DIRECTORY = process.cwd();

const VENV_NAME = ".cram_env";

// disable package manager update notifiers
process.env.NO_UPDATE_NOTIFIER = 1;

const isWindows = process.platform === "win32";

// Make virtualenv
execSync(`python3 -m venv ${VENV_NAME}`);

// Upgrade pip
execSync(`${getVenvBin("python3")} -m pip install --quiet --upgrade pip`);

// Install prysk
execSync(
  `${getVenvBin(
    "pip"
  )} install "pytest==8.3.3" "prysk[pytest-plugin]==0.15.2" "pytest-prysk==0.4.0" "pytest-xdist==3.6.1"`
);

execSync(`${getVenvBin("pip")} show pytest_prysk -f`, {
  stdio: "inherit",
  env: process.env,
});
patchPytestPrysk();

const flags = [
  isWindows
    ? "--prysk-shell=C:\\Program Files\\Git\\bin\\bash.EXE"
    : "--prysk-shell=bash",
  process.env.PRYSK_INTERACTIVE === "true" ? "--interactive" : "",
  isWindows ? "--prysk-dos2unix=true" : "",
].join(" ");

const cmd = [getVenvBin("pytest"), flags].join(" ");
console.log(`Running ${cmd}`);

try {
  execSync(cmd, { stdio: "inherit", env: process.env });
} catch (e) {
  // Swallow the node error stack trace. stdio: inherit should
  // already have the test failures printed. We don't need the Node.js
  // execution to also print its stack trace from execSync.
  process.exit(1);
}

function patchPytestPrysk() {
  // Only patches on windows
  if (false && !isWindows) {
    return;
  }

  const initPath = ["pytest_prysk", "__init__.py"];
  const sitePackages = path.join(
    DIRECTORY,
    VENV_NAME,
    "lib",
    isWindows ? "site-packages" : "python3.12/site-packages"
  );
  const pluginPath = path.join(sitePackages, ...initPath);
  console.log(`Patching pytest plugin: ${pluginPath}`);

  fs.copyFileSync(path.join(...initPath), pluginPath);
  fs.rmSync(path.join(sitePackages, "__pycache__"), {
    recursive: true,
    force: true,
  });
}

function getVenvBin(tool) {
  const allowedVenvTools = ["python3", "pip", "pytest"];
  if (!allowedVenvTools.includes(tool)) {
    throw new Error(`Tool not allowed: ${tool}`);
  }

  const suffix = isWindows ? ".exe" : "";

  const venvPath = path.join(DIRECTORY, VENV_NAME);
  const venvBin = isWindows
    ? path.join(venvPath, "Scripts")
    : path.join(venvPath, "bin");

  return path.join(venvBin, tool + suffix);
}
