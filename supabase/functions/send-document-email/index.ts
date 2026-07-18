// send-document-email - manual transactional document email via Resend.
// The browser asks to send a saved document; this function authenticates the
// caller, verifies document ownership, sends the email, and records history.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.1";

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

function hexToPdfRgb(color: string): string {
  const fallback = "#4f46e5";
  const safe = /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
  const r = parseInt(safe.slice(1, 3), 16) / 255;
  const g = parseInt(safe.slice(3, 5), 16) / 255;
  const b = parseInt(safe.slice(5, 7), 16) / 255;
  return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
}

function pdfText(value: unknown, x: number, y: number, size = 10, color = "0.070 0.090 0.150", font = "F1"): string {
  return `BT\n${color} rg\n/${font} ${size} Tf\n${x} ${y} Td\n(${pdfEscape(value)}) Tj\nET`;
}

function pdfRect(x: number, y: number, w: number, h: number, fill: string, stroke: string | null = null): string {
  const strokePart = stroke ? `${stroke} RG\n${x} ${y} ${w} ${h} re B` : `${x} ${y} ${w} ${h} re f`;
  return `q\n${fill} rg\n${strokePart}\nQ`;
}

function shorten(value: unknown, max = 56): string {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function buildPdfFromPages(pages: string[][]): string {
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];
  const kids: string[] = [];
  pages.forEach((pageCommands) => {
    const content = pageCommands.join("\n");
    const pageObjectNumber = objects.length + 1;
    const contentObjectNumber = pageObjectNumber + 1;
    kids.push(`${pageObjectNumber} 0 R`);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`);
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });
  objects[1] = `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pages.length} >>`;

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

function companyLines(company: any): string[] {
  return [
    company?.address,
    company?.phone || company?.mobile,
    company?.email,
  ].filter((line) => String(line || "").trim()).map((line) => String(line));
}

function customerLines(customer: any): string[] {
  return [
    customer?.address,
    customer?.phone || customer?.mobile,
    customer?.email,
  ].filter((line) => String(line || "").trim()).map((line) => String(line));
}

function buildPdfBase64(inv: any, company: any): string {
  const noun = docTypeNoun(inv.doc_type);
  const currency = inv.currency || "GBP";
  const totals = calcTotals(inv);
  const total = Number(inv.grand_total) || totals.grandTotal;
  const customer = inv.customer_snapshot || {};
  const companyName = company?.name || "Tallyo";
  const brand = hexToPdfRgb(brandColor(company));
  const text = "0.070 0.090 0.150";
  const muted = "0.390 0.455 0.560";
  const faint = "0.875 0.900 0.965";
  const veryFaint = "0.965 0.973 0.984";
  const border = "0.820 0.850 0.900";
  const pages: string[][] = [];
  let commands: string[] = [];
  const footerText = company?.invoice_footer || "Thank you for your business.";
  const addFooter = (target: string[]) => {
    target.push(pdfRect(40, 74, 515, 1, "0.900 0.920 0.950"));
    target.push(pdfText(footerText, 235, 48, 8, muted));
  };
  const addContinuationHeader = (_target: string[]) => {};
  const finishPage = () => {
    addFooter(commands);
    pages.push(commands);
    commands = [];
  };
  const addTableHeader = (target: string[], headerY: number) => {
    target.push(pdfRect(tableX, headerY, 515, 32, brand));
    target.push(pdfText("ITEM / DESCRIPTION", 50, headerY + 12, 8, "1 1 1", "F2"));
    target.push(pdfText("QTY / UNIT", 235, headerY + 12, 8, "1 1 1", "F2"));
    target.push(pdfText("PRICE", 338, headerY + 12, 8, "1 1 1", "F2"));
    target.push(pdfText("DISC", 405, headerY + 17, 8, "1 1 1", "F2"));
    target.push(pdfText("(%)", 412, headerY + 7, 8, "1 1 1", "F2"));
    target.push(pdfText("TAX", 455, headerY + 17, 8, "1 1 1", "F2"));
    target.push(pdfText("(%)", 461, headerY + 7, 8, "1 1 1", "F2"));
    target.push(pdfText("TOTAL", 510, headerY + 12, 8, "1 1 1", "F2"));
  };

  commands.push(pdfText(companyName, 40, 780, 13, text, "F2"));
  companyLines(company).slice(0, 4).forEach((line, index) => {
    commands.push(pdfText(shorten(line, 42), 40, 762 - index * 13, 8, muted));
  });

  commands.push(pdfText(noun.toUpperCase(), 425, 775, 24, faint, "F2"));
  commands.push(pdfText(`${noun} #:`, 425, 755, 9, text, "F2"));
  commands.push(pdfText(inv.number || "", 478, 755, 9, text));
  commands.push(pdfRect(40, 716, 515, 1.2, border));

  commands.push(pdfText("BILL TO", 40, 686, 8, faint, "F2"));
  commands.push(pdfText(customer.name || "Customer", 40, 670, 11, text, "F2"));
  customerLines(customer).slice(0, 4).forEach((line, index) => {
    commands.push(pdfText(shorten(line, 42), 40, 654 - index * 13, 8, muted));
  });

  commands.push(pdfText("DATE", 295, 686, 8, faint, "F2"));
  commands.push(pdfText(inv.issue_date || "-", 295, 670, 8, text, "F2"));
  commands.push(pdfText("DUE DATE", 420, 686, 8, faint, "F2"));
  commands.push(pdfText(inv.due_date || "-", 420, 670, 8, text, "F2"));
  commands.push(pdfText("PO NUMBER", 295, 632, 8, faint, "F2"));
  commands.push(pdfText(inv.po_number || "-", 295, 616, 8, text));

  const tableX = 40;
  let y = 575;
  addTableHeader(commands, y);
  y -= 35;

  const items = Array.isArray(inv.items) ? inv.items : [];
  let itemIndex = 0;
  let itemsOnPage = 0;
  while (itemIndex < items.length) {
    if (itemIndex === items.length - 1 && itemsOnPage > 0 && y - 32 < 300) {
      commands.push(pdfRect(40, y + 10, 515, 1, "0.900 0.920 0.950"));
      finishPage();
      addContinuationHeader(commands);
      y = 775;
      addTableHeader(commands, y);
      y -= 35;
      itemsOnPage = 0;
    }
    const item = items[itemIndex];
    const qty = Number(item.qty) || 0;
    const unit = item.unit ? ` ${item.unit}` : "";
    const price = Number(item.price) || 0;
    const discount = Number(item.discount) || 0;
    const tax = Number(item.tax) || 0;
    const lineTotal = qty * price * (1 - discount / 100);
    if (itemIndex % 2 === 0) commands.push(pdfRect(tableX, y - 9, 515, 30, "0.985 0.988 0.992"));
    commands.push(pdfText(shorten(item.name || "Item", 44), 50, y, 8, text));
    commands.push(pdfText(`${qty}${unit}`, 250, y, 8, text));
    commands.push(pdfText(formatMoneyAscii(currency, price), 332, y, 8, text));
    commands.push(pdfText(discount ? `${discount}%` : "0%", 410, y, 8, text));
    commands.push(pdfText(tax ? `${tax}%` : "0%", 458, y, 8, text));
    commands.push(pdfText(formatMoneyAscii(currency, lineTotal), 500, y, 8, text, "F2"));
    y -= 32;
    itemIndex++;
    itemsOnPage++;
    if (itemIndex < items.length && y < 180) {
      commands.push(pdfRect(40, y + 10, 515, 1, "0.900 0.920 0.950"));
      finishPage();
      addContinuationHeader(commands);
      y = 775;
      addTableHeader(commands, y);
      y -= 35;
      itemsOnPage = 0;
    }
  }

  commands.push(pdfRect(40, y + 10, 515, 1, "0.900 0.920 0.950"));

  let detailY = y - 45;
  commands.push(pdfText("NOTES", 40, detailY, 8, faint, "F2"));
  commands.push(pdfText(shorten(inv.notes || "", 58), 40, detailY - 18, 8, muted));
  detailY -= 44;
  commands.push(pdfText("TERMS", 40, detailY, 8, faint, "F2"));
  commands.push(pdfText(shorten(inv.terms || "", 58), 40, detailY - 18, 8, muted));
  detailY -= 44;
  commands.push(pdfText("PAYMENT DETAILS", 40, detailY, 8, faint, "F2"));
  String(company?.payment_details || "").split("\n").slice(0, 6).forEach((line, index) => {
    commands.push(pdfText(shorten(line, 58), 40, detailY - 18 - index * 12, 8, text));
  });

  const summaryRows = [
    ["Subtotal", totals.subtotal],
    ["Discount", -totals.globalDiscountAmt],
    ...(totals.taxAmt > 0 ? [["Tax", totals.taxAmt]] : []),
    ["Shipping", totals.shipping],
  ] as [string, number][];
  const totalBoxTop = Math.min(y - 32, 418);
  const totalBoxHeight = 120;
  const totalBoxBottom = totalBoxTop - totalBoxHeight;
  let summaryY = (totalBoxTop + totalBoxBottom + (summaryRows.length * 19) + 24) / 2;
  commands.push(pdfRect(365, totalBoxBottom, 190, totalBoxHeight, veryFaint, border));
  summaryRows.forEach(([label, amount]) => {
    commands.push(pdfText(label, 392, summaryY, 8, muted));
    commands.push(pdfText(formatMoneyAscii(currency, amount), 470, summaryY, 8, amount < 0 ? muted : text, "F2"));
    summaryY -= 19;
  });
  commands.push(pdfRect(385, summaryY + 5, 150, 1.2, brand));
  summaryY -= 24;
  commands.push(pdfText("Total", 402, summaryY, 12, text, "F2"));
  commands.push(pdfText(formatMoneyAscii(currency, total), 460, summaryY, 12, brand, "F2"));

  finishPage();
  return buildPdfFromPages(pages);
}

async function insertAuditEvent(admin: any, payload: Record<string, unknown>) {
  try {
    const { error } = await admin.from("audit_events").insert(payload);
    if (error) console.warn("audit event insert skipped", error.message);
  } catch (e) {
    console.warn("audit event insert skipped", String(e));
  }
}

async function insertRequiredAuditEvent(admin: any, payload: Record<string, unknown>) {
  const { error } = await admin.from("audit_events").insert(payload);
  if (!error || error.code === "23505") return;
  throw new Error(`required audit event insert failed: ${error.message}`);
}

function stripeKeyMatchesConfiguredMode(key: string): boolean {
  const expectsLive = Deno.env.get("STRIPE_LIVE_MODE") === "true";
  return expectsLive ? /^(?:sk|rk)_live_/.test(key) : /^(?:sk|rk)_test_/.test(key);
}

function stripePaymentsEnabled(): boolean {
  return Deno.env.get("STRIPE_LIVE_MODE") === "true"
    ? Deno.env.get("STRIPE_PAYMENTS_ENABLED") === "true"
    : Deno.env.get("STRIPE_PAYMENTS_ENABLED") !== "false";
}

async function checkoutIdempotencyKey(parts: string[]): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(parts.join("\u001f")),
  );
  const hex = Array.from(new Uint8Array(digest)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return `tallyo-checkout-${hex}`;
}

