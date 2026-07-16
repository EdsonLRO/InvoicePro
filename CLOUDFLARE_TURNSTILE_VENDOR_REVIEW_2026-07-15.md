# Tallyo Cloudflare Turnstile Vendor Review

Internal legal, privacy, security, and release evidence. This is not legal advice, a public notice, a completed transfer risk assessment, or evidence that Tallyo is GDPR compliant.

## Review Record

| Field | Value |
|---|---|
| Provider and service | Cloudflare Turnstile |
| Review date | 2026-07-15 |
| Intended purpose | Reduce automated abuse of public sign-up, password sign-in, and password-reset requests |
| Current state | Dormant frontend support is merged; the Owner reported creating the controlled test widget and pre-enforcement browser acceptance passed on 2026-07-16, but no site key or secret is configured in Tallyo and Supabase enforcement is off |
| Legal Agent disposition | `Approved with conditions` for test preparation and controlled acceptance only |
| Production disposition | `Blocked` pending the final hostname, notice/lawful-basis decisions, browser acceptance, separate production-widget provisioning, Owner-operated secret entry, and separate activation approval |
| External review | Required before paid/public onboarding because role allocation, international transfers, PECR treatment, and notice wording remain legally material |

## Evidence Snapshot

The following provider material was checked on 2026-07-15:

| Evidence | Provider position relevant to Tallyo |
|---|---|
| Turnstile Privacy Addendum, last updated 2025-06-18 | Turnstile processes client IP address, TLS fingerprint, user-agent header, site key, associated origin, and related browser signals. Cloudflare describes itself as processor for website protection and controller for improving bot detection. |
| Customer DPA v6.4, effective 2026-04-03 | For processor activity, the customer is controller and Cloudflare is processor. The DPA includes security, breach, rights-assistance, audit, subprocessor, and restricted-transfer provisions. |
| DPA transfer terms | Restricted UK transfers use the EU SCCs as amended by the UK Addendum. Cloudflare also describes Data Privacy Framework transfers, with the SCC/UK Addendum route applying if that certification lapses. |
| Subprocessor register, last updated 2025-10-01 | Lists support providers and Cloudflare group companies across the UK, EEA, United States, and other locations. Cloudflare offers an RSS update feed and a contractual change/objection process for processor activity. |
| Self-Serve Subscription Agreement, last updated 2025-09-12 | Use or account acceptance creates a binding agreement and may incorporate service-specific terms and product limits. An authorised Owner must accept it, not an automated agent. |
| Turnstile technical documentation, updated through 2026-05 | Managed mode is recommended. Hostnames restrict widget use, pre-clearance defaults to no clearance, and the widget can run without Cloudflare hosting the site. |
| ICO cookie guidance | A security technology may be exempt from consent only when it is strictly necessary for the user-requested service. Being merely useful or important is not enough. |

Primary sources:

- <https://www.cloudflare.com/turnstile-privacy-policy/>
- <https://www.cloudflare.com/en-gb/cloudflare-customer-dpa/>
- <https://www.cloudflare.com/en-gb/gdpr/subprocessors/cloudflare-services/>
- <https://www.cloudflare.com/terms/>
- <https://developers.cloudflare.com/turnstile/>
- <https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/>
- <https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/pre-clearance/>
- <https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/>
- <https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/>

## Data And Role Assessment

The intended flow sends no invoice, customer, payment, password, MFA-code, or workspace content to Cloudflare. It does expose security/browser signals and the Auth-page origin when a protected form loads.

Working role split:

- Tallyo is likely controller for deciding to use Turnstile to protect account Auth flows.
- Cloudflare states it is processor when using signals to protect Tallyo.
- Cloudflare states it is an independent controller when using the same class of signals to improve Turnstile.
- Cloudflare's DPA supports its processor activity; its separate controller activity is governed by its privacy material and cannot be treated as if it were solely covered by Tallyo's instructions.

The lawful basis for Tallyo's processing is not approved in this record. Legitimate interests may be a candidate for proportionate account-security processing, but the necessity, balancing, transparency, and reasonable-expectations analysis still requires an Owner decision and professional review before public onboarding.

## Transfer And Retention Gaps

