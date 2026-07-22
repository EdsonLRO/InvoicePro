# Tallyo public website

This directory is the independently deployable, static Tallyo marketing website.
It does not import the authenticated application, Supabase configuration, customer
data, analytics providers or private credentials.

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
- `TALLYO_GOOGLE_SITE_VERIFICATION`: optional Google Search Console verification
  value, supplied only through the approved deployment environment.
- `TALLYO_BING_SITE_VERIFICATION`: optional Bing Webmaster Tools verification
  value, supplied only through the approved deployment environment.

No real identifiers, secrets or provider credentials belong in these variables.
Cloudflare Pages configuration and final domain cutover are handled in later,
approval-gated milestones.

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
