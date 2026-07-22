# Remaining Owner actions — approve separately

These are independent gates. Approval for one does not approve any later gate.
Codex must state the exact scope and use Sol High before beginning actions marked
High. Do not place passwords, tokens, keys, private emails, customer data or
payment details in chat or repository evidence.

1. **Review and merge the stacked repository PRs.** Review PRs #76 onward in
   order. Public marketing/security wording and the release sequence remain
   Owner-gated. Merging is not permission to deploy.
2. **Free document generator (High).** Approve a Sol High implementation/review
   covering subtotal, discount, tax/VAT, shipping, rounding, totals, printable
   invoice/quote content and tests. This is not yet implemented.
3. **Private first-use guidance (High).** Decide whether to add onboarding that
   reads company/customer/document state. It must preserve tenant isolation and
   avoid analytics disclosure.
4. **Connect GitHub and create fail-closed Cloudflare preview projects (High
   provider and authorization action).** Separately approve the Cloudflare
   GitHub app with access limited to `EdsonLRO/InvoicePro`, then approve
   `tallyo-website` and `tallyo-app` using the exact build settings in
   `pages-projects.json`. Initial Cloudflare builds must remain blocked until
   Access protects both the main and wildcard preview `pages.dev` hostnames. Do
   not connect custom domains, enable a paid plan or treat `noindex` as access
   control.
5. **Enable Access and enter preview deployment variables (High configuration
   action).** Protect both the main and wildcard preview `pages.dev` hostnames,
   verify unauthenticated access is blocked, and only then set
   `TALLYO_CLOUDFLARE_ACCESS_CONFIRMED=true`. Enter browser-publishable values
   directly in Cloudflare without exposing them to Codex. Keep live Stripe and
   Turnstile disabled until their separate reviews.
6. **Run and accept previews.** Record immutable commits/URLs and complete
   `preview-acceptance.md` with fictional data and a synthetic account.
7. **Supabase Auth and MFA migration (High).** Review accepted preview/production
   origins, add exact allowed/redirect URLs, update the MFA recovery allowlist,
   preserve rollback URLs and run focused Auth/MFA tests.
8. **Turnstile hostname migration (High).** Create or approve a widget restricted
   to the accepted app hostname, enter its secret privately, activate client and
   server enforcement in the safe order, and test rollback.
9. **Stripe and email-link migration (High).** Verify Checkout success/cancel,
   emailed payment links, refunds, webhooks and Resend/Auth links against the
   accepted hostname. Change only confirmed dependencies and run a separately
   approved bounded live test if needed.
10. **Approve public content.** Separately decide final pricing, legal documents,
    public support contact and business identity. Do not infer approval from the
    technical preview.
11. **Connect custom domains and DNS (High).** Approve `tallyo.co.uk`, the
    `www` redirect and `app.tallyo.co.uk` one at a time, with an exact reverse
    rollback plan. Retain GitHub Pages.
12. **Final production release (High).** Approve the exact commits/builds after
    production acceptance. This does not automatically approve tracking or ads.
13. **Retire GitHub Pages (irreversible operational action).** Consider only
    after a stable Cloudflare acceptance period; requires a separate explicit
    approval.
14. **Tracking and growth activation.** Choose providers and approve consent,
    analytics, Search Console/Bing verification or paid advertising separately.
    Current analytics and advertising remain disabled.