async function resendIdempotencyKey(parts: string[]): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(parts.join("\u001f")),
  );
  const hex = Array.from(new Uint8Array(digest)).map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return `tallyo-document-email-${hex}`;
}

async function createStripeCheckoutUrl(inv: any, userId: string, to: string, admin: any, amount: number, kind: string): Promise<string | null> {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const appUrl = Deno.env.get("APP_BASE_URL")?.replace(/\/+$/, "");
  if (!stripeKey || !appUrl) return null;
  if (!stripeKeyMatchesConfiguredMode(stripeKey)) {
    throw new Error("Stripe key mode does not match STRIPE_LIVE_MODE");
  }
  if (!stripePaymentsEnabled()) {
    throw new Error("Card payments are temporarily unavailable");
  }
  const stripeApiVersion = Deno.env.get("STRIPE_API_VERSION")?.trim();
  if (Deno.env.get("STRIPE_LIVE_MODE") === "true" && !stripeApiVersion) {
    throw new Error("STRIPE_API_VERSION is required in live mode");
  }
  if (inv.doc_type !== "invoice" || inv.status === "Cancelled" || inv.status === "Paid") return null;

  const outstanding = outstandingAmount(inv);
  const safeAmount = Math.min(Math.max(Number(amount) || 0, 0), outstanding);
  const amountMinor = Math.round(safeAmount * 100);
  if (!Number.isFinite(amountMinor) || amountMinor < 1) return null;

  const currency = String(inv.currency || "GBP").toLowerCase();
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("customer_creation", "always");
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

  const idempotencyKey = await checkoutIdempotencyKey([
    String(inv.id),
    userId,
    currency,
    String(amountMinor),
    String(inv.stripe_event_version || 0),
    kind,
    "document_email",
    to.trim().toLowerCase(),
  ]);

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": idempotencyKey,
      ...(stripeApiVersion ? { "Stripe-Version": stripeApiVersion } : {}),
    },
    body: params,
  });
  const stripeBody = await stripeResponse.json().catch(() => ({}));
  if (!stripeResponse.ok) {
    throw new Error(stripeBody?.error?.message || "Stripe Checkout link could not be created");
  }
  if (!stripeBody?.id || !stripeBody?.url) {
    throw new Error("Stripe Checkout returned an incomplete session");
  }

  await insertRequiredAuditEvent(admin, {
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
      idempotency_key: idempotencyKey,
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

  const resendRequestKey = await resendIdempotencyKey([
    documentId,
    userData.user.id,
    to.toLowerCase(),
    String(inv.updated_at || inv.created_at || ""),
  ]);
  let resendResponse: Response;
  try {
    resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": resendRequestKey,
      },
      body: JSON.stringify(resendPayload),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    await insertAuditEvent(admin, {
      user_id: userData.user.id,
      actor_user_id: userData.user.id,
      event_type: "email_send_failed",
      object_type: "invoice",
      object_id: documentId,
      source: "edge_function",
      provider: "resend",
      metadata: { reason: timedOut ? "provider_timeout" : "provider_request_failed" },
    });
    return json({ error: timedOut ? "Email provider timed out; it is safe to retry" : "Email provider could not be reached" }, timedOut ? 504 : 502);
  }
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
      metadata: { status: resendResponse.status, reason: "provider_rejected_request" },
    });
    return json({ error: resendBody?.message || "Email could not be sent" }, 502);
  }

  const nowISO = new Date().toISOString();
  const history = Array.isArray(inv.history) ? inv.history : [];
  history.push({
    ts: nowISO,
    type: "sent",
    text: `Sent to email provider for delivery to ${to}`,
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
    metadata: {},
  });

  return json({ ok: true, emailId: resendBody?.id || null, invoice: updated });
});
