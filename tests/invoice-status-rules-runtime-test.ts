import {
  isInvoiceFullyPaid,
  storedInvoiceAllowsOverdueReminder,
  storedInvoiceStatusAfterPaymentChange,
} from "../supabase/functions/_shared/invoice-status.ts";

function assertEquals(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, received ${actual}`);
  }
}

Deno.test("payment mutations preserve only the user-controlled lifecycle", () => {
  assertEquals(
    storedInvoiceStatusAfterPaymentChange({ status: "Draft" }),
    "Sent",
    "payment issues a draft",
  );
  assertEquals(
    storedInvoiceStatusAfterPaymentChange({ status: "Sent" }),
    "Sent",
    "issued invoice remains sent",
  );
  assertEquals(
    storedInvoiceStatusAfterPaymentChange({ status: "Paid" }),
    "Sent",
    "mutated legacy paid invoice re-enters derived status model",
  );
  assertEquals(
    storedInvoiceStatusAfterPaymentChange({ status: "Cancelled" }),
    "Cancelled",
    "cancelled invoice remains cancelled",
  );
});

Deno.test("fully paid detection requires a positive settled balance", () => {
  assertEquals(
    isInvoiceFullyPaid(0, 0),
    false,
    "zero-value invoice is not payment-derived Paid",
  );
  assertEquals(
    isInvoiceFullyPaid(100, 99),
    false,
    "partial payment is not fully paid",
  );
  assertEquals(
    isInvoiceFullyPaid(100, 100),
    true,
    "matching payment settles the invoice",
  );
  assertEquals(
    isInvoiceFullyPaid(100, 120),
    true,
    "historical overpayment remains settled",
  );
});

Deno.test("overdue reminders require an issued invoice lifecycle", () => {
  assertEquals(
    storedInvoiceAllowsOverdueReminder({ doc_type: "invoice", status: "Sent" }),
    true,
    "sent invoice may be checked",
  );
  assertEquals(
    storedInvoiceAllowsOverdueReminder({
      doc_type: "invoice",
      status: "Draft",
    }),
    false,
    "draft is excluded",
  );
  assertEquals(
    storedInvoiceAllowsOverdueReminder({ doc_type: "invoice", status: "Paid" }),
    false,
    "legacy paid is excluded",
  );
  assertEquals(
    storedInvoiceAllowsOverdueReminder({
      doc_type: "invoice",
      status: "Cancelled",
    }),
    false,
    "cancelled is excluded",
  );
  assertEquals(
    storedInvoiceAllowsOverdueReminder({ doc_type: "quote", status: "Sent" }),
    false,
    "quote is excluded",
  );
  assertEquals(
    storedInvoiceAllowsOverdueReminder({ doc_type: "credit", status: "Sent" }),
    false,
    "credit note is excluded",
  );
  assertEquals(
    storedInvoiceAllowsOverdueReminder({ status: "Sent" }),
    false,
    "missing document type fails closed",
  );
});
