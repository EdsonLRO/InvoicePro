# Tallyo CAPTCHA And Auth Abuse-Control Decision

Internal security, privacy, product, and release decision pack. This is not a public notice, legal advice, or evidence that CAPTCHA is currently enabled.

## Task Record

| Field | Value |
|---|---|
| Task ID | AUTH-002 |
| Title | Select and prepare CAPTCHA protection for public Auth flows |
| Priority | High before public signup |
| Status | In Progress |
| Phase | App security hardening |
| Owner role | Security Agent |
| Assigned specialists | Backend / Supabase, Frontend, QA, Legal, Privacy and Regulatory, Release |
| Model / work mode | Sol for security/privacy decision; Terra for later implementation |
| Risk level | High: identity, browser fingerprinting signals, third-party code, Auth availability |
| Affected files if approved | `index.html`, focused Auth tests, release/legal/security records |
| Security boundary | Supabase Auth sign-up, sign-in, and password-reset initiation |
| Legal materiality | Yes: new browser-facing vendor and personal-data flow |
| Jurisdictions | United Kingdom initially; provider transfer terms still require final review |
| Affected people | Account applicants and account holders using protected Auth forms |
| Legal disposition | `Approved with conditions` for the bounded frontend implementation; provider provisioning, notice/transfer closure, and production activation remain `Blocked` |
| External review required | Final vendor/transfer and public-notice wording should be included in pre-launch professional review |
| Branch | `codex/turnstile-auth-integration` |
| Lock | `index.html`, `config.js`, focused Auth/security tests, and CAPTCHA-related status records; no production Auth configuration lock acquired |

## Decision Summary

**Recommendation:** use **Cloudflare Turnstile in Managed mode** for Tallyo's public sign-up, password sign-in, and password-reset request forms.

Configure it with:

- a dedicated production widget restricted to the exact Tallyo production hostname;
- a separate test widget or Cloudflare's published test keys for local automated testing;
- Managed mode, visible when Cloudflare requires interaction;
- no pre-clearance and therefore no intentional `cf_clearance` cookie;
- no invisible mode;
- visitor-feedback collection disabled where the widget option permits it;
- a fresh token for every Auth attempt, reset after success or failure;
- the public sitekey in the client and the secret only in Supabase Auth configuration;
- no CAPTCHA token, provider response, IP address, user agent, or fingerprint signal in Tallyo logs.

On 2026-07-15, the Owner approved the bounded implementation after the vendor data flow, exact-origin CSP change, and narrow SRI exception were explained. That approval covers frontend support, CSP, automated tests, and internal records. It does **not** authorize creating or accepting a Cloudflare account/widget on the Owner's behalf, copying a secret, enabling Supabase CAPTCHA enforcement, publishing legal wording, or treating the control as production-active.

## Implementation Record

The frontend now contains dormant Turnstile support for sign-up, password sign-in, and password-reset initiation:

- `config.js` contains a blank public `TURNSTILE_SITE_KEY`; no secret is present;
- the script loads conditionally only when a site key is configured;
- explicit SPA rendering uses flexible sizing, Managed interaction-only appearance, no pre-clearance, no hidden response field, and provider feedback disabled;
- the CSP adds only `https://challenges.cloudflare.com` to `script-src` and `frame-src`; `connect-src` is unchanged;
- each protected Supabase Auth call receives `captchaToken` only when configured;
- tokens are cleared and the widget is reset after successful, rejected, and network-failed requests;
- MFA, recovered-password update, and signed-in password-change calls remain outside the CAPTCHA flow;
- `tests/auth-captcha-harness.cjs` verifies token routing, reset/fail-closed behavior, dormant compatibility, CSP scope, and privacy-safe handling.

Supabase CAPTCHA enforcement remains **off**. A production site key is not configured, the Cloudflare secret is not stored, and the live Auth behavior is unchanged until the controlled rollout resumes.

