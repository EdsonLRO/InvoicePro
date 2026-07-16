# Tallyo Turnstile Browser Acceptance - 2026-07-16

Internal security and release evidence. This is not evidence that Supabase CAPTCHA enforcement is enabled or that Tallyo is ready for public onboarding.

## Scope

This acceptance pass checked the dormant frontend integration and the Owner-provisioned Cloudflare Turnstile test widget before any server-side enforcement was enabled.

Safeguards maintained throughout:

- the repository `TURNSTILE_SITE_KEY` remained blank;
- the public test site key was not committed or stored in project documentation;
- the Turnstile secret was not requested, viewed, copied, or stored by the agent;
- Supabase CAPTCHA enforcement remained off;
- no sign-up, sign-in, password-reset, email, password, or customer-data request was submitted;
- the test widget remains separate from the eventual production widget for Tallyo's final application hostname.

## Evidence

| Check | Result | Evidence |
|---|---|---|
| Focused Auth/CAPTCHA harness | Pass | `node tests/auth-captcha-harness.cjs` passed. |
| Security workflow harness | Pass | `node tests/security-workflow-harness.cjs` passed. |
| Sign-in frontend integration | Pass | Cloudflare's published always-pass test site key completed and enabled the protected submit control without an Auth submission. |
| Account-creation frontend integration | Pass | The challenge reset across the Auth-mode change and enabled the protected submit control. |
| Password-reset frontend integration | Pass | The challenge reset across the Auth-mode change and enabled the protected submit control. |
| Desktop layout | Pass | The Auth card and flexible widget container stayed within the viewport with no horizontal overflow. |
| 390-pixel layout | Pass | The widget container and submit control stayed within the card with no horizontal overflow. |
| 320-pixel layout and form scrolling | Pass | The long account-creation form scrolled to expose the full submit and return controls; no content was cut off. |
| Real test widget hostname/site-key check | Pass | On `https://edsonlro.github.io/InvoicePro/`, the Owner observed Cloudflare's Success state and the local status `Turnstile hostname and site key check passed.` |
| Repository cleanup | Pass | Local `main` remained clean and `config.js` retained a blank `TURNSTILE_SITE_KEY`. |

The supplied screenshot also showed Trusted Types errors from browser-extension content scripts and sandbox/font warnings associated with the provider frame. The Turnstile Success state completed despite those messages, so they were not treated as a Tallyo application failure. Repeat the check in a clean browser profile if future failures make attribution unclear.

## Not Yet Tested Or Approved

- Supabase server-side validation using the Turnstile secret;
- enforcement of missing, invalid, expired, or replayed real tokens in production Auth;
- the eventual separate production widget and final Tallyo application hostname;
- final privacy/cookie notice wording, lawful-basis/PECR decision, retention detail, transfer-risk conclusion, and professional legal review;
- public or paid onboarding.

## Disposition

`Verified` for controlled pre-enforcement browser acceptance.

`Blocked` for production activation until the unresolved legal/vendor decisions, final application hostname, separate production widget, Owner-operated secret entry, explicit activation approval, and immediate post-activation Auth regression are complete.
