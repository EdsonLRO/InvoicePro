# Tallyo decisions

| Decision | Status | Rationale |
|---|---|---|
| Free Invoice Maker remains free without an account | Approved | Provides useful acquisition value without subsidising saved workspaces. |
| Tallyo has one paid plan at launch | Approved | Avoids artificial complexity before usage evidence exists. |
| Monthly price is £8 | Approved | Fits the focused UK invoicing position. |
| Annual price is £80 | Approved | Saves £16 versus twelve monthly payments without “free month” language. |
| No full-feature free trial | Approved | Reduces repeated-email trial abuse; the free maker and monthly plan provide evaluation routes. |
| No permanent free saved account at launch | Approved | Keeps ongoing storage, automation and support within the paid product. |
| No lifetime deal | Approved | Infrastructure and support costs continue. |
| One business and one user | Approved | Matches the current verified implementation. |
| Teams are deferred | Approved | Multi-user workspace and role isolation are not implemented. |
| OpenAI public product Helper implementation | Approved | The bounded public-information Helper is built and privately tested; preserve the work. |
| Public AI Helper repository merge | Approved and merged | PR #91 merged the capability while keeping it disabled by default. |
| Public AI Helper production activation | Pending | Requires separate notice, provider budget, configuration and release approval. |
| Deterministic Helper | Retained | Provides a no-cost, privacy-minimised fallback. |
| Authenticated AI access | Deferred | No approved private-data architecture or market evidence. |
| AI tools and autonomous account actions | Not planned for launch | The public Helper remains informational and bounded. |
| Stripe Billing and Stripe Connect are separate systems | Approved | Software subscriptions and customer invoice payments have different merchants, data and risks. |
| No additional Tallyo percentage payment fee at initial Connect launch | Approved direction | Keeps the initial commercial model simple; Stripe processing fees remain separate. |
| Stripe Connect launch model | Approved | The Owner approved Accounts v2 Merchant connected accounts, direct charges, the connected business as merchant of record, Stripe-collected fees and losses, full Dashboard access when supported, Stripe-hosted onboarding and no initial Tallyo application fee. Provider activation remains separately gated. |
| Disabled commercial provider foundation deployment | Approved and completed | After a current physical-backup check, the Owner approved applying the additive Billing/Connect migrations and deploying only the seven new fail-closed functions. No Stripe configuration, secret, resource, transaction, existing live-function redeployment or public activation occurred. |
| Manual privacy-request and account-deletion launch model | Approved working launch scope | Initial public launch uses verified requests to `privacy@tallyo.co.uk`, manual review, deletion or anonymisation when no longer necessary, documented lawful-retention exceptions and provider backup cycles. No self-service closure, 30-day closure promise, deletion migration, destructive purge or scheduled retention job is required before launch. Publication remains separately gated. |
| Privacy launch document content, operating decisions and publication | Approved for focused publication | On 28 July 2026 the Owner approved the reconciled Privacy Notice, retention schedule, Article 28 Business-User Data Processing Terms, provider-register structure, public identity/address, UK-business-only launch, Google Workspace record system, mailbox ownership/cadence and proceeding without professional legal review at this stage. Focused launch-scope provider evidence is complete for Supabase, Resend, Stripe, Cloudflare, GitHub, OpenAI and Google Workspace. The Owner then separately approved customer-facing publication of the Privacy Notice and Data Processing Terms plus the related privacy links. This does not approve unrestricted public launch, public AI, analytics/marketing or unrelated product/provider changes. |
| No full authenticated-app rewrite before launch | Approved | A major rewrite is unnecessary and increases risk before market validation. |
