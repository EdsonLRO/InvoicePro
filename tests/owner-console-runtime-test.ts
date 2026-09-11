import assert from "node:assert/strict";

// Run the actual handler with local Auth/database/mail doubles. No network,
// account changes or emails are permitted by this test process.
const source = await Deno.readTextFile(new URL("../supabase/functions/owner-account-admin/index.ts", import.meta.url));
const ownerId = "10000000-0000-4000-8000-000000000001";
const otherId = "10000000-0000-4000-8000-000000000002";
let moduleId = 0;

async function harness(options: {
  userId?: string;
  aal?: string;
  actionLink?: string;
  requestStatus?: string;
  targetId?: string;
  appBaseUrl?: string;
} = {}) {
  const calls: string[] = [];
  const emails: any[] = [];
  const generatedLinks: any[] = [];
  let handler: (request: Request) => Promise<Response>;
  const account = {
    user_id: options.targetId || otherId,
    account_email: "sample@example.invalid",
    email_confirmed: true,
    verified_mfa_factors: 1,
    complimentary_access_active: false,
    recovery_request_status: options.requestStatus || "none",
    recent_owner_actions: [],
  };
  const env: Record<string, string> = {
    SUPABASE_URL: "https://project.example.invalid",
    SUPABASE_ANON_KEY: "public-test-key",
    SUPABASE_SERVICE_ROLE_KEY: "server-test-key",
    TALLYO_OWNER_USER_ID: ownerId,
    APP_BASE_URL: options.appBaseUrl ?? "https://app.tallyo.co.uk",
    RESEND_API_KEY: "mail-test-key",
  };
  const query: any = {
    select: () => query,
    eq: () => query,
    gte: () => Promise.resolve({ count: 0, error: null }),
    insert: () => { calls.push("audit"); return Promise.resolve({ error: null }); },
  };
  const admin = {
    from: () => query,
    rpc: (name: string) => {
      calls.push(name);
      return Promise.resolve({ data: name === "owner_console_account_by_email" ? [account] : "ok", error: null });
    },
    auth: { admin: {
      generateLink: (input: unknown) => {
        generatedLinks.push(input);
        calls.push("generateLink");
        return Promise.resolve({ data: { properties: { action_link: options.actionLink || "https://project.example.invalid/auth/v1/verify?token=synthetic" } }, error: null });
      },
      mfa: {
        listFactors: () => { calls.push("listFactors"); return Promise.resolve({ data: { factors: [{ id: "synthetic-factor" }] }, error: null }); },
        deleteFactor: () => { calls.push("deleteFactor"); return Promise.resolve({ error: null }); },
      },
    } },
  };
  const user = { auth: {
    getUser: () => Promise.resolve({ data: { user: { id: options.userId || ownerId } }, error: null }),
    mfa: { getAuthenticatorAssuranceLevel: () => Promise.resolve({ data: { currentLevel: options.aal || "aal2" }, error: null }) },
  } };
  const runtime = {
    Deno: { env: { get: (name: string) => env[name] }, serve: (fn: typeof handler) => { handler = fn; } },
    createClient: (_url: string, key: string) => key === "server-test-key" ? admin : user,
    fetch: (_url: string, init: RequestInit) => { calls.push("email"); emails.push(JSON.parse(String(init.body))); return Promise.resolve(new Response("{}", { status: 200 })); },
  };
  const key = `__ownerTest${++moduleId}`;
  (globalThis as any)[key] = runtime;
  const testSource = `const { Deno, createClient, fetch } = (globalThis as any)[${JSON.stringify(key)}];\n` + source.replace(/^import \{ createClient \} from .+;\r?\n/m, "");
  await import(`data:application/typescript;base64,${btoa(testSource)}`);
  delete (globalThis as any)[key];
  return {
    calls,
    emails,
    generatedLinks,
    request: (action: string, headers: Record<string, string> = { Authorization: "Bearer synthetic", Origin: "https://app.tallyo.co.uk" }) => handler(new Request("https://function.example.invalid", {
      method: "POST", headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ action, email: account.account_email }),
    })),
  };
}

