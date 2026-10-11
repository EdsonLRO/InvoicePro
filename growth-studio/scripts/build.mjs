import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repository = path.resolve(root, "..");
const source = path.join(root, "src");
const destination = path.join(root, "dist");
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

for (const file of ["index.html", "styles.css", "app.js", "data.js", "discovery.js", "discovery.json"]) {
  await cp(path.join(source, file), path.join(destination, file));
}

for (const file of ["tallyo-wordmark-white.png", "tallyo-mark.png"]) {
  await cp(path.join(repository, "website", "public", "assets", file), path.join(destination, "assets", file));
}

for (const file of linkedInAssets) {
  await cp(path.join(repository, "website", "public", "assets", "social", "linkedin", file), path.join(destination, "assets", "linkedin", file));
}

const html = await readFile(path.join(destination, "index.html"), "utf8");
if (!html.includes("Tallyo Growth Studio")) throw new Error("Built document title is missing.");

await writeFile(path.join(destination, "build-manifest.json"), `${JSON.stringify({ product: "Tallyo Growth Studio", mode: "draft-only", channels: ["linkedin"], generatedAt: new Date().toISOString() }, null, 2)}\n`);
console.log(`Built Growth Studio at ${destination}`);
