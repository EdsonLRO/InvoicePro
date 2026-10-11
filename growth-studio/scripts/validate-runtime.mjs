import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { validateDiscoveryPayload } from "../src/discovery.js";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function git(...args) {
  const { stdout } = await execFileAsync("git", args, { cwd: root, windowsHide: true });
  return stdout.trim();
}

export async function validateProductionRefresh() {
  const trackedChanges = await git("status", "--porcelain", "--untracked-files=no");
  if (trackedChanges) throw new Error("Scheduled deployment requires a clean tracked checkout.");

  const [head, production] = await Promise.all([
    git("rev-parse", "HEAD"),
    git("rev-parse", "origin/main")
  ]);
  if (head !== production) throw new Error("Scheduled deployment must run from the exact origin/main commit.");

  const runtimePath = path.join(root, "runtime", "discovery.json");
  const payload = JSON.parse(await readFile(runtimePath, "utf8"));
  const validated = validateDiscoveryPayload(payload);
  if (validated.candidates.length === 0) throw new Error("Scheduled deployment requires at least one discovery candidate.");

  console.log(`Validated ${validated.candidates.length} discovery candidates from ${validated.generatedAt}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  validateProductionRefresh().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
