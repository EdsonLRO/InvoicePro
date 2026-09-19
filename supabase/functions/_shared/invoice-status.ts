// Shared invoice lifecycle rules used by trusted server-side mutations.
// Payment-derived display states (Paid, Partially Paid and Overdue) are
// calculated from the invoice balance and due date by the application.

export function storedInvoiceStatusAfterPaymentChange(invoice: any): string {
  return invoice?.status === "Cancelled" ? "Cancelled" : "Sent";
}

export function isInvoiceFullyPaid(total: unknown, paid: unknown): boolean {
  const invoiceTotal = Number(total) || 0;
  const amountPaid = Number(paid) || 0;
  return invoiceTotal > 0 && amountPaid >= invoiceTotal - 0.001;
}

export function storedInvoiceAllowsOverdueReminder(invoice: any): boolean {
  if (String(invoice?.doc_type || "") !== "invoice") return false;
  return !["Draft", "Paid", "Cancelled"].includes(
    String(invoice?.status || ""),
  );
}
