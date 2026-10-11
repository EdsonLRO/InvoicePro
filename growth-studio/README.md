# Tallyo Growth Studio

An owner-facing, draft-first workspace for planning Tallyo's organic social growth. The first milestone provides automated public-business discovery plus a functional LinkedIn content and audience-planning workflow using Tallyo's existing brand assets.

## Safety boundary

This milestone does not connect to LinkedIn or any other social platform. It does not store credentials or personal profile data, scrape people, send messages or connection requests, react to content, publish posts, buy ads, or alter production systems. Content approval and publishing remain local planning states only.

The Discovery Agent searches public business sources on a weekday schedule, records evidence-backed company candidates without personal contact details, and writes the latest result to ignored local runtime data. The UI reads that feed from the local server. Search sources, evidence URLs, scores, and reasons remain visible for review.

Facebook and X are represented as future channels so the information architecture can expand without redesigning the product.

## Run locally

```powershell
npm run verify
npm run dev
```

Open `http://127.0.0.1:4397`. The app uses browser local storage for demo preferences and draft changes.

## Private deployment

The production build is deployed as a Cloudflare Worker with Static Assets. `workers_dev` and preview URLs are disabled so a deployment has no public Worker hostname. The only configured route is `https://growth.tallyo.co.uk/`, protected by a Cloudflare Access self-hosted application and an exact-email Owner allow policy created before the custom domain was attached.

```powershell
npm run deploy:dry-run
npm run deploy
```

The build uses `runtime/discovery.json` when the scheduled Discovery Agent has produced a current validated snapshot, otherwise it falls back to `src/discovery.json`. Browser planning state remains local to the browser in this release; no social credentials or customer data are stored by the Worker.

The weekday production refresh runs from a dedicated detached worktree at the exact `origin/main` commit. `npm run deploy:scheduled` refuses to deploy with tracked changes, a non-production commit, an invalid feed, duplicate candidate IDs, unknown fields, non-HTTPS evidence, or an empty candidate list. This keeps research data refreshes independent from in-progress source branches and prevents personal contact fields from entering the production asset bundle.

## Architecture

- `src/` contains a dependency-free HTML/CSS/JavaScript application.
- `scripts/build.mjs` creates a static `dist/` directory and copies only approved Tallyo assets from the main website.
- `runtime/discovery.json` is ignored local data maintained by the scheduled Discovery Agent.
- `scripts/validate-runtime.mjs` enforces the clean-production-checkout and discovery-data boundary before any scheduled deployment.
- `wrangler.jsonc` disables public Worker and preview hostnames, records the Access-protected custom domain, and packages only the built static assets.
- `tests/` enforces the draft-only channel capabilities, public-source discovery boundary, content guardrails, CSP, and build output.

Any future platform connection requires an approved API integration, owner-provided credentials, privacy/legal review, and a separate production release decision.
