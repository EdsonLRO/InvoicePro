# Tallyo controlled upgrade — single working checklist

Status: Step 1 in progress; local fixture preview verified, remote push awaiting branch-exclusion approval.
Recorded: 12 September 2026.
Owner: Codex, sequential repository/read-only verification and documentation.
Risk: Medium development-only foundation; provider changes remain approval-gated. No production runtime or security change.
Branch: `codex/tallyo-redesign-preview`, targeting local integration branch `codex/tallyo-redesign`; both include baseline `baa12d0`.
Authority: the Owner approved Step 1 only, following the staged plan in this task. Step 2 remains unstarted.

## 1. Scope and stop rules

Release 1 reorganises the existing application on desktop and mobile. Preserve current behaviour even where the screenshots omit a control. The reference set is a visual target, not a complete behaviour specification or evidence of implemented features.

Do not begin screen implementation, publish a preview, merge into main, deploy, change configuration, apply migrations, invoke functions, send email or create payment objects as part of Step 0. No account or customer records are read. No secret values are recorded.

Each step ends with a working result, focused evidence and an Owner review point. Later steps are not automatically authorised by completion. Sensitive actions and each production release require their own approval. No recurring monitor is started.

## 2. Baseline: observed versus recorded

| Item | Evidence on 12 September 2026 | Limit |
|---|---|---|
| Original working checkout | `c9edf462a05e6d2a77e50fdbdd8972c4a4114ad4`, promotional branch; 2 unique commits versus 11 on main | Preserved unchanged; not the implementation base |
| Remote main | `7429b2b74474493b81edd7e548bcd35bbe1c9b89`, PR #155 recovery deployment evidence | Verified with git ls-remote and fetch |
| Public app | HTTPS GET 200; `2026.09.11.1` in HTML and build-report.json | Public shell only, no authenticated journey |
| Public service worker | HTTPS GET 200; `2026-09-11-1` | Marker check, not an update/rollback rehearsal |
| Latest Cloudflare app check on main | Success; deployment `99c8fa2c-8dab-4460-9db4-a013c5fe9b20` | GitHub check metadata; active production alias not independently read from Cloudflare control plane |
| Original Owner Console app release | Merge `0e98392033895523eb4fb4e8fe85bab73a989211`; deployment `9ee7120d-122b-44e8-8c43-0077feed8e39` | Historical release evidence; app/editor/build script unchanged between this commit and main |
| Latest GitHub Pages deployment | `6399269004`, main SHA; successful workflow | Separate from Cloudflare; not assumed to be the immutable old rollback route |
| Main security workflow | [34633119856](https://github.com/EdsonLRO/InvoicePro/actions/runs/34633119856), success | Existing CI result, not a new local full regression |
| Main Pages workflow | [34633118752](https://github.com/EdsonLRO/InvoicePro/actions/runs/34633118752), success | Existing CI result |
| Backend inventory | 19 active functions and 19 applied migration ledger entries | Metadata read only; no function source, schema/data comparison or runtime test |
| Deployment URL protection | Exact latest app deployment hostname returned 302 to Cloudflare Access | Not evidence of backend isolation or every preview policy |

All seven current commit check runs returned success (including app, website, helper build and verify). Legacy combined commit status returned pending with an empty statuses array; do not mistake that empty legacy bucket for a failed check.

The current app build and successful deployment check identify the baseline candidate. Before preview/service work, independently confirm the active Cloudflare production alias and retained artifact availability. Before cutover, refresh this record and rehearse restoration. Step 0 does NOT certify rollback readiness.

### Read-only backend inventory

Values below came from live metadata, not older release narratives. Preserve existing JWT choices; false on a webhook/scheduled/public-consent function does not by itself imply a missing application-level gate. No authentication audit was performed.

| Function | Version | Verify JWT | State |
|---|---:|---|---|
| generate-recurring | 48 | false | ACTIVE |
| send-document-email | 57 | true | ACTIVE |
| resend-webhook | 44 | false | ACTIVE |
| send-reminder-email | 42 | true | ACTIVE |
| send-overdue-reminders | 42 | false | ACTIVE |
| create-stripe-checkout | 41 | true | ACTIVE |
| stripe-webhook | 43 | false | ACTIVE |
| create-stripe-refund | 35 | true | ACTIVE |
| log-app-event | 40 | true | ACTIVE |
| mfa-recovery | 35 | true | ACTIVE |
| create-billing-checkout | 29 | true | ACTIVE |
| create-billing-portal | 28 | true | ACTIVE |
| stripe-billing-webhook | 28 | false | ACTIVE |
| manage-stripe-connect | 32 | true | ACTIVE |
| create-connect-checkout | 31 | true | ACTIVE |
| create-connect-refund | 28 | true | ACTIVE |
| stripe-connect-webhook | 26 | false | ACTIVE |
| send-marketing-overview | 7 | false | ACTIVE |
| owner-account-admin | 3 | true | ACTIVE |

Applied migration ledger, in order (metadata only):

- `20260713193329` — harden_internal_trigger_functions
- `20260713210359` — optimize_rls_and_foreign_key_indexes
- `20260713211108` — secure_scheduled_automation_calls
- `20260713214042` — add_recurring_generation_idempotency
- `20260714161421` — harden_automation_http_timeouts
- `20260716133734` — mfa_recovery_codes
- `20260716160756` — fix_mfa_rls_factor_lookup
- `20260716161054` — move_mfa_helper_to_private_schema
- `20260717165044` — atomic_stripe_invoice_events
- `20260724111312` — stripe_billing_test_foundation
- `20260724174500` — stripe_connect_foundation
- `20260724175920` — stripe_connect_payments
- `20260725014434` — enforce_subscription_write_entitlements
- `20260725160000` — allow_live_billing_checkout_sessions
- `20260726172105` — fix_connect_checkout_expired_claim_constraint
- `20260731152423` — add_marketing_overview_requests
- `20260731155610` — narrow_marketing_overview_service_grants
- `20260909115547` — complimentary_access_by_email
- `20260911170410` — owner_console

Ledger membership is not a database backup and does not prove schema contents match source. Relevant recent entries include complimentary access and Owner Console. Release 1 proposes no backend change.

## 3. Preservation checklist

All implementation checks below are pending until their step runs. The source review identifies what to preserve; it does not certify every live journey.

| Area | Must survive the redesign | Existing focused test/source anchors |
|---|---|---|
| Navigation and access | Existing hash/deep links, back navigation, Account, Help/install and conditional Owner route; no broadened access | index.html; app-public-integration, owner-console harnesses |
| Document lifecycle | Invoice/quote/credit types, numbering/prefixes, save/reopen/edit/duplicate/delete, existing status behaviour | core-lifecycle, financial-action-audit |
| Customer history | Customer CRUD and all current fields; saved document customer snapshots must not change when contacts change | customer-item-validation; rowToInvoice/invoiceToRow |
| Products & services | Rename Saved Items in UI; preserve reuse and current name/description/price storage | customer-item-validation; saved_items mappings |
| Item calculations | Quantity, custom units, hours/minutes, per-line discount, tax rates, inclusive/exclusive tax, global discount, shipping, rounding and currencies | core-lifecycle; index.html calculation helpers |
| Document content/PDF | Notes, terms, bank instructions, customer/business details, branding, logo positioning, multipage PDF and correct download | brand-logo, core-lifecycle; current PDF path |
| Email | Recipient review, delivery feedback, retry/error wording, batch behaviour and no unintended sends | email-status-accuracy, user-message-guidance |
| Optional online payment | Off by default; no Checkout call when off; explicit full-balance/deposit choice, eligibility and deposit checks, bank instructions retained | invoice-email-payment-option |
| Payment records | Manual records, provider-derived records, balance, refunds/disputes, existing separation of subscription and customer payments | stripe-payment-integrity, refund-consequence-preview, dispute-lifecycle-visibility |
| Recurring/reminders | Frequencies/custom intervals, dates, optional auto-email, reminder opt-in/cadence/maximum, generation history and duplicate prevention | recurring-calendar-reliability; existing scheduler contract |
| Lists/export | Search/type/status/sort, pagination, bulk actions and XLSX; account data export stays separate | scale-accessibility-safety, account-data-export |
| Security/session | Sign-in/up, MFA, recovery routes, session clearing, protected actions and tenant boundaries unchanged | auth-captcha, mfa-recovery, session-expiry, tenant-isolation-attribution |
| Account/Owner | Subscription guidance, paid/grace/complimentary access, Owner lookup and recovery/grant controls without exposing private details | subscription-welcome-guidance, complimentary-access, owner-console |
| Privacy/public website | Analytics remains consent-controlled; event allowlist unchanged; free generator, marketing consent and public legal pages untouched | analytics-consent; website tests |
| PWA/updates | Install/help, asset paths, cached shell compatibility, update and rollback behaviour; no promise of offline business data | pwa-update, app-public-integration |

### Verified mockup-versus-source differences

- `index.html:1086` currently includes a manual Paid selection. Removing it or reinterpreting historical Paid records is deferred to the status-rule release, not a hidden UI refactor.
- `index.html:5867` converts quotes in place using the same ID. Preserve that existing action for Release 1; separate preserved quote plus automatically created invoice is a later workflow.
- `index.html:4016`, `:5390`, and the email request path retain default-off online payments and explicit selection. Save & send must open existing review, not bypass it.
- Current reusable-item data does not establish stored unit/tax defaults. Do not introduce those schema fields for a terminology change.
- Reminder Friendly/Standard/Firm presets, skip-one-occurrence and linked credit reconciliation are future features, not missing controls to invent in Release 1.
- Last saved is a successful-save indicator, not permission to add autosave. No screenshot proves save safety.
- Quote accepted/viewed and auto-created-from-quote examples must not become fabricated live activity events. Use only actually supported records in Release 1.
- Customer documents should be associated by established identifiers, not guessed from equal customer names. Historical snapshots remain authoritative; inspect coverage before adding summaries.
- KPI definitions must explicitly handle drafts, cancellations, credit documents and multiple currencies. Do not sum different currencies into a single GBP figure without an approved conversion method.
- Independent mockup examples reuse IDs with different amounts. Use one coherent fictional fixture set for implementation/testing; do not treat all screenshots as the same database.
- Minor screenshot controls are illustrative; complete loading, empty, disabled, failed-save and keyboard states during implementation.

## 4. Reference freeze

The nine primary references, two supporting images, nine HTML sources and nine renderers are preserved without alteration. See [README](README.md) for each screen's rationale and limitations; [reference-manifest.json](reference-manifest.json) records SHA-256 hashes and PNG dimensions. Original files remain in the promotional checkout.

- Release 1 visual targets: desktop Overview/editor/customer detail; mobile Overview/Documents/section editor/item editor.
- Later quote release: desktop accepted quote, mobile customer acceptance and success state.
- Logo: retain the existing official wordmark; do not recreate its font or symbol.
- The reference sources contain fictional illustrations only and are not imported as production modules.
- Renderers use a machine-specific dependency fallback. Future portability can be addressed in Step 1; do not upgrade dependencies solely to freeze the screenshots.

## 5. Controlled steps

| Step | Deliverable | Exit / review point |
|---|---|---|
| 0 — baseline | This record, preservation checklist and version-controlled reference set | Owner reviews discrepancies and agrees Step 1 scope |
| 1 — isolated foundation | Dedicated integration branch, protected non-production preview, fictional data, blocked live side effects; minimal shared structure | Prove isolation, CI targeting and preview rollback; then STOP |
| 2 — navigation/Overview | Simplified desktop/mobile navigation, New, real attention/activity data, restrained KPIs and contextual setup | Focused navigation/data-definition/a11y checks; Owner reviews |
| 3 — Documents/catalogue | Desktop list, mobile cards, preserved filters/export/bulk tools, Products & services naming | List/filter/action/phone checks; Owner reviews |
| 4 — editor | Desktop form/rail, mobile sections/items, Preview and existing send review | Lifecycle/calculation/PDF/payment-option tests; Owner reviews both devices |
| 5 — customer/remaining screens | Compact customer context, existing automation presentation, settings/Account/Help/Owner integration | Relevant summaries/access/automation checks; Owner reviews |
| 6 — acceptance | Feature-frozen Release 1 candidate, complete relevant regression, responsive/PWA/a11y/performance/security coverage | Owner accepts candidate and documented limitations |
| 7 — production | Separately approved exact candidate, fresh baseline, verified compatible rollback, bounded smoke checks | Keep candidate only if critical checks pass; otherwise approved restoration |

Step 1 must check live provider build-branch controls before ANY push. A documentation branch may trigger hosted previews. Do not push/PR this baseline merely to create a remote backup before those controls are understood. This stage creates a local Git checkpoint only.

The current GitHub security workflow runs for main pushes and PRs targeting main. PRs targeting a redesign integration branch will need equivalent checks deliberately configured in Step 1; do not assume they already run. No checks/protections are weakened.

### Step 1 progress — 12 September 2026

**Verified control-plane evidence (read-only):** `tallyo-app` production deployment `99c8fa2c-8dab-4460-9db4-a013c5fe9b20` is successful, references main `7429b2b`, and lists `app.tallyo.co.uk` as its alias. Both `tallyo-app` and `tallyo-website` use production branch `main` with automatic deployments enabled, build watch paths `*`, and preview branch selection **All non-production branches**. Both show preview access restricted by Cloudflare Access. No setting was changed; no secret was revealed.

The Helper rate-limiter Worker has production branch `main` and non-production builds unchecked. Its build command separately checks out `codex/website-ai-subscription-readiness` before deploying. Thus the Worker source must not be assumed equal to the triggering main commit. This pre-existing configuration was not changed and is outside the visual upgrade. Do not merge the redesign to main under preview authority.

**Recommended, not yet approved or applied:** exclude only `codex/tallyo-redesign*` from automatic preview builds in the two Pages projects. Retain main, other preview branches, Access and runtime configuration. Previous value is All non-production branches; restoring that selection reverses this restriction. Owner was asked for this narrow change and requested a recommendation; that is not approval. No branches have been pushed.

**Local implementation:** `dev/redesign/preview.mjs` serves an immutable in-memory snapshot of the existing app and official assets on loopback HTTP only. It never reads real `config.js` or environment secrets. Four existing pinned CDN libraries are cached under ignored `tmp/redesign-vendor/` and checked against the app's SHA-384 values on preparation and startup. No new production dependency or app source change.

`dev/redesign/fixture.js` replaces startup with a clearly labelled fictional account and a small in-memory data adapter. It supports sample customer/item/document CRUD for UI exploration. Unknown tables/methods do not fall back to a live service. Edge Functions, RPC, actual sign-in and account actions are unavailable. Email, Checkout, refunds and Analytics are not simulated as successful. Changes disappear on reload. Use only fictional sample input.

Isolation layers: loopback bind, exact Host and Origin checks, GET/HEAD-only allowlisted assets, no config/service-worker/API route, no-store responses, no indexing, no framing, CSP blocking connections/workers/frames/forms/external assets, and disabled browser transports/external links. This is a **UI fixture, not a Supabase/Auth/RLS/payment integration environment**. Authentication initialization is intentionally replaced only in the locally served fixture; no production bypass is added. Backend, MFA, permissions, scheduler execution, real delivery, PDF fidelity and provider integration require their existing separate tests.

Local usage from the repository root:

```text
node dev/redesign/preview.mjs --prepare
node dev/redesign/preview.mjs
```

Open `http://127.0.0.1:4173`. Preparation downloads only the four already-pinned CDN assets. The running preview uses local assets only. Stop with Ctrl+C; restart to load a new source snapshot. Browser testing uses a separately available Playwright installation and Chrome (`NODE_PATH` may point to the installed dependency directory): `node tests/redesign-preview-browser.cjs`. It creates fresh contexts, never attaches to the user's signed-in browser, and aborts every non-loopback request. Browser dependencies are not newly installed or committed.

**Validation passed:** `node tests/redesign-preview-harness.mjs`; `node tests/security-workflow-harness.cjs`; JavaScript syntax checks; `node tests/redesign-preview-browser.cjs`. Actual browser checks cover unchanged app mounting, sample customer creation and refresh reset, blocked provider operations, zero external request attempts, no uncaught errors and a 390px Overview without horizontal overflow. Actual preview artifact A → changed-title artifact B → original A passed, including revision headers and rendered title. This rehearses local snapshot rollback only, not a production Cloudflare rollback. Desktop/mobile baseline captures under ignored `tmp/redesign-evidence/` were visually inspected; frozen design references remain untouched.

The CI diff preserves main triggers and every existing check, adds PRs targeting `codex/tallyo-redesign` and pushes on the integration/step branches, and includes the offline preview harness. Remote CI has not run; browser acceptance is a local test, not currently a hosted CI job. No claim is made that all production regressions were rerun for this dev-only checkpoint.

**Remaining Step 1 gates:** Owner decision on the two branch exclusions, readback before pushing, integration-target PR and successful remote checks, provider artifact-retention/rollback availability confirmation. Keep Step 2 and production deployment paused. A future UI step may add only the fixture cases it needs; do not build a duplicate backend framework.

Historical preview configuration says browser configuration mirrored production. Access protection and a Stripe test flag are NOT backend isolation. Prefer existing free/local test facilities, mocked outbound delivery and fictional records. Obtain approval before any new paid service or sensitive provider setting. Do not copy production datasets or active scheduled jobs into an unattended preview.

Use focused tests during each change and the full relevant suite at the release milestone. A screenshot or source-pattern harness does not replace a complete interactive fixture-based workflow. No production writes, real emails, recovery actions or transactions are needed to establish this baseline.

### Later, separately scoped releases

1. Status rules: invoice/quote/credit semantics, manual payment retention, historical Paid compatibility, refunds/partial payments and overdue rules. Decide before migrating anything.
2. Customer document access and quote acceptance: secure scoped links, expiry/revocation, confirmed name/server timestamp, preserved quote and exactly one linked invoice, duplicate/retry/concurrent-click handling; no implicit email or payment.
3. Linked credits: original amounts retained, tax/partial/full credits, paid/overpaid balances and audit relationships; credit is not an automatic refund.
4. Automation extras: only selected skip-once, upcoming schedule and editable wording/defaults; scheduling/retry/duplicate tests.

Each later release repeats preview, tests, Owner review, compatible rollback planning and separate production approval. These are planned, not authorised implementations.

## 6. Rollback and known gaps

- Keep the existing backend and provider configuration unchanged for Release 1. Restore a compatible frontend artifact at the same canonical domain if release validation fails; do not route users to an obsolete GitHub Pages origin by assumption.
- A successful build check is not an artifact-retention guarantee. Verify exact artifact retrieval and rehearse the procedure during Step 1, then reconfirm at cutover.
- Retain a source reference now; refresh the actual rollback candidate immediately before launch to include intervening production fixes.
- Do not roll back the September recovery correction as part of a visual rollback.
- Do not restore production data just to undo a visual release: it can erase legitimate work. Later schema/workflow releases need explicit forward/backward data compatibility.
- This step does not inspect protected configuration values, verify backups, inspect private records, test live financial flows or certify current Auth/RLS behaviour.
- Main documentation still contains July baseline statements alongside September evidence. This scoped record distinguishes current observed facts; broad historical cleanup is not bundled into the redesign.
- Step 0 reference/checklist work is complete. Active Cloudflare alias/retention confirmation and rollback rehearsal remain explicit Step 1 gates, not claimed successes.

## 7. Validation record

Read-only checks: public app HTML/build-report/service worker; remote main/ref history; seven successful GitHub checks; Cloudflare app check identifier; exact deployment-host Access redirect; live function metadata and migration ledger. No browser application scripts executed.

Local checks passed: all 30 reference files match the originals by SHA-256; all 11 PNGs decode at their recorded dimensions; all nine renderer files pass node --check; all four embedded scripts parse; all nine HTML files resolve their local image assets. The frozen HTML/CJS/README bytes are retained across Git checkouts using directory-scoped attributes.

The 19 live migration version/name pairs match the 19 migration filenames on main. This verifies ledger naming only, not SQL contents or live schema equivalence. A focused credential-pattern scan found no private-key/token patterns in the added text. Contact strings were inspected: two reserved .example samples and the Owner-supplied illustrative hello@willowandpine.co.uk in the frozen mobile reference; there is no mailto link or delivery action. The original reference is unchanged; future fixtures should use reserved example domains.

Staged scope must contain only this design directory and the task pointer. Inspect staged whitespace/diff and confirm a clean checkpoint worktree at commit. No redesign build or application regression has been run for documentation-only changes; passing main CI is recorded separately, not represented as a new test run.
