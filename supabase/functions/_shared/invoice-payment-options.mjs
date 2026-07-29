const MONEY_EPSILON = 0.001;

/**
 * @typedef {object} InvoicePaymentSelection
 * @property {"full_balance" | "deposit"} kind
 * @property {number} amount
 * @property {number} outstanding
 * @property {number} remainingBalance
 */

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function amountPaid(payments) {
  if (!Array.isArray(payments)) return 0;
  return payments.reduce((sum, payment) => {
    return sum + (Number(payment?.amount) || 0);
  }, 0);
}

export function invoiceOutstandingAmount(invoice) {
  return Math.max(
    0,
    roundMoney(
      (Number(invoice?.grand_total) || 0) - amountPaid(invoice?.payments),
    ),
  );
}

export function invoiceOnlinePaymentEligibility(invoice) {
  if (!invoice || invoice.doc_type !== "invoice") {
    return {
      eligible: false,
      error: "Only invoices can include online payment",
    };
  }

  const status = String(invoice.status || "").trim().toLowerCase();
  if (["paid", "cancelled", "canceled", "void", "voided"].includes(status)) {
    return {
      eligible: false,
      error: status === "paid"
        ? "This invoice is already paid"
        : "This invoice cannot be paid online",
    };
  }

  const outstanding = invoiceOutstandingAmount(invoice);
  if (outstanding <= MONEY_EPSILON) {
    return {
      eligible: false,
      error: "This invoice has no outstanding balance",
    };
  }

  return { eligible: true, outstanding };
}

export function stripeConnectReady(mapping) {
  return !!(
    mapping &&
    mapping.onboarding_state === "active" &&
    mapping.card_payments_status === "active" &&
    mapping.payouts_status === "active"
  );
}

/**
 * @returns {InvoicePaymentSelection}
 */
export function resolveInvoicePaymentSelection(invoice, paymentKind) {
  const eligibility = invoiceOnlinePaymentEligibility(invoice);
  if (!eligibility.eligible) throw new Error(eligibility.error);

  const outstanding = eligibility.outstanding;
  if (paymentKind === "full_balance") {
    return {
      kind: "full_balance",
      amount: outstanding,
      outstanding,
      remainingBalance: 0,
    };
  }
  if (paymentKind !== "deposit") {
    throw new Error("Choose either the full balance or the saved deposit");
  }

  const deposit = Number(invoice.deposit_amount);
  if (!Number.isFinite(deposit) || deposit <= MONEY_EPSILON) {
    throw new Error("The saved deposit must be greater than zero");
  }
  if (deposit > outstanding + MONEY_EPSILON) {
    throw new Error("The saved deposit cannot exceed the outstanding balance");
  }

  const amount = roundMoney(deposit);
  return {
    kind: "deposit",
    amount,
    outstanding,
    remainingBalance: Math.max(0, roundMoney(outstanding - amount)),
  };
}

export async function createOptionalInvoicePaymentLinks({
  includeOnlinePayment,
  invoice,
  paymentKind,
  createLink,
}) {
  if (includeOnlinePayment !== true) return [];
  if (typeof createLink !== "function") {
    throw new Error("Online payment link creation is unavailable");
  }

  const selection = resolveInvoicePaymentSelection(invoice, paymentKind);
  const link = await createLink(selection);
  return link ? [link] : [];
}
