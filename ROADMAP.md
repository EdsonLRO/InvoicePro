# Tallyo roadmap

## Now

- Review the local Stripe-hosted branding candidate for Tallyo subscription Checkout, the Customer Portal and connected-business invoice payments. Keep Stripe attribution visible, preserve merchant identity for direct-charge invoice payments and require a separate exact approval before saving any live provider setting.
- Operate the native Owner-only Growth Studio inside `app.tallyo.co.uk`, with the Access-protected `growth.tallyo.co.uk` Worker retained only as its discovery feed and rollback surface. Enable guarded weekday feed refreshes after production verification. Keep LinkedIn scraping, social credentials, personal profile/contact data, outreach, publishing and paid advertising outside this milestone.
- Monitor the approved initial UK-business public release across the website, app, Auth, bounded AI Helper, Billing interface and connected-payment interface.
- Keep preview deployments protected by the retained wildcard Cloudflare Access applications.
- Preserve the verified production gates, server-side subscription enforcement and documented rollback routes.
- Preserve the documented separation between Tallyo subscriptions and independent-business customer payments.
- Monitor the released seven-day monthly-plan trial, reminder delivery and trial-to-paid/cancelled lifecycle without inspecting customer content.
- Monitor the released Income insights and local Income Pack using public/build evidence only. Preserve the income-recorded-in-Tallyo, separate-currency and non-tax/non-HMRC boundaries.
- Release and monitor Google sign-in through the approved production gate while preserving MFA, email/password access, recovery, RLS and the fail-closed checked-in configuration. Keep Apple disabled.

## Next

- Prepare Apple sign-in only as a later separate provider release. It requires its own Apple application, Supabase configuration, privacy/provider review, protected acceptance test, exact activation approval and client-secret rotation at least every six months.
- After separate Owner approval, evaluate an official LinkedIn company-page API connection for publishing and aggregate analytics, with credential handling, privacy/legal review, explicit per-post approval, audit history, rate limits and an immediate kill switch.
- Review the first guarded weekday production refresh and continue monitoring candidate quality. Facebook and X remain later channels and require their own provider reviews.
- Any controlled live account-recovery test requires separate approval.
- Review bounded launch monitoring and support evidence without inspecting customer data.
- Evaluate early UK-business onboarding feedback before expanding product scope.
- Add customer statements and improved onboarding. Bounded customer CSV import is already released.
- Implement retention, failed-payment and post-cancellation workflows.

## Later

- Evaluate Helper usage and unanswered public questions without collecting private content.
- Incrementally modularise the authenticated frontend.
- Add team workspaces and accountant collaboration only after tenant and role architecture is verified. Broader reporting beyond the approved income-only plan remains later work.

## Not planned for launch

- Authenticated AI account access, private-record access, tools or autonomous account actions.
- Full bookkeeping, bank reconciliation, payroll or tax filing.
- Native mobile applications.
- Multiple paid tiers, permanent free saved accounts, coupons or lifetime plans.
- Major authenticated-frontend rewrite.
