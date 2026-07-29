/**
 * Admin notification recipients — parses ADMIN_NOTIFICATION_EMAIL as a
 * comma-separated list (plan §9, confirmed 2026-07-27: kontakt@fermentfreude.at
 * + connectwithrafaela@gmail.com) so every admin alert reaches everyone who
 * should see it. Purely env-var driven — adding/removing a recipient later
 * needs no code change (see plan §13 "changing these decisions later").
 *
 * New admin-alert call sites (this refund/rebooking system) use this helper.
 * The two pre-existing call sites (sendOrderConfirmationEmail.ts,
 * sendVoucherPurchaseEmail.ts) are retrofitted to it separately — see
 * docs/REFUND_REBOOKING_SYSTEM_PLAN.md §9.
 */
export function getAdminRecipients(): { email: string; name?: string }[] {
  const raw = process.env.ADMIN_NOTIFICATION_EMAIL || 'kontakt@fermentfreude.at'
  const emails = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return emails.length > 0
    ? emails.map((email) => ({ email }))
    : [{ email: 'kontakt@fermentfreude.at' }]
}
