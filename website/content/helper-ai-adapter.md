# Public Helper AI adapter

## Current state

The Tallyo Helper has a same-origin Cloudflare Pages Function and browser
adapter, but both are disabled by default. The public website continues to use
the deterministic, browser-local knowledge matcher unless a separately reviewed
build explicitly enables the AI adapter.

No live OpenAI request was made while implementing or testing this boundary.
Tests use a local mock transport. The repository does not contain the API key,
and generated browser files do not receive it.

## Request boundary

An enabled browser build may send one question, limited to 240 characters, to
`/api/helper`. The Pages Function independently enforces:

- `POST` with a small JSON body;
- an exact approved HTTPS `Origin`;
- `TALLYO_AI_HELPER_ENABLED=true`;
- an encrypted `OPENAI_API_KEY` server-side secret;
- a configured `AI_HELPER_RATE_LIMITER` binding. On Cloudflare Pages this is a
  service binding to the non-public `tallyo-ai-helper-rate-limiter` Worker,
  which owns the native `RATE_LIMITER` binding;
- deterministic rejection of secrets, credentials, payment information,
  private-account requests, advice requests and internal-prompt requests;
- local answers for exact reviewed questions, avoiding an AI request;
- a short provider timeout and a small output-token limit;
- no account, Supabase, Stripe, Resend, payment or other tools;
- `store: false`;
- reviewed public knowledge embedded server-side rather than accepted from the
  browser;
- strict JSON output and application-side validation;
- no more than three links, each restricted to the reviewed public link
  allowlist;
- a deterministic fallback for provider, parsing, validation or confidence
  failure;
- no prompt or answer logging in application code.

The selected implementation default is `gpt-5.6-terra` at low reasoning effort.
It is a bounded, latency- and cost-sensitive product-guidance role rather than a
flagship-quality reasoning workload. Model choice must be rechecked against
current OpenAI documentation and representative evaluations before activation.

## Browser and visitor experience

The generated helper page declares whether the AI path is enabled. When it is
disabled, no AI endpoint call is attempted and the current browser-local
behaviour remains unchanged. When enabled in a reviewed preview:

- exact reviewed answers and safety boundaries still resolve locally;
- only an unmatched general product question is sent to the same-origin
  endpoint;
- the form exposes an accessible busy state;
- provider failure returns the existing reviewed no-answer response;
- clearing the conversation invalidates an in-flight answer;
- the page explains that the question is sent securely to OpenAI and that
  Tallyo does not save the conversation.

That visitor notice is implementation copy, not final legal publication. The
provider terms, retention position, final public wording and external review
remain release gates.

## Activation remains blocked

Do not activate or publish the AI path until all of the following are separately
reviewed and approved:

1. OpenAI project budget and hard usage alerts/limits.
2. Cloudflare encrypted secret entry.
3. Exact production and preview origin allowlists.
4. A tested `AI_HELPER_RATE_LIMITER` binding and abuse threshold.
5. Representative factuality, refusal, injection and unavailable-provider
   evaluations.
6. Final visitor notice, privacy data flow, retention position and provider
   evidence.
7. Private preview acceptance with synthetic, non-sensitive questions.
8. Owner approval for the paid API call, provider configuration, merge and
   public activation.

The build also fails closed unless `TALLYO_AI_PRIVATE_PREVIEW_APPROVED=true`
accompanies an enabled preview. An enabled production build additionally
requires `TALLYO_AI_PUBLIC_RELEASE_APPROVED=true`. These are release assertions,
not substitutes for the approvals and evidence above.

The adapter must not gain account, invoice, customer, support, payment or
provider tools as part of activation. Any authenticated or tool-using assistant
is a separate high-risk product.

Cloudflare's current Pages documentation lists only a subset of bindings and
does not list the native Rate Limiting binding. The prepared alternative is a
preview-only service binding to a non-public Worker. The Worker receives only a
SHA-256 rate key, fails closed, and has no provider key or question content.
Its proposed threshold and namespace remain unactivated Owner-reviewed values.