Deno.test("missing JWT and wrong origin perform no privileged action", async () => {
  const h = await harness();
  assert.equal((await h.request("lookup", {})).status, 401);
  assert.equal((await h.request("lookup", { Authorization: "Bearer synthetic", Origin: "https://untrusted.example.invalid" })).status, 403);
  assert.deepEqual(h.calls, []);
});

Deno.test("Owner reset and recovery-ready emails always return to the canonical app", async () => {
  for (const appBaseUrl of ["https://edsonlro.github.io/InvoicePro/", "https://app.tallyo.co.uk/", "", "https://untrusted.example.invalid", "http://localhost:3000", "https://app.tallyo.co.uk.evil.invalid/path"]) {
    const reset = await harness({ appBaseUrl });
    assert.equal((await reset.request("send-password-reset")).status, 200);
    assert.equal(reset.generatedLinks[0].options.redirectTo, "https://app.tallyo.co.uk/");
    const ready = await harness({ appBaseUrl, requestStatus: "confirmed" });
    assert.equal((await ready.request("approve-mfa-reset")).status, 200);
    assert(ready.emails[0].html.includes('href="https://app.tallyo.co.uk/"'));
    assert(ready.emails[0].text.includes("https://app.tallyo.co.uk/"));
  }
});

async function recoveryEmailHarness(appBaseUrl: string) {
  const recoverySource = await Deno.readTextFile(new URL("../supabase/functions/mfa-recovery/index.ts", import.meta.url));
  const emails: any[] = [];
  const rpcCalls: any[] = [];
  let handler: (request: Request) => Promise<Response>;
  const env: Record<string, string> = {
    SUPABASE_URL: "https://project.example.invalid",
    SUPABASE_ANON_KEY: "public-test-key",
    SUPABASE_SERVICE_ROLE_KEY: "server-test-key",
    MFA_RECOVERY_PEPPER: "synthetic-pepper-for-local-tests-only-32",
    RESEND_API_KEY: "mail-test-key",
    APP_BASE_URL: appBaseUrl,
  };
  const admin = {
    rpc: (name: string, args: unknown) => {
      rpcCalls.push({ name, args });
      return Promise.resolve({ data: "synthetic-request", error: null });
    },
    from: () => ({ insert: () => Promise.resolve({ error: null }) }),
    auth: { admin: { mfa: { listFactors: () => Promise.resolve({ data: { factors: [{ status: "verified" }] }, error: null }) } } },
  };
  const user = { auth: {
    getUser: () => Promise.resolve({ data: { user: { id: otherId, email: "sample@example.invalid" } }, error: null }),
    mfa: { getAuthenticatorAssuranceLevel: () => Promise.resolve({ data: { currentLevel: "aal1", nextLevel: "aal2" }, error: null }) },
  } };
  const runtime = {
    Deno: { env: { get: (name: string) => env[name] }, serve: (fn: typeof handler) => { handler = fn; } },
    createClient: (_url: string, key: string) => key === "server-test-key" ? admin : user,
    fetch: (url: string, init: RequestInit) => {
      assert.equal(url, "https://api.resend.com/emails");
      emails.push(JSON.parse(String(init.body)));
      return Promise.resolve(new Response("{}", { status: 200 }));
    },
  };
  const key = `__recoveryLinkTest${++moduleId}`;
  (globalThis as any)[key] = runtime;
  const testSource = `const { Deno, createClient, fetch } = (globalThis as any)[${JSON.stringify(key)}];\n` + recoverySource.replace(/^import \{ createClient \} from .+;\r?\n/m, "");
  await import(`data:application/typescript;base64,${btoa(testSource)}`);
  delete (globalThis as any)[key];
  const response = await handler!(new Request("https://function.example.invalid", {
    method: "POST",
    headers: { Authorization: "Bearer synthetic", Origin: "https://app.tallyo.co.uk", "Content-Type": "application/json" },
    body: JSON.stringify({ action: "request-owner", redirectTo: "https://untrusted.example.invalid" }),
  }));
  return { response, emails, rpcCalls };
}

