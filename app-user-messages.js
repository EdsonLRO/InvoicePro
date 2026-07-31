(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TallyoUserMessages = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const technicalDetailPattern = /row-level security|\brls\b|violates|constraint|duplicate key|permission denied|postgres|relation ["']|edge function|non-2xx|failed to fetch|network request failed|\bjwt\b|refresh token|supabase|\btable ["']/i;

  const contexts = [
    { match: /could not save customer/i, title: 'Customer wasn\'t saved', action: 'Check the customer details and try again.' },
    { match: /could not save item/i, title: 'Saved item wasn\'t saved', action: 'Check the item details and try again.' },
    { match: /could not save settings/i, title: 'Settings weren\'t saved', action: 'Check your connection and try saving again.' },
    { match: /could not save schedule/i, title: 'Schedule wasn\'t saved', action: 'Check the schedule details and try again.' },
    { match: /could not save preset/i, title: 'Recurring setup wasn\'t saved', action: 'Check the recurring invoice details and try again.' },
    { match: /could not save/i, title: 'Changes weren\'t saved', action: 'Check the details and try again.' },
    { match: /could not load your data/i, title: 'Your data couldn\'t be loaded', action: 'Refresh the page and try again. If this continues, sign out and back in.' },
    { match: /registration failed/i, title: 'Account wasn\'t created', action: 'Check the details and try again. If this email is already registered, sign in or reset the password instead.' },
    { match: /sign in failed/i, title: 'Couldn\'t sign in', action: 'Check your email and password, then try again. Use Forgot password if needed.' },
    { match: /could not send reset email/i, title: 'Reset email wasn\'t sent', action: 'Wait a moment and try again. Also check that the email address is typed correctly.' },
    { match: /could not change password/i, title: 'Password wasn\'t changed', action: 'Check the information you entered and try again.' },
    { match: /could not verify authenticator|two-factor verification could not be confirmed/i, title: 'Verification wasn\'t completed', action: 'Use the latest code from your authenticator app and try again.' },
    { match: /could not start setup/i, title: 'Two-factor setup couldn\'t start', action: 'Refresh the page and try again.' },
    { match: /could not generate recovery codes/i, title: 'Recovery codes weren\'t created', action: 'Refresh the page and try again. Your existing codes remain unchanged.' },
    { match: /could not remove authenticator/i, title: 'Authenticator wasn\'t removed', action: 'Try again. Your existing sign-in protection remains active.' },
    { match: /could not turn off two-factor/i, title: 'Two-factor authentication remains on', action: 'Complete the verification again or keep two-factor authentication enabled.' },
    { match: /could not log out|could not sign out/i, title: 'Couldn\'t sign out', action: 'Refresh the page and try again.' },
    { match: /could not export account data/i, title: 'Account data wasn\'t downloaded', action: 'Refresh the page and try the download again.' },
    { match: /could not open card payment/i, title: 'Card payment couldn\'t be opened', action: 'Check that the invoice is saved, unpaid and eligible for card payment, then try again.' },
    { match: /could not send reminder/i, title: 'Reminder wasn\'t sent', action: 'Check the customer email address and try again.' },
    { match: /could not delete selected documents|could not delete selected schedules|could not delete selected customers|could not delete selected items|could not delete/i, title: 'Nothing was deleted', action: 'Refresh the page, check the selected records and try again.' },
    { match: /could not update selected item prices/i, title: 'Prices weren\'t updated', action: 'Check the price and try again.' },
    { match: /could not update status/i, title: 'Status wasn\'t updated', action: 'Refresh the document and try again.' },
    { match: /could not update/i, title: 'Changes weren\'t updated', action: 'Refresh the page and try again.' },
    { match: /bulk duplicate stopped/i, title: 'Documents weren\'t all duplicated', action: 'Review the selected documents and try again.' },
    { match: /pdf could not be generated/i, title: 'PDF wasn\'t created', action: 'Try the download again. If it still fails, refresh the page first.' },
    { match: /could not copy automatically/i, title: 'Couldn\'t copy to the clipboard', action: 'Select the text and copy it manually.' },
    { match: /could not read that file|could not read that image/i, title: 'File couldn\'t be opened', action: 'Choose another supported image and try again.' }
  ];

  function hasWriteAccess(accessState) {
    return ['full', 'grace'].includes(String(accessState || '').toLowerCase());
  }

  function titleForFriendlyMessage(message) {
    if (/password (?:updated|changed) successfully/i.test(message)) return 'Password changed';
    if (/two-factor authentication is now enabled/i.test(message)) return 'Two-factor authentication is on';
    if (/two-factor authentication has been turned off/i.test(message)) return 'Two-factor authentication is off';
    if (/signed out on every device/i.test(message)) return 'Signed out everywhere';
    if (/account data has been downloaded/i.test(message)) return 'Account data downloaded';
    if (/settings saved/i.test(message)) return 'Settings saved';
    if (/refund requested/i.test(message)) return 'Refund requested';
    if (/recovery codes copied/i.test(message)) return 'Recovery codes copied';
    if (/invoice.*created and marked as sent/i.test(message)) return 'Recurring invoices created';
    if (/pdf export complete/i.test(message)) return 'PDF export finished';
    if (/reminder accepted for delivery/i.test(message)) return 'Reminder is on its way';
    if (/session has ended/i.test(message)) return 'Session ended';
    if (/incorrect or expired code/i.test(message)) return 'Code wasn\'t accepted';
    if (/success|successfully|now enabled|has been turned off|saved\.?$|downloaded|created|updated|complete|copied|signed out|refund requested/i.test(message)) return 'Done';
    if (/^enter |^please |^choose |^set |^keep /i.test(message)) return 'Information needed';
    if (/save this invoice/i.test(message)) return 'Save the invoice first';
    if (/already paid/i.test(message)) return 'Invoice already paid';
    if (/cancelled .*cannot|cancelled invoices cannot/i.test(message)) return 'Cancelled invoice';
    if (/cannot exceed|too large/i.test(message)) return 'Amount is too high';
    if (/no refundable balance/i.test(message)) return 'Nothing left to refund';
    if (/incorrect|expired|could not|couldn\'t|failed|wasn\'t|weren\'t|cannot|can\'t|not available/i.test(message)) return 'That didn\'t work';
    return 'Action needed';
  }

  function toneFor(title, message) {
    if (/Done|changed|is on|is off|Signed out|downloaded|saved|requested|copied|created|finished|on its way/i.test(title)) return 'success';
    if (/could not|couldn\'t|failed|wasn\'t|weren\'t|incorrect|expired|cannot|can\'t|not available/i.test(title + ' ' + message)) return 'error';
    return 'warning';
  }

  function normalise(message, options) {
    const text = String(message || '').trim() || 'Please try again.';
    const accessState = options && options.accessState;
    const context = contexts.find(item => item.match.test(text));

    if (/reminder accepted for delivery/i.test(text)) {
      return {
        title: 'Reminder is on its way',
        message: 'You can check its delivery status in Activity History.',
        tone: 'success',
        duration: 7000
      };
    }

    if (/row-level security|\brls\b|permission denied/i.test(text)) {
      if (!hasWriteAccess(accessState)) {
        return {
          title: context ? context.title : 'This feature isn\'t active yet',
          message: 'This feature needs an active Tallyo Pro subscription. Open Account, choose a plan, then try again.',
          tone: 'warning',
          duration: 0
        };
      }
      return {
        title: context ? context.title : 'Tallyo couldn\'t complete that action',
        message: 'Tallyo could not confirm access to this feature. Refresh the page and try again. If it continues, sign out and back in or contact support.',
        tone: 'error',
        duration: 0
      };
    }

    if (technicalDetailPattern.test(text)) {
      const title = context ? context.title : 'Tallyo couldn\'t complete that action';
      const safeMessage = /failed to fetch|network request failed|edge function|non-2xx/i.test(text)
        ? 'Tallyo could not reach the secure service. Check your connection, wait a moment and try again.'
        : (context ? context.action : 'Refresh the page and try again. If the problem continues, contact Tallyo support.');
      return { title, message: safeMessage, tone: 'error', duration: 0 };
    }

    if (context) {
      const detail = text.includes(':') ? text.slice(text.indexOf(':') + 1).trim() : '';
      const safeDetail = detail && !technicalDetailPattern.test(detail) ? detail : context.action;
      return { title: context.title, message: safeDetail || context.action, tone: 'error', duration: 0 };
    }

    const title = titleForFriendlyMessage(text);
    const tone = toneFor(title, text);
    return { title, message: text, tone, duration: tone === 'error' ? 0 : 7000 };
  }

  return { normalise };
});
