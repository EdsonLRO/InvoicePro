// send-overdue-reminders - scheduled Edge Function
// Sends overdue payment reminders only for invoices explicitly opted in to automation.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";

const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Tallyo <invoices@mail.tallyo.co.uk>";

type InvoicePayment = {
  amount?: unknown;
};

type ReminderHistory = {
  ts?: unknown;
  type?: unknown;
  text?: unknown;
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
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
  return ({ GBP: "\u00A3", EUR: "\u20AC", USD: "$" } as Record<string, string>)[code] || `${code} `;
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

function daysBetween(from: unknown, to: unknown) {
  const a = parseDate(from);
  const b = parseDate(to);
  if (a == null || b == null) return 0;
  return Math.floor((b - a) / 86400000);
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

function reminderEntries(history: unknown): ReminderHistory[] {
  if (!Array.isArray(history)) return [];
  return history.filter((entry: ReminderHistory) => {
    if (!entry || entry.type !== "reminder") return false;
    const text = String(entry.text || "");
    return text.startsWith("Payment reminder emailed to ") ||
      text.startsWith("Automatic payment reminder emailed to ") ||
      text.startsWith("Payment reminder sent to email provider for ") ||
      text.startsWith("Automatic payment reminder sent to email provider for ");
  });
}

async function resendIdempotencyKey(parts: string[]): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(parts.join("\u001f")),
  );
  const hex = Array.from(new Uint8Array(digest)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return `tallyo-overdue-email-${hex}`;
}

function lastReminderDate(history: unknown) {
  const entries = reminderEntries(history)
    .map((entry) => String(entry.ts || "").slice(0, 10))
    .filter(Boolean)
    .sort();
  return entries.length ? entries[entries.length - 1] : null;
}

function buildMessage(inv: any, company: any, outstanding: number, overdueDays: number) {
  const companyName = company?.name || "Tallyo";
  const customer = inv.customer_snapshot || {};
  const currency = inv.currency || "GBP";
  return [
    `Hi ${customer.name || "there"},`,
    "",
    `This is a friendly reminder that invoice #${inv.number} for ${formatMoney(currency, outstanding)} was due on ${inv.due_date} and is now ${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue.`,
    "",
    "We would be grateful if you could arrange payment at your earliest convenience. If you have already paid, please disregard this message.",
    "",
    "Thank you,",
    companyName,
  ].join("\n");
}

function buildEmail(inv: any, company: any, outstanding: number, overdueDays: number) {
  const companyName = company?.name || "Tallyo";
  const subject = `Payment reminder: Invoice #${inv.number} from ${companyName}`;
  const paymentDetails = company?.payment_details ? String(company.payment_details) : "";
  const message = buildMessage(inv, company, outstanding, overdueDays);
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

async function insertRunAuditEvent(admin: any, payload: Record<string, unknown>): Promise<boolean> {
  try {
    const { error } = await admin.from("audit_events").insert(payload);
    if (error) {
      console.error("automation run audit insert failed", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("automation run audit insert failed", error instanceof Error ? error.name : "unknown");
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const automationSecret = Deno.env.get("AUTOMATION_SECRET") || "";
  if (!automationSecret) return json({ error: "Automation secret is not configured" }, 500);
  if (req.headers.get("x-automation-secret") !== automationSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  const resendKey = Deno.env.get("RESEND_API_KEY") || "";
  if (!resendKey) return json({ error: "Email service is not configured" }, 500);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const today = toDateOnly(new Date());
  const nowISO = new Date().toISOString();

  const { data: settings, error: settingsError } = await admin.from("company_settings")
    .select("*");
  if (settingsError) return json({ error: settingsError.message }, 500);
  const settingsByUser = new Map<string, any>();
  for (const company of settings || []) {
    const userId = String(company.user_id || "");
    if (userId) settingsByUser.set(userId, company);
  }

  let checked = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  const { data: invoices, error: invoiceError } = await admin.from("invoices")
    .select("*")
    .eq("overdue_reminders_enabled", true)
    .eq("doc_type", "invoice")
    .not("due_date", "is", null)
    .lte("due_date", today);

  if (invoiceError) return json({ error: invoiceError.message }, 500);

  const { data: reminderOwners, error: reminderOwnerError } = await admin.from("invoices")
    .select("user_id")
    .eq("overdue_reminders_enabled", true)
    .eq("doc_type", "invoice");
  if (reminderOwnerError) return json({ error: reminderOwnerError.message }, 500);

  const monitoredUsers = new Set<string>();
  for (const owner of reminderOwners || []) {
    const userId = String(owner.user_id || "");
    if (userId) monitoredUsers.add(userId);
  }
  const checkedByUser = new Map<string, number>();
  const sentByUser = new Map<string, number>();
  const failuresByUser = new Map<string, number>();
  const markFailure = (userId: string) => {
    if (userId) failuresByUser.set(userId, (failuresByUser.get(userId) || 0) + 1);
  };

  const activeUsers = new Set<string>();

  for (const inv of invoices || []) {
      checked++;
      const userId = String(inv.user_id || "");
      if (!userId) {
        skipped++;
        continue;
      }
      activeUsers.add(userId);
      checkedByUser.set(userId, (checkedByUser.get(userId) || 0) + 1);
      const company = settingsByUser.get(userId) || {};

      const firstDays = Math.max(1, Number(inv.overdue_first_reminder_days) || Number(company.overdue_first_reminder_days) || 3);
      const repeatDays = Math.max(1, Number(inv.overdue_repeat_reminder_days) || Number(company.overdue_repeat_reminder_days) || 7);
      const maxReminders = Math.max(1, Number(inv.overdue_max_reminders) || Number(company.overdue_max_reminders) || 3);

      if (inv.status === "Draft" || inv.status === "Paid" || inv.status === "Cancelled") {
        skipped++;
        continue;
      }

      const outstanding = outstandingAmount(inv);
      if (outstanding <= 0.001) {
        skipped++;
        continue;
      }

      const overdueDays = daysBetween(inv.due_date, today);
      if (overdueDays < firstDays) {
        skipped++;
        continue;
      }

      const reminders = reminderEntries(inv.history);
      if (reminders.length >= maxReminders) {
        skipped++;
        continue;
      }

      const lastDate = lastReminderDate(inv.history);
      if (lastDate && daysBetween(lastDate, today) < repeatDays) {
        skipped++;
        continue;
      }

      const customer = inv.customer_snapshot || {};
      const to = String(customer.email || "").trim();
      if (!validEmail(to)) {
        skipped++;
        continue;
      }

      let email: ReturnType<typeof buildEmail>;
      let resendResponse: Response;
      try {
        email = buildEmail(inv, company, outstanding, overdueDays);
        const resendRequestKey = await resendIdempotencyKey([
          String(inv.id),
          userId,
          to.toLowerCase(),
          String(reminders.length + 1),
        ]);
        resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": resendRequestKey,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [to],
            subject: email.subject,
            html: email.html,
            text: email.text,
            tags: [
              { name: "category", value: "payment_reminder" },
              { name: "document_id", value: inv.id },
              { name: "user_id", value: userId },
              { name: "automated", value: "true" },
            ],
          }),
          signal: AbortSignal.timeout(15_000),
        });
      } catch (error) {
        failed++;
        markFailure(userId);
        const timedOut = error instanceof DOMException && error.name === "TimeoutError";
        console.error("payment reminder request failed", inv.id, timedOut ? "provider_timeout" : "provider_request_failed");
        await insertAuditEvent(admin, {
          user_id: userId,
          actor_user_id: null,
          event_type: "email_send_failed",
          object_type: "invoice",
          object_id: inv.id,
          source: "edge_function",
          provider: "resend",
          metadata: {
            stage: "provider_request",
            reason: timedOut ? "provider_timeout" : "provider_request_failed",
            category: "payment_reminder",
            automated: true,
          },
        });
        continue;
      }
      const resendBody = await resendResponse.json().catch(() => ({}));

      if (!resendResponse.ok) {
        failed++;
        markFailure(userId);
        await insertAuditEvent(admin, {
          user_id: userId,
          actor_user_id: userId,
          event_type: "email_send_failed",
          object_type: "invoice",
          object_id: inv.id,
          source: "edge_function",
          provider: "resend",
          metadata: {
            status: resendResponse.status,
            reason: "provider_rejected_request",
            category: "payment_reminder",
            automated: true,
          },
        });
        continue;
      }

      const history = Array.isArray(inv.history) ? inv.history : [];
      history.push({
        ts: nowISO,
        type: "reminder",
        text: `Automatic payment reminder sent to email provider for ${to} (${overdueDays} days overdue)`,
      });

      const { error: updateError } = await admin.from("invoices")
        .update({ history, updated_at: nowISO })
        .eq("id", inv.id)
        .eq("user_id", userId);

      if (updateError) {
        failed++;
        markFailure(userId);
        console.error("invoice history update failed", inv.id, updateError.message);
        await insertAuditEvent(admin, {
          user_id: userId,
          actor_user_id: null,
          event_type: "payment_reminder_processing_failed",
          object_type: "invoice",
          object_id: inv.id,
          source: "edge_function",
          metadata: {
            stage: "invoice_history_update",
            reason: "database_rejected",
            category: "payment_reminder",
            automated: true,
          },
        });
        continue;
      }

      await insertAuditEvent(admin, {
        user_id: userId,
        actor_user_id: userId,
        event_type: "payment_reminder_email_sent",
        object_type: "invoice",
        object_id: inv.id,
        source: "edge_function",
        provider: "resend",
        provider_event_id: resendBody?.id || null,
        metadata: { outstanding, overdue_days: overdueDays, automated: true },
      });

      sent++;
      sentByUser.set(userId, (sentByUser.get(userId) || 0) + 1);
  }

  let monitoringFailed = 0;
  for (const userId of monitoredUsers) {
    const failureCount = failuresByUser.get(userId) || 0;
    const recorded = await insertRunAuditEvent(admin, {
      user_id: userId,
      actor_user_id: null,
      event_type: "overdue_reminder_run_completed",
      object_type: "account",
      object_id: null,
      source: "edge_function",
      metadata: {
        checked: checkedByUser.get(userId) || 0,
        sent: sentByUser.get(userId) || 0,
        failed: failureCount,
        status: failureCount > 0 ? "attention" : "ok",
      },
    });
    if (!recorded) monitoringFailed++;
  }

  const ok = failed === 0 && monitoringFailed === 0;
  return json({ ok, users: activeUsers.size, checked, sent, skipped, failed, monitoringFailed }, ok ? 200 : 500);
});