Deno.test("confirmation email uses the canonical app and keeps its one-time token in the fragment", async () => {
  for (const appBaseUrl of ["https://edsonlro.github.io/InvoicePro/", "https://app.tallyo.co.uk/", "", "https://untrusted.example.invalid", "http://localhost:3000", "https://app.tallyo.co.uk.evil.invalid/path"]) {
    const h = await recoveryEmailHarness(appBaseUrl);
    assert.equal(h.response.status, 200);
    assert.deepEqual(await h.response.json(), { sent: true });
    assert.equal(h.emails.length, 1);
    const link = h.emails[0].html.match(/href="([^"]+)"/)[1];
    const url = new URL(link);
    assert.equal(url.origin, "https://app.tallyo.co.uk");
    assert.equal(url.pathname, "/");
    assert.equal(url.search, "");
    assert.match(url.hash, /^#mfa-recovery-confirm\?token=[a-f0-9]{64}$/);
    assert(h.emails[0].text.includes(link));
    const token = url.hash.split("token=")[1];
    assert.match(h.rpcCalls[0].args.p_token_hash, /^[a-f0-9]{64}$/);
    assert(!JSON.stringify(h.rpcCalls).includes(token));
    assert.equal(h.rpcCalls[0].name, "create_owner_mfa_recovery_request");
  }
});

Deno.test("non-Owner and Owner at AAL1 cannot invoke privileged actions", async () => {
  const other = await harness({ userId: otherId });
  assert.deepEqual(await (await other.request("status")).json(), { owner: false });
  assert.equal((await other.request("grant-complimentary")).status, 404);
  assert.deepEqual(other.calls, []);
  const aal1 = await harness({ aal: "aal1" });
  assert.equal((await aal1.request("approve-mfa-reset")).status, 403);
  assert.deepEqual(aal1.calls, []);
});

Deno.test("lookup excludes internal user identity and preserves absent-grant status", async () => {
  const h = await harness();
  const result = await (await h.request("lookup")).json();
  assert.equal(result.account.complimentary_access_active, false);
  assert.equal("user_id" in result.account, false);
  assert.deepEqual(h.calls, ["owner_console_account_by_email"]);
});

Deno.test("unconfirmed and self MFA resets do not remove factors", async () => {
  for (const options of [{ requestStatus: "awaiting_confirmation" }, { requestStatus: "confirmed", targetId: ownerId }]) {
    const h = await harness(options);
    assert.equal((await h.request("approve-mfa-reset")).status, 409);
    assert.deepEqual(h.calls, ["owner_console_account_by_email"]);
  }
});

Deno.test("confirmed MFA reset locks recovery before deleting factors", async () => {
  const h = await harness({ requestStatus: "confirmed" });
  assert.equal((await h.request("approve-mfa-reset")).status, 200);
  assert(h.calls.indexOf("owner_console_begin_mfa_recovery") < h.calls.indexOf("deleteFactor"));
  assert.equal(h.calls.filter(x => x === "email").length, 1);
});

Deno.test("password-reset links remain server-side and hostile links are rejected", async () => {
  const good = await harness();
  const response = await good.request("send-password-reset");
  assert.equal(response.status, 200);
  assert(!(await response.text()).includes("token="));
  assert.equal(good.calls.filter(x => x === "email").length, 1);
  for (const actionLink of ["https://project.example.invalid.evil.invalid/auth/v1/verify", "https://project.example.invalid/auth/v1/verify-evil", "https://user:pass@project.example.invalid/auth/v1/verify"]) {
    const bad = await harness({ actionLink });
    assert.equal((await bad.request("send-password-reset")).status, 500);
    assert(!bad.calls.includes("email"));
  }
});
