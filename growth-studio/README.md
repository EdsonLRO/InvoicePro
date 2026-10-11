# Tallyo Growth Studio

An owner-facing, draft-first workspace for planning Tallyo's organic social growth. The first milestone provides a functional LinkedIn content and audience-planning workflow using Tallyo's existing brand assets.

## Safety boundary

This milestone does not connect to LinkedIn or any other social platform. It does not store credentials or personal profile data, scrape people, send messages or connection requests, react to content, publish posts, buy ads, or alter production systems. Approval and scheduling are local planning states only.

Facebook and X are represented as future channels so the information architecture can expand without redesigning the product.

## Run locally

```powershell
npm run verify
npm run dev
```

Open `http://127.0.0.1:4397`. The app uses browser local storage for demo preferences and draft changes.

## Architecture

- `src/` contains a dependency-free HTML/CSS/JavaScript application.
- `scripts/build.mjs` creates a static `dist/` directory and copies only approved Tallyo assets from the main website.
- `tests/` enforces the draft-only channel capabilities, content guardrails, CSP, and build output.

Any future platform connection requires an approved API integration, owner-provided credentials, privacy/legal review, and a separate production release decision.
