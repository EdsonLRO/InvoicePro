# WEB-004 — Public AI helper and subscription readiness

Task ID: WEB-004
Objective: Prepare the public website for a bounded AI product helper and a
future Tallyo subscription journey without making paid provider calls, creating
live Stripe Billing products, changing production provider configuration,
publishing the website, or inventing prices.
Priority: High
Status: Repository implementation ready for review — external activation blocked
Owner role: Master Orchestrator
Triggered roles: Product, Backend, Security, Documentation, Legal/Privacy, QA,
Payments for the subscription boundary
Risk level: High because visitor prompts may be sent to an external AI provider
and future subscriptions involve money, customer commitments and production
provider configuration.
Branch: `codex/website-ai-subscription-readiness`
Affected files: Public Helper source, a same-origin Cloudflare Pages Function,
reviewed public knowledge, website configuration/build/tests, subscription
architecture documentation, and this task record.
Security boundary: The AI path is disabled by default and fail-closed. The API
key remains server-side, the model receives only one short visitor question and
reviewed public product knowledge, responses are not stored through the API,
and the helper has no tools, Auth, account, invoice, customer, payment, provider
or private-data access. Deterministic public guidance remains the fallback.
Privacy boundary: No prompt or answer logging is introduced. Visitors must be
told before activation that an enabled AI answer sends their question to the
selected provider. Questions containing secrets, credentials, payment details,
private-account requests or advice requests are rejected before any provider
call. External review of the final notice, retention position and provider
terms remains required before public activation.
Payment boundary: Repository-only subscription architecture may be prepared.
No price, trial, product, coupon, tax rule, checkout, portal, webhook, customer
mapping or entitlement is activated or claimed without a separate reviewed
Stripe Billing task and exact Owner approval.
Acceptance criteria: Same-origin AI endpoint; explicit feature, origin, rate
limit and secret gates; request-size and output limits; reviewed-source-only
prompt; no tools; `store: false`; strict response and citation validation;
deterministic fallback; accessible pending/error states; mock-only provider
tests; no secret in generated/browser files; subscription readiness record
with server-enforced entitlement and lifecycle requirements.
Required validation: Website build/test suite in disabled mode, enabled-mode
build assertions, endpoint mock tests covering disabled, origin, rate, input,
sensitive/private/advice/internal, provider failure, malformed output,
unreviewed citation and successful bounded response paths; focused secret scan;
`git diff --check`; independent focused diff review.
Approval boundary: Stop before any live OpenAI request or spend, Cloudflare
secret/binding/environment change, public AI activation, prompt/answer logging,
live Stripe Billing configuration, checkout, customer subscription, public
pricing commitment, DNS change, merge that publishes the website, or final
public release.
Evidence: The same-origin Pages Function, disabled browser adapter, private
preview and production build approval guards, origin/body/secret/rate gates,
reviewed-knowledge prompt, `store: false`, output/citation validation and
deterministic fallback are implemented. The focused website suite builds all 26
routes plus 404 and passes existing checks. The new mock suite covers disabled,
method, origin, content type, malformed/oversize input, each protected content
boundary, exact local answer, missing/failing/exceeded rate binding, provider
failure, malformed output, unreviewed links, oversized output, bounded success,
fallback, browser adapter, secret/source and subscription fail-closed cases.
No OpenAI request was made. Enabled private-preview UI QA passed at desktop,
390 px and 320 px with no horizontal overflow or browser console errors; a
reviewed suggestion answered locally without a busy state or provider call.
Subscription readiness now records the separate billing boundary, required
lifecycle states, server enforcement, provider/customer mapping, idempotency,
portal/cancellation, isolation and exact unresolved Owner decisions. A build
with `TALLYO_SUBSCRIPTIONS_ENABLED=true` fails before changing output.
`git diff --check`, JavaScript syntax checks and the focused secret-pattern scan
pass.
Remaining technical gate: Confirm that the Cloudflare website deployment can
provide the required rate-limit binding. If Pages cannot expose that binding,
place the endpoint in a dedicated same-origin Worker or use another reviewed
fail-closed edge limit; do not remove the gate.
Next action: Commit and publish a draft PR for review. Then obtain decisions on
plan names, features, limits, prices, tax display, free/trial approach and
cancellation commitments. AI preview activation separately needs budget,
rate-limit/provider configuration, privacy/content review and exact Owner
approval.

## Preview compatibility finding

Finding ID: WEB-004-COMP-001

Status: Validated — approved to fix under the standing source-maintenance
permission.

Severity: Medium. Cloudflare Pages cloned and built the website successfully,
but its pinned Wrangler 3.114.17 Functions bundler rejected the newer JavaScript
JSON import-attributes syntax in `website/functions/api/helper.js`. The
deployment therefore failed before any Function or AI route was published.
There was no secret exposure, provider call, weakened gate, customer impact or
partial deployment.

Fix: Use the bundler-compatible bare JSON module import while keeping the same
reviewed knowledge file and all request, origin, rate, secret, content, provider
and output controls unchanged.

Required proof: Existing website and helper suites; JavaScript syntax checks;
Wrangler 3.114.17 Pages Functions build; focused diff and secret checks; one
bounded Cloudflare preview retry only after the source fix is pushed. Public AI
activation, secret entry, binding creation, merge and production release remain
outside this fix.

Post-remediation evidence: Local website/helper tests, syntax checks, diff
check, focused secret scan and the exact Wrangler 3.114.17 Functions build
passed. Commit `f4fb8f2` then passed required GitHub `verify`, the Cloudflare app
preview and the Cloudflare website preview. The original parser failure no
longer reproduces and no provider configuration changed.

## Rate-limiter architecture disposition

Cloudflare documentation checked on 2026-07-23 states that Pages Functions
support only a listed subset of bindings, which does not include the native
Rate Limiting binding. The Workers Rate Limiting API requires Wrangler 4.36.0
or later and its binding is not visible in the Cloudflare dashboard.

Disposition: Prepare, but do not deploy, a non-public Worker with a native
`RATE_LIMITER` binding. The Pages Function accepts a service binding named
`AI_HELPER_RATE_LIMITER` and sends it only the SHA-256 actor key, never the
visitor question or provider credential. Missing, malformed and unavailable
states fail closed. The proposed Worker disables public and preview URLs and
does not log.

Residual limits: Cloudflare describes its native limiter as per-location and
eventually consistent. An IP-derived anonymous key can also group people behind
one shared network. The preview proposal is three unmatched AI questions per
60 seconds per derived key; that threshold, namespace, Worker creation and
service binding remain Owner-reviewed provider configuration. OpenAI budget and
usage controls are still required because this is not a hard global cost cap.

Repository validation: The website/helper suite passes direct-binding and
service-binding allow, limit and unavailable paths plus the private Worker's
method, route, content-type, body, key, missing-binding, exception, limit and
success paths. Syntax and diff checks pass. Wrangler 3.114.17 compiles the
updated Pages Function, and Wrangler 4.36.0 dry-runs the non-public Worker with
the proposed `RATE_LIMITER` binding at three requests per 60 seconds. No Worker,
binding, variable or secret was created or changed in Cloudflare.

Provider preflight: Read-only Cloudflare review found only the two existing
Pages projects, no Worker name conflict and zero Worker requests on the free
quota. Read-only OpenAI project review found zero API credit, zero requests,
access to `gpt-5.6-terra`, and a current Free-tier limit of 3 RPM and 50 RPD for
that model. The proposed Cloudflare threshold was reduced from five to three
per minute before activation. A live provider test remains blocked until the
Owner purchases prepaid API credit; no payment details were inspected.
