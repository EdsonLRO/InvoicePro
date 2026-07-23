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
