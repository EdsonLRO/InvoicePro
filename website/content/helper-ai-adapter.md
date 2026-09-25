# Public Helper AI adapter

## Current state

The Tallyo Helper has a same-origin Cloudflare Pages Function and browser
adapter. Source remains disabled by default, while the public production website
explicitly enables the reviewed AI path through its approved Cloudflare
configuration. The deterministic browser-local matcher remains as an offline
and provider-failure fallback. In an enabled build, every safe conversational
turn goes to the same-origin AI endpoint so the assistant can understand
ordinary wording, spelling mistakes and follow-up questions instead of
behaving like a search box.

The model may use its general conversational ability to understand intent,
maintain context and explain ordinary concepts naturally. The reviewed Tallyo
catalogue remains the sole source for claims about Tallyo features, behaviour,
availability, prices and policies. This distinction lets the Helper converse
normally without inventing product facts.

Follow-up understanding is semantic rather than phrase-based. Short or
incomplete questions, pronouns, reactions, clarification requests, requests for
suggestions and next-step questions are interpreted from recent turns regardless
of exact wording, grammar or spelling. When recent context still leaves a real
ambiguity, the Helper asks one conversational clarifying question.

The reviewed catalogue now covers 44 current product and workflow topics. For
each question, the server selects the most relevant reviewed entries using the
current message and recent user turns, then supplies only that bounded context
to OpenAI. The model can paraphrase and combine those entries, but still must
return `answered=false` when they do not support an answer.

On 27 July 2026, one Owner-approved synthetic question was sent from the
canonical Access-protected website to OpenAI. The Helper returned a bounded
Tallyo-specific answer from the reviewed public guidance, and the OpenAI usage
dashboard attributed exactly one Responses request for that UTC date. The
repository does not contain the API key, generated browser files do not receive
it, and application code uses `store: false`.

## Request boundary

An enabled browser build may send one current message, limited to 240
characters, plus up to three recent user-and-assistant exchanges from the same
open page to `/api/helper`. The Pages Function independently enforces:

- `POST` with a small JSON body;
- an exact approved HTTPS `Origin`;
- `TALLYO_AI_HELPER_ENABLED=true`;
- an encrypted `OPENAI_API_KEY` server-side secret;
- a configured `AI_HELPER_RATE_LIMITER` binding. On Cloudflare Pages this is a
  service binding to the non-public `tallyo-ai-helper-rate-limiter` Worker,
  which owns the native `RATE_LIMITER` binding;
- deterministic rejection of secrets, credentials, payment information,
  private-account requests, advice requests and internal-prompt requests;
- strict role, order, length and body-shape validation for recent turns;
- independent safety checks for the current message and every recent user turn;
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

- safety boundaries still resolve locally and never reach the provider;
- every safe turn is sent to the same-origin endpoint so greetings, natural
  questions and follow-ups share the same conversational path;
- up to three completed exchanges are held only in page memory and accompany
  the next safe message;
- the form exposes an accessible busy state;
- insufficient guidance, rate limiting and temporary provider failure remain
  visibly distinct without exposing provider detail, using helpful visitor
  language rather than provider or policy terminology;
- clearing the conversation invalidates an in-flight answer and clears recent
  page memory;
- the page explains that the current message and a small recent part of the
  conversation are sent securely to OpenAI and are not intentionally stored by
  Tallyo.

The published Privacy Notice remains authoritative for the provider and
retention position. The Helper copy must continue to state that the current
message and up to three recent exchanges may be sent to OpenAI, the conversation
is not intentionally stored by Tallyo, and the Helper has no account access or
tools.

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
