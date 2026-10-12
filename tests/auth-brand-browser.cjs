// Local browser acceptance for the signed-out Tallyo experience.
// Uses the existing fictional, network-blocked preview adapter and never contacts Auth or payment services.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');

(async () => {
  const { artifact, serve, root } = await import('../dev/redesign/preview.mjs');
  const snapshot = await artifact();
  const fixture = snapshot.files.get('/fixture.js');
  const signedOutFixture = fixture.bytes.toString().replace(
    'this.isLoggedIn = true;\r\n      await this.loadAllData();',
    'this.isLoggedIn = false;\r\n      return;\r\n      await this.loadAllData();'
  ).replace(
    'this.isLoggedIn = true;\n      await this.loadAllData();',
    'this.isLoggedIn = false;\n      return;\n      await this.loadAllData();'
  );
  assert.notEqual(signedOutFixture, fixture.bytes.toString(), 'the preview fixture must be switched to its signed-out state');
  snapshot.files.set('/fixture.js', { ...fixture, bytes: Buffer.from(signedOutFixture) });

  const server = await serve(snapshot, 0);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const outside = [];
  const errors = [];
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
    await context.route('**/*', route => {
      const url = route.request().url();
      if (url.startsWith(`${origin}/`)) return route.continue();
      outside.push(url);
      return route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin);
    await page.locator('.auth-form-panel').waitFor();

    const evidence = path.join(root, 'tmp/auth-brand-evidence');
    await mkdir(evidence, { recursive: true });
    await page.screenshot({ path: path.join(evidence, 'desktop-sign-in.png'), fullPage: true });

    assert.equal(await page.locator('.auth-workspace-preview').isVisible(), true, 'desktop must show the app-style workspace preview');
    assert.equal(await page.getByRole('heading', { name: 'Welcome to your Tallyo workspace.' }).count(), 1);
    assert.equal(await page.getByRole('heading', { name: 'Sign In' }).count(), 1);
    assert.equal(await page.getByRole('button', { name: 'Continue with Google' }).count(), 1, 'the signed-out preview must represent the approved Google sign-in layout');
    const signInButton = page.getByRole('button', { name: 'Sign In', exact: true });
    const signInLegalCopy = page.locator('.auth-submit-stack .auth-legal-copy');
    assert.equal(await signInLegalCopy.count(), 1, 'the sign-in agreement must be grouped with the email sign-in action');
    assert.equal(await signInLegalCopy.locator('a').count(), 4, 'the sign-in agreement must retain all four legal links');
    const [signInButtonBox, signInLegalBox] = await Promise.all([signInButton.boundingBox(), signInLegalCopy.boundingBox()]);
    assert(signInButtonBox && signInLegalBox, 'the sign-in action and legal agreement must both be visible');
    assert(signInLegalBox.y >= signInButtonBox.y + signInButtonBox.height, 'the sign-in agreement must appear beneath the Sign In button');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'desktop must not overflow horizontally');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(evidence, 'mobile-sign-in.png'), fullPage: true });
    assert.equal(await page.locator('.auth-workspace-preview').isVisible(), false, 'mobile must keep the account form primary');
    assert.equal(await page.locator('.auth-form-panel').isVisible(), true, 'mobile account form must stay visible');
    assert.equal(await signInLegalCopy.isVisible(), true, 'mobile must keep the sign-in agreement visible beneath the action');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'mobile must not overflow horizontally');

    assert.deepEqual(outside, [], 'the signed-out preview must not make non-loopback requests');
    assert.deepEqual(errors, [], 'the signed-out preview must mount without uncaught errors');
    await context.close();
    console.log('Auth brand browser acceptance passed at 1440px and 390px with no external requests.');
  } finally {
    await browser.close();
    await new Promise(done => server.close(done));
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
