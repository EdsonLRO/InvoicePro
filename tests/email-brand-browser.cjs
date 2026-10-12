// Local visual acceptance for the source-controlled email shells. No message is sent.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { mkdir, readFile } = require('node:fs/promises');
const path = require('node:path');

(async () => {
  const root = path.resolve(__dirname, '..');
  const { businessEmailShell, emailActionButton, emailNotice, tallyoEmailShell } = await import('../supabase/functions/_shared/email-brand.mjs');
  const invoice = businessEmailShell({
    businessName: 'North & Stone (fictional)',
    brandColour: '#4f46e5',
    title: 'Invoice #INV-1046',
    eyebrow: 'Invoice from North & Stone',
    preheader: 'Invoice #INV-1046 for £5,000.00 is ready.',
    bodyHtml: `<p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.65;">Hi Willow &amp; Pine Studio,</p><p style="margin:0 0 18px;color:#334155;font-size:15px;line-height:1.65;">Your invoice from North &amp; Stone is ready.</p><div style="padding:18px;border:1px solid #dbe3ef;border-radius:10px;background:#f8fafc;"><p style="margin:0 0 7px;"><strong>Invoice:</strong> #INV-1046</p><p style="margin:0 0 7px;"><strong>Due date:</strong> 26 October 2026</p><p style="margin:0;font-size:19px;"><strong>Total:</strong> £5,000.00</p></div>${emailActionButton('View payment options', 'https://example.invalid/pay', '#4f46e5')}<p style="margin:24px 0 0;color:#334155;">Thank you,<br><strong>North &amp; Stone</strong></p>`,
  });
  const security = tallyoEmailShell({
    title: 'Confirm your recovery request',
    eyebrow: 'Account security',
    preheader: 'Confirm the account recovery request you started.',
    bodyHtml: `<p style="margin:0;color:#334155;font-size:15px;line-height:1.65;">Confirm that you asked for help resetting your lost authenticator. This link expires in 30 minutes and does not unlock the account by itself.</p>${emailActionButton('Confirm recovery request', 'https://example.invalid/recovery')}${emailNotice('<strong>If you did not request this, do not open the link. Your account remains protected.</strong>', 'important')}`,
    footerNote: 'Tallyo account security notice.',
  });

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const output = process.env.EMAIL_BRAND_EVIDENCE_DIR || path.join(root, 'tmp/email-brand-evidence');
  await mkdir(output, { recursive: true });
  const logo = await readFile(path.join(root, 'tallyo-mark.png'));
  try {
    for (const [name, html] of [['customer-invoice-email', invoice], ['tallyo-security-email', security]]) {
      const context = await browser.newContext({ viewport: { width: 900, height: 960 }, serviceWorkers: 'block' });
      const page = await context.newPage();
      const outside = [];
      await page.route('**/*', async route => {
        if (route.request().url() === 'https://tallyo.co.uk/assets/tallyo-mark.png') {
          return route.fulfill({ status: 200, contentType: 'image/png', body: logo });
        }
        outside.push(route.request().url());
        return route.abort();
      });
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.deepEqual(outside, []);
      await context.close();
    }
    console.log('Tallyo email visual acceptance passed at 900px and 390px without sending messages.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
