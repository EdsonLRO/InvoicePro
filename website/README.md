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

No real identifiers, secrets or provider credentials belong in these variables.
Cloudflare Pages configuration and final domain cutover are handled in later,
approval-gated milestones.
