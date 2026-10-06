# Tallyo roadmap

## Now

- Monitor the approved initial UK-business public release across the website, app, Auth, bounded AI Helper, Billing interface and connected-payment interface.
- Keep preview deployments protected by the retained wildcard Cloudflare Access applications.
- Preserve the verified production gates, server-side subscription enforcement and documented rollback routes.
- Preserve the documented separation between Tallyo subscriptions and independent-business customer payments.
- Monitor the released seven-day monthly-plan trial, reminder delivery and trial-to-paid/cancelled lifecycle without inspecting customer content.

## Next

- Any controlled live account-recovery test requires separate approval.
- Review bounded launch monitoring and support evidence without inspecting customer data.
- Evaluate early UK-business onboarding feedback before expanding product scope.
- Complete the approved Income insights Phase 6 release candidate. Phases 0-5 are Owner-approved; Phase 6 hardening is in progress on build `2026.10.06.1`. The checked-in feature gate remains disabled until the exact candidate receives separate merge and production-publication approval. Expenses, bank feeds, profit, tax calculation and HMRC submission remain excluded.
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
