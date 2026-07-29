const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

async function main() {
  const paymentOptions = await import(pathToFileURL(path.join(
    root,
    'supabase',
    'functions',
    '_shared',
    'invoice-payment-options.mjs'
  )).href);
  const app = read('index.html');
  const email = read('supabase', 'functions', 'send-document-email', 'index.ts');
  const connectCheckout = read('supabase', 'functions', 'create-connect-checkout', 'index.ts');

  const baseInvoice = {
    doc_type: 'invoice',
    status: 'Sent',
    grand_total: 100,
    payments: [],
    deposit_amount: 30,
  };

  let checkoutCreates = 0;
  const noLinks = await paymentOptions.createOptionalInvoicePaymentLinks({
    includeOnlinePayment: false,
    invoice: baseInvoice,
    paymentKind: 'full_balance',
    createLink: async () => {
      checkoutCreates += 1;
      return { url: 'https://checkout.stripe.com/should-not-exist' };
    },
  });
  assert.deepEqual(noLinks, []);
  assert.equal(checkoutCreates, 0, 'Off must not call the Checkout creator');

  const fullLinks = await paymentOptions.createOptionalInvoicePaymentLinks({
    includeOnlinePayment: true,
    invoice: baseInvoice,
    paymentKind: 'full_balance',
    createLink: async selection => {
      checkoutCreates += 1;
      return { ...selection, url: 'https://checkout.stripe.com/full' };
    },
  });
  assert.equal(fullLinks.length, 1);
  assert.equal(fullLinks[0].kind, 'full_balance');
  assert.equal(fullLinks[0].amount, 100);

  const depositLinks = await paymentOptions.createOptionalInvoicePaymentLinks({
    includeOnlinePayment: true,
    invoice: baseInvoice,
    paymentKind: 'deposit',
    createLink: async selection => ({ ...selection, url: 'https://checkout.stripe.com/deposit' }),
  });
  assert.equal(depositLinks.length, 1);
  assert.equal(depositLinks[0].kind, 'deposit');
  assert.equal(depositLinks[0].amount, 30);
  assert.equal(depositLinks[0].remainingBalance, 70);

  assert.throws(
    () => paymentOptions.resolveInvoicePaymentSelection(
      { ...baseInvoice, deposit_amount: 0 },
      'deposit'
    ),
    /greater than zero/
  );
  assert.throws(
    () => paymentOptions.resolveInvoicePaymentSelection(
      { ...baseInvoice, deposit_amount: 101 },
      'deposit'
    ),
    /cannot exceed/
  );
  assert.throws(
    () => paymentOptions.resolveInvoicePaymentSelection(
      { ...baseInvoice, status: 'Paid' },
      'full_balance'
    ),
    /already paid/
  );
  assert.throws(
    () => paymentOptions.resolveInvoicePaymentSelection(
      { ...baseInvoice, grand_total: 0 },
      'full_balance'
    ),
    /no outstanding balance/
  );
  assert.throws(
    () => paymentOptions.resolveInvoicePaymentSelection(
      { ...baseInvoice, status: 'Cancelled' },
      'full_balance'
    ),
    /cannot be paid online/
  );
  assert.throws(
    () => paymentOptions.resolveInvoicePaymentSelection(
      baseInvoice,
      'unexpected'
    ),
    /Choose either/
  );
  assert.equal(paymentOptions.stripeConnectReady(null), false);
  assert.equal(paymentOptions.stripeConnectReady({
    onboarding_state: 'active',
    card_payments_status: 'active',
    payouts_status: 'pending',
  }), false);
  assert.equal(paymentOptions.stripeConnectReady({
    onboarding_state: 'active',
    card_payments_status: 'active',
    payouts_status: 'active',
  }), true);

  assert.match(app, /Include online payment option/);
  assert.match(app, /includeOnlinePayment: false/);
  assert.match(app, /Stripe processing fees may apply/);
  assert.match(app, /canOfferOnlinePayment\(documentEmailModal\.inv\)/);
  assert.match(app, /body: \{ documentId: inv\.id, to, includeOnlinePayment: false \}/);
  assert.match(app, /The customer will be asked to pay/);
  assert.match(app, /Return to the invoice and enter a deposit greater than zero in the Online payment amount box\./);
  assert.match(app, /role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(app, /showAppNotice\('Email is on its way'/);
  assert.doesNotMatch(app, /alert\('Email accepted for delivery/);

  assert.match(email, /body\.includeOnlinePayment === true/);
  assert.match(email, /typeof body\.includeOnlinePayment !== "boolean"/);
  assert.match(email, /createOptionalInvoicePaymentLinks/);
  assert.match(email, /stripeConnectReady\(mapping\)/);
  assert.match(email, /paymentLinks\.length[\s\S]*?no_online_payment/);
  assert.match(email, /company\?\.payment_details/);
  const createPaymentLinksBlock = email.match(
    /async function createPaymentLinks[\s\S]*?\n}\n\nDeno\.serve/
  )?.[0] || '';
  assert.doesNotMatch(
    createPaymentLinksBlock,
    /createStripeCheckoutUrl/,
    'invoice email payment links must use the connected-account direct-charge path'
  );

  assert.match(connectCheckout, /resolveInvoicePaymentSelection\(invoice, paymentKind\)/);
  assert.match(connectCheckout, /Number\(session\?\.amount_total\) !== amountMinor/);
  assert.match(connectCheckout, /session\?\.metadata\?\.payment_kind/);
  assert.match(connectCheckout, /metadata\[payment_kind\]", selection\.kind/);
  assert.match(connectCheckout, /payment_intent_data\[metadata\]\[payment_kind\]/);
  assert.doesNotMatch(connectCheckout, /application_fee|transfer_data|destination|on_behalf_of/);

  console.log('invoice-email-payment-option-harness: ok');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
