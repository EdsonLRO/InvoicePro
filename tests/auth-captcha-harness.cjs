const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function run() {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const config = fs.readFileSync(path.join(__dirname, '..', 'config.js'), 'utf8');
    const inlineScript = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
        .find((match) => !/\ssrc\s*=/.test(match[0]));
    assert(inlineScript, 'The application inline script was not found.');
    new Function(inlineScript[1]);

    assert.match(html, /script-src[^;]*https:\/\/challenges\.cloudflare\.com/);
    assert.match(html, /frame-src https:\/\/challenges\.cloudflare\.com/);
    assert.match(config, /window\.TURNSTILE_SITE_KEY\s*=\s*'0x4AAAAAAD3Dby1bdtNSIb94';/,
        'The reviewed public production Turnstile site key must remain configured exactly.');
    assert.match(config, /window\.TURNSTILE_ENABLED\s*=\s*true;/,
        'The public kill switch must remain explicit for controlled rollback.');
    assert.match(config, /disable Supabase CAPTCHA enforcement first/,
        'Rollback ordering must prevent frontend/provider configuration drift.');
    assert.match(inlineScript[1], /https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js\?render=explicit/);
    assert.match(inlineScript[1], /if \(!window\.turnstile\) script\.remove\(\);/,
        'A failed provider script must be removable so Retry can perform a fresh load.');
    assert.doesNotMatch(inlineScript[1], /console\.(?:log|warn|error)\([^\n]*(?:captchaToken|turnstile\.token)/i);

    let component;
    let widgetConfig;
    let resetCount = 0;
    let signInError = null;
    let throwOnSignIn = false;
    const calls = { signUp: [], signIn: [], reset: [] };
    const alerts = [];

    const supabaseClient = {
        auth: {
            async signUp(args) {
                calls.signUp.push(args);
                return { data: {}, error: null };
            },
            async signInWithPassword(args) {
                calls.signIn.push(args);
                if (throwOnSignIn) throw new Error('network unavailable');
                return { data: { user: { id: 'user-a' } }, error: signInError };
            },
            async resetPasswordForEmail(email, options) {
                calls.reset.push({ email, options });
                return { data: {}, error: null };
            }
        }
    };

    const location = {
        origin: 'https://example.test',
        pathname: '/InvoicePro/',
        search: '',
        hash: '',
        protocol: 'https:'
    };
    const turnstile = {
        render(_container, config) {
            widgetConfig = config;
            config.callback('captcha-token');
            return 'widget-a';
        },
        reset() { resetCount += 1; },
        remove() {}
    };
    const context = {
        console,
        setTimeout,
        clearTimeout,
        Date,
        Math,
        JSON,
        Intl,
        URLSearchParams,
        alert(message) { alerts.push(String(message)); },
        confirm() { return true; },
        location,
        history: { replaceState() {} },
        navigator: {},
        document: {
            body: { innerHTML: '' },
            head: { appendChild() {} },
            querySelector() { return null; },
            createElement() { return { addEventListener() {} }; },
            addEventListener() {},
            getElementById() { return null; }
        },
        Vue: {
            createApp(definition) {
                component = definition;
                return { mount() {} };
            }
        },
        XLSX: {},
        html2canvas() {},
        window: {
            SUPABASE_URL: 'https://example.supabase.co',
            SUPABASE_ANON_KEY: 'public-key',
            TURNSTILE_ENABLED: true,
            TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
            turnstile,
            supabase: { createClient() { return supabaseClient; } },
            location,
            history: { replaceState() {} },
            addEventListener() {}
        }
    };
    context.window.window = context.window;
    vm.createContext(context);
    vm.runInContext(inlineScript[1], context);

    const renderSource = component.methods.renderTurnstile.toString();
    assert.match(renderSource, /this\.turnstile\.loading/,
        'Concurrent next-tick callbacks must not render duplicate Turnstile widgets.');
    assert.match(renderSource, /this\.isLoggedIn/,
        'A restored signed-in session must not retain a background Auth widget.');
    assert.match(renderSource, /container\.isConnected === false/,
        'An async provider load must not render into a detached Auth container.');
    const signedInSource = component.methods.onSignedIn.toString();
    assert.ok(
        signedInSource.indexOf('this.removeTurnstileWidget()') < signedInSource.indexOf('this.isLoggedIn = true'),
        'Sign-in must remove the challenge before replacing the signed-out Auth shell.'
    );
    assert.match(component.methods.clearSignedOutState.toString(), /this\.\$nextTick\(\(\) => this\.renderTurnstile\(\)\)/,
        'Sign-out must schedule a fresh challenge after restoring the Auth shell.');

    context.window.TURNSTILE_ENABLED = false;
    const rollbackApp = { ...component.methods };
    Object.assign(rollbackApp, component.data.call(rollbackApp));
    assert.equal(rollbackApp.turnstile.enabled, false, 'The public kill switch must disable the widget even when a site key exists.');
    context.window.TURNSTILE_ENABLED = true;

    const app = { ...component.methods };
    Object.assign(app, component.data.call(app));
    app.$refs = { turnstileContainer: {} };
    app.$nextTick = (callback) => Promise.resolve().then(callback);
    app.routeAfterAuth = async () => {};

    await app.renderTurnstile();
    assert.equal(app.turnstile.token, 'captcha-token');
    assert.equal(widgetConfig.size, 'flexible');
    assert.equal(widgetConfig.appearance, 'interaction-only');
    assert.equal(widgetConfig['feedback-enabled'], false);
    assert.equal(widgetConfig['response-field'], false);
    assert.equal(widgetConfig.retry, 'auto');
    assert.equal(widgetConfig['retry-interval'], 8000);
    assert.equal(widgetConfig['refresh-expired'], 'manual');
    assert.equal(widgetConfig['refresh-timeout'], 'auto');

    widgetConfig['timeout-callback']();
    assert.equal(app.turnstile.token, '');
    assert.equal(app.turnstile.error, 'Security check timed out. Retry the security check.');
    widgetConfig.callback('fresh-captcha-token');
    assert.equal(app.turnstile.token, 'fresh-captcha-token', 'A later provider retry must clear a transient timeout.');

    widgetConfig['error-callback']();
    assert.equal(app.turnstile.token, '');
    widgetConfig.callback('captcha-token');
    assert.equal(app.turnstile.error, '', 'A successful automatic retry must clear the provider error.');

    app.auth = { username: 'owner@example.test', password: 'Long-Passphrase-42!', confirm: 'Long-Passphrase-42!' };
    await app.register();
    assert.equal(calls.signUp.length, 1);
    assert.equal(calls.signUp[0].options.captchaToken, 'captcha-token');
    assert.equal(calls.signUp[0].options.emailRedirectTo, 'https://example.test/InvoicePro/');

    app.authMode = 'login';
    app.turnstile.token = 'login-token';
    await app.login();
    assert.equal(calls.signIn.length, 1);
    assert.equal(calls.signIn[0].options.captchaToken, 'login-token');
    assert.deepEqual(Object.keys(calls.signIn[0].options), ['captchaToken']);

    app.authMode = 'forgot';
    app.turnstile.token = 'reset-token';
    await app.sendPasswordReset();
    assert.equal(calls.reset.length, 1);
    assert.equal(calls.reset[0].options.captchaToken, 'reset-token');
    assert.equal(calls.reset[0].options.redirectTo, 'https://example.test/InvoicePro/');
    assert.equal(resetCount, 3, 'Each protected Auth request must reset the challenge.');

    app.authMode = 'login';
    app.turnstile.token = 'invalid-login-token';
    signInError = new Error('invalid credentials');
    await app.login();
    assert.equal(resetCount, 4, 'Provider-rejected Auth requests must reset the challenge.');
    assert.equal(app.turnstile.token, '');
    signInError = null;

    app.turnstile.token = 'network-error-token';
    throwOnSignIn = true;
    await app.login();
    assert.equal(resetCount, 5, 'Network-failed Auth requests must reset the challenge.');
    assert.equal(app.authBusy, false);
    throwOnSignIn = false;

    app.authMode = 'login';
    app.turnstile.token = '';
    const signInCount = calls.signIn.length;
    await app.login();
    assert.equal(calls.signIn.length, signInCount, 'A configured CAPTCHA must fail closed without a token.');
    assert.equal(alerts.at(-1), 'Complete the security check before continuing.');

    app.turnstile.enabled = false;
    app.turnstile.widgetId = null;
    await app.login();
    assert.equal(calls.signIn.length, signInCount + 1);
    assert.equal(calls.signIn.at(-1).options, undefined, 'Dormant integration must preserve existing Auth behavior.');

    assert.equal((html.match(/role="group" aria-label="Security verification"/g) || []).length, 4);
    assert.equal((html.match(/role="alert"/g) || []).length >= 4, true);
    assert.match(html, /Retry security check/);

    console.log('Auth CAPTCHA harness passed.');
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
