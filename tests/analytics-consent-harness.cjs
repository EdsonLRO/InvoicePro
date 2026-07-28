const assert = require('node:assert/strict');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

const createBrowser = (href = 'https://tallyo.co.uk/pricing/?email=private@example.com#invoice-123') => {
  const cookies = new Map();
  const scripts = [];
  const document = {
    head: {
      appendChild(node) {
        scripts.push(node);
      }
    },
    createElement(tagName) {
      return { tagName };
    },
    getElementById(id) {
      return scripts.find((script) => script.id === id) || null;
    }
  };
  Object.defineProperty(document, 'cookie', {
    get() {
      return [...cookies].map(([name, value]) => `${name}=${value}`).join('; ');
    },
    set(value) {
      const [pair, ...attributes] = String(value).split(';').map((part) => part.trim());
      const separator = pair.indexOf('=');
      const name = pair.slice(0, separator);
      const cookieValue = pair.slice(separator + 1);
      const maxAge = attributes.find((attribute) => /^Max-Age=/i.test(attribute));
      if (cookieValue === '' || maxAge === 'Max-Age=0') cookies.delete(name);
      else cookies.set(name, cookieValue);
    }
  });
  const location = new URL(href);
  const window = { location };
  return { cookies, document, scripts, window };
};

const commands = (window) => (window.dataLayer || []).map((entry) => Array.from(entry));

