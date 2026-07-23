# AI Helper rate-limiter Worker

This is repository-only preparation for the Tallyo public Helper. It has not
been deployed, does not authorise provider changes and does not enable AI.

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

`wrangler.example.jsonc` is a reviewed proposal rather than active provider
configuration. It disables `workers.dev`, preview URLs and observability and
proposes five unmatched AI questions per 60 seconds for each derived key.
Cloudflare documents the native limiter as local to a Cloudflare location and
eventually consistent, so it is an abuse layer rather than a hard global budget
cap. OpenAI project budgets and usage alerts remain separately required.

Before any provider action:

1. verify that namespace `2026072301` is unused in the account;
2. review the five-per-minute preview threshold;
3. deploy the Worker without a public route using a current Wrangler version;
4. add a preview-only Pages service binding named
   `AI_HELPER_RATE_LIMITER` pointing to the Worker;
5. validate `204`, `429` and fail-closed behaviour with synthetic requests;
6. record the previous provider state and rollback;
7. obtain separate Owner approval before secret entry, a paid OpenAI request,
   public activation, merge or production release.

Rollback removes the preview Pages service binding and disables the preview AI
build/runtime switches. The deterministic Helper remains available.
