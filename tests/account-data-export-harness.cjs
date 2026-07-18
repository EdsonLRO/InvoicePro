const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function run() {
    const root = path.resolve(__dirname, '..');
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const writer = fs.readFileSync(
        path.join(root, 'supabase', 'functions', 'log-app-event', 'index.ts'),
        'utf8'
    );
    const inlineScript = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
        .find((match) => !/\ssrc\s*=/.test(match[0]));
    assert.ok(inlineScript, 'The application inline script was not found.');

    let component;
    let downloadedLink;
    let downloadedBlob;
    let confirmationText = '';
    const alerts = [];
    const auditCalls = [];
    const ranges = {};
    let forcedErrorTable = null;
    const tableData = {
        company_settings: [{ user_id: 'user-a', name: 'Private Co' }],
        customers: Array.from({ length: 1001 }, (_, index) => ({ id: `customer-${index}`, name: `Customer ${index}` })),
        saved_items: [{ id: 'item-a', name: 'Private Item' }],
        invoices: [{ id: 'invoice-a', number: 'INV-PRIVATE', customer_snapshot: { email: 'customer@example.test' } }],
        recurring_templates: [{ id: 'schedule-a', name: 'Private Schedule' }],
        audit_events: [{ id: 'event-a', event_type: 'document_email_sent', metadata: { to: 'customer@example.test' } }]
    };

    function queryBuilder(table) {
        return {
            select() { return this; },
            order() { return this; },
            range(from, to) {
                ranges[table] = ranges[table] || [];
                ranges[table].push([from, to]);
                if (table === forcedErrorTable) {
                    return Promise.resolve({ data: null, error: { message: 'simulated query failure' } });
                }
                return Promise.resolve({ data: tableData[table].slice(from, to + 1), error: null });
            }
        };
    }

    const supabaseClient = {
        from(table) {
            assert.ok(tableData[table], `Unexpected export table: ${table}`);
            return queryBuilder(table);
        },
        auth: {
            async getUser() {
                return {
                    data: {
                        user: {
                            id: 'user-a',
                            email: 'owner@example.test',
                            created_at: '2026-01-01T00:00:00Z',
                            updated_at: '2026-07-15T00:00:00Z',
                            email_confirmed_at: '2026-01-01T00:01:00Z',
                            last_sign_in_at: '2026-07-15T08:00:00Z',
                            app_metadata: { role: 'private' },
                            user_metadata: { display_name: 'Private Owner' },
                            identities: [{ identity_data: { email: 'owner@example.test' } }]
                        }
                    },
                    error: null
                };
            }
        },
        functions: {
            async invoke(name, options) {
                auditCalls.push({ name, options });
                return { data: { ok: true }, error: null };
            }
        }
    };

    const urlApi = {
        createObjectURL(blob) {
            downloadedBlob = blob;
            return 'blob:tallyo-export';
        },
        revokeObjectURL() {}
    };
    const document = {
        body: { appendChild() {} },
        createElement(tag) {
            assert.equal(tag, 'a');
            downloadedLink = {
                href: '',
                download: '',
                clicked: false,
                click() { this.clicked = true; },
                remove() {}
            };
            return downloadedLink;
        },
        addEventListener() {},
        getElementById() { return null; }
    };
    const location = { pathname: '/InvoicePro/', search: '', hash: '', protocol: 'https:' };
    const history = { replaceState() {} };
    const context = {
        console: { log: console.log, warn: console.warn, error() {} },
        setTimeout(callback) { callback(); return 1; },
        clearTimeout() {},
        Date,
        Math,
        JSON,
        Intl,
        Object,
        Blob,
        URL: urlApi,
        URLSearchParams,
        alert(message) { alerts.push(String(message)); },
        confirm(message) { confirmationText = String(message); return true; },
        navigator: {},
        document,
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
    Object.assign(app, component.data.call(app), {
        isLoggedIn: true,
        currentUser: { id: 'user-a', email: 'owner@example.test' },
        authSessionVersion: 7
    });
    await app.exportAccountData();

    assert.match(confirmationText, /sensitive business and customer data/i);
    assert.ok(downloadedLink.clicked, 'The browser download must be triggered.');
    assert.equal(downloadedLink.href, 'blob:tallyo-export');
    assert.match(downloadedLink.download, /^tallyo-account-export-\d{4}-\d{2}-\d{2}\.json$/);
    assert.equal(downloadedBlob.type, 'application/json');

    const payload = JSON.parse(await downloadedBlob.text());
    assert.equal(payload.export_version, 1);
    assert.deepEqual(Object.keys(payload.account), [
        'id', 'email', 'created_at', 'updated_at', 'email_confirmed_at', 'last_sign_in_at'
    ]);
    assert.equal(payload.account.app_metadata, undefined);
    assert.equal(payload.account.user_metadata, undefined);
    assert.equal(payload.account.identities, undefined);
    assert.equal(payload.data.customers.length, 1001);
    assert.deepEqual(ranges.customers, [[0, 999], [1000, 1999]]);
    assert.deepEqual(Object.keys(payload.data), [
        'company_settings', 'customers', 'saved_items', 'invoices', 'recurring_templates', 'audit_events'
    ]);

    assert.equal(auditCalls.length, 1);
    assert.equal(auditCalls[0].name, 'log-app-event');
    assert.equal(auditCalls[0].options.body.eventType, 'account_data_exported');
    assert.match(writer, /"account_data_exported"/, 'The export event must be allowlisted server-side.');
    assert.doesNotMatch(writer, /metadata\.user_agent|headers\.get\("user-agent"\)/,
        'Audit events must not retain browser user-agent enrichment.');
    assert.deepEqual(alerts, ['Your account data has been downloaded. Keep it somewhere secure.']);
    assert.equal(app.accountExportBusy, false);

    forcedErrorTable = 'invoices';
    downloadedLink = undefined;
    downloadedBlob = undefined;
    alerts.length = 0;
    auditCalls.length = 0;
    await app.exportAccountData();

    assert.equal(downloadedLink, undefined, 'A failed dataset query must not create a partial download.');
    assert.equal(downloadedBlob, undefined, 'A failed dataset query must not create a partial export blob.');
    assert.equal(auditCalls.length, 0, 'A failed export must not be logged as completed.');
    assert.deepEqual(alerts, ['Could not export invoices.']);
    assert.equal(app.accountExportBusy, false);

    console.log('Account data export harness passed.');
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
