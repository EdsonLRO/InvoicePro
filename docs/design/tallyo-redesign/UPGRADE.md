# Tallyo controlled upgrade — single working checklist

Status: Steps 1 and 2 approved and merged into the non-production integration branch. [PR #157](https://github.com/EdsonLRO/InvoicePro/pull/157) merged as `8df885a`. Step 3 Documents/catalogue is implemented and locally verified for Owner review. STOP before Step 4 or main merge.
Recorded: 12 September 2026.
Owner: Codex, sequential development, provider verification and QA.
Risk: Medium frontend Documents/catalogue work on an isolated branch; no financial helper, backend, Auth or provider change.
Branch: `codex/tallyo-redesign-documents`, targeting `codex/tallyo-redesign`, from Step 2 merge `8df885a`.
Authority: the Owner explicitly requested “Move to step 3” on 12 September 2026. Later stages and production release remain separate approvals.

Step 2 approval: the Owner replied “Reviewed and approved” after reviewing the symmetric Overview refinement. Both hosted verification runs passed at `933a3c8`: [push](https://github.com/EdsonLRO/InvoicePro/actions/runs/34692038558), [PR](https://github.com/EdsonLRO/InvoicePro/actions/runs/34692039918). This closes the Step 2 review gate, not the separately scoped Step 3 implementation or production release gates.

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

**Approved and applied:** the Owner accepted the recommendation on 12 September 2026. Only the two Pages preview branch controls changed from All non-production branches to Custom, include `*`, exclude `codex/tallyo-redesign*`. Each was saved once and reopened: both retain production branch `main`, automatic production deployments checked, include `*` and the exact single exclusion. Access, build commands, runtime values, watch paths and the Worker were not changed. No secrets were revealed. Rollback: restore All non-production branches in each project. This is a reversible preview-only configuration restriction, not a production release or access-policy change. [Cloudflare branch-control documentation](https://developers.cloudflare.com/pages/configuration/branch-build-controls/) confirms excludes take precedence over includes.

GitHub Pages is independently configured as legacy publishing from `main` at `/`; the only other repository workflow is Security checks. The active main ruleset remains unchanged. Redesign integration/step branches had no existing remote counterparts at the pre-push check.

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

The CI diff preserves main triggers and every existing check, adds PRs targeting `codex/tallyo-redesign` and pushes on the integration/step branches, and includes the offline preview harness. Both the [push run](https://github.com/EdsonLRO/InvoicePro/actions/runs/34689528431) and [integration-target PR run](https://github.com/EdsonLRO/InvoicePro/actions/runs/34689566065) passed at `9fadc42`: the complete workflow's security harnesses, website build/tests and frozen Edge Function type-check step succeeded. Browser acceptance remains a local test, not a hosted CI job. No live integration test was run.

**Push isolation verified:** both Pages deployment histories display `codex/tallyo-redesign` at `baa12d0` and `codex/tallyo-redesign-preview` at `9fadc42` as **skipped / No deployment available**. Current app production remains `99c8fa2c` and website production remains `397e7da2`. GitHub reports zero deployment records for the preview head and only the two successful verification checks. Skipped provider attempt records are expected; there is no published preview artifact from these pushes.

**Rollback availability checked, not executed:** the current app deployment still lists its retained `index.html`, `build-report.json` and `service-worker.js` assets. The prior successful main deployment `423f10c2-42d1-4990-b3c2-18517b013cd4` at `bd8b754` exposes **Rollback to this deployment** in the dashboard menu; this action was not selected. [Cloudflare's rollback documentation](https://developers.cloudflare.com/pages/configuration/rollbacks/) limits rollback targets to successful production deployments, not previews. This confirms the present retained targets and available mechanism, not a future retention guarantee, a downloaded backup or a performed production recovery. Keep the current production deployment as the candidate source and reverify availability/compatibility immediately before any separately approved release. The actual exercised rollback is the local A-B-A preview test above.

**Review handoff:** [draft PR #156](https://github.com/EdsonLRO/InvoicePro/pull/156) targets `codex/tallyo-redesign`, never `main`. The eight-file Step 1 diff contains the two dev files, two preview tests, CI workflow and its harness, this checklist and the task pointer. No screen implementation or main merge. Review the foundation before authorising Step 2. A future UI step may add only the fixture cases it needs; do not build a duplicate backend framework. The final documentation-only head must also pass the existing PR checks; read that result from the PR rather than creating another closeout document.

Historical preview configuration says browser configuration mirrored production. Access protection and a Stripe test flag are NOT backend isolation. Prefer existing free/local test facilities, mocked outbound delivery and fictional records. Obtain approval before any new paid service or sensitive provider setting. Do not copy production datasets or active scheduled jobs into an unattended preview.

Use focused tests during each change and the full relevant suite at the release milestone. A screenshot or source-pattern harness does not replace a complete interactive fixture-based workflow. No production writes, real emails, recovery actions or transactions are needed to establish this baseline.

### Step 2 — navigation and Overview

**Scope:** the existing Vue app now has the approved sidebar/mobile bottom-navigation structure, a global New menu, and an action-oriented Overview. The same official wordmark, navy/slate/indigo palette and existing asset pipeline are retained. No new runtime dependency, build gate, service, query, provider call, Analytics event, payment calculation or schema.

**Navigation decisions:** existing hash routes and conditional Owner visibility remain intact. Reminders is a shortcut to the current overdue-invoice list, not a new scheduler. Branding remains directly accessible under Settings. Products & services is the navigation label; the catalogue screen's remaining terminology/layout belongs to Step 3. New opens the existing invoice/quote draft workflow or existing customer/item forms. Unsaved new-invoice state survives a visit to Overview and return; the existing editor's New Invoice control still starts another. Menus support Escape, contained Tab navigation and return focus; mobile Help returns focus to More. The existing persistent cookie control is positioned above the new mobile navigation, without changing consent behaviour.

**Overview definitions and constraints:**

- The existing `dashboardStats`, `amountPaid`, `invoiceOutstanding`, status helpers and dispute-state resolver are unchanged. Monetary figures select one currency; attention/activity show document-specific currencies and span all currencies.
- Outstanding/aging retain invoice total minus recorded-payment semantics, excluding Draft, Cancelled, quotes and credits. **Known legacy behaviour is deliberately preserved:** a historical invoice marked Paid without matching payment records can still contribute to the old dashboard balance, while the existing effective-status helper excludes it from overdue attention. Resolve that compatibility question in the separately scoped status release, not silently here.
- Paid this month is the UTC-month sum of dated invoice payment records, including negative refund entries. A manually selected Paid status alone does not fabricate a payment. Recorded payments on subsequently cancelled invoices retain the existing reporting treatment.
- Recurring this week means **active schedules whose next run is Monday–Sunday UTC**, including still-due runs earlier in that week. It is neither a generated-invoice count nor an expansion of every future occurrence. The label's detail and “How these figures work” explain this.
- Attention: actionable current disputes; existing eligible overdue invoices with positive balances; active recurring schedules due by tomorrow; quotes Sent/marked Sent at least five days ago using their latest sending evidence. Issue date alone does not imply an email was sent. Reminder actions open the existing review dialog, never send immediately. Closed/won disputes and paid/zero-balance invoices do not create those respective attention prompts.
- Recent activity is derived from saved document history plus the already-loaded delivery audit records, matched by document ID. It shows deterministic labels, not copied note/provider metadata. Three items initially, up to twenty on expansion; no new fetch or claim of a complete system audit. Quote acceptance and accepted-quote automatic invoices are **not invented**.
- Setup reflects existing business details/logo/customers/invoices and delivery evidence. A manual Sent status alone does not complete “Send your first invoice.” The optional card leads for an empty account, disappears when complete and adds no stored onboarding flags. Empty accounts do not display an empty aging chart.
- Figures describe currently loaded records, not live bank/scheduler state. Refresh uses the existing app lifecycle. Greeting uses a supplied profile first name when available, never an email-derived name.

**Local validation:** `node tests/redesign-overview-harness.cjs` covers empty state, currency separation, unchanged legacy financial treatment, net payments, UTC week boundaries, active/paused schedules, latest quote-sending evidence, unresolved/resolved disputes, setup evidence, bounded activity and review-only actions. It executes the actual Vue selectors/methods, not a duplicate calculation model.

`node tests/redesign-overview-browser.cjs` passed in fresh Chrome with blocked non-loopback requests: actual desktop/mobile route actions, hash fallback and back/forward, existing reminder/quote/schedule review, New forms, unsaved new-invoice retention, keyboard focus containment/Escape/return, mobile Help, currency selector, empty-account state and widths 320/390/768/1099/1100/1280/1440 without Overview horizontal overflow. Cookie-settings geometry clears the bottom navigation. Zero uncaught errors or external requests. `redesign-preview-browser.cjs` also passed actual app mount, customer CRUD/reset, blocked providers and A→B→A artifact restoration. No real email, payment or account action was exercised.

The existing Node CI harness suite passed locally, including the app's synthetic-config build, lifecycle/calculations, email/payment-option, navigation/accessibility, Auth/MFA/Owner, session, tenant and PWA checks. Four old horizontal-menu source assertions were replaced by equivalent bottom-navigation/scrollable-dialog/focus-containment checks, backed by browser interactions; no security assertion or workflow protection was removed. The new Overview unit harness runs in the existing CI. Browser checks remain local. Hosted CI will additionally run the existing website tests, Owner runtime tests and frozen function checks; final results belong to the review PR.

**Review images:** generated, ignored local evidence under `tmp/redesign-evidence/`: `step2-desktop-overview.png`, `step2-mobile-overview.png`, `step2-mobile-activity.png`, `step2-empty-overview.png`. The desktop, actual 390px phone composition and empty state were visually checked. Original frozen reference files remain unchanged. Open `http://127.0.0.1:4173` while the local server is running to review the interactive result.

**Review closeout:** [PR #157](https://github.com/EdsonLRO/InvoicePro/pull/157) is draft and targets only `codex/tallyo-redesign`. Both hosted verification runs passed at `aa8f7c5`: [push](https://github.com/EdsonLRO/InvoicePro/actions/runs/34691410395), [PR](https://github.com/EdsonLRO/InvoicePro/actions/runs/34691412452), including the website suite, Owner runtime tests and frozen function checks. GitHub returned zero deployment records for that commit. Final visual inspection caught outer-page scrolling caused by absolute screen-reader labels; containing those labels and scrolling only the main content corrected it. The browser regression now asserts no outer-page scroll or height overflow after the activity shortcut; focused browser/unit/accessibility checks pass after that correction. The final small follow-up must also pass the PR's existing checks; use the PR's current head as the authoritative CI result. No production action.

**Owner review refinement:** paired Overview cards now stretch to equal row heights (attention/activity and balance-age/setup), without fixed heights or changing the stacked mobile layout. The browser regression checks matching top edges and heights at 768–1440px and non-overlapping stacked cards at 320/390px. Focused browser and accessibility checks pass; desktop evidence refreshed. This is a preview-only visual adjustment in the same draft PR.

**Limits:** this is a fictional UI preview, not a live Auth/RLS/provider or email-delivery acceptance test. Automated keyboard/responsive checks are not full screen-reader/browser-matrix certification. Other screens remain the existing UI inside the new shell; their redesign is explicitly deferred. No main merge, public preview, app release marker change or deployment is authorised by this step. Stop for Owner review before Step 3.

### Step 3 review — Documents and catalogue

**Implementation:** the existing document list now groups type/number and issue/due dates into eight columns. A single set of row controls becomes touch-friendly cards at narrow content widths; no cloned mobile action handlers or horizontal table scrolling. The document number and mobile card surface open the existing editor. Native More disclosures expose Duplicate, Email, Download PDF and Delete; Escape closes them and returns focus. Selection controls have 44px touch labels, pagination has explicit names, and empty/filter-empty states explain the next step. The overdue reminder list is a compact expandable summary; individual existing reminder actions remain. The old aggregate amount is omitted because it could combine different currencies; document totals retain their individual currency labels and existing calculations.

**Preserved:** all type/status/search/sort options, twenty-record pagination, page selection and bulk Duplicate/Email/PDF/Delete remain bound to their original state and handlers. XLSX still exports all saved documents, not the filtered subset (button tooltip explains this). Existing email review and default-off payment choice, issued-document deletion guards, PDF rendering and restored editor state remain unchanged. No new quote-acceptance status or conversion behaviour. Catalogue storage is still `saved_items`; only presentation uses Products & services. Existing name/description/default price, edit/save, search, pagination, batch-price/delete and document reuse remain. No unit/tax defaults or schema fields added.

**Validation:** all 34 Node CI harnesses passed locally. The Pages build harness initially could not spawn in the restricted shell; it passed unchanged when permitted to start its local synthetic build. `redesign-documents-browser.cjs` exercised actual app filters/status/sort, page selection and 21-record pagination, blocked issued-document deletion, cancelled catalogue deletion/bulk-price prompt, keyboard More/Escape, email review without sending, local PDF/XLSX downloads, mobile card opening, catalogue create/update/search/reuse and unchanged existing document snapshots. Width checks cover Documents at 320/390/768/900/1024/1100/1240/1280/1440px and catalogue at 320/390/768/1100/1440px. Step 2 Overview/navigation and preview A-B-A rollback browser suites also passed. All three used fresh profiles, fictional records, zero external requests and zero uncaught browser errors. A new focused document contract/filter harness runs in the existing CI alongside every retained check. Current-head hosted results belong to the draft PR.

**Review:** open `http://127.0.0.1:4173/#invoices` or `/#items` while the preview server runs. Refreshed ignored evidence: `tmp/redesign-evidence/step3-desktop-documents.png`, `step3-mobile-documents.png`, `step3-mobile-document-card.png`, `step3-desktop-catalogue.png`, `step3-mobile-catalogue.png`. Desktop and phone renders were visually inspected. Frozen design references remain untouched.

**Limits/next gate:** no production, Auth, database, provider, Analytics, email, payment or migration change. The fixture does not certify live backend behaviour. This is Chromium keyboard/geometry coverage, not full screen-reader or browser-matrix certification. Existing catalogue currencies, status semantics and editor behaviour remain; editor refinements belong to Step 4. Stop for Owner review before integration or Step 4.

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
