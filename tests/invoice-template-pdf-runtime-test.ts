import { buildPdfBase64 } from "../supabase/functions/send-document-email/index.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const invoice = {
  doc_type: "invoice",
  number: "INV-TEST-1",
  issue_date: "2026-09-24",
  due_date: "2026-10-08",
  currency: "GBP",
  customer_snapshot: { name: "Fictional Customer", email: "customer@example.invalid" },
  items: [
    { name: "Design", qty: 1, unit: "service", price: 200, discount: 0, tax: 20 },
    { name: "Consulting", qty: 2, unit: "hours", price: 50, discount: 0, tax: 20 },
  ],
  payments: [],
  grand_total: 360,
};

const templates = ["tallyo", "basic", "modern", "professional"];
const results = templates.map((invoice_template) => buildPdfBase64(invoice, {
  name: "North & Stone (fictional)",
  brand_color: "#4f46e5",
  invoice_template,
  alternate_item_rows: true,
}));

for (const encoded of results) {
  assert(atob(encoded).startsWith("%PDF-1.4"), "each template must produce a PDF attachment");
}
assert(new Set(results).size === templates.length, "each template must produce a distinct PDF presentation");

const rowsOn = buildPdfBase64(invoice, { invoice_template: "tallyo", alternate_item_rows: true });
const rowsOff = buildPdfBase64(invoice, { invoice_template: "tallyo", alternate_item_rows: false });
assert(rowsOn !== rowsOff, "alternating-row preference must affect the emailed PDF attachment");

const invalid = buildPdfBase64(invoice, { invoice_template: "unknown", alternate_item_rows: true });
const defaultTemplate = buildPdfBase64(invoice, { invoice_template: "tallyo", alternate_item_rows: true });
assert(invalid === defaultTemplate, "unknown template values must fail safely to Tallyo");

console.log("Invoice template PDF runtime tests passed.");