## Why CAPTCHA Is Worth Adding

Tallyo exposes public Auth endpoints that can be targeted for:

- fake-account creation;
- credential stuffing and password spraying;
- automated password-reset email generation;
- consumption of the configured 30 Auth emails-per-hour allowance;
- nuisance traffic and avoidable provider cost or reputation risk.

Existing password rules, leaked-password protection, email confirmation, MFA, rate limits, and custom SMTP address different layers. CAPTCHA adds an abuse signal before Supabase processes the protected public request. It does not replace rate limits, MFA, breached-password checks, monitoring, or generic login error messages.

## Supported Provider Comparison

Supabase currently supports hCaptcha and Cloudflare Turnstile for sign-in, sign-up, and password-reset forms.

| Area | Cloudflare Turnstile | hCaptcha | Tallyo assessment |
|---|---|---|---|
| Supabase support | Supported | Supported | Equal |
| Normal user interaction | Managed mode can remain non-interactive or show a checkbox based on risk; no image/text puzzle in the documented Managed flow | Basic/Publisher configurations may present active image or text challenges; low-friction passive modes are paid tiers | Turnstile is lower friction for the current small-business audience |
| Accessibility claim | Cloudflare documents WCAG 2.2 AA | hCaptcha states it believes the service meets WCAG and Section 508 but asks integrators to evaluate their implementation | Turnstile has the clearer conservative claim; Tallyo must still test keyboard, zoom, screen-reader labels, and failure recovery |
| CSP impact | Add only `https://challenges.cloudflare.com` to `script-src` and `frame-src` for the documented non-pre-clearance integration | Add `https://hcaptcha.com` and `https://*.hcaptcha.com` to `script-src`, `frame-src`, `style-src`, and `connect-src`; hCaptcha advises against pinning narrower asset subdomains | Turnstile preserves a materially narrower origin allowlist |
| Browser signals | Cloudflare lists IP address, TLS fingerprint, user agent, sitekey, and associated origin; its docs also describe browser/API and behavioural signals used for challenges | hCaptcha lists IP/browser/device information plus mouse movement, scrolling, keypress, touch and challenge-response data | Both create personal-data/privacy considerations; hCaptcha's published collection description is broader |
| Provider role | Cloudflare says it is processor for protecting the site and controller for improving Turnstile | hCaptcha says it is generally processor for integrator service data, with its DPA governing that processing | Cloudflare's dual role must be disclosed and reviewed rather than hidden |
| Transfers/DPA | Cloudflare publishes a DPA with UK Addendum/SCC treatment and a subprocessor list | hCaptcha terms incorporate a DPA with EU SCCs and UK Addendum; it is US-based | Neither removes the need for Tallyo's vendor and transfer review |
| Free-plan fit | Free plan documents unlimited challenges and up to 20 widgets | Basic is available, but the lowest-friction passive modes are paid | Turnstile is the better current cost/UX fit |

## Important SRI Trade-Off

Tallyo currently pins ordinary third-party libraries and checks them with Subresource Integrity (SRI). Turnstile is different:

- Cloudflare requires `api.js` to be loaded from its exact live URL.
- Cloudflare warns that proxying or caching that script will break future updates.
- A changing live script cannot use a stable SRI hash in the same way as Tallyo's version-pinned CDN libraries.

If approved, the integration must record a **narrow, provider-required SRI exception** only for:

`https://challenges.cloudflare.com/turnstile/v0/api.js`

Compensating controls:

1. allow only `https://challenges.cloudflare.com` in `script-src` and `frame-src`;
2. do not add broad `https:`, `*.cloudflare.com`, `unsafe-inline`, or new `connect-src` sources for Turnstile;
3. load the script only on logged-out Auth screens that need a challenge;
4. render the widget explicitly and fail closed if the script or challenge cannot load;
5. keep the Turnstile secret out of the browser and repository;
6. restrict the widget to the exact production hostname;
7. do not use pre-clearance;
8. verify the final CSP with focused tests and a CSP evaluator;
9. document and monitor the exception in Tallyo's supply-chain story.

