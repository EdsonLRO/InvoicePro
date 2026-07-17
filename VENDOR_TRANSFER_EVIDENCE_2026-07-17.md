# Tallyo Vendor And Transfer Evidence - 2026-07-17

Internal evidence register for `LEGAL-OPS-001`. Sources were checked on 2026-07-17. This is contract and transfer issue-spotting, not legal advice, acceptance of provider terms, a transfer-risk conclusion, or evidence of compliance.

No dashboard secrets, provider payloads, customer data, payment details, or private account information were inspected. Provider statements are recorded as provider claims and must not be presented as Tallyo certifications.

## Supabase

**Implemented use:** Auth, Postgres, Edge Functions, Vault/cron support, and managed backups. The existing project is documented as `eu-west-2` (London). Workspace and account data are intended to remain tenant-isolated through Auth, AAL controls, RLS, and privileged server-side functions.

**Current official evidence:**

- [Data Processing Addendum, version dated 1 June 2026](https://supabase.com/downloads/docs/Supabase%2BDPA%2B260601.pdf): Supabase describes itself as processor/service provider, or subprocessor where its customer is a processor. It states that data directed to a specific region is stored and primarily processed there, while allowing processing where Supabase or subprocessors maintain facilities subject to the DPA.
- The DPA includes SCC provisions and the ICO-approved UK Addendum route; it names Supabase Pte. Ltd in Singapore as importer for the described transfers.
- The DPA provides at least 30 days' notice of proposed subprocessor changes, with a five-day objection window; reasonable rights-request assistance; written security-incident notice without undue delay and, where feasible, within 48 hours; and deletion after a 30-day post-termination return period, subject to its terms.
- Schedule 3 lists subprocessors and purposes. The live list still requires a review/notification owner rather than a one-time snapshot.
- [Regions](https://supabase.com/docs/guides/platform/regions), [Backups](https://supabase.com/docs/guides/platform/backups), and [project deletion](https://supabase.com/docs/guides/platform/delete-project) document product behaviour. The current technical evidence records daily Pro backups and a seven-day operational window; deleting a project is irreversible and is not an approved privacy-operation shortcut.
- The [breaking-change changelog](https://supabase.com/changelog?tags=breaking-change) was checked as required by the Supabase specialist policy. No listed 2026 change altered this evidence-only review; future implementation must be checked again against the affected feature.

**Open before launch:** confirm the DPA is actually incorporated for the account and completed with accurate controller/processor facts; complete the UK transfer assessment; establish subprocessor-change monitoring; document active-record, Auth-user, provider-log, Edge Function log, backup, and account-termination deletion behaviour; record incident and rights-assistance contacts; externally review the customer-controller/Tallyo-processor/Supabase-subprocessor chain.

## Resend

**Implemented use:** transactional document, reminder, and security-notice email through server-side Edge Functions, with signed webhook delivery tracking. Message content, attachments, recipient addresses, and delivery metadata can contain personal data.

**Current official evidence:**

- [Data Processing Addendum](https://resend.com/legal/dpa): Resend identifies Plus Five Five, Inc. as processor where the customer may be controller or processor; incorporates EU SCCs and the UK Addendum for relevant transfers; provides subprocessor terms, rights assistance, and breach notice without undue delay. It states customer/user data is deleted within 90 days of account termination, subject to legal exceptions, and that deletion certification is available on request under the stated conditions.
- [Subprocessor list](https://resend.com/legal/subprocessors), last updated 15 July 2026, lists US-based hosting, sending, security, analytics, support, AI, administration, and infrastructure providers. Listing does not by itself prove which Tallyo message fields each provider receives.
- [Email dashboard documentation](https://resend.com/docs/dashboard/emails/introduction) shows that the dashboard can display email details and logs, create unauthenticated public share links lasting up to 48 hours, and export email/log data. Operational policy must prohibit public share links for Tallyo customer or security email and restrict exports to an approved case purpose and secure store.

**Open before launch:** obtain qualified advice on the UK transfer route and the July 2026 subprocessor list; clarify the processing scope for AI/analytics/support subprocessors where material; approve message/delivery/suppression retention; verify account-level deletion and assistance paths with synthetic data; restrict provider-dashboard roles; prohibit public share links; document secure export and deletion evidence; monitor changes.

## Stripe

**Implemented use:** sandbox Checkout, webhook-confirmed invoice payments, seller-approved deposits, refunds, failures, and disputes. Card data remains with Stripe Checkout. Live mode is disabled.

**Current official evidence:**

- [Data Processing Agreement](https://stripe.com/legal/dpa): Stripe describes activity-specific processor and controller roles. It may act as controller for regulated services, fraud/loss prevention, legal and financial-provider obligations, and service improvement, while providing processor duties and rights assistance for other processing.
- The DPA says the business user is responsible for accurate privacy notices and necessary rights/permissions. It identifies transfers to Stripe, LLC in the United States and global transfers to affiliates and subprocessors.
- [Data Transfers Addendum](https://stripe.com/legal/dta) provides the contractual transfer framework, including UK mechanisms where applicable.
- [Service providers, subprocessors and affiliates](https://stripe.com/legal/service-providers) describes provider categories, countries, and purposes. Applicability depends on the Stripe services and account configuration actually used.
- The DPA provides for return/deletion after termination at the user's choice, subject to Stripe's contractual, legal, regulatory, fraud, dispute, and other permitted retention needs; it does not establish Tallyo's retention period.

**Open before launch/live mode:** confirm the contracting Stripe entity, account country, exact enabled services, and incorporated agreement; complete role and transfer review; approve notice wording and Tallyo/provider retention; document customer/payment rights routing, refund and dispute evidence, incident contacts, deletion/closure behaviour, and identity-verification boundaries; complete Stripe production readiness and obtain the existing separate Owner approval for live keys, webhooks, and real-money testing.

## GitHub Pages

**Implemented use:** public static hosting. No workspace/customer database is intentionally stored in Pages, but GitHub can receive ordinary request, device, cookie, and usage metadata from visitors.

**Current official evidence:**

- [GitHub Pages limits and terms](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) states Pages use is subject to GitHub's Terms of Service.
- [GitHub General Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) describes website usage logging, cookies/technologies, global processing, general retention criteria, security, and data-subject contacts.
- [GitHub Data Protection Agreement](https://github.com/customer-terms/github-data-protection-agreement) applies to Online Services under a written GitHub Customer Agreement. The [GitHub subprocessor list](https://docs.github.com/en/site-policy/privacy-policies/github-subprocessors) expressly describes services governed by that DPA for Enterprise customers.

**Evidence limitation:** the current public/free Pages arrangement has not been shown to be governed by an executed GitHub Customer Agreement or the Enterprise DPA. Therefore the Enterprise DPA/subprocessor terms must not be treated as accepted protection for this deployment.

**Open before launch:** obtain a documented answer on the applicable Pages terms, provider role, visitor-log/cookie scope, retention, transfer mechanism, rights/incident route, custom-domain and response-header constraints; decide whether Pages is an acceptable real-customer host or whether migration to a contractually suitable host is required. A hosting migration, custom domain, Auth URL change, or paid plan requires a separate scoped task and approvals.

## Cloudflare Turnstile

Turnstile remains selected but inactive. `CLOUDFLARE_TURNSTILE_VENDOR_REVIEW_2026-07-15.md` is the current evidence record. The repository site key is blank, the secret is not stored by Tallyo, and Supabase enforcement is off. Product-specific retention, transfer-risk conclusions, final notice/PECR wording, final hostname, a separate production widget, and separate Owner activation approval remain open.

## Cross-Vendor Operating Requirements

1. Maintain a dated contract/DPA/subprocessor/transfer record for the exact account tier and service scope.
2. Subscribe a controlled role account to provider change notices and review changes before their objection windows expire.
3. Keep provider-dashboard access least-privileged and MFA-protected; review access periodically and after role changes.
4. Never copy provider payloads, message bodies, exports, secrets, identity documents, or payment details into Git, ordinary chat, or unrestricted tickets.
5. For rights, deletion, incident, and closure work, use the approved restricted case system and record references rather than raw data.
6. Test provider assistance, export, correction where available, deletion, closure, and incident routes using synthetic data before real-customer processing.
7. Treat region selection as one control, not proof that all support, telemetry, subprocessors, and onward processing remain in that region.
8. Re-open review after a provider, region, account tier, purpose, data category, integration, custom domain, or legal-transfer mechanism changes.

## Disposition

`Evidence collected; legal acceptance pending.` None of these provider records authorizes real-customer processing or removes the need for an activity-specific role, transfer, retention, and contract decision.
