// send-document-email - manual transactional document email via Resend.
// The browser asks to send a saved document; this function authenticates the
// caller, verifies document ownership, sends the email, and records history.

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

type EmailLine = {
  name: string;
  qty: number;
  unit: string;
  price: number;
  discount: number;
  tax: number;
  total: number;
};

type PaymentLink = {
  label: string;
  url: string;
  amount: number;
  kind: string;
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

function docTypeNoun(docType: string) {
  return ({ invoice: "Invoice", quote: "Quote", credit: "Credit Note" } as Record<string, string>)[docType] || "Invoice";
}

function currencySymbol(code: string) {
  return ({ GBP: "£", EUR: "€", USD: "$" } as Record<string, string>)[code] || `${code} `;
}

function formatMoney(code: string, amount: unknown) {
  return `${currencySymbol(code)}${(Number(amount) || 0).toFixed(2)}`;
}

function formatMoneyAscii(code: string, amount: unknown) {
  return `${code || "GBP"} ${(Number(amount) || 0).toFixed(2)}`;
}

function brandColor(company: any): string {
  const color = String(company?.brand_color || "#4f46e5").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#4f46e5";
}

function amountPaid(payments: unknown): number {
  if (!Array.isArray(payments)) return 0;
  return payments.reduce((sum: number, payment: InvoicePayment) => {
    return sum + (Number(payment?.amount) || 0);
  }, 0);
}

function outstandingAmount(inv: any): number {
  return Math.max(0, (Number(inv.grand_total) || 0) - amountPaid(inv.payments));
}

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
  return { subtotal, globalDiscountAmt, taxAmt, taxByRate, shipping, mode, grandTotal };
}