This is a conscious supply-chain trade-off, not a claim that Turnstile has SRI protection.

## Proposed Data Flow

1. The logged-out browser loads Turnstile only when a protected Auth form is displayed.
2. The browser sends Cloudflare the signals needed to evaluate the challenge.
3. Cloudflare returns a short-lived, single-use token.
4. Tallyo passes that token to the relevant Supabase Auth call as `captchaToken`.
5. Supabase Auth validates the token using the configured secret and accepts or rejects the Auth request.
6. Tallyo discards the token and resets the widget after every attempt.

Tallyo should not send invoice, customer, payment, MFA code, password, company profile, or workspace data to Cloudflare. The token belongs only to the Auth request.

## Auth Flows That Must Change Together

Supabase protection must not be enabled until the deployed frontend supplies a token for every protected flow.

| Flow | Current call | Required change if approved |
|---|---|---|
| Create account | `supabaseClient.auth.signUp(...)` | Add `captchaToken` to the existing `options` object while preserving `emailRedirectTo` |
| Password sign-in | `supabaseClient.auth.signInWithPassword(...)` | Add an `options` object containing `captchaToken` |
| Request password reset | `supabaseClient.auth.resetPasswordForEmail(...)` | Add `captchaToken` to the existing options while preserving `redirectTo` |
| MFA verification | `mfa.challengeAndVerify(...)` | No CAPTCHA; possession-factor verification is a separate control |
| Set recovered password | `auth.updateUser(...)` | No CAPTCHA; the recovery session plus TOTP gate remain authoritative |
| Signed-in password change | reauthentication, TOTP, then `auth.updateUser(...)` | No CAPTCHA; do not add third-party browser processing to an authenticated account action without a separate reason |

## Failure And Privacy Behaviour

- Disable the Auth submit button until the widget has produced a token.
- Use plain failure text such as `Security check could not be completed. Retry the check and submit again.`
- Do not reveal whether an account exists.
- Reset the widget/token after all Auth responses, including invalid credentials, rate limits, network failures, and expired tokens.
- If Cloudflare is blocked or offline, fail closed and explain that the security check could not load; do not silently bypass it.
- Keep ordinary Supabase rate limits active.
- Do not add analytics or advertising cookies as part of this task.
- Update the eventual Privacy Notice and vendor register before public onboarding.
- Treat Cloudflare's claim that signals are strictly necessary as provider evidence, not as Tallyo's final legal conclusion about PECR consent.

## Test And Acceptance Plan

### Automated

- Static test that the CSP adds only the exact Turnstile origin to `script-src` and `frame-src`.
- Static test that the Turnstile script URL is exact and the documented SRI exception is limited to that URL.
- Auth harness verifies token forwarding for sign-up, sign-in, and reset request.
- Auth harness verifies token reset after success and every error path.
- Harness verifies no token, IP, user agent, Cloudflare response, email, or password is logged.
- Harness verifies MFA and password-update calls do not receive CAPTCHA tokens.
- Test keys cover success, interactive challenge, expired/duplicate token, and provider failure.

### Browser and mobile

- Desktop and 320/390-pixel mobile widths.
- Keyboard-only operation and visible focus.
- 200% zoom without clipping.
- Managed interaction, expiry, retry, offline, blocked-script, and unsupported-browser states.
- Sign-up, wrong-password sign-in, correct sign-in, reset request, and generic account-enumeration wording.
- Installed PWA online Auth flow and normal service-worker update behaviour.
- Confirm no workspace/customer data is sent in Cloudflare requests.

### Supabase and provider

