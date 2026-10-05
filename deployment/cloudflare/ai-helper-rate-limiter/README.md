# AI Helper rate-limiter Worker

This is the active private rate-limiter Worker for the public Tallyo Helper.
It is deployed without a public route and receives only a derived SHA-256 rate
key from the website's same-origin Pages Function.

Cloudflare Pages supports only a subset of bindings and does not currently
support the native Rate Limiting binding directly. The reviewed design is:

```text
Pages Function /api/helper
  -> service binding AI_HELPER_RATE_LIMITER
  -> private tallyo-ai-helper-rate-limiter Worker
  -> native RATE_LIMITER binding
```

The Worker accepts only an internal `POST /limit` request containing one
64-character SHA-256 rate key. It returns `204` when allowed, `429` when
limited, and fails closed for every malformed or unavailable state. It has no
OpenAI key, visitor question, account access, tools or logging.

`wrangler.example.jsonc` is the reviewed production configuration. Its
historical filename is retained because the provider deploy command already
uses it. It disables `workers.dev`, preview URLs and observability and allows
three unmatched AI questions per 60 seconds for each derived key, matching the
OpenAI project's current `gpt-5.6-terra` request limit. `package.json` pins the
verified Wrangler release used by automated builds.
Cloudflare documents the native limiter as local to a Cloudflare location and
eventually consistent, so it is an abuse layer rather than a hard global budget
cap. OpenAI project budgets and usage alerts remain separately required.

## Automated build

Cloudflare Workers Builds watches `main` with these production settings:

- root directory: `/deployment/cloudflare/ai-helper-rate-limiter/`;
- build command: `node --check src/index.mjs`;
- deploy command: `npx wrangler deploy --config wrangler.example.jsonc`;
- included paths: `deployment/cloudflare/ai-helper-rate-limiter/*`;
- previews disabled.

On 5 October 2026 build `d0aa82f2-7270-4418-bbb0-43326de0de55`
successfully deployed version `abe523bb-f033-4414-8f48-4ce87e471b98` at 100%
after the stale deleted-branch checkout was removed from the build settings.
The rate-limit binding, Worker source and runtime behaviour were unchanged.

Run `pnpm install --frozen-lockfile` and `pnpm run check` from this directory
before changing the Worker. A provider deployment, binding change, public
route, observability change or live Helper request remains separately
approval-gated.

Rollback retains the previous identical Worker deployment
`6854fa31-58cc-49d0-8e2c-7a0130bc772f` / version
`40d6a5d2-e5cb-4e9e-ba14-127773b88203`. Disabling the AI release gates keeps
the deterministic Helper available if the service-bound limiter is unavailable.
