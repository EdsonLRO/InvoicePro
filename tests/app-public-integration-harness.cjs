const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const integrationSource = fs.readFileSync(path.join(root, 'app-help-install.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const workerSource = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');

const window = {};
vm.runInNewContext(integrationSource, { window, URL }, { filename: 'app-help-install.js' });
const integration = window.TallyoPublicIntegration;

assert(integration, 'public integration helpers must be exposed');
assert(Object.isFrozen(integration), 'public integration helpers must be immutable');

assert.equal(integration.normalisePublicSiteUrl('https://tallyo.example/help?source=app#top'), 'https://tallyo.example/help/');
assert.equal(integration.normalisePublicSiteUrl('http://localhost:8080'), 'http://localhost:8080/');
assert.equal(integration.normalisePublicSiteUrl('http://127.0.0.1:8013/'), 'http://127.0.0.1:8013/');
for (const rejected of ['', 'not-a-url', 'http://tallyo.example', 'javascript:alert(1)', 'ftp://tallyo.example']) {
  assert.equal(integration.normalisePublicSiteUrl(rejected), '', `unsafe public URL must be rejected: ${rejected}`);
}

assert.equal(integration.detectInstallPlatform('Mozilla/5.0 (iPhone)', 1), 'ios');
assert.equal(integration.detectInstallPlatform('Mozilla/5.0 (Linux; Android 15)', 5), 'android');
assert.equal(integration.detectInstallPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X)', 5), 'ios', 'touch-capable iPad desktop UA must be recognised');
assert.equal(integration.detectInstallPlatform('Mozilla/5.0 (Windows NT 10.0)', 0), 'desktop');
assert.equal(integration.isStandalone(true, false), true);
assert.equal(integration.isStandalone(false, true), true);
assert.equal(integration.isStandalone(false, false), false);

assert.match(indexSource, /<script src="\.\/app-help-install\.js"><\/script>/, 'integration helper must load before app startup');
assert.match(indexSource, /role="dialog" aria-modal="true" aria-labelledby="help-panel-title"/, 'help panel must expose dialog semantics');
assert.match(indexSource, /@keydown\.esc\.stop="closeHelpPanel"/, 'Escape must close the help panel');
assert.match(indexSource, /You need an internet connection to sign in and work with your business records\./, 'offline limitations must be explained accurately');
assert.match(indexSource, /window\.addEventListener\('beforeinstallprompt'/, 'install prompt must only be captured after the browser offers it');
assert.match(indexSource, /window\.addEventListener\('appinstalled'/, 'successful app installation must update the UI');
assert.match(indexSource, /<button v-if="installPromptEvent"[^>]+@click="requestInstall"/, 'installation must require an explicit user click');
assert.match(indexSource, /<nav v-if="publicSiteUrl"/, 'public links must stay hidden until a valid website URL is configured');
assert.doesNotMatch(indexSource, /TALLYO_PUBLIC_SITE_URL\s*=|https:\/\/tallyo\.co\.uk/, 'this change must not hard-code or mutate production website configuration');

for (const forbidden of ['fetch(', 'XMLHttpRequest', 'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie']) {
  assert.equal(integrationSource.includes(forbidden), false, `integration helper must not use ${forbidden}`);
}
assert.match(workerSource, /'\.\/app-help-install\.js'/, 'integration helper must be part of the offline app shell');
assert.match(workerSource, /tallyo-shell-2026-07-23-2/, 'service-worker cache marker must match this build');

console.log('App public integration harness passed.');