- Read back CAPTCHA provider/enabled state without exposing the secret.
- Confirm exact widget hostname restriction.
- Confirm no pre-clearance.
- Confirm test and production widgets/keys are separated.
- Verify Auth requests without a token fail after dashboard enforcement is enabled.
- Verify valid tokens succeed once and cannot be replayed.
- Inspect privacy-safe provider/Auth logs for failure patterns without collecting new PII.

## Rollout Order

1. Owner chooses the provider and accepts the documented SRI/data-flow trade-off.
2. Review Cloudflare terms, DPA, UK transfer mechanism, subprocessors, and intended Privacy Notice wording.
3. Create separate test and production widgets; keep secret values masked.
4. Implement frontend code, CSP, focused tests, and documentation on a review branch.
5. Deploy the frontend first with CAPTCHA support present but Supabase enforcement still off.
6. Complete browser acceptance using test configuration.
7. With Owner approval, configure the production secret and enable Supabase CAPTCHA protection.
8. Immediately test all three protected Auth flows and a missing/expired token.
9. Roll back Supabase enforcement first if the deployed frontend cannot complete Auth.

The dashboard-only state is prohibited because it would break sign-up, sign-in, and password-reset initiation.

## Owner Decision Record

The Owner approved items 1-3 and 5-6 for the bounded frontend implementation on 2026-07-15. Item 4 remains open for provider/legal evidence and final pre-launch review. Item 7 remains an Owner-operated provisioning step because it involves provider account/terms interaction and a secret. Item 8 remains a separate approval immediately before production enforcement.

1. Cloudflare Turnstile as a new browser-facing vendor.
2. Managed mode with no pre-clearance or invisible mode.
3. The browser signal/data flow and Cloudflare's processor/controller split.
4. Review and later acceptance of the applicable Cloudflare terms/DPA/transfer position.
5. The exact-origin CSP expansion.
6. The provider-required, narrowly documented SRI exception for Turnstile `api.js`.
7. Creating test and production widgets and storing the secret only in Supabase Auth.
8. A later separate approval immediately before enabling the production Supabase Auth setting.

## Official Sources Reviewed

- Supabase CAPTCHA guide: <https://supabase.com/docs/guides/auth/auth-captcha>
- Supabase CAPTCHA feature status: <https://supabase.com/features/auth-captcha-protection>
- Supabase Auth changelog review: <https://supabase.com/changelog?tags=auth>
- Cloudflare Turnstile overview and accessibility: <https://developers.cloudflare.com/turnstile/>
- Cloudflare client-side loading requirement: <https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/>
- Cloudflare CSP requirements: <https://developers.cloudflare.com/turnstile/reference/content-security-policy/>
- Cloudflare token validation and replay limits: <https://developers.cloudflare.com/turnstile/get-started/server-side-validation/>
- Cloudflare widget configuration: <https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/>
- Cloudflare hostname management: <https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/>
- Cloudflare Turnstile Privacy Addendum: <https://www.cloudflare.com/turnstile-privacy-policy/>
- Cloudflare DPA: <https://www.cloudflare.com/en-gb/cloudflare-customer-dpa/>
- ICO cookies and similar technologies guidance: <https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/>
- hCaptcha privacy policy: <https://www.hcaptcha.com/privacy>
- hCaptcha developer/CSP guide: <https://docs.hcaptcha.com/>
- hCaptcha accessibility and data FAQ: <https://docs.hcaptcha.com/faq/>
- hCaptcha DPA/UK transfer material: <https://www.hcaptcha.com/gdpr>

## Final Disposition

`Approved with conditions` for the bounded, dormant frontend implementation, exact-origin CSP change, focused tests, and internal records.

`Blocked` for provider/account provisioning by the agent, legal-notice publication, secret handling, Supabase enforcement, and public reliance. Production activation still requires the outstanding vendor/legal evidence, Owner-operated widget and secret steps, browser acceptance, and a separate Owner approval. Paid/public launch remains blocked by the wider legal and operational gates even if CAPTCHA is later enabled.