function buildEmail(inv: any, company: any, paymentLinks: PaymentLink[] = []) {
  const noun = docTypeNoun(inv.doc_type);
  const currency = inv.currency || "GBP";
  const color = brandColor(company);
  const totals = calcTotals(inv);
  const total = Number(inv.grand_total) || totals.grandTotal;
  const customer = inv.customer_snapshot || {};
  const companyName = company?.name || "Tallyo";
  const subject = `${noun} #${inv.number} from ${companyName}`;
  const lines: EmailLine[] = (inv.items || []).map((item: any): EmailLine => {
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
    `Please find ${noun.toLowerCase()} #${inv.number} from ${companyName}.`,
    "",
    `${noun}: #${inv.number}`,
    `Issue date: ${inv.issue_date || ""}`,
    `Due date: ${inv.due_date || ""}`,
    `Total: ${formatMoney(currency, total)}`,
    "",
    "Items:",
    ...lines.map((line) => `- ${line.name}: ${line.qty}${line.unit ? ` ${line.unit}` : ""} x ${formatMoney(currency, line.price)}${line.discount ? `, ${line.discount}% discount` : ""}${line.tax ? `, ${line.tax}% tax` : ""} = ${formatMoney(currency, line.total)} before tax`),
    "",
    "Summary:",
    `Subtotal: ${formatMoney(currency, totals.subtotal)}`,
  ];

  if (totals.globalDiscountAmt > 0) textLines.push(`Discount: -${formatMoney(currency, totals.globalDiscountAmt)}`);
  if (totals.taxAmt > 0) textLines.push(`${taxLabel}: ${formatMoney(currency, totals.taxAmt)}`);
  if (totals.shipping > 0) textLines.push(`Shipping: ${formatMoney(currency, totals.shipping)}`);
  textLines.push(`Total: ${formatMoney(currency, total)}`);
  if (paymentLinks.length) {
    textLines.push("", "Pay online:");
    paymentLinks.forEach((link) => textLines.push(`- ${link.label}: ${link.url}`));
  }

  if (inv.notes) textLines.push("", "Notes:", String(inv.notes));
  if (inv.terms) textLines.push("", "Terms:", String(inv.terms));
  if (company?.payment_details) textLines.push("", "Payment details:", String(company.payment_details));
  textLines.push("", "Thank you", companyName);

  const itemRows = lines.map((line) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(line.name)}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(line.qty)}${line.unit ? ` ${escapeHtml(line.unit)}` : ""}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(formatMoney(currency, line.price))}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${line.discount ? `${escapeHtml(line.discount)}%` : "-"}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${line.tax ? `${escapeHtml(line.tax)}%` : "-"}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(formatMoney(currency, line.total))}</td>
    </tr>`).join("");

  const summaryRows = [
    ["Subtotal", totals.subtotal, ""],
    ...(totals.globalDiscountAmt > 0 ? [["Discount", totals.globalDiscountAmt, "-"]] : []),
    ...(totals.taxAmt > 0 ? [[taxLabel, totals.taxAmt, ""]] : []),
    ...(totals.shipping > 0 ? [["Shipping", totals.shipping, ""]] : []),
  ].map(([label, amount, prefix]) => `
    <tr>
      <td style="padding:6px 0;color:#475569;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;text-align:right;font-weight:600;">${escapeHtml(prefix)}${escapeHtml(formatMoney(currency, amount))}</td>
    </tr>`).join("");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5;max-width:680px;margin:0 auto;">
      <h1 style="font-size:22px;margin:0 0 12px;">${escapeHtml(noun)} #${escapeHtml(inv.number)}</h1>
      <p>Hi ${escapeHtml(customer.name || "there")},</p>
      <p>Please find ${escapeHtml(noun.toLowerCase())} #${escapeHtml(inv.number)} from ${escapeHtml(companyName)}.</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:18px 0;">
        <p style="margin:0 0 6px;"><strong>Issue date:</strong> ${escapeHtml(inv.issue_date || "")}</p>
        <p style="margin:0 0 6px;"><strong>Due date:</strong> ${escapeHtml(inv.due_date || "")}</p>
        <p style="margin:0;font-size:18px;"><strong>Total:</strong> ${escapeHtml(formatMoney(currency, total))}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:18px 0;">
        <thead>
          <tr style="background:${escapeHtml(color)};color:#ffffff;">
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
            <td style="padding:10px 0;border-top:2px solid ${escapeHtml(color)};font-size:18px;font-weight:700;">Total</td>
            <td style="padding:10px 0;border-top:2px solid ${escapeHtml(color)};text-align:right;font-size:18px;font-weight:700;">${escapeHtml(formatMoney(currency, total))}</td>
          </tr>
        </tbody>
      </table>
      ${paymentLinks.length ? `<div style="margin:22px 0;text-align:center;">${paymentLinks.map((link) => `<a href="${escapeHtml(link.url)}" style="display:inline-block;background:${escapeHtml(color)};color:#ffffff;text-decoration:none;font-weight:700;border-radius:8px;padding:12px 18px;margin:4px;">${escapeHtml(link.label)}</a>`).join("")}</div>` : ""}
      ${inv.notes ? `<h2 style="font-size:16px;margin-top:20px;">Notes</h2><p>${escapeHtml(inv.notes).replaceAll("\n", "<br>")}</p>` : ""}
      ${inv.terms ? `<h2 style="font-size:16px;margin-top:20px;">Terms</h2><p>${escapeHtml(inv.terms).replaceAll("\n", "<br>")}</p>` : ""}
      ${company?.payment_details ? `<h2 style="font-size:16px;margin-top:20px;">Payment details</h2><p>${escapeHtml(company.payment_details).replaceAll("\n", "<br>")}</p>` : ""}
      <p style="margin-top:24px;">Thank you<br>${escapeHtml(companyName)}</p>
    </div>`;

  return { subject, text: textLines.join("\n"), html };
}