The DPA provides a UK Addendum/SCC route for restricted processor transfers, but that contractual mechanism does not by itself complete Tallyo's transfer risk assessment. Before production activation, Tallyo still needs to record:

1. the applicable contracting Cloudflare entity and accepted contract version;
2. which processing locations and subprocessors are relevant to Turnstile rather than to unrelated Cloudflare products;
3. whether any adequacy or Data Privacy Framework route is actually relied on;
4. supplementary safeguards and residual risk for applicable restricted transfers;
5. the retention or deletion position for Turnstile signals, account records, and analytics;
6. the handling route for rights, incidents, and provider assistance.

Cloudflare's public Turnstile Addendum does not provide enough product-specific retention detail to close Tallyo's retention decision. Record this as unknown rather than inventing a period.

## PECR And Transparency Position

Tallyo will keep pre-clearance disabled, so the integration does not intentionally request a `cf_clearance` cookie. Cloudflare still processes browser signals and may use essential service technologies inside the widget.

Cloudflare describes these signals as strictly necessary. That statement is provider evidence, not Tallyo's final PECR conclusion. Before activation, the Owner and adviser should decide whether the security purpose meets the UK strictly-necessary exemption, and the public Privacy/Cookie Notice should explain the vendor, purpose, signal categories, role split, transfers, and failure consequences. Do not silently classify it as non-cookie processing merely because pre-clearance is off.

## Approved Test Configuration

The Owner reported provisioning the controlled test widget on 2026-07-16 using this required profile:

| Setting | Required value |
|---|---|
| Widget name | `Tallyo portfolio Auth test` |
| Widget mode | Managed |
| Hostname | `edsonlro.github.io` only |
| Pre-clearance | Off / no clearance |
| Client feedback | Disabled by Tallyo widget configuration |
| Browser size | Flexible |
| Appearance | Interaction only |
| Test and production separation | Test widget must never be reused as the eventual production widget |
| Site key | Public client configuration only |
| Secret | Supabase Auth dashboard only; never chat, Git, screenshots, browser code, or local notes |

### GitHub Pages limitation

The current app URL is `https://edsonlro.github.io/InvoicePro/`, but Turnstile restricts by hostname, not path. Authorising `edsonlro.github.io` therefore covers that hostname and its paths rather than only `/InvoicePro/`. This is acceptable only for controlled portfolio acceptance. It is not the intended long-term SaaS production boundary.

The eventual production widget must be separate and restricted to Tallyo's final application hostname after that hostname is decided and deployed. Do not guess or pre-authorise a future root domain or wildcard-equivalent scope.

## Controlled Acceptance Checklist

1. Completed 2026-07-16: Owner reviewed and personally accepted the Cloudflare account and applicable terms.
2. Completed 2026-07-16: Owner reported creating the test widget with the exact profile above and kept the secret masked.
3. Completed 2026-07-16 for the implemented scope: focused tests used Cloudflare's published test key; no production secret entered automated tests.
4. Completed 2026-07-16: the public test site key was used transiently on the authorised GitHub Pages hostname and was not committed or stored in project records.
5. Completed 2026-07-16 for pre-enforcement acceptance: desktop, 390-pixel, and 320-pixel rendering and mobile form scrolling passed; retry/fail-closed paths remain covered by the focused harness. Production post-activation testing remains separate.
6. Partially completed: no Auth form or Tallyo workspace/customer data was submitted during acceptance, and the implemented code sends only the challenge token with protected Auth requests. Provider-side signal processing remains governed by the vendor/privacy review.
7. Completed 2026-07-16: the repository remained on the blank-key state and the working tree was clean after testing.
8. Complete notice, role, transfer, retention, and professional-review actions.
9. Later, create a separate production widget for the final application hostname and enter its secret directly in Supabase Auth.
10. Obtain a separate Owner approval immediately before enabling Supabase CAPTCHA, then test all protected flows and missing/expired/replayed tokens.

## Review Triggers

Repeat this review if Cloudflare changes the Turnstile Privacy Addendum, DPA, subprocessor list, signal categories, retention, controller purposes, hostname behaviour, pre-clearance defaults, or contract terms; if Tallyo changes its public hostname or jurisdiction; or after an incident, complaint, rights request, or material browser-compatibility problem.
