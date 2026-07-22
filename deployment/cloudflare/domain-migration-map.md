# Tallyo domain migration map

Target structure:

- `tallyo.co.uk`: public website and help centre;
- `www.tallyo.co.uk`: redirect to the apex website;
- `app.tallyo.co.uk`: authenticated application and PWA.

This is a readiness audit, not an instruction to change a live system. Anything
marked High remains deferred for Sol High review and the applicable Owner action.

| Dependency | Current finding | Classification | Required later action |
| --- | --- | --- | --- |
| Website canonical URLs and sitemap | Generated from `TALLYO_CANONICAL_ORIGIN`; preview remains noindex | Already domain independent | Set the approved origin only for the production build |
| Website login and sign-up links | Generated from deployment variables; default retains GitHub Pages | Already domain independent | Point to the accepted app hostname after preview acceptance |
| App asset paths | Relative URLs throughout the app shell | Already domain independent | Verify in the Cloudflare preview |
| PWA manifest, start URL and scope | Relative `./` values | Already domain independent | Verify install/update at the preview hostname |
| Service worker | Relative registration and same-origin network-first shell | Already domain independent | Verify scope, update and offline shell at preview |
| Email confirmation and password reset return | Browser derives the current origin/path | Already domain independent | Add the accepted hostname to Supabase Auth URL settings (High) |
| Supabase allowed/site URLs | Production dashboard state is outside this repository | Provider dashboard and Owner action required | Review and add exact preview/production URLs without removing rollback URLs (High) |
| MFA recovery origin allowlist | Existing backend allowlist includes the current GitHub hostname | Repository change required | Auth/security review before adding an accepted app hostname (High) |
| Stripe success/cancel and emailed payment links | Payment code/provider behaviour was deliberately not changed in this Medium milestone | Payment review and provider action required | Trace and test exact return/link behaviour before hostname activation (High) |
| Stripe webhook endpoints | Production provider state is outside this repository | Provider dashboard and Owner action required | Review only if the app-domain change affects an endpoint (High) |
| Resend/Auth links and sender | Sender domain is separate; link behaviour depends on approved Auth/application URLs | Provider dashboard review required | Verify generated links after Supabase URL changes (High) |
| Turnstile | Current widget is restricted to the GitHub Pages hostname | New provider configuration and Owner action required | Create/review a separate widget for the final app hostname and activate client/server halves together (High) |
| App public-site links | Optional `TALLYO_PUBLIC_SITE_URL`; hidden when unset | Repository preparation complete | Supply only after the website hostname is accepted |
| Content Security Policy | Uses provider origins, not the current app hostname | Already domain independent | Verify delivered Cloudflare response headers |
| `www` to apex redirect | No live rule exists in this repository | Provider/DNS action required | Configure and verify after the apex custom domain is connected (High) |
| Existing GitHub Pages deployment | Current working production/rollback | Owner approval required to retire | Keep until Cloudflare production acceptance and explicit retirement approval |

## Old URL disposition

Runtime references to `https://edsonlro.github.io/InvoicePro/` are retained where
they are the deliberate rollback/default app destination. Historical evidence,
test fixtures and repository naming are not production-routing defects. Do not
bulk-replace them. Auth, MFA, Turnstile and payment references require their own
high-risk reviews after preview hostnames are known.
