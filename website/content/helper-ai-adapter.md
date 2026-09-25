# Public Helper AI adapter

## Current state

The Tallyo Helper has a same-origin Cloudflare Pages Function and browser
adapter. Source remains disabled by default, while the public production website
explicitly enables the reviewed AI path through its approved Cloudflare
configuration. The deterministic browser-local matcher remains first in the
request path and continues to answer exact reviewed questions without an AI
request. Greetings, thanks and simple goodbyes also resolve locally with a
natural conversational reply, so they do not consume a provider request or
appear as failed product searches.

The reviewed catalogue now covers 44 current product and workflow topics. For
an unmatched question, the server selects the most relevant reviewed entries by
local keyword scoring and supplies only that bounded context to OpenAI. The
model can paraphrase and combine those entries, but still must return
`answered=false` when they do not support an answer.

On 27 July 2026, one Owner-approved synthetic question was sent from the
canonical Access-protected website to OpenAI. The Helper returned a bounded
Tallyo-specific answer from the reviewed public guidance, and the OpenAI usage
dashboard attributed exactly one Responses request for that UTC date. The
repository does not contain the API key, generated browser files do not receive
it, and application code uses `store: false`.

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
  browser, with local relevance selection before the provider request;
- strict JSON output and application-side validation;
- no more than three links, each restricted to the reviewed public link
  allowlist;
- a deterministic no-answer response for insufficient reviewed guidance and
  distinct visitor messages for rate limiting or temporary service failure;
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
- greetings and simple acknowledgements receive a warm local reply;
- only an unmatched general product question is sent to the same-origin
  endpoint;
- the form exposes an accessible busy state;
- insufficient guidance, rate limiting and temporary provider failure remain
  visibly distinct without exposing provider detail, using helpful visitor
  language rather than provider or policy terminology;
- clearing the conversation invalidates an in-flight answer;
- the page explains that the question is sent securely to OpenAI and that
  Tallyo does not save the conversation.

The published Privacy Notice remains authoritative for the provider and
retention position. The Helper copy must continue to state that the current
question may be sent to OpenAI, the conversation is not intentionally saved by
Tallyo, and the Helper has no account access or tools.

## Current production gate

Public activation was completed under exact Owner approval after the encrypted
secret, service-bound rate limiter, exact public-domain origins, hard monthly
budget and alerts, public notice/provider evidence and representative bounded
evaluations were verified. Those controls remain release invariants.

The build also fails closed unless `TALLYO_AI_PRIVATE_PREVIEW_APPROVED=true`
accompanies an enabled preview. An enabled production build additionally
requires `TALLYO_AI_PUBLIC_RELEASE_APPROVED=true`. These are release assertions,
not substitutes for the approvals and evidence above.

The adapter must not gain account, invoice, customer, support, payment or
provider tools as part of activation. Any authenticated or tool-using assistant
is a separate high-risk product.

The production Pages Function reaches a non-public Worker through a service
binding. That Worker receives only a SHA-256 rate key, fails closed, and has no
provider key or question content. Its native rate limit remains three provider
requests per connection key per minute.
