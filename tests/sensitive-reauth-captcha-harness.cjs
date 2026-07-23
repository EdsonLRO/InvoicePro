const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const flush = () => new Promise((resolve) => setImmediate(resolve));

async function run() {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const inlineScript = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
        .find((match) => !/\ssrc\s*=/.test(match[0]));
    assert(inlineScript, 'The application inline script was not found.');
    new Function(inlineScript[1]);

    let component;
    let widgetConfig;
    let autoSolveWidget = true;
    let removeCount = 0;
    let signInError = null;
    let throwOnSignIn = false;
    const calls = { signIn: [], updateUser: [] };
    const alerts = [];
    const supabaseClient = {
        auth: {
            async signInWithPassword(credentials) {
                calls.signIn.push(credentials);
                if (throwOnSignIn) throw new Error('network unavailable');
                return { data: { user: { id: 'user-a' } }, error: signInError };
            },
            async updateUser(update) {
                calls.updateUser.push(update);
                return { data: {}, error: null };
            },
            mfa: {}
        }
    };
    const turnstile = {
        render(_container, config) {
            widgetConfig = config;
            if (autoSolveWidget) config.callback('one-use-token');
            return 'reauth-widget';
        },
        remove() { removeCount += 1; }
    };
    const location = { origin: 'https://example.test', pathname: '/', search: '', hash: '', protocol: 'https:' };
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
        Vue: { createApp(definition) { component = definition; return { mount() {} }; } },
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

    assert.match(html, /ref="reauthTurnstileContainer"/);
    assert.match(html, /aria-labelledby="reauth-challenge-title"/);
    assert.match(component.methods.renderReauthTurnstile.toString(), /action:\s*['"]password_reauth['"]/);
    assert.doesNotMatch(inlineScript[1], /console\.(?:log|warn|error)\([^\n]*(?:captchaToken|reauthChallenge\.token)/i);

    const makeApp = () => {
        const app = { ...component.methods };
        Object.assign(app, component.data.call(app));
        app.$refs = { reauthTurnstileContainer: { isConnected: true } };
        app.$nextTick = (callback) => Promise.resolve().then(callback);
        app.userProfileEmail = 'owner@example.test';
        return app;
    };

    const app = makeApp();
    const tokenPromise = app.requestReauthChallenge('global_signout');
    await flush();
    assert.equal(app.reauthChallenge.token, 'one-use-token');
    const firstWidgetConfig = widgetConfig;
    assert.equal(widgetConfig.action, 'password_reauth');
    assert.equal(widgetConfig['response-field'], false);
    assert.equal(widgetConfig['feedback-enabled'], false);
    app.submitReauthChallenge();
    assert.equal(await tokenPromise, 'one-use-token');
    assert.equal(app.reauthChallenge.token, '', 'The submitted token must be discarded immediately.');
    assert.equal(app.reauthChallenge.widgetId, null);
    assert.equal(removeCount, 1);
    firstWidgetConfig.callback('stale-token');
    assert.equal(app.reauthChallenge.token, '', 'A stale provider callback must not restore a used token.');

    autoSolveWidget = false;
    const missingPromise = app.requestReauthChallenge('global_signout');
    await flush();
    firstWidgetConfig.callback('stale-token-from-prior-widget');
    assert.equal(app.reauthChallenge.token, '', 'A stale callback must not populate a newer challenge with the same action.');
    app.submitReauthChallenge();
    assert.equal(app.reauthChallenge.error, 'Complete the security check before continuing.');
    assert.equal(calls.signIn.length, 0, 'Missing verification must fail before password reauthentication.');
    app.cancelReauthChallenge();
    await assert.rejects(missingPromise, /cancelled/);

    const providerFailureApp = makeApp();
    const providerFailurePromise = providerFailureApp.requestReauthChallenge('password_change');
    await flush();
    widgetConfig['expired-callback']();
    assert.equal(providerFailureApp.reauthChallenge.token, '');
    assert.match(providerFailureApp.reauthChallenge.error, /expired/);
    widgetConfig['error-callback']();
    assert.match(providerFailureApp.reauthChallenge.error, /could not be completed/);
    providerFailureApp.cancelReauthChallenge();
    await assert.rejects(providerFailurePromise, /cancelled/);

    const cancelApp = makeApp();
    cancelApp.requestReauthChallenge = async () => { throw new Error('Account verification was cancelled.'); };
    await assert.rejects(
        () => cancelApp.reauthenticateCurrentUser('private-password', 'password_change'),
        /Account verification was cancelled\./
    );

    const requestApp = makeApp();
    requestApp.requestReauthChallenge = async () => 'fresh-token';
    await requestApp.reauthenticateCurrentUser('private-password', 'password_change');
    assert.equal(calls.signIn.at(-1).options.captchaToken, 'fresh-token');
    assert.deepEqual(Object.keys(calls.signIn.at(-1).options), ['captchaToken']);

    const disabledApp = makeApp();
    disabledApp.turnstile.enabled = false;
    await disabledApp.reauthenticateCurrentUser('private-password', 'password_change');
    assert.equal(calls.signIn.at(-1).options, undefined, 'The rollback switch must preserve the no-CAPTCHA request shape.');

    const errorApp = makeApp();
    errorApp.requestReauthChallenge = async () => 'error-token';
    signInError = new Error('captcha protection: request disallowed (no captcha_token found)');
    await assert.rejects(() => errorApp.reauthenticateCurrentUser('private-password', 'password_change'), /Security verification expired/);
    signInError = new Error('too many requests');
    await assert.rejects(() => errorApp.reauthenticateCurrentUser('private-password', 'password_change'), /Too many attempts/);
    signInError = new Error('invalid login credentials');
    await assert.rejects(() => errorApp.reauthenticateCurrentUser('private-password', 'password_change'), /Current password is incorrect/);
    signInError = null;
    throwOnSignIn = true;
    await assert.rejects(() => errorApp.reauthenticateCurrentUser('private-password', 'password_change'), /Check your connection/);
    throwOnSignIn = false;

    const logoutOrder = [];
    const logoutApp = makeApp();
    logoutApp.requestSessionPasswordConfirm = async () => 'private-password';
    logoutApp.reauthenticateCurrentUser = async (_password, action) => logoutOrder.push(`reauth:${action}`);
    logoutApp.currentSessionNeedsMfa = async () => { logoutOrder.push('needs-mfa'); return true; };
    logoutApp.requestPasswordMfaCode = async () => { logoutOrder.push('request-mfa'); return '000000'; };
    logoutApp.completeMfaForCurrentSession = async () => logoutOrder.push('verify-mfa');
    logoutApp.logAppAuditEvent = async () => logoutOrder.push('audit');
    logoutApp.signOutWithScope = async (scope) => logoutOrder.push(`signout:${scope}`);
    await logoutApp.confirmLogoutAllDevices();
    assert.deepEqual(logoutOrder, [
        'reauth:global_signout', 'needs-mfa', 'request-mfa', 'verify-mfa', 'audit', 'signout:global'
    ]);

    const changeOrder = [];
    const changeApp = makeApp();
    changeApp.pwdChange = { old: 'private-password', new: 'Unique-new-passphrase-42!', confirm: 'Unique-new-passphrase-42!' };
    changeApp.reauthenticateCurrentUser = async (_password, action) => changeOrder.push(`reauth:${action}`);
    changeApp.currentSessionNeedsMfa = async () => { changeOrder.push('needs-mfa'); return true; };
    changeApp.requestPasswordMfaCode = async () => { changeOrder.push('request-mfa'); return '000000'; };
    changeApp.completeMfaForCurrentSession = async () => changeOrder.push('verify-mfa');
    changeApp.logAppAuditEvent = async () => changeOrder.push('audit');
    supabaseClient.auth.updateUser = async () => { changeOrder.push('update-password'); return { error: null }; };
    await changeApp.changePassword();
    assert.deepEqual(changeOrder, [
        'reauth:password_change', 'needs-mfa', 'request-mfa', 'verify-mfa', 'update-password', 'audit'
    ]);

    console.log('Sensitive reauthentication CAPTCHA harness passed.');
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
