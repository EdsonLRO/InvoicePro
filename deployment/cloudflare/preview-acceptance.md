# Cloudflare preview acceptance record

Status: **Access-protected deployments created — authenticated acceptance pending.**

This record must not be marked accepted from local builds alone. Complete it only
after the relevant feature PRs are reviewed, the Owner separately approves the
provider actions, and immutable preview deployments exist. Use fictional data and
a dedicated synthetic account; never record credentials, tokens, private email
addresses, customer data or payment details here.

`noindex` is not a privacy control. Cloudflare Pages URLs are public by default,
so an accepted private preview must prove that Cloudflare Access protects both
the main project hostname and wildcard branch-preview hostnames before either
build is allowed to succeed.

## Deployment identity

| Item | Evidence |
| --- | --- |
| Website preview URL | `https://f7d12c7b.tallyo-website.pages.dev` |
| Website commit | `9fc3f9063527057aa04b9c4544290b0095fc043e` |
| App preview URL | `https://e8ac6e50.tallyo-app.pages.dev` |
| App commit/build | `9fc3f9063527057aa04b9c4544290b0095fc043e` / `2026.07.22.2` |
| Cloudflare project names | Created `tallyo-website` and `tallyo-app` |
| Initial production builds | Both blocked by the reviewed Access guard; the separately approved one-time retries then succeeded |
| Wildcard preview Access | Owner policy enabled on both projects; unauthenticated requests still redirected to Cloudflare Access sign-in after deployment |
| Main `pages.dev` Access | Owner policy enabled on both projects; unauthenticated requests still redirected to Cloudflare Access sign-in after deployment |
| GitHub Pages rollback | Retained |

## Website preview

- [x] An unauthenticated request is redirected to Cloudflare Access on the main
  and wildcard preview hostnames after deployment.
- [x] HTTPS is valid and the immutable preview hostname is recorded.
- [ ] Homepage, Features, Product Tour, Pricing, Security, Help, FAQ, About,
  industry pages and real 404 routes render correctly.
- [ ] Helper answers reviewed public-product questions and refuses private,
  sensitive, advice-seeking and internal-prompt requests.
- [ ] Response headers include the generated CSP and preview `X-Robots-Tag`.
- [ ] `robots.txt` disallows crawling and every page is `noindex`.
- [ ] Canonicals remain the intended production website origin and exclude
  campaign parameters.
- [ ] No provider script, analytics transport, cookie banner, Supabase client,
  secret, private data or fake proof appears.
- [ ] Layout, navigation, keyboard interaction and visible focus pass at 320,
  390, tablet, 1280 and large-desktop widths.
- [ ] Website Login/Create account links use the approved preview destination.

The free invoice/quote generator is not part of the current Medium stack. Its
financial calculations and printable document rules require Sol High review
before implementation and preview acceptance.

## App preview

- [x] An unauthenticated request is redirected to Cloudflare Access on the main
  and wildcard preview hostnames after deployment.
- [ ] App root and refresh fallback render the same reviewed build.
- [ ] Delivered headers include CSP, frame denial and preview noindex policy.
- [ ] The generated public configuration contains only approved browser-safe
  values; no value is copied into this evidence record.
- [ ] Sign-in, confirmation/reset callbacks and sign-out are tested with a
  synthetic account after the separate Auth configuration review.
- [ ] Existing MFA and recovery boundaries remain intact after the separate
  Auth/MFA review.
- [ ] PWA manifest, scope, install, update and network-first shell work on the
  preview hostname.
- [ ] Help & install opens, closes by button/overlay/Escape, restores focus and
  shows correct iOS, Android or desktop guidance.
- [ ] No real customer, invoice, private account or live payment data is used.
- [ ] Stripe, Turnstile and email-link behaviour are tested only after their
  individually approved High-risk provider/configuration stages.

## Rollback acceptance

- [x] Current GitHub Pages app remains operational on build `2026.07.22.2`.
- [ ] Removing an unaccepted Cloudflare preview does not affect GitHub Pages.
- [ ] No custom-domain DNS points to the preview during acceptance.
- [ ] No production Auth, payment, email or CAPTCHA URL is removed.
- [ ] The exact production cutover and reverse-order rollback are reviewed before
  any DNS change.

## Decision

Preview accepted by Owner: **Pending**

Accepted commits: **Pending**

Accepted preview URLs: **Pending**

Residual risks acknowledged: **Pending**

Acceptance of a preview is not approval for custom-domain DNS, public launch,
legal publication, tracking activation, paid advertising or retirement of the
GitHub Pages rollback.
