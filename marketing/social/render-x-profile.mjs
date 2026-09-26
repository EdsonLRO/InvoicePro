import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "../..");
const officialMark = resolve(
  repositoryRoot,
  "website/public/assets/tallyo-mark.png",
);
const outputPath = resolve(scriptDirectory, "tallyo-x-profile-800.png");

const size = 800;

// Trim only the transparent padding and keep the original brand artwork
// untouched. The mark is clearer than the full wordmark at profile-photo size.
const officialSymbol = await sharp(officialMark)
  .trim()
  .resize({ width: 260 })
  .png()
  .toBuffer();

const background = Buffer.from(`
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="base" x1="70" y1="40" x2="735" y2="770" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#13264c"/>
        <stop offset="0.52" stop-color="#171f4c"/>
        <stop offset="1" stop-color="#5145f5"/>
      </linearGradient>
      <radialGradient id="cyanGlow" cx="0" cy="0" r="1" gradientTransform="translate(175 135) rotate(42) scale(420)" gradientUnits="userSpaceOnUse">
        <stop stop-color="#58d8e8" stop-opacity="0.36"/>
        <stop offset="1" stop-color="#58d8e8" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="violetGlow" cx="0" cy="0" r="1" gradientTransform="translate(650 665) rotate(-135) scale(430)" gradientUnits="userSpaceOnUse">
        <stop stop-color="#7c73ff" stop-opacity="0.58"/>
        <stop offset="1" stop-color="#7c73ff" stop-opacity="0"/>
      </radialGradient>
      <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#060b18" flood-opacity="0.36"/>
      </filter>
    </defs>
    <rect width="800" height="800" fill="url(#base)"/>
    <rect width="800" height="800" fill="url(#cyanGlow)"/>
    <rect width="800" height="800" fill="url(#violetGlow)"/>
    <circle cx="400" cy="400" r="224" fill="#ffffff" fill-opacity="0.085" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2" filter="url(#shadow)"/>
    <circle cx="400" cy="400" r="196" fill="#ffffff" fill-opacity="0.045"/>
  </svg>
`);

await mkdir(scriptDirectory, { recursive: true });
await sharp(background)
  .composite([
    {
      input: officialSymbol,
      gravity: "centre",
    },
  ])
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(outputPath);

console.log(outputPath);
