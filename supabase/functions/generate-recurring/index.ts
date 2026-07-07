// generate-recurring — scheduled Edge Function
// Finds active recurring schedules that are due, generates one invoice each,
// advances next_run, and logs to the schedule's history.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// ---- totals (mirrors the app so generated invoices are consistent) ----
function calcGrandTotal(tpl: any): number {
  const items = tpl.items || [];
  const exclusive = (tpl.tax_mode || "exclusive") === "exclusive";
  let sub = 0, tax = 0;
  for (const it of items) {
    const qty = Number(it.qty) || 0, price = Number(it.price) || 0;
    const disc = Number(it.discount) || 0, rate = Number(it.tax) || 0;
    const line = qty * price * (1 - disc / 100);
    if (exclusive) { sub += line; tax += line * rate / 100; }
    else { const net = line / (1 + rate / 100); sub += net; tax += line - net; }
  }
  const shipping = Number(tpl.shipping_cost) || 0;
  const gd = Number(tpl.global_discount) || 0;
  const afterDiscount = sub - (sub * gd / 100);
  return Math.round((afterDiscount + tax + shipping) * 100) / 100;
}

// ---- next invoice number, per user, per doc type, WITH the user's prefix ----
async function nextNumber(admin: any, userId: string): Promise<string> {
  // Look up this user's invoice prefix from their company settings.
  const { data: settings } = await admin.from("company_settings")
    .select("invoice_prefix").eq("user_id", userId).single();
  const prefix = (settings?.invoice_prefix ?? "") as string;

  // Find the highest existing invoice number for this user.
  const { data } = await admin.from("invoices")
    .select("number").eq("user_id", userId).eq("doc_type", "invoice");
  let max = 0;
  for (const r of (data || [])) {
    const n = parseInt(String(r.number).replace(/\D/g, ""), 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return prefix + String(max + 1).padStart(4, "0");
}

Deno.serve(async (_req) => {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,   // privileged key — server-side only
  );

  const today = toISO(new Date());
  const nowISO = new Date().toISOString();

  // Find active schedules that are due (across ALL users).
  const { data: due, error } = await admin.from("recurring_templates")
    .select("*").eq("active", true).lte("next_run", today);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  let generated = 0;
  for (const tpl of (due || [])) {
    try {
      const number = await nextNumber(admin, tpl.user_id);
      const invoice = {
        user_id: tpl.user_id,                        // <-- critical: stamp the schedule's owner
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
        history: [
          { ts: nowISO, type: "created",   text: "Document created" },
          { ts: nowISO, type: "recurring", text: "Generated automatically from recurring schedule" + (tpl.name ? ` "${tpl.name}"` : "") },
          { ts: nowISO, type: "sent",      text: "Marked as sent" },
        ],
      };

      const { error: insErr } = await admin.from("invoices").insert(invoice);
      if (insErr) { console.error("insert failed", tpl.id, insErr.message); continue; }

      const res = catchUp(tpl, today);
      const hist = tpl.history || [];
      hist.push({ ts: nowISO, type: "generated", text: `Generated invoice #${number} (scheduled)` });

      await admin.from("recurring_templates").update({
        next_run: res.newNextRun,
        last_generated: today,
        generated_count: (tpl.generated_count || 0) + 1,
        history: hist,
        updated_at: nowISO,
      }).eq("id", tpl.id);

      generated++;
    } catch (e) {
      console.error("template failed", tpl.id, String(e));
    }
  }

  return new Response(JSON.stringify({ ok: true, generated, checked: (due || []).length }), {
    headers: { "Content-Type": "application/json" },
  });
});