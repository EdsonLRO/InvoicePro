# Tallyo PDF and PWA Regression Evidence - 2026-07-15

Privacy-safe acceptance notes for the release-readiness branch and its deployment through merge commit `c48c60267bbb44e5257d2f258a0ffc92fb8f9ac9`. The invoice, customer, descriptions, address, and email domain used in this exercise were synthetic and belong to a dedicated test account. No email or payment action was triggered.

## Long PDF Layout

- Created one draft invoice containing 24 synthetic line items.
- Exported the authenticated invoice through the deployed app.
- `pdfinfo` reported A4, three pages, PDF 1.3, and no encryption.
- Rendered all pages to images and visually inspected them.
- Page 1 contained rows 1-8, page 2 contained rows 9-21, and page 3 contained rows 22-24.
- No item row was split between pages.
- Alternating row colours continued across page boundaries.
- Each page had a clean top and bottom gap.
- Notes, terms, payment details, and the totals box followed the final item without overlap.

The deployed PNG/RGBA export was 35,767,558 bytes. Inspection showed the same 1600x5588 RGBA image embedded in the PDF pages. A quality-92 JPEG rendering of that continuous image was 684,960 bytes and retained acceptable visual quality in all three inspected page crops.

## PDF Size Hardening

The deployed application now:

- supplies an explicit white background to `html2canvas`;
- converts the captured invoice to JPEG at quality 0.92 instead of RGBA PNG;
- reuses one jsPDF image alias across continuation pages; and
- retains the existing fixed 800px desktop capture and row-boundary pagination logic.

The inline application script parses successfully after the change.

## Post-Deployment PDF Acceptance

- Confirmed the public deployment contains the JPEG exporter and jsPDF image-alias reuse.
- Exported the same authenticated 24-row synthetic invoice from the deployed application.
- The deployed optimized PDF was 689,481 bytes, compared with 35,767,558 bytes for the previous PNG/RGBA export: a reduction of approximately 98.1%.
- `pdfinfo` and `pypdf` confirmed A4, three pages, PDF 1.3, and no encryption.
- All three pages were rendered again and visually inspected. Rows 1-8, 9-21, and 22-24 remained complete on pages 1, 2, and 3 respectively; continuation spacing, alternating colours, notes, terms, and totals remained correct.
- Pixel inspection confirmed white page edges on every page. A dark strip seen around page 2 in one preview was the viewer background, not embedded PDF content.
- All three pages reference the same 1600x5588 `/DCTDecode` JPEG object, confirming that the image alias is reused rather than embedding three copies.

Desktop PDF size, format, and multi-page layout acceptance are Verified. A real-phone download is still required before authenticated mobile PDF acceptance can be marked Verified.

## PWA Boundary

- The deployed manifest and service-worker source match the repository.
- Both required PWA icon files exist.
- The public 390x844 shell has no horizontal overflow or off-screen controls.
- The available authenticated browser-control surface does not expose mobile viewport emulation or Service Worker install/offline controls.

PWA install, offline fallback, update behaviour, and authenticated mobile workflows therefore remain In Progress. They must be accepted on a real phone or a browser surface that exposes those capabilities; source inspection alone is not treated as operational proof.
