const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function run() {
  const root = path.resolve(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const config = fs.readFileSync(path.join(root, 'config.js'), 'utf8');
  const build = fs.readFileSync(path.join(root, 'scripts', 'build-app-pages.mjs'), 'utf8');
  const inlineScript = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    .find((match) => !/\ssrc\s*=/.test(match[0]));

  assert(inlineScript, 'The application inline script was not found.');
  new Function(inlineScript[1]);
  assert.match(config, /window\.TALLYO_GOOGLE_AUTH_ENABLED = false;/, 'Google sign-in must be disabled in checked-in configuration.');
  assert.match(config, /window\.TALLYO_APPLE_AUTH_ENABLED = false;/, 'Apple sign-in must be disabled in checked-in configuration.');
  assert.match(build, /TALLYO_SOCIAL_AUTH_PUBLIC_RELEASE_APPROVED/, 'A separate release approval must gate social sign-in builds.');
  assert.match(html, /Continue with Google/);
  assert.match(html, /Continue with Apple/);
  assert.match(html, /authMode === 'social-password-setup'/);
  assert.doesNotMatch(inlineScript[1], /provider_token|provider_refresh_token/, 'Tallyo must not read or persist provider API tokens.');

  let component;
  const oauthCalls = [];
  const updateCalls = [];
  const signOutCalls = [];
  const alerts = [];
  let updatedUser = {
    id: 'social-user',
    email: 'owner@example.test',
    identities: [{ provider: 'email' }, { provider: 'google' }],
    app_metadata: { provider: 'google', providers: ['email', 'google'] }
  };
  const supabaseClient = {
    auth: {
      async signInWithOAuth(args) { oauthCalls.push(args); return { data: { url: 'https://provider.example.test' }, error: null }; },
      async updateUser(args) { updateCalls.push(args); return { data: { user: updatedUser }, error: null }; },
      async signOut(args) { signOutCalls.push(args); return { error: null }; },
      async getSession() { return { data: { session: null } }; },
      onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; },
      mfa: {
        async getAuthenticatorAssuranceLevel() { return { data: { currentLevel: 'aal1', nextLevel: 'aal1' }, error: null }; },
        async listFactors() { return { data: { totp: [], all: [] }, error: null }; }
      }
    }
  };
  const location = {
    origin: 'https://app.example.test',
    href: 'https://app.example.test/workspace/',
    protocol: 'https:',
    hostname: 'app.example.test',
    pathname: '/workspace/',
    search: '',
    hash: ''
  };
  let replacedUrl = '';
  const history = { replaceState(_state, _title, url) { replacedUrl = String(url || ''); location.hash = ''; location.search = ''; } };
  const context = {
    console,
    setTimeout,
    clearTimeout,
    Date,
    Math,
    JSON,
    Intl,
    URL,
    URLSearchParams,
    alert(message) { alerts.push(String(message)); },
    confirm() { return true; },
    location,
    history,
    navigator: {},
    document: {
      body: { innerHTML: '' },
      head: { appendChild() {} },
      querySelector() { return null; },
      createElement() { return { addEventListener() {}, removeEventListener() {}, remove() {} }; },
      addEventListener() {},
      getElementById() { return null; }
    },
    Vue: { createApp(definition) { component = definition; return { mount() {} }; } },
    XLSX: {},
    html2canvas() {},
    window: {
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_ANON_KEY: 'sb_publishable_test',
      TURNSTILE_ENABLED: false,
      TURNSTILE_SITE_KEY: '',
      TALLYO_GOOGLE_AUTH_ENABLED: true,
      TALLYO_APPLE_AUTH_ENABLED: true,
      supabase: { createClient() { return supabaseClient; } },
      location,
      history,
      addEventListener() {},
      clearTimeout
    }
  };
  context.window.window = context.window;
  vm.createContext(context);
  vm.runInContext(inlineScript[1], context);

  const app = { ...component.methods };
  Object.assign(app, component.data.call(app));
  app.$nextTick = (callback) => Promise.resolve().then(callback);
  app.fetchMfaRecoveryState = async () => ({ recovery_required: false, codes_generated_at: null });

  assert.equal(app.oauthRedirectUrl(), 'https://app.example.test/workspace/', 'OAuth must return only to the current Tallyo path.');
  Object.assign(location, { origin: 'http://app.example.test', protocol: 'http:', hostname: 'app.example.test' });
  assert.throws(() => app.oauthRedirectUrl(), /secure Tallyo address/, 'Insecure non-local OAuth callbacks must fail closed.');
  Object.assign(location, { origin: 'http://localhost:4195', protocol: 'http:', hostname: 'localhost' });
  assert.equal(app.oauthRedirectUrl(), 'http://localhost:4195/workspace/', 'Local HTTP must remain available for development only.');
  Object.assign(location, { origin: 'https://app.example.test', protocol: 'https:', hostname: 'app.example.test' });
  assert.equal(app.socialProviderEnabled('google'), true);
  assert.equal(app.socialProviderEnabled('apple'), true);
  assert.equal(app.socialProviderEnabled('github'), false, 'Unapproved providers must be rejected by the exact allowlist.');

  await app.signInWithProvider('github');
  assert.equal(oauthCalls.length, 0, 'A disabled or unknown provider must not reach Supabase.');
  assert.match(app.socialAuth.error, /not available right now/);

  app.socialAuth.error = '';
  await app.signInWithProvider('google');
  assert.equal(oauthCalls.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(oauthCalls[0])), {
    provider: 'google',
    options: { redirectTo: 'https://app.example.test/workspace/' }
  });
  assert.equal(app.socialAuth.busyProvider, '');

  app.authMode = 'register';
  await app.signInWithProvider('apple');
  assert.equal(oauthCalls.length, 2);
  assert.equal(oauthCalls[1].provider, 'apple');

  assert.equal(app.userHasPasswordIdentity({ identities: [{ provider: 'google' }], app_metadata: { providers: ['google'] } }), false);
  assert.equal(app.userHasPasswordIdentity({ identities: [{ provider: 'email' }, { provider: 'google' }], app_metadata: { providers: ['email', 'google'] } }), true);
  assert.equal(app.userHasPasswordIdentity({ id: 'legacy-email-user' }), true, 'Legacy password sessions without expanded identity metadata remain compatible.');

  let businessDataStarted = false;
  app.onSignedIn = async () => { businessDataStarted = true; };
  const socialOnlyUser = {
    id: 'social-user',
    email: 'owner@example.test',
    identities: [{ provider: 'google' }],
    app_metadata: { provider: 'google', providers: ['google'] }
  };
  await app.routeAfterAuth(socialOnlyUser);
  assert.equal(app.authMode, 'social-password-setup', 'A new provider-only account must establish the existing recovery credential before business data loads.');
  assert.equal(businessDataStarted, false, 'Provider-only sessions must not load business data before account setup completes.');

  app.socialPassword.new = 'A-Secure-Backup-Phrase-42!';
  app.socialPassword.confirm = 'A-Secure-Backup-Phrase-42!';
  await app.completeSocialPasswordSetup();
  assert.equal(updateCalls.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(updateCalls[0])), { password: 'A-Secure-Backup-Phrase-42!' });
  assert.equal(businessDataStarted, true, 'A completed password identity must return through the normal Auth/MFA route.');
  assert.equal(app.socialPassword.new, '', 'The temporary password value must be cleared after use.');

  location.hash = '#error=access_denied&error_description=The+user+cancelled';
  assert.equal(app.consumeAuthCallbackError(), true);
  assert.match(app.socialAuth.error, /was cancelled/);
  assert.equal(replacedUrl, '/workspace/', 'OAuth callback errors must be removed from the visible URL.');
  assert.doesNotMatch(app.socialAuth.error, /access_denied|description/i, 'Raw provider errors must not be shown.');

  console.log('Social Auth harness passed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
