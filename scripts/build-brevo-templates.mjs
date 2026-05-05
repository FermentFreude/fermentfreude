#!/usr/bin/env node
/**
 * Generate 8 V2 Brevo transactional email templates.
 *
 * Output: public/email-templates/v2/<id>-<slug>.html
 *
 * Design:
 * - 600px single column, Helvetica/Arial, inline CSS
 * - Brand: cream #F6F0E8, dark #1a1a1a, body #555251, accent #E5B765
 * - Logo submark + Lucide PNG icons hosted on R2 prod bucket
 * - Defensive Liquid: every param wrapped in `| default: ""`
 * - Raw HTML rendering for ORDER_ITEMS_HTML / WORKSHOP_BOOKINGS_HTML
 * - Subject lines NOT included here (PUT keeps existing V2 subjects)
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'email-templates', 'v2')
mkdirSync(OUT_DIR, { recursive: true })

const R2 = 'https://pub-c70f47169a1846d79fdab1a41ed2dc7f.r2.dev/media/email'
const SITE = 'https://www.fermentfreude.at'

// Brand tokens
const C = {
  cream: '#F6F0E8',
  dark: '#1a1a1a',
  body: '#555251',
  muted: '#8a8783',
  accent: '#E5B765',
  border: '#E8DFD0',
  rowAlt: '#FAF6EE',
  danger: '#c2410c',
  success: '#15803d',
  buttonText: '#1a1a1a',
}

const FONT = `font-family: Helvetica, Arial, sans-serif;`

// =============================================================================
// PARTIALS
// =============================================================================

function preheader(text) {
  return `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.cream};">${text}</div>`
}

function header() {
  return `<tr>
  <td align="center" style="padding:32px 24px 16px 24px;background-color:${C.cream};">
    <a href="${SITE}" style="text-decoration:none;border:0;outline:none;">
      <img src="${R2}/submark-dark.png" alt="FermentFreude" width="72" height="72" style="display:block;border:0;outline:none;width:72px;height:auto;" />
    </a>
  </td>
</tr>`
}

function footer() {
  return `<tr>
  <td style="padding:0;background-color:${C.dark};">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:32px 24px 16px 24px;">
          <a href="${SITE}" style="text-decoration:none;border:0;outline:none;">
            <img src="${R2}/submark-light.png" alt="FermentFreude" width="48" height="48" style="display:block;border:0;outline:none;width:48px;height:auto;" />
          </a>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:0 24px 16px 24px;${FONT}font-size:13px;line-height:1.5;color:#cbc6bd;">
          FermentFreude ist ein Workshop-Studio in Wien rund um Fermentation.<br>
          David &amp; Marcel — <a href="mailto:kontakt@fermentfreude.at" style="color:#cbc6bd;text-decoration:underline;">kontakt@fermentfreude.at</a>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:0 24px 20px 24px;">
          <a href="https://instagram.com/fermentfreude" style="display:inline-block;margin:0 6px;text-decoration:none;border:0;">
            <img src="${R2}/instagram.png" alt="Instagram" width="24" height="24" style="display:block;border:0;outline:none;width:24px;height:24px;" />
          </a>
          <a href="https://facebook.com/fermentfreude" style="display:inline-block;margin:0 6px;text-decoration:none;border:0;">
            <img src="${R2}/facebook.png" alt="Facebook" width="24" height="24" style="display:block;border:0;outline:none;width:24px;height:24px;" />
          </a>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:0 24px 28px 24px;${FONT}font-size:12px;line-height:1.6;color:#9b9690;">
          <a href="${SITE}/datenschutz" style="color:#9b9690;text-decoration:underline;">Datenschutz</a>
          &nbsp;·&nbsp;
          <a href="${SITE}/agb" style="color:#9b9690;text-decoration:underline;">AGB</a>
          &nbsp;·&nbsp;
          <a href="${SITE}/impressum" style="color:#9b9690;text-decoration:underline;">Impressum</a>
          <br><br>
          &copy; FermentFreude — Wien, Österreich
        </td>
      </tr>
    </table>
  </td>
</tr>`
}

function shell({ title, preheaderText, body }) {
  return `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<title>${title}</title>
<style>
  @media only screen and (max-width:620px){
    .ff-container{width:100% !important;}
    .ff-px{padding-left:20px !important;padding-right:20px !important;}
    .ff-h1{font-size:24px !important;line-height:1.25 !important;}
    .ff-stack{display:block !important;width:100% !important;}
    .ff-button a{display:block !important;width:auto !important;}
  }
  a{color:${C.dark};}
</style>
</head>
<body style="margin:0;padding:0;background-color:${C.cream};${FONT}color:${C.body};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
${preheader(preheaderText)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:${C.cream};">
  <tr>
    <td align="center" style="padding:0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="ff-container" style="border-collapse:collapse;width:600px;max-width:600px;background-color:${C.cream};">
        ${header()}
        ${body}
        ${footer()}
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

// Reusable card block
function card(innerHtml) {
  return `<tr><td class="ff-px" style="padding:0 32px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:#ffffff;border:1px solid ${C.border};border-radius:8px;">
      ${innerHtml}
    </table>
  </td></tr>
  <tr><td style="height:16px;line-height:16px;font-size:0;">&nbsp;</td></tr>`
}

// CTA button
function button(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="ff-button" style="border-collapse:collapse;margin:0 auto;">
    <tr>
      <td align="center" bgcolor="${C.accent}" style="border-radius:6px;background-color:${C.accent};">
        <a href="${href}" style="display:inline-block;padding:14px 32px;${FONT}font-size:15px;font-weight:700;letter-spacing:0.02em;color:${C.buttonText};text-decoration:none;border-radius:6px;">${label}</a>
      </td>
    </tr>
  </table>`
}

// Heading + paragraph block
function intro({ heading, lead }) {
  return `<tr><td class="ff-px" align="center" style="padding:8px 32px 8px 32px;">
    <h1 class="ff-h1" style="margin:0;${FONT}font-size:28px;line-height:1.2;color:${C.dark};font-weight:700;letter-spacing:-0.01em;">${heading}</h1>
  </td></tr>
  <tr><td class="ff-px" align="center" style="padding:12px 32px 24px 32px;">
    <p style="margin:0;${FONT}font-size:16px;line-height:1.6;color:${C.body};">${lead}</p>
  </td></tr>`
}

// Detail row with icon
function detailRow({ icon, label, value }) {
  return `<tr>
    <td style="padding:14px 20px;border-bottom:1px solid ${C.border};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
        <tr>
          <td width="40" valign="top" style="padding-right:12px;">
            <img src="${R2}/${icon}.png" alt="" width="24" height="24" style="display:block;border:0;width:24px;height:24px;" />
          </td>
          <td valign="middle">
            <div style="${FONT}font-size:12px;line-height:1.3;color:${C.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">${label}</div>
            <div style="${FONT}font-size:15px;line-height:1.4;color:${C.dark};font-weight:500;margin-top:2px;">${value}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

// Money row
function moneyRow({ label, value, bold = false, accent = false }) {
  const w = bold ? '700' : '400'
  const sz = bold ? '17px' : '15px'
  const color = accent ? C.dark : C.body
  return `<tr>
    <td style="padding:10px 20px;${bold ? `border-top:2px solid ${C.dark};` : `border-bottom:1px solid ${C.border};`}">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
        <tr>
          <td align="left" style="${FONT}font-size:${sz};line-height:1.4;color:${color};font-weight:${w};">${label}</td>
          <td align="right" style="${FONT}font-size:${sz};line-height:1.4;color:${color};font-weight:${w};white-space:nowrap;">${value}</td>
        </tr>
      </table>
    </td>
  </tr>`
}

// Spacer
function spacer(h = 24) {
  return `<tr><td style="height:${h}px;line-height:${h}px;font-size:0;">&nbsp;</td></tr>`
}

// CTA row
function ctaRow(href, label) {
  return `<tr><td class="ff-px" align="center" style="padding:8px 32px 8px 32px;">${button(href, label)}</td></tr>`
}

// Note / disclaimer block
function note(html, color = C.muted) {
  return `<tr><td class="ff-px" align="center" style="padding:12px 32px 24px 32px;">
    <p style="margin:0;${FONT}font-size:13px;line-height:1.6;color:${color};">${html}</p>
  </td></tr>`
}

// =============================================================================
// LIQUID HELPERS — defensive defaults
// =============================================================================
const p = (key, fallback = '') => `{{ params.${key} | default: "${fallback}" }}`

// =============================================================================
// 66 — ACCOUNT CREATION
// =============================================================================
function tpl_66() {
  const body = `
${intro({
  heading: `Willkommen, ${p('FIRST_NAME', 'liebe Genießer:in')}.`,
  lead: 'Dein Konto bei FermentFreude ist eingerichtet. Wir freuen uns, dich in unserer Community zu begrüßen — bereit, gemeinsam zu fermentieren.',
})}
${ctaRow(p('DASHBOARD_URL', SITE + '/account'), 'Zu meinem Konto')}
${spacer(24)}
${card(`
  ${detailRow({ icon: 'graduation-cap', label: 'Workshops entdecken', value: '<a href="' + p('WORKSHOPS_URL', SITE + '/workshops') + '" style="color:' + C.dark + ';text-decoration:underline;">Aktuelle Termine ansehen</a>' })}
  ${detailRow({ icon: 'shopping-cart', label: 'Im Shop stöbern', value: '<a href="' + SITE + '/shop" style="color:' + C.dark + ';text-decoration:underline;">Fermente &amp; Kits</a>' })}
  ${detailRow({ icon: 'user', label: 'Bestellungen &amp; Buchungen', value: '<a href="' + SITE + '/account/orders" style="color:' + C.dark + ';text-decoration:underline;">In deinem Konto verwalten</a>' })}
`)}
${note('Brauchst du Hilfe? Antworte einfach auf diese E-Mail — wir sind direkt erreichbar.')}
${spacer(8)}
`
  return shell({
    title: 'Willkommen bei FermentFreude',
    preheaderText: `Hi ${p('FIRST_NAME', 'liebe Genießer:in')}, dein Konto ist bereit.`,
    body,
  })
}

// =============================================================================
// 69 — EMAIL VERIFICATION
// =============================================================================
function tpl_69() {
  const body = `
${intro({
  heading: 'Bestätige deine E-Mail-Adresse',
  lead: `Hi ${p('FIRST_NAME', 'liebe Genießer:in')}, klicke unten, um dein Konto zu aktivieren. Der Link ist 24 Stunden gültig.`,
})}
${ctaRow(p('VERIFICATION_URL', SITE), 'E-Mail bestätigen')}
${spacer(16)}
${card(`
  <tr><td style="padding:18px 20px;">
    <div style="${FONT}font-size:12px;line-height:1.3;color:${C.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-bottom:6px;">Falls der Button nicht funktioniert</div>
    <div style="${FONT}font-size:13px;line-height:1.5;color:${C.body};word-break:break-all;">
      <a href="${p('VERIFICATION_URL', SITE)}" style="color:${C.dark};text-decoration:underline;">${p('VERIFICATION_URL', SITE)}</a>
    </div>
  </td></tr>
`)}
${note('Du hast kein Konto erstellt? Ignoriere diese E-Mail — es passiert nichts weiter.')}
${spacer(8)}
`
  return shell({
    title: 'E-Mail bestätigen',
    preheaderText: 'Aktiviere dein FermentFreude-Konto in einem Klick.',
    body,
  })
}

// =============================================================================
// 70 — PASSWORD RESET
// =============================================================================
function tpl_70() {
  const body = `
${intro({
  heading: 'Passwort zurücksetzen',
  lead: `Hi ${p('FIRST_NAME', 'liebe Genießer:in')}, wir haben deine Anfrage erhalten. Klicke unten, um ein neues Passwort zu wählen. Der Link ist ${p('EXPIRY_TIME', '1 Stunde')} gültig.`,
})}
${ctaRow(p('RESET_URL', SITE + '/forgot-password'), 'Neues Passwort setzen')}
${spacer(16)}
${card(`
  ${detailRow({ icon: 'lock', label: 'Sicherheitshinweis', value: 'Wir werden dich niemals nach deinem Passwort fragen.' })}
  ${detailRow({ icon: 'clock', label: 'Gültigkeit', value: p('EXPIRY_TIME', '1 Stunde') + ' ab Versand dieser E-Mail' })}
`)}
${note('Du hast keine Passwort-Zurücksetzung angefordert? Dann ignoriere diese Nachricht — dein Konto bleibt unverändert.', C.danger)}
${spacer(8)}
`
  return shell({
    title: 'Passwort zurücksetzen',
    preheaderText: 'Setze dein FermentFreude-Passwort zurück.',
    body,
  })
}

// =============================================================================
// 71 — LOGIN NOTIFICATION
// =============================================================================
function tpl_71() {
  const body = `
${intro({
  heading: 'Neue Anmeldung in deinem Konto',
  lead: `Hi ${p('FIRST_NAME', 'liebe Genießer:in')}, wir haben gerade eine neue Anmeldung in deinem FermentFreude-Konto registriert. Wenn du das warst, ist alles in Ordnung.`,
})}
${card(`
  ${detailRow({ icon: 'clock', label: 'Zeitpunkt', value: p('LOGIN_DATE', '—') })}
  ${detailRow({ icon: 'monitor', label: 'Gerät / Browser', value: p('DEVICE', '—') })}
  ${detailRow({ icon: 'map-pin', label: 'Standort (ungefähr)', value: p('LOCATION', '—') })}
`)}
${ctaRow(p('RESET_URL', SITE + '/forgot-password'), 'Warst du das nicht? Passwort ändern')}
${note('Aus Sicherheitsgründen empfehlen wir, dein Passwort regelmäßig zu aktualisieren und niemanden mit deinen Zugangsdaten teilen.', C.danger)}
${spacer(8)}
`
  return shell({
    title: 'Neue Anmeldung',
    preheaderText: 'Sicherheitsbenachrichtigung deines Kontos.',
    body,
  })
}

// =============================================================================
// 68 — NEWSLETTER WELCOME
// =============================================================================
function tpl_68() {
  const body = `
${intro({
  heading: 'Willkommen im Newsletter!',
  lead: `Hi ${p('FIRST_NAME', 'liebe Genießer:in')}, schön, dass du dabei bist. Wir teilen Rezepte, Workshop-Termine und kleine Geschichten aus der Welt der Fermentation — ohne Spam, versprochen.`,
})}
${ctaRow(p('WORKSHOPS_URL', SITE + '/workshops'), 'Aktuelle Workshops ansehen')}
${spacer(24)}
${card(`
  ${detailRow({ icon: 'utensils', label: 'Rezepte &amp; Inspiration', value: 'Saisonal, einfach, voller Geschmack' })}
  ${detailRow({ icon: 'calendar', label: 'Workshop-Termine', value: 'Frühzeitige Bekanntgabe neuer Kurse' })}
  ${detailRow({ icon: 'gift', label: 'Exklusive Angebote', value: 'Newsletter-Abonnent:innen erfahren es zuerst' })}
`)}
${note('Du möchtest dich abmelden? <a href="' + p('UNSUBSCRIBE_URL', SITE) + '" style="color:' + C.muted + ';text-decoration:underline;">Hier abmelden</a>')}
${spacer(8)}
`
  return shell({
    title: 'Willkommen im Newsletter',
    preheaderText: 'Rezepte, Termine und Inspiration — alle paar Wochen.',
    body,
  })
}

// =============================================================================
// 65 — WORKSHOP BOOKING CONFIRMATION
// =============================================================================
function tpl_65() {
  // Fallback: render single-booking detail card if WORKSHOP_BOOKINGS_HTML empty
  const fallbackBookingCard = card(`
  <tr><td style="padding:18px 20px 8px 20px;">
    <div style="${FONT}font-size:12px;line-height:1.3;color:${C.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Workshop</div>
    <div style="${FONT}font-size:18px;line-height:1.3;color:${C.dark};font-weight:700;margin-top:4px;">${p('WORKSHOP_TITLE', 'Workshop')}</div>
  </td></tr>
  ${detailRow({ icon: 'calendar', label: 'Datum', value: p('WORKSHOP_DATE', '—') })}
  ${detailRow({ icon: 'clock', label: 'Uhrzeit', value: p('WORKSHOP_TIME', '—') })}
  ${detailRow({ icon: 'map-pin', label: 'Ort', value: p('WORKSHOP_LOCATION', '—') })}
  ${detailRow({ icon: 'user', label: 'Teilnehmer:innen', value: p('GUEST_COUNT', '1') })}
  ${moneyRow({ label: 'Gesamt', value: p('TOTAL_PRICE', '—'), bold: true, accent: true })}
  `)

  const body = `
${intro({
  heading: 'Buchung bestätigt — wir freuen uns!',
  lead: `Hi ${p('FIRST_NAME', 'liebe Genießer:in')}, deine Workshop-Buchung ist eingegangen. Hier sind alle Details. Buchungsnummer: <strong>${p('BOOKING_REF', '—')}</strong>`,
})}
{% if params.WORKSHOP_BOOKINGS_HTML and params.WORKSHOP_BOOKINGS_HTML != "" %}
<tr><td class="ff-px" style="padding:0 32px;">{{ params.WORKSHOP_BOOKINGS_HTML }}</td></tr>
<tr><td style="height:16px;line-height:16px;font-size:0;">&nbsp;</td></tr>
{% else %}
${fallbackBookingCard}
{% endif %}
{% if params.WHAT_TO_BRING and params.WHAT_TO_BRING != "" %}
${card(`
  <tr><td style="padding:18px 20px;">
    <div style="${FONT}font-size:12px;line-height:1.3;color:${C.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-bottom:8px;">Was du mitbringen sollst</div>
    <div style="${FONT}font-size:14px;line-height:1.6;color:${C.body};">{{ params.WHAT_TO_BRING }}</div>
  </td></tr>
`)}
{% endif %}
${ctaRow(p('BOOKING_URL', SITE + '/account/orders'), 'Buchung im Konto ansehen')}
${spacer(16)}
${note('Du musst absagen oder verschieben? Antworte auf diese E-Mail — wir helfen dir gerne weiter.')}
${spacer(8)}
`
  return shell({
    title: 'Workshop-Buchung bestätigt',
    preheaderText: `Buchung ${p('BOOKING_REF', '')} — wir freuen uns auf dich.`,
    body,
  })
}

// =============================================================================
// 72 — ORDER CONFIRMATION
// =============================================================================
function tpl_72() {
  // Fallback if ORDER_ITEMS_HTML empty: show generic line
  const fallbackItems = `
  <tr><td style="padding:14px 20px;border-bottom:1px solid ${C.border};${FONT}font-size:14px;color:${C.body};">
    Deine Artikel werden in der Bestellübersicht angezeigt.
  </td></tr>`

  const body = `
${intro({
  heading: 'Vielen Dank für deine Bestellung!',
  lead: `Hi ${p('FIRST_NAME', 'liebe Genießer:in')}, wir haben deine Bestellung erhalten und bearbeiten sie. Bestellnummer: <strong>${p('ORDER_NUMBER', '—')}</strong>`,
})}

<!-- Items card -->
<tr><td class="ff-px" style="padding:0 32px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:#ffffff;border:1px solid ${C.border};border-radius:8px;">
    <tr><td style="padding:18px 20px 6px 20px;">
      <div style="${FONT}font-size:12px;line-height:1.3;color:${C.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Bestellung ${p('ORDER_NUMBER', '')}</div>
    </td></tr>
    {% if params.ORDER_ITEMS_HTML and params.ORDER_ITEMS_HTML != "" %}
    <tr><td style="padding:0 20px;">{{ params.ORDER_ITEMS_HTML }}</td></tr>
    {% else %}
    ${fallbackItems}
    {% endif %}
    ${moneyRow({ label: 'Zwischensumme', value: p('SUBTOTAL', '—') })}
    ${moneyRow({ label: 'Versand', value: p('SHIPPING', '—') })}
    ${moneyRow({ label: 'Gesamt', value: p('TOTAL', '—'), bold: true, accent: true })}
  </table>
</td></tr>
${spacer(16)}

{% if params.WORKSHOP_BOOKINGS_HTML and params.WORKSHOP_BOOKINGS_HTML != "" %}
<tr><td class="ff-px" style="padding:0 32px 8px 32px;">
  <div style="${FONT}font-size:12px;line-height:1.3;color:${C.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Inkludierte Workshop-Buchungen</div>
</td></tr>
<tr><td class="ff-px" style="padding:0 32px;">{{ params.WORKSHOP_BOOKINGS_HTML }}</td></tr>
${spacer(16)}
{% endif %}

{% if params.SHIPPING_ADDRESS and params.SHIPPING_ADDRESS != "" %}
${card(`
  <tr><td style="padding:18px 20px;">
    <div style="${FONT}font-size:12px;line-height:1.3;color:${C.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-bottom:6px;">Lieferadresse</div>
    <div style="${FONT}font-size:14px;line-height:1.6;color:${C.dark};white-space:pre-line;">{{ params.SHIPPING_ADDRESS }}</div>
  </td></tr>
`)}
{% endif %}

${ctaRow(p('ORDER_URL', SITE + '/account/orders'), 'Bestellung ansehen')}
${spacer(16)}
${note('Du hast Fragen zu deiner Bestellung? Antworte einfach auf diese E-Mail.')}
${spacer(8)}
`
  return shell({
    title: 'Bestellbestätigung',
    preheaderText: `Bestellung ${p('ORDER_NUMBER', '')} — vielen Dank!`,
    body,
  })
}

// =============================================================================
// 73 — VOUCHER PURCHASED
// =============================================================================
function tpl_73() {
  const body = `
${intro({
  heading: 'Dein Gutschein ist bereit',
  lead: `Hi ${p('FIRST_NAME', 'liebe Genießer:in')}, danke für deinen Kauf. Hier ist dein FermentFreude-Gutschein zum Verschenken oder selbst Genießen.`,
})}

<!-- Voucher card -->
<tr><td class="ff-px" style="padding:0 32px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background-color:${C.dark};border-radius:8px;">
    <tr><td align="center" style="padding:28px 24px 8px 24px;">
      <img src="${R2}/gift.png" alt="" width="40" height="40" style="display:block;border:0;width:40px;height:40px;margin:0 auto;" />
    </td></tr>
    <tr><td align="center" style="padding:6px 24px 4px 24px;${FONT}font-size:12px;line-height:1.3;color:#cbc6bd;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Gutscheinwert
    </td></tr>
    <tr><td align="center" style="padding:0 24px 16px 24px;${FONT}font-size:36px;line-height:1.1;color:${C.accent};font-weight:700;letter-spacing:-0.01em;">
      ${p('VOUCHER_AMOUNT', '99')} €
    </td></tr>
    <tr><td align="center" style="padding:0 24px 8px 24px;${FONT}font-size:12px;line-height:1.3;color:#cbc6bd;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
      Code
    </td></tr>
    <tr><td align="center" style="padding:0 24px 28px 24px;${FONT}font-size:24px;line-height:1.2;color:#ffffff;font-weight:700;letter-spacing:0.12em;font-family:'Courier New',Courier,monospace;">
      ${p('VOUCHER_CODE', '—')}
    </td></tr>
  </table>
</td></tr>
${spacer(16)}

${card(`
  ${detailRow({ icon: 'calendar', label: 'Gültig bis', value: p('VOUCHER_EXPIRY', '—') })}
  ${detailRow({ icon: 'shopping-cart', label: 'Einlösbar für', value: 'Workshops &amp; Shop-Artikel auf fermentfreude.at' })}
  ${detailRow({ icon: 'info', label: 'So einlösbar', value: 'Code beim Bezahlvorgang im Feld &bdquo;Gutschein&ldquo; eingeben' })}
`)}

${ctaRow(p('SHOP_URL', SITE + '/workshops'), 'Workshops &amp; Shop ansehen')}
${spacer(16)}
${note('Bewahre diese E-Mail auf — sie enthält deinen Gutscheincode.')}
${spacer(8)}
`
  return shell({
    title: 'Dein Gutschein',
    preheaderText: `${p('VOUCHER_AMOUNT', '99')} € Gutschein — Code ${p('VOUCHER_CODE', '')}`,
    body,
  })
}

// =============================================================================
// WRITE
// =============================================================================
const templates = [
  { id: 65, slug: 'workshop-booking', html: tpl_65() },
  { id: 66, slug: 'account-creation', html: tpl_66() },
  { id: 68, slug: 'newsletter-welcome', html: tpl_68() },
  { id: 69, slug: 'email-verification', html: tpl_69() },
  { id: 70, slug: 'password-reset', html: tpl_70() },
  { id: 71, slug: 'login-notification', html: tpl_71() },
  { id: 72, slug: 'order-confirmation', html: tpl_72() },
  { id: 73, slug: 'voucher-purchased', html: tpl_73() },
]

for (const t of templates) {
  const file = path.join(OUT_DIR, `${t.id}-${t.slug}.html`)
  writeFileSync(file, t.html, 'utf8')
  console.log(`✓ ${path.basename(file)} (${t.html.length} bytes)`)
}
console.log(`\n${templates.length} templates written to ${OUT_DIR}`)
