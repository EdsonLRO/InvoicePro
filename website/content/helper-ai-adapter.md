# Future public-helper AI adapter

The current Tallyo Helper is deterministic and browser-local. The exported future
adapter in `src/helper-core.mjs` is disabled and throws if called.

Activating any AI-backed adapter is a separate reviewed task. It requires:

- server-side secrets only;
- an allowlist containing public website knowledge only;
- prompt-injection and output-boundary controls;
- response, rate and abuse limits;
- hard spending limits;
- privacy-minimised logs with an approved retention period;
- no account, invoice, customer, support, payment or provider tools;
- citations restricted to reviewed public Tallyo pages;
- deterministic fallback when the provider is unavailable or uncertain;
- independent security, privacy and content review before activation.

Do not select a paid provider, add an endpoint, place a key in browser code or
send visitor prompts to a third party as part of the deterministic helper.
