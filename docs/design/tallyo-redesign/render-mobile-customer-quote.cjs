// Two isolated customer-facing design states; no acceptance, email or provider call.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const deps = process.env.TALLYO_DESIGN_NODE_MODULES || 'C:/Users/Edson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(deps, 'playwright'));
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route(/^https?:/, route => { errors.push('External request'); return route.abort(); });
    await page.goto(pathToFileURL(path.join(__dirname, 'mobile-customer-quote-acceptance.html')).href);
    await page.addScriptTag({ path: path.join(deps, 'lucide/dist/umd/lucide.min.js') });
    await page.evaluate(() => lucide.createIcons()); await page.evaluate(() => document.fonts.ready);
    const qa = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight,
      logoLoaded: document.querySelector('.footer img').naturalWidth > 0,
      adminNavigation: document.querySelectorAll('nav,.sidebar,.bottom-nav').length,
      smallTouchTargets: [...document.querySelectorAll('button,input,a')].filter(e => e.checkVisibility()).filter(e => { const r=e.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).map(e => e.textContent.trim() || e.id),
      clippedText: [...document.querySelectorAll('h1,h2,p,button,.scope-row,.validity')].filter(e => e.checkVisibility() && e.clientWidth && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim()),
    }));
    await page.screenshot({ path: path.join(__dirname, 'mobile-customer-quote-acceptance.png'), fullPage: true });
    if (qa.width !== 390 || qa.height !== 900 || !qa.logoLoaded || qa.adminNavigation || qa.smallTouchTargets.length || qa.clippedText.length || errors.length) throw new Error(JSON.stringify({qa,errors}));
    await page.evaluate(() => document.body.classList.add('accepted'));
    const acceptedState = await page.evaluate(() => ({ confirmationVisible: document.querySelector('.success-card').checkVisibility(), formHidden: !document.querySelector('.decision-card').checkVisibility(), invoiceLink: document.querySelector('.view-invoice').getAttribute('href'), height: document.documentElement.scrollHeight }));
    if (!acceptedState.confirmationVisible || !acceptedState.formHidden || acceptedState.height !== 900) throw new Error(JSON.stringify(acceptedState));
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: path.join(__dirname, 'mobile-customer-quote-accepted.png'), fullPage: true });
    const narrowChecks = [];
    for (const accepted of [false,true]) { await page.evaluate(value => document.body.classList.toggle('accepted',value), accepted); await page.setViewportSize({width:360,height:844}); narrowChecks.push(await page.evaluate(() => ({viewport:innerWidth,document:document.documentElement.scrollWidth}))); }
    if(narrowChecks.some(c=>c.viewport!==c.document)) throw new Error('Horizontal overflow');
    console.log(JSON.stringify({...qa,resolution:'780 x 1800',acceptedState,narrowChecks,externalRequests:0,errors},null,2));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
