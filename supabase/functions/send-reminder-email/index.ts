// send-reminder-email - manual overdue payment reminder via Resend.
// Authenticates the caller, verifies invoice ownership and overdue state,
// sends the reminder, then records history and audit events.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Tallyo <invoices@mail.tallyo.co.uk>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type InvoicePayment = {
  amount?: unknown;
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function validEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function currencySymbol(code: string) {
  return ({ GBP: "£", EUR: "€", USD: "$" } as Record<string, string>)[code] || `${code} `;
}

function formatMoney(code: string, amount: unknown) {
  return `${currencySymbol(code || "GBP")}${(Number(amount) || 0).toFixed(2)}`;
}

function toDateOnly(value: Date) {
  return value.toISOString().split("T")[0];
}

function parseDate(value: unknown) {
  const parts = String(value || "").split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null;
  return Date.UTC(parts[0], parts[1] - 1, parts[2]);
}

function daysOverdue(dueDate: unknown) {
  const due = parseDate(dueDate);
  const today = parseDate(toDateOnly(new Date()));
  if (due == null || today == null) return 0;
  return Math.max(0, Math.floor((today - due) / 86400000));
}

function amountPaid(payments: unknown) {
  if (!Array.isArray(payments)) return 0;
  return payments.reduce((sum: number, payment: InvoicePayment) => {
    return sum + (Number(payment?.amount) || 0);
  }, 0);
}

function outstandingAmount(inv: any) {
  return Math.max(0, (Number(inv.grand_total) || 0) - amountPaid(inv.payments));
}

function buildEmail(inv: any, company: any, message: string, outstanding: number, overdueDays: number) {
  const companyName = company?.name || "Tallyo";
  const subject = `Payment reminder: Invoice #${inv.number} from ${companyName}`;
  const paymentDetails = company?.payment_details ? String(company.payment_details) : "";
  const text = [
    message,
    "",
    `Invoice: #${inv.number}`,
    `Due date: ${inv.due_date || ""}`,
    `Outstanding: ${formatMoney(inv.currency || "GBP", outstanding)}`,
    `Overdue: ${overdueDays} day${overdueDays === 1 ? "" : "s"}`,
    ...(paymentDetails ? ["", "Payment details:", paymentDetails] : []),
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5;max-width:640px;margin:0 auto;">
      <h1 style="font-size:22px;margin:0 0 12px;">Payment reminder</h1>
      <p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:18px 0;">
        <p style="margin:0 0 6px;"><strong>Invoice:</strong> #${escapeHtml(inv.number)}</p>
        <p style="margin:0 0 6px;"><strong>Due date:</strong> ${escapeHtml(inv.due_date || "")}</p>
        <p style="margin:0 0 6px;"><strong>Outstanding:</strong> ${escapeHtml(formatMoney(inv.currency || "GBP", outstanding))}</p>
        <p style="margin:0;"><strong>Overdue:</strong> ${escapeHtml(overdueDays)} day${overdueDays === 1 ? "" : "s"}</p>
      </div>
      ${paymentDetails ? `<h2 style="font-size:16px;margin-top:20px;">Payment details</h2><p>${escapeHtml(paymentDetails).replaceAll("\n", "<br>")}</p>` : ""}
    </div>`;

  return { subject, text, html };
}

async function insertAuditEvent(admin: any, payload: Record<string, unknown>) {
  try {
    const { error } = await admin.from("audit_events").insert(payload);
    if (error) console.warn("audit event insert skipped", error.message);
  } catch (e) {
    console.warn("audit event insert skipped", String(e));
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return json({ error: "Email service is not configured" }, 500);

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Missing authorization" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const admin = createClient(supabaseUrl, serviceKey);

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData?.user) return json({ error: "Invalid session" }, 401);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const documentId = String(body.documentId || "");
  const message = String(body.message || "").trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
    return json({ error: "Invalid document ID" }, 400);
  }
  if (message.length < 10) return json({ error: "Reminder message is too short" }, 400);
  if (message.length > 5000) return json({ error: "Reminder message is too long" }, 400);

  const { data: inv, error: invError } = await admin.from("invoices").select("*").eq("id", documentId).maybeSingle();
  if (invError) return json({ error: invError.message }, 500);
  if (!inv || inv.user_id !== userData.user.id) return json({ error: "Invoice not found" }, 404);
  if (inv.doc_type !== "invoice") return json({ error: "Only invoices can receive payment reminders" }, 400);
  if (inv.status === "Cancelled") return json({ error: "Cancelled invoices cannot receive reminders" }, 400);

  const outstanding = outstandingAmount(inv);
  if (outstanding <= 0.001 || inv.status === "Paid") return json({ error: "This invoice is already paid" }, 400);

  const overdueDays = daysOverdue(inv.due_date);
  if (overdueDays <= 0) return json({ error: "This invoice is not overdue yet" }, 400);

  const customer = inv.customer_snapshot || {};
  const to = String(customer.email || "").trim();
  if (!validEmail(to)) return json({ error: "This customer does not have a valid email address" }, 400);

  const { data: company } = await admin.from("company_settings").select("*").eq("user_id", userData.user.id).maybeSingle();
  const email = buildEmail(inv, company || {}, message, outstanding, overdueDays);
  const resendPayload = {
    from: FROM_EMAIL,
    to: [to],
    subject: email.subject,
    html: email.html,
    text: email.text,
    tags: [
      { name: "category", value: "payment_reminder" },
      { name: "document_id", value: documentId },
      { name: "user_id", value: userData.user.id },
    ],
  };

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resendPayload),
  });
  const resendBody = await resendResponse.json().catch(() => ({}));
  if (!resendResponse.ok) {
    await insertAuditEvent(admin, {
      user_id: userData.user.id,
      actor_user_id: userData.user.id,
      event_type: "email_send_failed",
      object_type: "invoice",
      object_id: documentId,
      source: "edge_function",
      provider: "resend",
      metadata: { status: resendResponse.status, reason: "provider_rejected_request", category: "payment_reminder" },
    });
    return json({ error: resendBody?.message || "Reminder email could not be sent" }, 502);
  }

  const nowISO = new Date().toISOString();
  const history = Array.isArray(inv.history) ? inv.history : [];
  history.push({
    ts: nowISO,
    type: "reminder",
    text: `Payment reminder emailed to ${to} (${overdueDays} days overdue)`,
  });

  const { data: updated, error: updateError } = await admin.from("invoices")
    .update({ history, updated_at: nowISO })
    .eq("id", documentId)
    .eq("user_id", userData.user.id)
    .select("*")
    .single();
  if (updateError) return json({ error: updateError.message }, 500);

  await insertAuditEvent(admin, {
    user_id: userData.user.id,
    actor_user_id: userData.user.id,
    event_type: "payment_reminder_email_sent",
    object_type: "invoice",
    object_id: documentId,
    source: "edge_function",
    provider: "resend",
    provider_event_id: resendBody?.id || null,
    metadata: { to, from: FROM_EMAIL, subject: email.subject, outstanding, overdue_days: overdueDays },
  });

  return json({ ok: true, emailId: resendBody?.id || null, invoice: updated });
});
