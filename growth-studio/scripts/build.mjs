import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateDiscoveryPayload } from "../src/discovery.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repository = path.resolve(root, "..");
const source = path.join(root, "src");
const destination = path.join(root, "dist");
const runtimeDiscovery = path.join(root, "runtime", "discovery.json");
const linkedInAssets = [
  "01-free-invoice-maker.png",
  "02-dashboard-clarity.png",
  "03-create-invoices.png",
  "05-recurring-invoices.png",
  "30-overdue-with-context.png",
  "32-after-the-invoice-is-sent.png"
];

await rm(destination, { recursive: true, force: true });
await mkdir(path.join(destination, "assets", "linkedin"), { recursive: true });

for (const file of ["index.html", "styles.css", "app.js", "data.js", "discovery.js"]) {
  await cp(path.join(source, file), path.join(destination, file));
}

let discoverySource = path.join(source, "discovery.json");
try {
  await readFile(runtimeDiscovery, "utf8");
  discoverySource = runtimeDiscovery;
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
const discoveryPayload = JSON.parse(await readFile(discoverySource, "utf8"));
const validatedDiscovery = validateDiscoveryPayload(discoveryPayload);
await writeFile(path.join(destination, "discovery.json"), `${JSON.stringify(validatedDiscovery, null, 2)}\n`);

for (const file of ["tallyo-wordmark-white.png", "tallyo-mark.png"]) {
  await cp(path.join(repository, "website", "public", "assets", file), path.join(destination, "assets", file));
}

for (const file of linkedInAssets) {
  await cp(path.join(repository, "website", "public", "assets", "social", "linkedin", file), path.join(destination, "assets", "linkedin", file));
}

const html = await readFile(path.join(destination, "index.html"), "utf8");
if (!html.includes("Tallyo Growth Studio")) throw new Error("Built document title is missing.");

await writeFile(path.join(destination, "build-manifest.json"), `${JSON.stringify({ product: "Tallyo Growth Studio", mode: "draft-only", channels: ["linkedin"], generatedAt: new Date().toISOString() }, null, 2)}\n`);
await writeFile(path.join(destination, "_headers"), `/discovery.json
  Access-Control-Allow-Origin: https://app.tallyo.co.uk
  Access-Control-Allow-Credentials: true
  Cache-Control: private, no-store
  Vary: Origin
`);
await writeFile(path.join(destination, ".assetsignore"), "build-manifest.json\n.assetsignore\n");
console.log(`Built Growth Studio at ${destination}`);
