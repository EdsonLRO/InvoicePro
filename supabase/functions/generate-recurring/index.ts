// generate-recurring - scheduled Edge Function
// Finds active recurring schedules that are due, generates one invoice each,
// optionally emails generated invoices, advances next_run, and logs history.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";

const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Tallyo <invoices@mail.tallyo.co.uk>";

// ---- date helpers (same logic as the browser app) ----
function daysInMonth(y: number, m: number) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }
function parseD(s: string) { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); }
function toISO(d: Date) { return d.toISOString().split("T")[0]; }

function advanceOnce(nextRun: string, tpl: any): string {
  const d = parseD(nextRun);
  const anchorDay = Number(String(tpl.start_date).split("-")[2]);
  let unit = "months", n = 1;
  switch (tpl.frequency) {
    case "weekly":    unit = "days";   n = 7;  break;
    case "monthly":   unit = "months"; n = 1;  break;
    case "quarterly": unit = "months"; n = 3;  break;
    case "yearly":    unit = "months"; n = 12; break;
    case "custom":    unit = tpl.custom_unit || "months"; n = Number(tpl.custom_interval) || 1; break;
  }
  if (unit === "days")  { d.setUTCDate(d.getUTCDate() + n);     return toISO(d); }
  if (unit === "weeks") { d.setUTCDate(d.getUTCDate() + n * 7); return toISO(d); }
  let y = d.getUTCFullYear(), mo = d.getUTCMonth() + n;
  y += Math.floor(mo / 12); mo = ((mo % 12) + 12) % 12;
  const day = Math.min(anchorDay, daysInMonth(y, mo));
  return toISO(new Date(Date.UTC(y, mo, day)));
}

function catchUp(tpl: any, today: string) {
  let nr = tpl.next_run;
  let due = false;
  if (parseD(nr) <= parseD(today)) {
    due = true;
    let guard = 0;
    while (parseD(nr) <= parseD(today) && guard < 2000) { nr = advanceOnce(nr, tpl); guard++; }
  }
  return { due, newNextRun: nr };
}

// ---- totals and email rendering ----
function r2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function calcTotals(inv: any) {
  const items = inv.items || [];
  const mode = inv.tax_mode || "exclusive";
  let netSum = 0;
  let grossSum = 0;
  const taxRaw: Record<string, number> = {};
  for (const item of items) {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const discount = Number(item.discount) || 0;
    const rate = Number(item.tax) || 0;
    const afterDisc = qty * price * (1 - discount / 100);
    let lineNet;
    let lineTax;
    if (mode === "inclusive") {
      lineNet = rate ? afterDisc / (1 + rate / 100) : afterDisc;
      lineTax = afterDisc - lineNet;
    } else {
      lineNet = afterDisc;
      lineTax = afterDisc * (rate / 100);
    }
    netSum += lineNet;
    grossSum += mode === "inclusive" ? afterDisc : afterDisc + lineTax;
    if (rate > 0) taxRaw[String(rate)] = (taxRaw[String(rate)] || 0) + lineTax;
  }
  const discount = Number(inv.global_discount) || 0;
  const shipping = Number(inv.shipping_cost) || 0;
  const factor = 1 - discount / 100;
  const base = mode === "inclusive" ? grossSum : netSum;
  const subtotal = r2(base);
  const globalDiscountAmt = r2(base * (discount / 100));
  const taxByRate: Record<string, number> = {};
  let taxAmt = 0;
  for (const rate of Object.keys(taxRaw)) {
    const v = r2(taxRaw[rate] * factor);
    taxByRate[rate] = v;
    taxAmt = r2(taxAmt + v);
  }
  const grandTotal = mode === "inclusive"
    ? r2(grossSum * factor + shipping)
    : r2(netSum * factor + taxAmt + shipping);
  return { subtotal, globalDiscountAmt, taxAmt, taxByRate, shipping, grandTotal };
}

function calcGrandTotal(tpl: any): number {
  return calcTotals({
    items: tpl.items || [],
    global_discount: tpl.global_discount || 0,
    tax_mode: tpl.tax_mode || "exclusive",
    shipping_cost: tpl.shipping_cost || 0,
  }).grandTotal;
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
  return `${currencySymbol(code)}${(Number(amount) || 0).toFixed(2)}`;
}

type EmailLine = {
  name: string;
  qty: number;
  unit: string;
  price: number;
  discount: number;
  tax: number;
  total: number;
};

