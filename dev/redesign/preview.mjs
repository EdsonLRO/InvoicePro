// Development only. Never imported by the production build.
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const cache = resolve(root, 'tmp/redesign-vendor');
const sha = (bytes, algorithm = 'sha384') => createHash(algorithm).update(bytes).digest('base64');
export const csp = "default-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'none'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
export function vendors(html) {
  return [...html.matchAll(/<script src="(https:\/\/cdn\.jsdelivr\.net\/[^\"]+)" integrity="sha384-([^\"]+)" crossorigin="anonymous"><\/script>/g)]
    .filter(match => !match[1].includes('@supabase/'))
    .map((match, i) => ({ tag: match[0], url: match[1], hash: match[2], name: `vendor-${i}.js` }));
}
export async function prepare() {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  await mkdir(cache, { recursive: true });
  for (const vendor of vendors(html)) {
    const response = await fetch(vendor.url, { redirect: 'error' });
    if (!response.ok) throw new Error(`Vendor download failed: ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (sha(bytes) !== vendor.hash) throw new Error('Pinned vendor integrity mismatch');
    await writeFile(resolve(cache, vendor.name), bytes);
  }
  console.log('Four existing pinned libraries cached and integrity-verified. No app/provider requests made.');
}
export async function artifact() {
  let html = await readFile(resolve(root, 'index.html'), 'utf8');
  const files = new Map();
  for (const vendor of vendors(html)) {
    const bytes = await readFile(resolve(cache, vendor.name));
    if (sha(bytes) !== vendor.hash) throw new Error('Cached vendor integrity mismatch; run --prepare');
    files.set(`/${vendor.name}`, { bytes, type: 'text/javascript' });
    html = html.replace(vendor.tag, `<script src="/${vendor.name}"></script>`);
  }
  html = html.replace(/<meta http-equiv="Content-Security-Policy" content="[^"]*">/, '')
    .replace(/<script src="https:[^"]*supabase[^\n]+<\/script>/, '')
    .replace('<script src="./config.js"></script>', '<script src="/fixture.js"></script>')
    .replace('<script type="module" src="./analytics-app.js"></script>', '')
    .replace('<link rel="manifest" href="./manifest.json">', '')
    .replace('<body', '<body data-redesign-preview="fictional"');
  if (/<script[^>]+src="https?:/.test(html)) throw new Error('Unexpected external script; preview fails closed');
  for (const name of ['tailwind.css', 'analytics-consent.css', 'app-user-messages.js', 'customer-csv-import.js', 'app-help-install.js', 'tallyo-wordmark-white.png', 'icon-192.png']) {
    files.set(`/${name}`, { bytes: await readFile(resolve(root, name)), type: name.endsWith('.png') ? 'image/png' : name.endsWith('.css') ? 'text/css' : 'text/javascript' });
  }
  files.set('/fixture.js', { bytes: await readFile(resolve(root, 'dev/redesign/fixture.js')), type: 'text/javascript' });
  files.set('/', { bytes: Buffer.from(html), type: 'text/html; charset=utf-8' });
  // Immutable snapshot: edits on disk cannot change a running preview.
  const digest = createHash('sha256');
  for (const [name, file] of files) digest.update(name).update(file.bytes);
  return { files, revision: digest.digest('hex') };
}
export function serve(snapshot, port = 4173) {
  return new Promise((resolveServer, reject) => {
    const server = createServer((req, res) => {
      const expectedHost = `127.0.0.1:${server.address().port}`;
      if (req.headers.host !== expectedHost || (req.headers.origin && req.headers.origin !== `http://${expectedHost}`)) {
        res.writeHead(403); return res.end();
      }
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
      const file = snapshot.files.get(req.url);
      if (!file) { res.writeHead(404); return res.end(); }
      res.writeHead(200, {
        'Content-Type': file.type, 'Content-Security-Policy': csp,
        'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY',
        'X-Robots-Tag': 'noindex, nofollow', 'X-Preview-Revision': snapshot.revision,
      });
      res.end(req.method === 'HEAD' ? undefined : file.bytes);
    });
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => resolveServer(server));
  });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--prepare')) await prepare();
  else {
    const snapshot = await artifact();
    const server = await serve(snapshot);
    console.log(`Fictional Tallyo preview: http://127.0.0.1:${server.address().port} — ${snapshot.revision}`);
  }
}
