const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const deferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function run() {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const inlineScript = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
        .find((match) => !/\ssrc\s*=/.test(match[0]));
    assert(inlineScript, 'The application inline script was not found.');
    new Function(inlineScript[1]);

    let component;
    let authListener;
    let alerts = [];
    let queries = {};

    const queryBuilder = (table) => ({
        select() { return this; },
        eq() { return this; },
        in() { return this; },
        order() { return this; },
        limit() { return this; },
        maybeSingle() { return this; },
        then(resolve, reject) { return queries[table].promise.then(resolve, reject); }
    });

    const supabaseClient = {
        from(table) {
            assert(queries[table], `No deferred query was configured for ${table}.`);
            return queryBuilder(table);
        },
        auth: {
            onAuthStateChange(callback) {
                authListener = callback;
                return { data: { subscription: { unsubscribe() {} } } };
            },
            async getSession() { return { data: { session: null } }; },
            async signOut() { return { error: null }; },
            mfa: {
                async listFactors() { return { data: { totp: [], all: [] }, error: null }; },
                async getAuthenticatorAssuranceLevel() {
                    return { data: { currentLevel: 'aal2', nextLevel: 'aal2' }, error: null };
                }
            }
        }
    };

    const location = { pathname: '/InvoicePro/', search: '', hash: '', protocol: 'http:' };
    const history = { replaceState() { location.hash = ''; } };
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
        history,
        navigator: {},
        document: { body: { innerHTML: '' }, addEventListener() {}, getElementById() { return null; } },
        Vue: { createApp(definition) { component = definition; return { mount() {} }; } },
        XLSX: {},
        html2canvas() {},
        window: {
            SUPABASE_URL: 'https://example.supabase.co',
            SUPABASE_ANON_KEY: 'public-anon-key',
            supabase: { createClient() { return supabaseClient; } },
            location,
            history,
            addEventListener() {}
        }
    };
    context.window.window = context.window;
    vm.createContext(context);
    vm.runInContext(inlineScript[1], context);

    const app = { ...component.methods };
    Object.assign(app, component.data.call(app));
    app.navigateTo = () => {};
    await component.mounted.call(app);
    assert(authListener, 'The Supabase Auth listener was not registered.');

    Object.assign(app, {
        isLoggedIn: true,
        currentUser: { id: 'user-a', email: 'owner@example.test' },
        pendingEmail: 'customer@example.test',
        userProfileEmail: 'owner@example.test',
        authBusy: true,
        company: { name: 'Private Co', paymentDetails: 'Private bank details' },
        customers: [{ name: 'Private Customer' }],
        savedItems: [{ name: 'Private Item' }],
        invoices: [{ number: 'INV-PRIVATE' }],
        auditEvents: [{ metadata: { to: 'customer@example.test' } }],
        draft: {
            notes: 'Private note',
            terms: 'Private terms',
            items: [{ description: 'Private item' }],
            history: [{ text: 'Private history' }],
            payments: [{ amount: 5 }]
        },
        recurringTemplates: [{ name: 'Private schedule' }],
        customerForm: { name: 'Private Customer', email: 'customer@example.test' },
        itemForm: { name: 'Private Item' },
        activityNote: 'Private activity note',
        mfa: { enabled: true, verifiedFactors: [{ id: 'factor' }], secret: 'private-totp' },
        mfaRecovery: { busy: false, pending: false, enrollmentVerified: false, code: 'PRIVATE-CODE', error: '', codes: ['PRIVATE-CODE'], codesGeneratedAt: '2026-07-16T00:00:00Z' },
        mfaPasswordConfirm: { visible: true, code: '123456' },
        sessionConfirm: { visible: true, password: 'private-password' }
    });
    app.clearSignedOutState();
    app.clearSignedOutState();
    assert.equal(app.isLoggedIn, false);
    assert.equal(app.currentUser, null);
    assert.equal(app.authBusy, false);
    for (const key of ['customers', 'savedItems', 'invoices', 'auditEvents', 'recurringTemplates']) {
        assert.equal(app[key].length, 0, `${key} was not cleared.`);
    }
    assert.equal(app.company.name, '');
    assert.equal(app.company.paymentDetails, '');
    assert.equal(app.userProfileEmail, '');
    assert.equal(app.activityNote, '');
    assert.equal(app.mfa.secret, '');
    assert.equal(app.mfaRecovery.code, '');
    assert.equal(app.mfaRecovery.codes.length, 0);
    assert.equal(app.mfaPasswordConfirm.code, '');
    assert.equal(app.sessionConfirm.password, '');
    assert(app.draft.items.every((item) => !item.name && !item.description && !item.price));
    assert(app.draft.history.every((entry) => entry.text !== 'Private history'));
    assert.equal(app.draft.payments.length, 0);

    alerts = [];
    app.isLoggedIn = true;
    app.currentUser = { id: 'user-a' };
    app.authSignOutRequested = false;
    app.customers = [{ name: 'Private Customer' }];
    authListener('SIGNED_OUT', null);
    await sleep(5);
    assert.equal(app.isLoggedIn, false);
    assert.equal(app.customers.length, 0);
    assert.deepEqual(alerts, ['Your session has ended. Please sign in again.']);

    alerts = [];
    app.isLoggedIn = true;
    app.currentUser = { id: 'user-a' };
    app.authSignOutRequested = false;
    supabaseClient.auth.signOut = async () => {
        authListener('SIGNED_OUT', null);
        return { error: null };
    };
    await app.signOutWithScope('local');
    await sleep(5);
    assert.equal(app.isLoggedIn, false);
    assert.equal(app.authSignOutRequested, true);
    assert.equal(alerts.length, 0);

    app.isLoggedIn = true;
    app.currentUser = { id: 'user-a' };
    app.authSignOutRequested = false;
    supabaseClient.auth.signOut = async () => ({ error: new Error('network') });
    await assert.rejects(() => app.signOutWithScope('local'), /network/);
    assert.equal(app.isLoggedIn, true);
    assert.equal(app.authSignOutRequested, false);

    app.authSignOutRequested = true;
    supabaseClient.auth.mfa.getAuthenticatorAssuranceLevel = async () => ({
        data: { currentLevel: 'aal1', nextLevel: 'aal2' },
        error: null
    });
    supabaseClient.auth.mfa.listFactors = async () => ({
        data: { totp: [{ id: 'factor', status: 'verified' }] },
        error: null
    });
    app.fetchMfaRecoveryState = async () => ({ recovery_required: false, codes_generated_at: null });
    await app.routeAfterAuth({ id: 'user-a' });
    assert.equal(app.authSignOutRequested, false);
    assert.equal(app.authMode, 'mfa');

    let recoveryEnrollmentStarted = false;
    let signedInDataStarted = false;
    app.fetchMfaRecoveryState = async () => ({ recovery_required: true, codes_generated_at: null });
    app.beginMfaRecoveryEnrollment = async () => { recoveryEnrollmentStarted = true; };
    app.onSignedIn = async () => { signedInDataStarted = true; };
    supabaseClient.auth.mfa.getAuthenticatorAssuranceLevel = async () => ({
        data: { currentLevel: 'aal1', nextLevel: 'aal1' },
        error: null
    });
    supabaseClient.auth.mfa.listFactors = async () => ({ data: { totp: [], all: [] }, error: null });
    await app.routeAfterAuth({ id: 'user-a' });
    assert.equal(recoveryEnrollmentStarted, true, 'pending recovery must force authenticator enrollment');
    assert.equal(signedInDataStarted, false, 'pending recovery must not initialize business data');

    alerts = [];
    app.isLoggedIn = true;
    app.currentUser = { id: 'user-a' };
    app.authSessionVersion = 100;
    queries = {
        company_settings: deferred(),
        customers: deferred(),
        saved_items: deferred(),
        invoices: deferred()
    };
    const dataLoad = app.loadAllData();
    app.clearSignedOutState();
    queries.company_settings.resolve({ data: { company_name: 'Private Co' }, error: null });
    queries.customers.resolve({ data: [{ name: 'Private Customer' }], error: null });
    queries.saved_items.resolve({ data: [{ name: 'Private Item' }], error: null });
    queries.invoices.resolve({ data: [{ number: 'INV-PRIVATE' }], error: null });
    await dataLoad;
    assert.equal(app.customers.length, 0);
    assert.equal(app.savedItems.length, 0);
    assert.equal(app.invoices.length, 0);
    assert.equal(app.company.name, '');
    assert.equal(alerts.length, 0);

    app.isLoggedIn = true;
    app.currentUser = { id: 'user-a' };
    app.authSessionVersion = 200;
    queries = { audit_events: deferred() };
    const auditLoad = app.loadAuditEvents();
    app.clearSignedOutState();
    queries.audit_events.resolve({ data: [{ metadata: { to: 'customer@example.test' } }], error: null });
    await auditLoad;
    assert.equal(app.auditEvents.length, 0);

    app.isLoggedIn = true;
    app.currentUser = { id: 'user-a' };
    app.authSessionVersion = 300;
    const mfaQuery = deferred();
    supabaseClient.auth.mfa.listFactors = () => mfaQuery.promise;
    const mfaLoad = app.loadMfaStatus();
    app.clearSignedOutState();
    mfaQuery.resolve({ data: { totp: [{ id: 'factor', status: 'verified' }] }, error: null });
    await mfaLoad;
    assert.equal(app.mfa.enabled, false);
    assert.equal(app.mfa.verifiedFactors.length, 0);

    console.log('Session-expiry harness passed.');
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
