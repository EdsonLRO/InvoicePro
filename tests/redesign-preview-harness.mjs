import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { request } from 'node:http';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { webcrypto } from 'node:crypto';
import { serve, root, csp, vendors } from '../dev/redesign/preview.mjs';

const fixture = await readFile(resolve(root, 'dev/redesign/fixture.js'), 'utf8');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
assert.equal(vendors(html).length, 4);
assert.match(csp, /connect-src 'none'/);
assert.match(csp, /worker-src 'none'/);
const context = () => ({ location: { protocol: 'http:', hostname: '127.0.0.1' }, window: {}, navigator: {}, document: { addEventListener() {} }, Vue: { createApp() {} }, crypto: webcrypto });
const sandbox = context();
runInNewContext(fixture, sandbox);
const client = sandbox.window.supabase.createClient();
const rows = await client.from('customers').select('*');
assert.equal(rows.data.length, 1);
assert.match(rows.data[0].email, /\.example$/);
const inserted = await client.from('customers').insert({ name: 'Example customer' }).select().single();
assert.equal(inserted.data.name, 'Example customer');
await client.from('customers').update({ name: 'Edited sample' }).eq('id', inserted.data.id);
assert.equal((await client.from('customers').select().eq('id', inserted.data.id).single()).data.name, 'Edited sample');
await assert.rejects(async () => await client.from('customers').delete(), /explicit filter/);
await client.from('customers').delete().eq('id', inserted.data.id);
assert.equal((await client.from('customers').select()).data.length, 1);
assert.throws(() => client.from('private_grants'), /Unsupported/);
for (const action of ['send-document-email', 'create-connect-checkout', 'create-billing-checkout', 'owner-account-admin', 'log-app-event']) {
  assert.ok((await client.functions.invoke(action)).error, action);
}
assert.ok((await client.auth.signInWithPassword({})).error);
assert.ok((await client.rpc('any_rpc')).error);
await assert.rejects(() => sandbox.window.fetch('https://blocked.example'), /blocks/);
assert.throws(() => new sandbox.window.WebSocket('wss://blocked.example'), /blocks/);
const hostile = context(); hostile.location.hostname = 'app.tallyo.co.uk';
assert.throws(() => runInNewContext(fixture, hostile), /loopback/);
const fresh = context(); runInNewContext(fixture, fresh);
assert.equal((await fresh.window.supabase.createClient().from('customers').select()).data.length, 1);

const get = (port, path, headers = {}, method = 'GET') => new Promise((done, reject) => {
  const req = request({ hostname: '127.0.0.1', port, path, method, headers }, res => {
    const chunks = []; res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => done({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() }));
  }); req.on('error', reject); req.end();
});
const a = { revision: 'fixture-a', files: new Map([['/', { type: 'text/html', bytes: Buffer.from('A') }]]) };
const b = { revision: 'fixture-b', files: new Map([['/', { type: 'text/html', bytes: Buffer.from('B') }]]) };
// Rehearse snapshot selection A -> B -> A without touching production.
for (const snapshot of [a, b, a]) {
  const server = await serve(snapshot, 0);
  try {
    const port = server.address().port;
    const response = await get(port, '/');
    assert.equal(response.status, 200); assert.equal(response.headers['x-preview-revision'], snapshot.revision);
    assert.equal(response.body, snapshot === a ? 'A' : 'B');
    assert.equal((await get(port, '/', { host: 'attacker.example' })).status, 403);
    assert.equal((await get(port, '/', { origin: 'https://attacker.example' })).status, 403);
    assert.equal((await get(port, '/', {}, 'POST')).status, 405);
    for (const path of ['/config.js', '/.env', '/service-worker.js', '/../index.html', '/%2e%2e/config.js', '/functions/v1/send-document-email']) {
      assert.equal((await get(port, path)).status, 404, path);
    }
  } finally { await new Promise(done => server.close(done)); }
}
console.log('Preview harness passed: fictional CRUD/reset, blocked providers/auth/transports, loopback/host/origin/method/path controls, A-B-A snapshot rollback.');