function buildEmail(inv: any, company: any) {
  const currency = inv.currency || "GBP";
  const totals = calcTotals(inv);
  const total = Number(inv.grand_total) || totals.grandTotal;
  const customer = inv.customer_snapshot || {};
  const companyName = company?.name || "Tallyo";
  const subject = `Invoice #${inv.number} from ${companyName}`;
  const lines = (inv.items || []).map((item: any) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const discount = Number(item.discount) || 0;
    const lineTotal = qty * price * (1 - discount / 100);
    return {
      name: item.name || "Item",
      qty,
      unit: item.unit || "",
      price,
      discount,
      tax: Number(item.tax) || 0,
      total: lineTotal,
    };
  });

  const taxLabel = Object.keys(totals.taxByRate).length === 1
    ? `Tax (${Object.keys(totals.taxByRate)[0]}%)`
    : "Tax";

  const textLines = [
    `Hi ${customer.name || "there"},`,
    "",
    `Please find invoice #${inv.number} from ${companyName}.`,
    "",
    `Invoice: #${inv.number}`,
    `Issue date: ${inv.issue_date || ""}`,
    `Due date: ${inv.due_date || ""}`,
    `Total: ${formatMoney(currency, total)}`,
    "",
    "Items:",
    ...lines.map((line: EmailLine) => `- ${line.name}: ${line.qty}${line.unit ? ` ${line.unit}` : ""} x ${formatMoney(currency, line.price)}${line.discount ? `, ${line.discount}% discount` : ""}${line.tax ? `, ${line.tax}% tax` : ""} = ${formatMoney(currency, line.total)} before tax`),
    "",
    "Summary:",
    `Subtotal: ${formatMoney(currency, totals.subtotal)}`,
  ];
  if (totals.globalDiscountAmt > 0) textLines.push(`Discount: -${formatMoney(currency, totals.globalDiscountAmt)}`);
  if (totals.taxAmt > 0) textLines.push(`${taxLabel}: ${formatMoney(currency, totals.taxAmt)}`);
  if (totals.shipping > 0) textLines.push(`Shipping: ${formatMoney(currency, totals.shipping)}`);
  textLines.push(`Total: ${formatMoney(currency, total)}`);
  if (inv.notes) textLines.push("", "Notes:", String(inv.notes));
  if (inv.terms) textLines.push("", "Terms:", String(inv.terms));
  if (company?.payment_details) textLines.push("", "Payment details:", String(company.payment_details));
  textLines.push("", "Thank you", companyName);

  const itemRows = lines.map((line: EmailLine) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(line.name)}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(line.qty)}${line.unit ? ` ${escapeHtml(line.unit)}` : ""}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(formatMoney(currency, line.price))}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${line.discount ? `${escapeHtml(line.discount)}%` : "-"}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${line.tax ? `${escapeHtml(line.tax)}%` : "-"}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(formatMoney(currency, line.total))}</td>
    </tr>`).join("");

  const summaryValues: Array<[string, number, string]> = [
    ["Subtotal", totals.subtotal, ""],
    ...(totals.globalDiscountAmt > 0 ? [["Discount", totals.globalDiscountAmt, "-"] as [string, number, string]] : []),
    ...(totals.taxAmt > 0 ? [[taxLabel, totals.taxAmt, ""] as [string, number, string]] : []),
    ...(totals.shipping > 0 ? [["Shipping", totals.shipping, ""] as [string, number, string]] : []),
  ];
  const summaryRows = summaryValues.map(([label, amount, prefix]) => `
    <tr>
      <td style="padding:6px 0;color:#475569;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;text-align:right;font-weight:600;">${escapeHtml(prefix)}${escapeHtml(formatMoney(currency, amount))}</td>
    </tr>`).join("");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5;max-width:680px;margin:0 auto;">
      <h1 style="font-size:22px;margin:0 0 12px;">Invoice #${escapeHtml(inv.number)}</h1>
      <p>Hi ${escapeHtml(customer.name || "there")},</p>
      <p>Please find invoice #${escapeHtml(inv.number)} from ${escapeHtml(companyName)}.</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:18px 0;">
        <p style="margin:0 0 6px;"><strong>Issue date:</strong> ${escapeHtml(inv.issue_date || "")}</p>
        <p style="margin:0 0 6px;"><strong>Due date:</strong> ${escapeHtml(inv.due_date || "")}</p>
        <p style="margin:0;font-size:18px;"><strong>Total:</strong> ${escapeHtml(formatMoney(currency, total))}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:18px 0;">
        <thead>
          <tr style="background:#0f172a;color:#ffffff;">
            <th style="padding:10px;text-align:left;">Item</th>
            <th style="padding:10px;text-align:right;">Qty</th>
            <th style="padding:10px;text-align:right;">Price</th>
            <th style="padding:10px;text-align:right;">Disc</th>
            <th style="padding:10px;text-align:right;">Tax</th>
            <th style="padding:10px;text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <table style="width:280px;margin:4px 0 22px auto;border-collapse:collapse;">
        <tbody>
          ${summaryRows}
          <tr>
            <td style="padding:10px 0;border-top:2px solid #cbd5e1;font-size:18px;font-weight:700;">Total</td>
            <td style="padding:10px 0;border-top:2px solid #cbd5e1;text-align:right;font-size:18px;font-weight:700;">${escapeHtml(formatMoney(currency, total))}</td>
          </tr>
        </tbody>
      </table>
      ${inv.notes ? `<h2 style="font-size:16px;margin-top:20px;">Notes</h2><p>${escapeHtml(inv.notes).replaceAll("\n", "<br>")}</p>` : ""}
      ${inv.terms ? `<h2 style="font-size:16px;margin-top:20px;">Terms</h2><p>${escapeHtml(inv.terms).replaceAll("\n", "<br>")}</p>` : ""}
      ${company?.payment_details ? `<h2 style="font-size:16px;margin-top:20px;">Payment details</h2><p>${escapeHtml(company.payment_details).replaceAll("\n", "<br>")}</p>` : ""}
      <p style="margin-top:24px;">Thank you<br>${escapeHtml(companyName)}</p>
    </div>`;

  return { subject, text: textLines.join("\n"), html };
}

