# Tallyo public website

This directory is the independently deployable, static Tallyo marketing website.
It does not import the authenticated application, Supabase configuration, customer
data or private credentials. Its optional GA4 integration is fail-closed and
consent-controlled.

## Local build

```text
npm run build
npm test
```

The dependency-free Node build writes to ignored `dist/` output. Preview is the
default mode and applies `noindex, nofollow` plus a disallow-all `robots.txt`.

Production output must be an explicit, approval-gated build:

```text
TALLYO_SITE_MODE=production npm run build
```

Supported build configuration:

- `TALLYO_SITE_MODE`: `preview` (default) or `production`.
- `TALLYO_CANONICAL_ORIGIN`: canonical website origin; defaults to
  `https://tallyo.co.uk`.
- `TALLYO_APP_URL`: Login destination; defaults to the current GitHub Pages app.
- `TALLYO_SIGNUP_URL`: Create account destination; defaults to `TALLYO_APP_URL`.
- `TALLYO_SUBSCRIPTION_URL`: Tallyo Pro destination; defaults to the Account page
  within `TALLYO_APP_URL`.
- `TALLYO_SUBSCRIPTIONS_ENABLED`: shows the working Tallyo Pro signup action only
  with the matching private-preview or public-release approval variable.
- `TALLYO_PUBLIC_AI_HELPER_ENABLED`: enables the OpenAI-backed public Helper only
  with the matching private-preview or public-release approval variable.
- `TALLYO_CONNECT_PAYMENTS_ENABLED`: publishes customer card-payment availability
  only with `TALLYO_CONNECT_PRIVATE_PREVIEW_APPROVED=true` in preview or
  `TALLYO_CONNECT_PUBLIC_RELEASE_APPROVED=true` in production.
- `TALLYO_GA4_ENABLED`: enables the reviewed GA4 consent controls and conditional
  provider CSP only with the matching preview or public-release approval.
- `TALLYO_GA4_MEASUREMENT_ID`: must exactly equal `G-PZFZKCWZ7M` when Analytics is
  enabled.
- `TALLYO_GA4_PRIVATE_PREVIEW_APPROVED` and
  `TALLYO_GA4_PUBLIC_RELEASE_APPROVED`: explicit fail-closed release gates.
- `TALLYO_GOOGLE_SITE_VERIFICATION`: optional Google Search Console verification
  value, supplied only through the approved deployment environment.
- `TALLYO_BING_SITE_VERIFICATION`: optional Bing Webmaster Tools verification
  value, supplied only through the approved deployment environment.

No real identifiers, secrets or provider credentials belong in these variables.
Repository-only Cloudflare Pages settings, preview variables, rollback and the
domain migration map are documented in `../deployment/cloudflare/`. Creating a
provider project, setting production variables and final domain cutover remain
separate approval-gated actions.

## Search release checklist

After the final domain and public release are approved:

1. connect the final domain and confirm its canonical redirect;
2. verify the domain property in Google Search Console and Bing Webmaster Tools;
3. submit `https://tallyo.co.uk/sitemap.xml`;
4. inspect the homepage, product tour, help centre and free-tool routes;
5. confirm the production build is indexable and the preview build is not;
6. review structured-data reports against the visible FAQ and guide content;
7. check security issues and manual actions in the search tools;
8. monitor search queries and click-through rates without activating unapproved
   tracking.

The planning-only content map in `content/seo-content-map.json` does not authorise
publishing a route. Each topic still needs useful original content, factual review
and the applicable release approval.

## Consent-controlled Analytics candidate

`content/analytics-events.json` is the authoritative event dictionary. The public
website and app scripts permit only eight property-free events. GA4 is disabled by
default. A production build can include its CSP origins only after the exact
release gate is present.

The Google tag is inserted dynamically only after affirmative Analytics consent.
Before consent or after rejection there is no Google tag, Analytics cookie or
Analytics request. The only preference record is a six-month first-party cookie
whose value is `granted` or `denied`. Withdrawal updates Consent Mode, disables
future sends and removes readable GA cookies. Advertising storage, Google Signals,
advertising personalisation, enhanced conversions, user-provided data collection
and Enhanced Measurement remain disabled. See `content/growth-readiness.md`,
`content/storage-inventory.md` and `../docs/legal/GA4_CONSENT_REVIEW.md` before
any activation.
