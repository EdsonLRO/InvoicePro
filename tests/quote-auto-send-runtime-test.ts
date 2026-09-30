import {
  sendAcceptedQuoteInvoice,
} from "../supabase/functions/send-document-email/index.ts";

type Recorded = {
  invoiceUpdates: Record<string, unknown>[];
  audits: Record<string, unknown>[];
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function mockAdmin(invoice: Record<string, unknown>, recorded: Recorded) {
  return {
    from(table: string) {
      let updateValue: Record<string, unknown> | null = null;
      const builder: any = {
        select() { return builder; },
        update(value: Record<string, unknown>) {
          updateValue = value;
          if (table === "invoices") recorded.invoiceUpdates.push(value);
          return builder;
        },
        insert(value: Record<string, unknown>) {
          if (table === "audit_events") recorded.audits.push(value);
          return Promise.resolve({ error: null });
        },
        eq() { return builder; },
        async maybeSingle() {
          if (table === "company_settings") {
            return { data: { name: "North & Stone", brand_color: "#4f46e5" }, error: null };
          }
          if (table === "invoices") {
            return { data: { ...invoice, ...(updateValue || {}) }, error: null };
          }
          return { data: null, error: null };
        },
      };
      return builder;
    },
  };
}

function draftInvoice() {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "22222222-2222-4222-8222-222222222222",
    doc_type: "invoice",
    number: "1048",
    status: "Draft",
    source_quote_id: "33333333-3333-4333-8333-333333333333",
    issue_date: "2026-09-20",
    due_date: "2026-10-04",
    currency: "GBP",
    customer_snapshot: { name: "Fictional Customer", email: "customer@example.invalid" },
    items: [{ name: "Design", qty: 1, unit: "service", price: 100, discount: 0, tax: 20 }],
    payments: [],
    history: [],
    grand_total: 120,
  };
}

async function testSuccessfulAutomaticDelivery() {
  const invoice = draftInvoice();
  const recorded: Recorded = { invoiceUpdates: [], audits: [] };
  const requests: { url: string; init?: RequestInit }[] = [];
  const result = await sendAcceptedQuoteInvoice({
    admin: mockAdmin(invoice, recorded),
    invoice,
    ownerUserId: String(invoice.user_id),
    to: "reviewed-recipient@example.invalid",
    resendKey: "test_resend_key",
    now: new Date("2026-09-20T12:00:00.000Z"),
    fetcher: async (url, init) => {
      requests.push({ url: String(url), init });
      return new Response(JSON.stringify({ id: "resend_event_1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  assert(requests.length === 1, "one provider request is expected");
  const headers = requests[0].init?.headers as Record<string, string>;
  assert(headers["Idempotency-Key"].startsWith("tallyo-document-email-"), "provider request must be idempotent");
  const payload = JSON.parse(String(requests[0].init?.body));
  assert(payload.to[0] === "reviewed-recipient@example.invalid", "the owner-reviewed quote recipient must be used");
  assert(!JSON.stringify(payload).includes("Pay online"), "automatic email must not create a payment link");
  assert(result.invoice.status === "Sent", "invoice becomes Sent only after provider acceptance");
  assert(recorded.invoiceUpdates.length === 1, "one invoice status update is expected");
  assert(recorded.audits.some(event => event.event_type === "document_email_sent"), "successful send must be audited");
}

async function testProviderRejectionLeavesDraft() {
  const invoice = draftInvoice();
  const recorded: Recorded = { invoiceUpdates: [], audits: [] };
  let rejected = false;
  try {
    await sendAcceptedQuoteInvoice({
      admin: mockAdmin(invoice, recorded),
      invoice,
      ownerUserId: String(invoice.user_id),
      to: String((invoice.customer_snapshot as { email: string }).email),
      resendKey: "test_resend_key",
      fetcher: async () => new Response(JSON.stringify({ message: "rejected" }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      }),
    });
  } catch {
    rejected = true;
  }
  assert(rejected, "provider rejection must be surfaced");
  assert(recorded.invoiceUpdates.length === 0, "Draft status must not change after provider rejection");
  assert(recorded.audits.some(event => event.event_type === "email_send_failed"), "provider rejection must be audited");
}

async function testInvalidRecipientStopsBeforeProvider() {
  const invoice = draftInvoice();
  const recorded: Recorded = { invoiceUpdates: [], audits: [] };
  let providerCalls = 0;
  let rejected = false;
  try {
    await sendAcceptedQuoteInvoice({
      admin: mockAdmin(invoice, recorded),
      invoice,
      ownerUserId: String(invoice.user_id),
      to: "not-an-email",
      resendKey: "test_resend_key",
      fetcher: async () => {
        providerCalls += 1;
        return new Response("{}", { status: 200 });
      },
    });
  } catch {
    rejected = true;
  }
  assert(rejected, "invalid recipient must be rejected");
  assert(providerCalls === 0, "provider must not be called for an invalid recipient");
}

await testSuccessfulAutomaticDelivery();
await testProviderRejectionLeavesDraft();
await testInvalidRecipientStopsBeforeProvider();
console.log("Quote automatic invoice delivery runtime tests passed.");