async function nextNumber(admin: any, userId: string): Promise<string> {
  const { data: settings } = await admin.from("company_settings")
    .select("invoice_prefix").eq("user_id", userId).single();
  const prefix = (settings?.invoice_prefix ?? "") as string;

  const { data } = await admin.from("invoices")
    .select("number").eq("user_id", userId).eq("doc_type", "invoice");
  let max = 0;
  for (const r of (data || [])) {
    const n = parseInt(String(r.number).replace(/\D/g, ""), 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return prefix + String(max + 1).padStart(4, "0");
}

async function insertAuditEvent(admin: any, payload: Record<string, unknown>) {
  try {
    const { error } = await admin.from("audit_events").insert(payload);
    if (error) console.warn("audit event insert skipped", error.message);
  } catch (e) {
    console.warn("audit event insert skipped", String(e));
  }
}

async function resendIdempotencyKey(parts: string[]): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(parts.join("\u001f")),
  );
  const hex = Array.from(new Uint8Array(digest)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return `tallyo-recurring-email-${hex}`;
}

async function sendInvoiceEmail(resendKey: string, invoice: any, company: any, to: string, userId: string) {
  const email = buildEmail(invoice, company || {});
  const resendRequestKey = await resendIdempotencyKey([String(invoice.id), userId, to.toLowerCase()]);
  let resendResponse: Response;
  try {
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
          { name: "category", value: "document_email" },
          { name: "document_id", value: invoice.id },
          { name: "user_id", value: userId },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    return { ok: false, status: timedOut ? 504 : 502, body: {}, subject: email.subject, reason: timedOut ? "provider_timeout" : "provider_request_failed" };
  }
  const body = await resendResponse.json().catch(() => ({}));
  return { ok: resendResponse.ok, status: resendResponse.status, body, subject: email.subject, reason: resendResponse.ok ? null : "provider_rejected_request" };
}

Deno.serve(async (req) => {
  const automationSecret = Deno.env.get("AUTOMATION_SECRET") || "";
  if (!automationSecret || req.headers.get("x-automation-secret") !== automationSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const resendKey = Deno.env.get("RESEND_API_KEY") || "";

  const today = toISO(new Date());
  const nowISO = new Date().toISOString();

  const { data: due, error } = await admin.from("recurring_templates")
    .select("*").eq("active", true).lte("next_run", today);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  let generated = 0;
  let emailed = 0;
  let emailSkipped = 0;
  let emailFailed = 0;
  let generationFailed = 0;
  let duplicatePrevented = 0;
  let historyUpdateFailed = 0;

  for (const tpl of (due || [])) {
    try {
      const userId = String(tpl.user_id || "");
      if (!userId) {
        console.error("template missing user_id", tpl.id);
        generationFailed++;
        continue;
      }

      const occurrenceDate = String(tpl.next_run || "");
      if (!occurrenceDate) {
        generationFailed++;
        await insertAuditEvent(admin, {
          user_id: userId,
          actor_user_id: null,
          event_type: "recurring_invoice_generation_failed",
          object_type: "recurring_template",
          object_id: tpl.id,
          source: "edge_function",
          metadata: { stage: "validate_occurrence", reason: "missing_next_run" },
        });
        continue;
      }

      const number = await nextNumber(admin, userId);
      const invoice = {
        user_id: userId,
        doc_type: "invoice",
        number,
        status: "Sent",
        issue_date: today,
        due_date: today,
        customer_snapshot: tpl.customer_snapshot || null,
        currency: tpl.currency || "GBP",
        items: tpl.items || [],
        payments: [],
        global_discount: tpl.global_discount || 0,
        tax_mode: tpl.tax_mode || "exclusive",
        shipping_cost: tpl.shipping_cost || 0,
        notes: tpl.notes || null,
        terms: tpl.terms || null,
        grand_total: calcGrandTotal(tpl),
        recurring_template_id: tpl.id,
        recurring_occurrence_date: occurrenceDate,
        history: [
          { ts: nowISO, type: "created", text: "Document created" },
          { ts: nowISO, type: "recurring", text: "Generated automatically from recurring schedule" + (tpl.name ? ` "${tpl.name}"` : "") },
          { ts: nowISO, type: "sent", text: "Marked as sent" },
        ],
      };

      let inserted: any = null;
      let reusedExisting = false;
      const { data: created, error: insErr } = await admin.from("invoices")
        .insert(invoice).select("*").single();
      if (insErr) {
        if (insErr.code === "23505") {
          const { data: existing, error: existingError } = await admin.from("invoices")
            .select("*")
            .eq("recurring_template_id", tpl.id)
            .eq("recurring_occurrence_date", occurrenceDate)
            .maybeSingle();
          if (existingError || !existing) {
            generationFailed++;
            console.error("idempotent invoice lookup failed", tpl.id, existingError?.message || "not found");
            await insertAuditEvent(admin, {
              user_id: userId,
              actor_user_id: null,
              event_type: "recurring_invoice_generation_failed",
              object_type: "recurring_template",
              object_id: tpl.id,
              source: "edge_function",
              metadata: { stage: "idempotency_lookup", reason: "existing_invoice_unavailable", occurrence_date: occurrenceDate },
            });
            continue;
          }
          inserted = existing;
          reusedExisting = true;
          duplicatePrevented++;
          await insertAuditEvent(admin, {
            user_id: userId,
            actor_user_id: null,
            event_type: "recurring_generation_retry_reused_invoice",
            object_type: "invoice",
            object_id: existing.id,
            source: "edge_function",
            metadata: { recurring_template_id: tpl.id, occurrence_date: occurrenceDate },
          });
        } else {
          generationFailed++;
          console.error("insert failed", tpl.id, insErr.message);
          await insertAuditEvent(admin, {
            user_id: userId,
            actor_user_id: null,
            event_type: "recurring_invoice_generation_failed",
            object_type: "recurring_template",
            object_id: tpl.id,
            source: "edge_function",
            metadata: { stage: "invoice_insert", reason: "database_rejected", occurrence_date: occurrenceDate },
          });
          continue;
        }
      } else {
        inserted = created;
      }

      const invoiceNumber = String(inserted.number || number);
      const res = catchUp(tpl, today);
      const hist = Array.isArray(tpl.history) ? tpl.history : [];
      hist.push({ ts: nowISO, type: "generated", text: `Generated invoice #${invoiceNumber} (scheduled)` });

      const { data: claimed, error: claimError } = await admin.from("recurring_templates").update({
        next_run: res.newNextRun,
        last_generated: today,
        generated_count: (tpl.generated_count || 0) + 1,
        history: hist,
        updated_at: new Date().toISOString(),
      })
        .eq("id", tpl.id)
        .eq("user_id", userId)
        .eq("active", true)
        .eq("next_run", occurrenceDate)
        .select("id")
        .maybeSingle();

      if (claimError || !claimed) {
        if (claimError) generationFailed++;
        console.warn("recurring occurrence was not claimed", tpl.id, claimError?.message || "already claimed or changed");
        await insertAuditEvent(admin, {
          user_id: userId,
          actor_user_id: null,
          event_type: claimError
            ? "recurring_invoice_generation_failed"
            : "recurring_generation_claim_skipped",
          object_type: "recurring_template",
          object_id: tpl.id,
          source: "edge_function",
          metadata: {
            stage: "schedule_claim",
            reason: claimError ? "database_rejected" : "already_claimed_or_changed",
            invoice_id: inserted.id,
            occurrence_date: occurrenceDate,
            reused_existing: reusedExisting,
          },
        });
        continue;
      }

      generated++;
      await insertAuditEvent(admin, {
        user_id: userId,
        actor_user_id: null,
        event_type: "recurring_invoice_generated",
        object_type: "invoice",
        object_id: inserted.id,
        source: "edge_function",
        metadata: {
          recurring_template_id: tpl.id,
          occurrence_date: occurrenceDate,
          reused_existing: reusedExisting,
        },
      });

      if (tpl.email_enabled === true) {
        const to = String(tpl.customer_snapshot?.email || "").trim();
        if (!validEmail(to)) {
          emailSkipped++;
          hist.push({ ts: nowISO, type: "email", text: `Automatic email skipped for invoice #${invoiceNumber}: customer has no valid email address` });
        } else if (!resendKey) {
          emailSkipped++;
          hist.push({ ts: nowISO, type: "email", text: `Automatic email skipped for invoice #${invoiceNumber}: email service is not configured` });
        } else {
          const { data: company } = await admin.from("company_settings").select("*").eq("user_id", userId).maybeSingle();
          const sentAt = new Date().toISOString();
          const sendResult = await sendInvoiceEmail(resendKey, inserted, company || {}, to, userId);
          if (sendResult.ok) {
            emailed++;
            const invoiceHistory = Array.isArray(inserted.history) ? inserted.history : [];
            invoiceHistory.push({ ts: sentAt, type: "sent", text: `Sent to email provider for delivery to ${to}` });
            await admin.from("invoices")
              .update({ history: invoiceHistory, updated_at: sentAt })
              .eq("id", inserted.id)
              .eq("user_id", userId);
            hist.push({ ts: sentAt, type: "email", text: `Sent invoice #${invoiceNumber} to email provider for ${to}` });
            await insertAuditEvent(admin, {
              user_id: userId,
              actor_user_id: userId,
              event_type: "document_email_sent",
              object_type: "invoice",
              object_id: inserted.id,
              source: "edge_function",
              provider: "resend",
              provider_event_id: sendResult.body?.id || null,
              metadata: { to, from: FROM_EMAIL, subject: sendResult.subject, automated: true, recurring_template_id: tpl.id },
            });
          } else {
            emailFailed++;
            const invoiceHistory = Array.isArray(inserted.history) ? inserted.history : [];
            invoiceHistory.push({ ts: sentAt, type: "email", text: `Automatic email failed to ${to}` });
            await admin.from("invoices")
              .update({ history: invoiceHistory, updated_at: sentAt })
              .eq("id", inserted.id)
              .eq("user_id", userId);
            hist.push({ ts: sentAt, type: "email", text: `Automatic email failed for invoice #${invoiceNumber}` });
            await insertAuditEvent(admin, {
              user_id: userId,
              actor_user_id: userId,
              event_type: "email_send_failed",
              object_type: "invoice",
              object_id: inserted.id,
              source: "edge_function",
              provider: "resend",
              metadata: {
                status: sendResult.status,
                reason: sendResult.reason || "provider_rejected_request",
                automated: true,
                recurring_template_id: tpl.id,
              },
            });
          }
        }
      }

      if (tpl.email_enabled === true) {
        const { error: historyError } = await admin.from("recurring_templates")
          .update({ history: hist, updated_at: new Date().toISOString() })
          .eq("id", tpl.id)
          .eq("user_id", userId);
        if (historyError) {
          historyUpdateFailed++;
          console.error("schedule history update failed", tpl.id, historyError.message);
          await insertAuditEvent(admin, {
            user_id: userId,
            actor_user_id: null,
            event_type: "recurring_schedule_history_update_failed",
            object_type: "recurring_template",
            object_id: tpl.id,
            source: "edge_function",
            metadata: { invoice_id: inserted.id, occurrence_date: occurrenceDate },
          });
        }
      }
    } catch (e) {
      generationFailed++;
      console.error("template failed", tpl.id, String(e));
      const userId = String(tpl.user_id || "");
      if (userId) {
        await insertAuditEvent(admin, {
          user_id: userId,
          actor_user_id: null,
          event_type: "recurring_invoice_generation_failed",
          object_type: "recurring_template",
          object_id: tpl.id,
          source: "edge_function",
          metadata: { stage: "template_processing", reason: "unexpected_error" },
        });
      }
    }
  }

  const ok = generationFailed === 0 && historyUpdateFailed === 0;
  return new Response(JSON.stringify({
    ok,
    generated,
    emailed,
    emailSkipped,
    emailFailed,
    generationFailed,
    duplicatePrevented,
    historyUpdateFailed,
    checked: (due || []).length,
  }), {
    status: ok ? 200 : 500,
    headers: { "Content-Type": "application/json" },
  });
});