(async () => {
  const moduleUrl = pathToFileURL(path.resolve(__dirname, '..', 'analytics-consent.mjs')).href;
  const {
    APPROVED_ANALYTICS_EVENTS,
    CONSENT_COOKIE_NAME,
    GA4_MEASUREMENT_ID,
    createGa4ConsentClient,
    sanitisePageLocation
  } = await import(moduleUrl);

  assert.equal(GA4_MEASUREMENT_ID, 'G-PZFZKCWZ7M');
  assert.deepEqual(APPROVED_ANALYTICS_EVENTS, [
    'view_pricing',
    'start_registration',
    'complete_registration',
    'start_checkout',
    'subscription_activated',
    'use_invoice_maker',
    'download_invoice',
    'contact_support'
  ]);
  assert.equal(sanitisePageLocation('https://tallyo.co.uk/pricing/?email=private@example.com#invoice-123'), 'https://tallyo.co.uk/pricing/');
  assert.equal(sanitisePageLocation('https://tallyo.co.uk/private@example.com/invoice-123'), 'https://tallyo.co.uk/');
  assert.equal(sanitisePageLocation('https://app.tallyo.co.uk/?invoice=private#account'), 'https://app.tallyo.co.uk/');
  assert.equal(sanitisePageLocation('https://attacker.example/?customer=private'), 'https://tallyo.co.uk/');

  const indexSource = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
  const generatorSource = fs.readFileSync(path.resolve(__dirname, '..', 'website', 'src', 'generator.js'), 'utf8');
  const growthSource = fs.readFileSync(path.resolve(__dirname, '..', 'website', 'src', 'growth.js'), 'utf8');
  for (const eventName of ['start_registration', 'complete_registration', 'start_checkout', 'subscription_activated']) {
    assert.match(indexSource, new RegExp(`trackEvent\\('${eventName}'\\)`), `app must wire ${eventName} without properties`);
  }
  for (const eventName of ['use_invoice_maker', 'download_invoice']) {
    assert.match(generatorSource, new RegExp(`emitAnalyticsEvent\\("${eventName}"\\)`), `generator must wire ${eventName} without properties`);
  }
  assert.match(growthSource, /trackEvent\("view_pricing"\)/);
  assert.match(growthSource, /trackEvent\("contact_support"\)/);
  assert.doesNotMatch(`${indexSource}\n${generatorSource}\n${growthSource}`, /trackEvent\(['"][a-z_]+['"]\s*,/, 'event call sites must not pass custom properties');

  const beforeConsent = createBrowser();
  const beforeClient = createGa4ConsentClient({
    enabled: true,
    environment: 'production',
    measurementId: GA4_MEASUREMENT_ID,
    windowRef: beforeConsent.window,
    documentRef: beforeConsent.document
  });
  assert.equal(beforeClient.start().reason, 'consent-unset');
  assert.equal(beforeConsent.scripts.length, 0, 'no Google tag may load before consent');
  assert.equal(beforeConsent.window.dataLayer, undefined, 'no Google command may be queued before consent');
  assert.equal(beforeClient.trackEvent('view_pricing').reason, 'consent-denied');
  assert.equal(beforeConsent.scripts.length, 0, 'events before consent must not load Google');

  const rejected = createBrowser();
  const rejectedClient = createGa4ConsentClient({
    enabled: true,
    environment: 'production',
    measurementId: GA4_MEASUREMENT_ID,
    windowRef: rejected.window,
    documentRef: rejected.document
  });
  assert.equal(rejectedClient.reject().reason, 'denied');
  assert.equal(rejected.cookies.get(CONSENT_COOKIE_NAME), 'denied');
  assert.equal(rejectedClient.trackEvent('view_pricing').reason, 'consent-denied');
  assert.equal(rejected.scripts.length, 0, 'rejection must not load Google');
  assert.equal(rejected.window.dataLayer, undefined, 'rejection before loading must not contact or initialise Google');

  const accepted = createBrowser();
  const acceptedClient = createGa4ConsentClient({
    enabled: true,
    environment: 'production',
    measurementId: GA4_MEASUREMENT_ID,
    windowRef: accepted.window,
    documentRef: accepted.document
  });
  assert.equal(acceptedClient.accept().reason, 'loaded');
  assert.equal(accepted.cookies.get(CONSENT_COOKIE_NAME), 'granted');
  assert.equal(accepted.scripts.length, 1, 'acceptance loads the Google tag once');
  assert.equal(accepted.scripts[0].src, `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`);
  assert.equal(acceptedClient.accept().reason, 'already-loaded');
  assert.equal(accepted.scripts.length, 1, 'repeated acceptance must not install a second tag');

  const initialCommands = commands(accepted.window);
  assert.deepEqual(initialCommands[0].slice(0, 2), ['consent', 'default']);
  assert.equal(initialCommands[0][2].analytics_storage, 'denied');
  assert.equal(initialCommands[0][2].ad_storage, 'denied');
  assert.equal(initialCommands[0][2].ad_user_data, 'denied');
  assert.equal(initialCommands[0][2].ad_personalization, 'denied');
  const config = initialCommands.find((command) => command[0] === 'config');
  assert(config, 'the accepted tag must receive one GA4 configuration command');
  assert.equal(config[1], GA4_MEASUREMENT_ID);
  assert.equal(config[2].send_page_view, false);
  assert.equal(config[2].allow_google_signals, false);
  assert.equal(config[2].allow_ad_personalization_signals, false);
  assert.equal(config[2].page_location, 'https://tallyo.co.uk/pricing/');
  assert.equal(config[2].page_referrer, '');
  assert.equal(config[2].page_title, 'Tallyo');

  for (const eventName of APPROVED_ANALYTICS_EVENTS) {
    assert.equal(acceptedClient.trackEvent(eventName).reason, 'sent', `${eventName} must be accepted after consent`);
  }
  assert.equal(acceptedClient.trackEvent('unknown_event').reason, 'unknown-event');
  assert.equal(acceptedClient.trackEvent('view_pricing', { email: 'private@example.com' }).reason, 'invalid-properties');
  const eventCommands = commands(accepted.window).filter((command) => command[0] === 'event');
  assert.equal(eventCommands.length, APPROVED_ANALYTICS_EVENTS.length);
  for (const command of eventCommands) {
    assert(APPROVED_ANALYTICS_EVENTS.includes(command[1]));
    assert.deepEqual(Object.keys(command[2]).sort(), ['page_location', 'page_referrer', 'page_title', 'send_to']);
    const payload = JSON.stringify(command[2]);
    assert.doesNotMatch(payload, /private@example|customer|invoice-123|stripe|company|free.?text/i);
    assert.equal(command[2].page_location, 'https://tallyo.co.uk/pricing/');
  }

  accepted.cookies.set('_ga', 'GA1.1.123.456');
  const commandCountBeforeWithdrawal = commands(accepted.window).length;
  assert.equal(acceptedClient.withdraw().reason, 'denied');
  assert.equal(accepted.cookies.get(CONSENT_COOKIE_NAME), 'denied');
  assert.equal(accepted.cookies.has('_ga'), false, 'withdrawal removes readable GA cookies');
  assert.equal(accepted.window[`ga-disable-${GA4_MEASUREMENT_ID}`], true);
  const withdrawnCommands = commands(accepted.window);
  const finalConsent = withdrawnCommands[withdrawnCommands.length - 1];
  assert.deepEqual(finalConsent.slice(0, 2), ['consent', 'update']);
  assert.equal(finalConsent[2].analytics_storage, 'denied');
  assert.equal(acceptedClient.trackEvent('view_pricing').reason, 'consent-denied');
  assert.equal(commands(accepted.window).length, commandCountBeforeWithdrawal + 1, 'no event may be queued after withdrawal');

  const disabled = createBrowser();
  const disabledClient = createGa4ConsentClient({
    enabled: true,
    environment: 'preview',
    measurementId: GA4_MEASUREMENT_ID,
    windowRef: disabled.window,
    documentRef: disabled.document
  });
  assert.equal(disabledClient.accept().reason, 'disabled');
  assert.equal(disabled.scripts.length, 0);
  assert.equal(disabled.document.cookie, '');

  console.log('GA4 consent harness passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
