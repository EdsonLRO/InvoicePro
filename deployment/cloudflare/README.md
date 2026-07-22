# Cloudflare Pages readiness

This directory records repository-only deployment preparation. It does not prove
that a Cloudflare project exists and does not authorise provider configuration,
DNS changes or production release.

Cloudflare Pages deployment URLs are public by default. `noindex` reduces search
indexing; it is not access control. Both prepared builds therefore fail in the
Cloudflare build environment until the provider project has Access policies for
the main `pages.dev` hostname and wildcard preview hostnames. Only after both
policies are verified may the non-secret
`TALLYO_CLOUDFLARE_ACCESS_CONFIRMED=true` build variable be set.

## Expected projects

The machine-readable settings are in `pages-projects.json`.

| Project | Root directory | Build command | Output directory |
| --- | --- | --- | --- |
| `tallyo-website` | `website` | `npm run build` | `dist` |
| `tallyo-app` | repository root | `node scripts/build-app-pages.mjs` | `app-dist` |

Use Git integration and the current Cloudflare Pages build system. Do not add a
Wrangler configuration file by hand to an existing project: Cloudflare treats it
as the project configuration source of truth. If a project is created later and
Wrangler configuration is required, download the live project configuration
first and review the diff before committing it.

## Preview variables

Website previews use the default `preview` mode and are therefore `noindex`.
Configure only the final reviewed values when a preview project is approved:

- `TALLYO_SITE_MODE=preview`
- `TALLYO_CANONICAL_ORIGIN=https://tallyo.co.uk`
- `TALLYO_APP_URL`: approved app preview or retained GitHub Pages rollback URL
- `TALLYO_SIGNUP_URL`: approved account-creation destination
- `TALLYO_CLOUDFLARE_ACCESS_CONFIRMED=true`: set only after both required
  Cloudflare Access policies are visibly enabled

The app build deliberately fails without explicit public configuration. Values
must be entered directly in the provider UI; never paste them into issues, PRs,
logs or documentation:

- `TALLYO_SUPABASE_URL`: public HTTPS project URL
- `TALLYO_SUPABASE_PUBLISHABLE_KEY`: browser-publishable key only
- `TALLYO_TURNSTILE_ENABLED`: keep `false` until the matching preview hostname
  and server-side enforcement have been reviewed together
- `TALLYO_TURNSTILE_SITE_KEY`: public site key; required only when enabled
- `TALLYO_STRIPE_LIVE_MODE`: keep `false` for an unapproved preview
- `TALLYO_PUBLIC_SITE_URL`: optional reviewed public-site base URL
- `TALLYO_CLOUDFLARE_ACCESS_CONFIRMED=true`: set only after both required
  Cloudflare Access policies are visibly enabled

The build rejects obvious service-role, secret and private-key values and never
prints supplied values. These controls do not replace provider-side review.

## Preview acceptance

After the Owner approves the GitHub integration and creation of free preview
projects, allow their initial builds to fail closed. Then enable and verify
Cloudflare Access for the main `pages.dev` hostname and wildcard preview
hostnames before setting the access-confirmation variable and retrying a build.
After a successful access-controlled deployment:

1. confirm unauthenticated requests cannot reach either Pages hostname and that
   preview deployments are not indexed;
2. verify website routes, 404 handling, redirects and response headers;
3. verify app refresh, Auth callbacks, PWA install/update and the Help & install
   panel without using real customer data;
4. test 320, 390, tablet, 1280 and large-desktop widths;
5. confirm website-to-app links use the approved preview destination;
6. record the immutable build commit and preview URLs;
7. leave GitHub Pages available as the tested rollback.

## Rollback

Before custom-domain acceptance, rollback means removing or disabling only the
unaccepted Cloudflare preview while leaving the current GitHub Pages deployment
untouched. During a later cutover, DNS and provider changes require a separate,
ordered rollback plan. Never delete GitHub Pages until the Owner accepts the
Cloudflare production deployment and explicitly approves retirement.

HSTS is intentionally absent from the prepared headers. Add it only after final
custom-domain HTTPS and rollback implications are accepted.
