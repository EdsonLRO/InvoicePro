# UX-001 - Mobile invoice and PDF usability

Task ID: UX-001

Title: Correct mobile invoice actions, PDF download/pagination and default routing

Priority: High user impact

Status: Local implementation and focused validation complete - publication pending

Owner role: Master Orchestrator

Assigned specialists: Frontend and QA

Model/work mode: Medium

Risk level: Medium - responsive UI, browser download behaviour, client-side PDF layout and ordinary routing

Objective: Keep mobile invoice-list actions readable, download PDFs without navigating away from My Invoices, keep totals together, repeat the line-item header on continuation pages, and open authenticated sessions on Dashboard when no explicit route was requested.

Affected files: `index.html`, `service-worker.js`, a focused regression harness, and this task record

Files or paths locked: `index.html`, `service-worker.js`, the focused UX-001 regression harness, and this task record

Lock acquired: 2026-07-23 by the Master Orchestrator after the frozen AUTH-003 implementation transferred its edit lock on these two source files

Dependency: Stacked on the locally accepted AUTH-003 candidate at `4df5732`; PR #88 remains draft, unmerged and unpublished

Acceptance criteria:

- the mobile Email status uses a compact label and cannot overlap the Actions column;
- exporting from My Invoices does not change the visible route, URL hash or existing draft state;
- the downloaded file has a `.pdf` filename and `application/pdf` MIME type;
- line-item headers repeat at the top of every continuation page;
- the notes/terms/totals section moves as a unit when it would cross a page boundary;
- an empty or unsupported authenticated route opens Dashboard;
- explicit supported routes still open the requested page;
- no invoice calculation, payment, Auth, MFA, RLS, secret, provider or customer-data behaviour changes.

Required validation: focused static/source harness; inline-script syntax; existing PDF/PWA, app-integration, email-status, routing/accessibility and financial harnesses affected by source shape; generated multi-page PDF render inspection; `git diff --check`; scoped secret scan

Specialist triggers:

- Frontend: Triggered
- QA/PDF: Triggered
- Payments: Not triggered - no calculation, Stripe, payment-state or refund source change
- Auth/Security: Not triggered - the frozen AUTH-003 implementation is preserved
- Legal/Privacy: Not triggered
- Release: Not triggered until a later merge/publication request

Production impact: None in this task stage. Commit, push, PR readiness, merge and publication are separate actions.

Approval boundary: Routine local implementation and focused validation may proceed. Do not mark PR #88 ready, merge it, publish its candidate, deploy this UX change or perform production-provider actions without the applicable later approval.

Branch: `codex/mobile-pdf-usability`

Implementation result:

- mobile widths show `Accepted` while wider layouts retain `Accepted for delivery`;
- PDF export uses an off-screen invoice surface, preserves the visible route and any existing draft, and downloads a named `application/pdf` Blob;
- line-item continuation pages repeat the table header;
- the notes, terms, payment details and totals summary move together when they would cross an A4 boundary;
- empty and unsupported authenticated routes resolve to Dashboard while explicit supported routes remain unchanged;
- candidate app/cache marker is `2026.07.23.2`.

Validation evidence:

- `git diff --check` passed;
- focused scale/accessibility/PDF/routing, PWA update, email-status, app-integration, document-lifecycle, sensitive-reauthentication, session-expiry and financial-audit harnesses passed;
- Chrome generated `Invoice_TEST-004.pdf` from 42 synthetic line items while remaining on `#invoices`;
- the file had a `%PDF-` signature, `.pdf` filename, A4 page size and four pages;
- Poppler-rendered page inspection confirmed repeated line-item headers on pages 2 and 3, no sliced row, and the complete notes/terms/payment-details/totals block on page 4;
- the test used fictional data only and did not sign in, call Supabase, alter payments or inspect private information.

Blocked reason: Push and preview deployment are deferred because this stacked branch would trigger new Cloudflare provider builds. PR #88 readiness, merge and production publication retain their separate exact Owner boundary.

Next action: Commit the verified local change. Stop before push or any preview/production deployment.
