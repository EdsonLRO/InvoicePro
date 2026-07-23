# UX-001 - Mobile invoice and PDF usability

Task ID: UX-001

Title: Correct mobile invoice actions, PDF download/pagination and default routing

Priority: High user impact

Status: Release approved - PR checks and production publication pending

Owner role: Master Orchestrator

Assigned specialists: Frontend and QA

Model/work mode: Medium

Risk level: Medium - responsive UI, browser download behaviour, client-side PDF layout and ordinary routing

Objective: Keep mobile invoice-list actions readable, download PDFs without navigating away from My Invoices, keep totals together, repeat the line-item header on continuation pages, and open authenticated sessions on Dashboard when no explicit route was requested.

Affected files: `index.html`, `service-worker.js`, a focused regression harness, and this task record

Files or paths locked: `index.html`, `service-worker.js`, the focused UX-001 regression harness, and this task record

Lock acquired: 2026-07-23 by the Master Orchestrator after the frozen AUTH-003 implementation transferred its edit lock on these two source files

Dependency: Rebased without conflict onto `main` at `35880c7` after the approved AUTH-003 PR #88 merge

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
- Release: Triggered - the Owner approved the complete push, PR, merge and build `2026.07.23.2` publication sequence

Production impact: Publishes the reviewed frontend and service-worker update as build `2026.07.23.2`; no provider, Auth, payment, database or customer-data configuration changes.

Approval boundary: On 2026-07-23 the Owner explicitly approved pushing this branch, creating and merging its pull request, and publishing build `2026.07.23.2`. Required checks, branch protection and focused production verification remain mandatory.

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

Blocked reason: None within the approved release scope.

Next action: Commit this release-state update, push the rebased branch, create the pull request, require all checks and protected previews to pass, then merge and verify production build `2026.07.23.2`.