function pdfEscape(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildPdfBase64(inv: any, company: any): string {
  const noun = docTypeNoun(inv.doc_type);
  const currency = inv.currency || "GBP";
  const totals = calcTotals(inv);
  const total = Number(inv.grand_total) || totals.grandTotal;
  const customer = inv.customer_snapshot || {};
  const companyName = company?.name || "Tallyo";
  const lines = [
    `${noun} #${inv.number || ""}`,
    companyName,
    "",
    `Bill to: ${customer.name || ""}`,
    customer.address || "",
    customer.email || "",
    "",
    `Issue date: ${inv.issue_date || ""}`,
    `Due date: ${inv.due_date || ""}`,
    `Total: ${formatMoneyAscii(currency, total)}`,
    "",
    "Items",
    ...((inv.items || []).map((item: any) => {
      const qty = Number(item.qty) || 0;
      const price = Number(item.price) || 0;
      const discount = Number(item.discount) || 0;
      const lineTotal = qty * price * (1 - discount / 100);
      return `${item.name || "Item"} | Qty ${qty}${item.unit ? ` ${item.unit}` : ""} | ${formatMoneyAscii(currency, price)} | Total ${formatMoneyAscii(currency, lineTotal)}`;
    })),
    "",
    `Subtotal: ${formatMoneyAscii(currency, totals.subtotal)}`,
    ...(totals.globalDiscountAmt > 0 ? [`Discount: -${formatMoneyAscii(currency, totals.globalDiscountAmt)}`] : []),
    ...(totals.taxAmt > 0 ? [`Tax: ${formatMoneyAscii(currency, totals.taxAmt)}`] : []),
    ...(totals.shipping > 0 ? [`Shipping: ${formatMoneyAscii(currency, totals.shipping)}`] : []),
    `Total: ${formatMoneyAscii(currency, total)}`,
    ...(inv.notes ? ["", "Notes", String(inv.notes)] : []),
    ...(inv.terms ? ["", "Terms", String(inv.terms)] : []),
    ...(company?.payment_details ? ["", "Payment details", String(company.payment_details)] : []),
  ].filter((line) => line != null);

  const content = [
    "BT",
    "/F1 16 Tf",
    "50 790 Td",
    ...lines.flatMap((line, index) => {
      const escaped = pdfEscape(line);
      const font = index === 0 ? ["/F1 16 Tf"] : index === 1 ? ["/F1 11 Tf"] : [];
      return [...font, `(${escaped}) Tj`, "0 -18 Td"];
    }),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  let binary = "";
  for (let i = 0; i < pdf.length; i++) binary += String.fromCharCode(pdf.charCodeAt(i) & 0xff);
  return btoa(binary);
}

async function insertAuditEvent(admin: any, payload: Record<string, unknown>) {
  try {
    const { error } = await admin.from("audit_events").insert(payload);
    if (error) console.warn("audit event insert skipped", error.message);
  } catch (e) {
    console.warn("audit event insert skipped", String(e));
  }
}

async function createStripeCheckoutUrl(inv: any, userId: string, to: string, admin: any, amount: number, kind: string): Promise<string | null> {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const appUrl = Deno.env.get("APP_BASE_URL")?.replace(/\/+$/, "");
  if (!stripeKey || !appUrl) return null;
  if (inv.doc_type !== "invoice" || inv.status === "Cancelled" || inv.status === "Paid") return null;

  const outstanding = outstandingAmount(inv);
  const safeAmount = Math.min(Math.max(Number(amount) || 0, 0), outstanding);
  const amountMinor = Math.round(safeAmount * 100);
  if (!Number.isFinite(amountMinor) || amountMinor < 1) return null;

  const currency = String(inv.currency || "GBP").toLowerCase();
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${appUrl}?payment=success&invoice=${encodeURIComponent(inv.id)}`);
  params.set("cancel_url", `${appUrl}?payment=cancelled&invoice=${encodeURIComponent(inv.id)}`);
  params.set("client_reference_id", String(inv.id));
  params.set("line_items[0][price_data][currency]", currency);
  params.set("line_items[0][price_data][unit_amount]", String(amountMinor));
  params.set("line_items[0][price_data][product_data][name]", `Invoice #${inv.number || inv.id}`);
  params.set("line_items[0][quantity]", "1");
  params.set("metadata[invoice_id]", String(inv.id));
  params.set("metadata[user_id]", userId);
  params.set("metadata[invoice_number]", String(inv.number || ""));
  params.set("metadata[payment_kind]", kind);
  params.set("payment_intent_data[metadata][invoice_id]", String(inv.id));
  params.set("payment_intent_data[metadata][user_id]", userId);
  params.set("payment_intent_data[metadata][payment_kind]", kind);
  if (validEmail(to)) params.set("customer_email", to.trim());

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const stripeBody = await stripeResponse.json().catch(() => ({}));
  if (!stripeResponse.ok) {
    console.warn("Stripe Checkout link skipped", stripeBody?.error?.message || stripeResponse.status);
    return null;
  }

  await insertAuditEvent(admin, {
    user_id: userId,
    actor_user_id: userId,
    event_type: "stripe_checkout_created",
    object_type: "invoice",
    object_id: inv.id,
    source: "edge_function",
    provider: "stripe",
    provider_event_id: stripeBody?.id || null,
    metadata: {
      invoice_number: inv.number || null,
      amount: amountMinor / 100,
      currency: inv.currency || "GBP",
      customer_email: to,
      channel: "document_email",
      payment_kind: kind,
    },
  });

  return stripeBody?.url || null;
}

async function createPaymentLinks(inv: any, userId: string, to: string, admin: any): Promise<PaymentLink[]> {
  const outstanding = outstandingAmount(inv);
  if (outstanding <= 0.001) return [];

  const links: PaymentLink[] = [];
  const mode = String(inv.online_payment_mode || "full");
  const deposit = Math.min(Math.max(Number(inv.deposit_amount) || 0, 0), outstanding);

  if (mode === "deposit" && deposit > 0.001 && deposit < outstanding - 0.001) {
    const depositUrl = await createStripeCheckoutUrl(inv, userId, to, admin, deposit, "deposit");
    if (depositUrl) links.push({ label: `Pay deposit ${formatMoney(inv.currency || "GBP", deposit)} now`, url: depositUrl, amount: deposit, kind: "deposit" });
  }

  const fullUrl = await createStripeCheckoutUrl(inv, userId, to, admin, outstanding, "full_balance");
  if (fullUrl) links.push({ label: `Pay full balance ${formatMoney(inv.currency || "GBP", outstanding)} now`, url: fullUrl, amount: outstanding, kind: "full_balance" });
  return links;
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
  const to = String(body.to || "").trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
    return json({ error: "Invalid document ID" }, 400);
  }
  if (!validEmail(to)) return json({ error: "Enter a valid recipient email address" }, 400);

  const { data: inv, error: invError } = await admin.from("invoices").select("*").eq("id", documentId).maybeSingle();
  if (invError) return json({ error: invError.message }, 500);
  if (!inv || inv.user_id !== userData.user.id) return json({ error: "Document not found" }, 404);
  if (inv.status === "Cancelled") return json({ error: "Cancelled documents cannot be emailed" }, 400);

  const { data: company } = await admin.from("company_settings").select("*").eq("user_id", userData.user.id).maybeSingle();
  const paymentLinks = await createPaymentLinks(inv, userData.user.id, to, admin);
  const email = buildEmail(inv, company || {}, paymentLinks);
  const filenameNumber = String(inv.number || "invoice").replace(/[^a-z0-9_-]+/gi, "-");
  const resendPayload = {
    from: FROM_EMAIL,
    to: [to],
    subject: email.subject,
    html: email.html,
    text: email.text,
    attachments: [
      {
        filename: `${docTypeNoun(inv.doc_type).replaceAll(" ", "-")}-${filenameNumber}.pdf`,
        content: buildPdfBase64(inv, company || {}),
      },
    ],
    tags: [
      { name: "category", value: "document_email" },
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
      metadata: { to, status: resendResponse.status, response: resendBody },
    });
    return json({ error: resendBody?.message || "Email could not be sent" }, 502);
  }

  const nowISO = new Date().toISOString();
  const history = Array.isArray(inv.history) ? inv.history : [];
  history.push({
    ts: nowISO,
    type: "sent",
    text: `Emailed to ${to}`,
  });

  const nextStatus = inv.status === "Draft" ? "Sent" : inv.status;
  const { data: updated, error: updateError } = await admin.from("invoices")
    .update({ history, status: nextStatus, updated_at: nowISO })
    .eq("id", documentId)
    .eq("user_id", userData.user.id)
    .select("*")
    .single();
  if (updateError) return json({ error: updateError.message }, 500);

  await insertAuditEvent(admin, {
    user_id: userData.user.id,
    actor_user_id: userData.user.id,
    event_type: "document_email_sent",
    object_type: "invoice",
    object_id: documentId,
    source: "edge_function",
    provider: "resend",
    provider_event_id: resendBody?.id || null,
    metadata: { to, from: FROM_EMAIL, subject: email.subject },
  });

  return json({ ok: true, emailId: resendBody?.id || null, invoice: updated });
});
