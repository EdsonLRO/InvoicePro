const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function pngInfo(file) {
  const bytes = fs.readFileSync(path.join(root, file));
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${file} must be a PNG`);
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25]
  };
}

for (const file of ['tallyo-mark.png', 'website/public/assets/tallyo-mark.png']) {
  assert.deepEqual(pngInfo(file), { width: 512, height: 512, colorType: 6 });
  assert.ok(fs.statSync(path.join(root, file)).size < 75_000, `${file} must remain web-ready`);
}
for (const file of ['tallyo-wordmark-white.png', 'website/public/assets/tallyo-wordmark-white.png']) {
  assert.deepEqual(pngInfo(file), { width: 512, height: 218, colorType: 6 });
  assert.ok(fs.statSync(path.join(root, file)).size < 50_000, `${file} must remain web-ready`);
}
assert.deepEqual(pngInfo('icon-192.png'), { width: 192, height: 192, colorType: 6 });
assert.deepEqual(pngInfo('icon-512.png'), { width: 512, height: 512, colorType: 6 });

const app = read('index.html');
assert.match(app, /class="auth-brand" aria-label="Tallyo"[\s\S]*class="auth-brand-wordmark-base" src="\.\/tallyo-wordmark-white\.png"[\s\S]*class="auth-brand-wordmark-colour" src="\.\/tallyo-wordmark-white\.png"/, 'signed-out brand must reuse the full wordmark letterforms with the coloured mark');
assert.match(app, /<img src="\.\/tallyo-wordmark-white\.png" alt="Tallyo"[^>]*>/, 'signed-in header must expose the full wordmark with an accessible name');

const websiteLayout = read('website/src/layout.mjs');
assert.match(websiteLayout, /class="brand" href="\/" aria-label="Tallyo home"[\s\S]*class="brand-wordmark-dark-base" src="\$\{assetUrl\("\/assets\/tallyo-wordmark-white\.png"\)\}"[\s\S]*class="brand-wordmark-dark-colour" src="\$\{assetUrl\("\/assets\/tallyo-wordmark-white\.png"\)\}"/, 'website header must reuse the versioned wordmark letterforms with the coloured mark');
assert.match(websiteLayout, /class="brand-wordmark" src="\$\{assetUrl\("\/assets\/tallyo-wordmark-white\.png"\)\}" alt="" aria-hidden="true"/, 'website footer must use the versioned white wordmark');

const manifest = JSON.parse(read('manifest.json'));
assert.deepEqual(manifest.icons.map(({ src, sizes }) => [src, sizes]), [['./icon-192.png', '192x192'], ['./icon-512.png', '512x512']]);

const worker = read('service-worker.js');
for (const asset of ['./tallyo-mark.png', './tallyo-wordmark-white.png', './icon-192.png', './icon-512.png']) {
  assert.ok(worker.includes(asset), `service worker must cache ${asset}`);
}

const appBuild = read('scripts/build-app-pages.mjs');
for (const asset of ['tallyo-mark.png', 'tallyo-wordmark-white.png']) {
  assert.ok(appBuild.includes(`"${asset}"`), `strict app build must include ${asset}`);
}

console.log('Brand logo harness passed.');
