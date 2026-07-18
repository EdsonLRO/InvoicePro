# Turnstile Production Acceptance — 2026-07-18

Scope: production Cloudflare Turnstile activation for Tallyo Auth on `edsonlro.github.io`, without recording credentials, private email addresses, CAPTCHA tokens, provider secrets, or customer data.

## Activation evidence

- The Owner supplied only the public production Site Key and confirmed that the widget hostname is `edsonlro.github.io`.
- PR #65 configured the public Site Key, retained `TURNSTILE_ENABLED=true`, and bumped the PWA release to `2026.07.18.7`. Its required `verify` check passed before the approved merge.
- PR #65 merged as `dc666860b493086419fa38e704748c96002e9873`. Main `Security checks` run `29656059202` and Pages run `29656058868` passed.
- The live response contained the exact reviewed public Site Key, the enabled frontend switch, and build `2026.07.18.7`. The provider script loaded without browser error.
- The Owner entered the matching secret privately in Supabase Auth. Read-only UI verification confirmed CAPTCHA enabled, provider `Turnstile by Cloudflare`, and no unsaved change; no secret value was read.

## Production acceptance

- A clean signed-out load rendered the security-verification container, obtained a provider token without exposing it, and enabled Sign In.
- Password sign-in and normal local sign-out succeeded with Owner-private credentials and MFA values.
- The first same-tab sign-out exposed a stale-widget lifecycle defect: the Auth shell returned but the old widget id prevented a fresh challenge until reload.
- PR #66 removed the widget before replacing the Auth shell, scheduled a fresh render after sign-out, blocked duplicate async renders, rejected detached containers, and bumped the PWA release to `2026.07.18.8`.
- PR #66 merged as `42a4d3d02b45f699636977cba68fc74229cb2843`. Main `Security checks` run `29656628475` and Pages run `29656628215` passed.
- Live build `2026.07.18.8` passed the same-tab sign-in/sign-out retest without reload: a new challenge rendered, Sign In became enabled, and no browser warning/error was recorded.
- One Owner-approved password-reset request completed and the Owner confirmed receipt. Neutral account-enumeration wording remained in use.
- One Owner-approved synthetic account completed signup, email confirmation, and authenticated application-shell access without any credential or private-address evidence being recorded.

## Deterministic and reused evidence

- `tests/auth-captcha-harness.cjs` covers signup, password sign-in, password reset, fail-closed missing-token behavior, token reset after success/provider rejection/network failure, expiry/timeout handling, provider retry, the public rollback switch, and the sign-in/sign-out widget lifecycle guards.
- `tests/pwa-update-harness.cjs`, `tests/session-expiry-harness.cjs`, and `tests/security-workflow-harness.cjs` passed for the affected releases.
- Earlier desktop, 390 px, 320 px and real-widget rendering evidence remains in `TURNSTILE_BROWSER_ACCEPTANCE_2026-07-16.md`; the relevant integration did not regress.
- Raw missing, expired, or reused tokens were not extracted or retained for evidence. The client fails closed and resets tokens deterministically, while live Auth acceptance proved provider-backed fresh-token operation.

## Rollback

Rollback order remains mandatory: first disable CAPTCHA enforcement in Supabase Auth; then set `TURNSTILE_ENABLED=false`, publish the reviewed frontend, and verify signed-out Auth. This prevents a client/server mismatch during provider failure.

## Result and limits

Production Auth abuse protection is **Verified** for controlled use. The broader functional verdict remains **Functionally ready for controlled users**, not unrestricted public self-service: the downstream product journey was not repeated end-to-end inside this new account, refund-receipt delivery remains a separate controlled acceptance, Firefox/iPhone Safari evidence is unavailable, and the existing legal/public-launch block is unchanged.
