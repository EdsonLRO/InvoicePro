// Isolated fictional quote-acceptance preview. Never imported by production.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const csp = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

export async function artifact() {
  const files = new Map();
  for (const [url, local, type] of [
    ['/customer', 'dev/quote-acceptance/index.html', 'text/html; charset=utf-8'],
    ['/owner', 'dev/quote-acceptance/index.html', 'text/html; charset=utf-8'],
    ['/styles.css', 'dev/quote-acceptance/styles.css', 'text/css; charset=utf-8'],
    ['/prototype.js', 'dev/quote-acceptance/prototype.js', 'text/javascript; charset=utf-8'],
    ['/tallyo-wordmark-white.png', 'tallyo-wordmark-white.png', 'image/png'],
  ]) files.set(url, { bytes: await readFile(resolve(root, local)), type });
  const digest = createHash('sha256');
  for (const [name, file] of files) digest.update(name).update(file.bytes);
  return { files, revision: digest.digest('hex') };
}

export function serve(snapshot, port = 4181) {
  return new Promise((resolveServer, reject) => {
    const server = createServer((req, res) => {
      const expectedHost = `127.0.0.1:${server.address().port}`;
      if (req.headers.host !== expectedHost || (req.headers.origin && req.headers.origin !== `http://${expectedHost}`)) {
        res.writeHead(403); return res.end();
      }
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
      const pathname = new URL(req.url, `http://${expectedHost}`).pathname.replace(/\/$/, '') || '/customer';
      const file = snapshot.files.get(pathname);
      if (!file) { res.writeHead(404); return res.end(); }
      res.writeHead(200, {
        'Content-Type': file.type,
        'Content-Security-Policy': csp,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'X-Frame-Options': 'DENY',
        'X-Robots-Tag': 'noindex, nofollow',
        'X-Preview-Revision': snapshot.revision,
      });
      res.end(req.method === 'HEAD' ? undefined : file.bytes);
    });
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => resolveServer(server));
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const snapshot = await artifact();
  const server = await serve(snapshot);
  console.log(`Fictional quote preview: http://127.0.0.1:${server.address().port}/customer`);
  console.log(`Fictional owner preview: http://127.0.0.1:${server.address().port}/owner`);
  console.log(`Revision: ${snapshot.revision}`);
}
