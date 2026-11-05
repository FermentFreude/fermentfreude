import type { Field, Tab } from 'payload'

import { pointIconField } from '@/fields/pointIcon'

/* ═══════════════════════════════════════════════════════════════
 *  "Voucher Page" tab — every text and picture of /workshops/voucher,
 *  one group per section, top to bottom as on the page. Shown only
 *  when the page's slug is "voucher". Empty fields fall back to the
 *  text in src/app/(app)/workshops/voucher/content.ts.
 *
 *  All fields live in new groups (hero, values, occasions, …), so
 *  the fields of the old voucher design stay untouched in the
 *  database and simply aren't used any more.
 * ═══════════════════════════════════════════════════════════════ */

const text = (name: string, label: string, description?: string, extra: Partial<Field> = {}): Field =>
  ({
    name,
    type: 'text',
    localized: true,
    label,
    ...(description ? { admin: { description } } : {}),
    ...extra,
  }) as Field

const area = (name: string, label: string, description?: string): Field => ({
  name,
  type: 'textarea',
  localized: true,
  label,
  ...(description ? { admin: { description } } : {}),
})

const show = (what: string): Field => ({
  name: 'show',
  type: 'checkbox',
  defaultValue: true,
  label: `Abschnitt anzeigen / Show ${what}`,
})

const amountField = (name: string, options: number[], label: string, description: string): Field => ({
  name,
  type: 'select',
  label,
  options: options.map((n) => ({ label: n === 99 ? '€99 Workshop' : `€${n}`, value: String(n) })),
  admin: { description },
})

const points = (description: string): Field => ({
  name: 'points',
  type: 'array',
  label: 'Punkte / Points',
  labels: { singular: 'Punkt', plural: 'Punkte' },
  maxRows: 4,
  admin: { description, initCollapsed: true },
  fields: [
    pointIconField('gift'),
    text('title', 'Titel / Title', undefined, { required: true }),
    text('text', 'Kurzer Satz / Short line'),
  ],
})

export const voucherTab: Tab = {
  name: 'voucher',
  label: 'Voucher Page',
  admin: {
    description:
      'Alle Texte und Bilder der Gutschein-Seite (/workshops/voucher), von oben nach unten. Leere Felder zeigen den Standardtext. / Every text and picture of the voucher page, top to bottom. Empty fields show the default text.',
    condition: (data) => data?.slug === 'voucher',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: '1 · Oben: €99 Workshop-Gutschein / Top: €99 workshop voucher',
      admin: { description: 'Der erste Bildschirm: Überschrift, Text, Preis, Button und das Gutschein-Motiv rechts.' },
      fields: [
        {
          name: 'visual',
          type: 'select',
          label: 'Was rechts zu sehen ist / What shows on the right',
          defaultValue: 'ticket',
          options: [
            { label: 'Gutschein-Motiv (€99 Ticket) / Voucher ticket', value: 'ticket' },
            { label: 'Foto rechts (statt Ticket) / Photo on the right', value: 'image' },
            { label: 'Foto als Hintergrund / Photo as background', value: 'background' },
          ],
          admin: {
            description:
              'Beim Hintergrund-Foto wird der Text hell auf einer dunklen Schattierung, damit er gut lesbar bleibt.',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Foto / Photo',
          admin: {
            description:
              'Rechts: Hochformat oder quadratisch (mind. 1200 px). Hintergrund: Querformat (mind. 1920 px), das Motiv eher rechts im Bild.',
            condition: (_, sibling) => sibling?.visual === 'image' || sibling?.visual === 'background',
          },
        },
        {
          name: 'ticketOnBackground',
          type: 'checkbox',
          defaultValue: true,
          label: 'Gutschein-Motiv über dem Foto zeigen / Show the ticket over the photo',
          admin: { condition: (_, sibling) => sibling?.visual === 'background' },
        },
        text('eyebrow', 'Kleine Zeile über der Überschrift / Small line above the headline', 'z. B. „Geschenkgutschein · Graz“'),
        text('headline', 'Überschrift (H1) / Headline', 'Die wichtigste Zeile für Google: Gutschein + Fermentations-Workshop nennen.'),
        area('text', 'Text unter der Überschrift / Text'),
        text('price', 'Preis / Price', 'z. B. „€99“'),
        text('priceNote', 'Zeile neben dem Preis / Next to the price', 'z. B. „ein ganzer Workshop nach Wahl, pro Person“'),
        text('button', 'Button (öffnet den Kauf) / Buy button'),
        text('secondary', 'Link zu den Wertgutscheinen / Link to value vouchers'),
        points('Drei kurze Punkte unter den Buttons.'),
        text('ticketAlt', 'Bildbeschreibung des Gutscheins / Voucher picture description', 'Für Google und Screenreader.'),
      ],
    },
    {
      name: 'ticket',
      type: 'group',
      label: 'Texte auf dem Gutschein-Motiv / Text on the voucher picture',
      admin: {
        description:
          'Die Schrift auf den gezeichneten Gutscheinen auf der Seite (nicht im PDF). Zeilenumbruch im Titel = neue Zeile.',
      },
      fields: [
        text('workshopLabel', '€99: kleine Zeile oben / €99: small top line'),
        area('workshopTitle', '€99: Titel / €99: title'),
        area('workshopText', '€99: Text'),
        text('valueLabel', 'Wertgutschein: kleine Zeile oben / Value voucher: small top line'),
        area('valueTitle', 'Wertgutschein: Titel / Value voucher: title'),
        area('valueText', 'Wertgutschein: Text / Value voucher: text'),
        text('footer', 'Zeile unten / Bottom line', 'z. B. „Fermentfreude · Graz“'),
        text('stub', 'Text auf dem goldenen Abschnitt / Text on the gold stub', 'z. B. „Für dich“'),
      ],
    },
    {
      name: 'values',
      type: 'group',
      label: '2 · Wertgutscheine €50 / €30 / €20 / Value vouchers',
      fields: [
        show('value vouchers'),
        text('eyebrow', 'Kleine Zeile / Small line'),
        text('headline', 'Überschrift / Headline'),
        area('text', 'Text'),
        {
          name: 'items',
          type: 'array',
          label: 'Gutscheine / Vouchers',
          labels: { singular: 'Gutschein', plural: 'Gutscheine' },
          maxRows: 3,
          admin: { description: 'Ein Eintrag pro Betrag, in dieser Reihenfolge.', initCollapsed: true },
          fields: [
            { ...amountField('amount', [50, 30, 20], 'Betrag / Amount', 'Welcher Gutschein.'), required: true } as Field,
            text('line', 'Kurzer Satz unter dem Betrag / Short line'),
          ],
        },
        text('button', 'Button-Text / Button text', 'z. B. „Verschenken“'),
        text('valueName', 'Name neben dem Betrag / Name next to the amount', 'z. B. „Wertgutschein“'),
      ],
    },
    {
      name: 'occasions',
      type: 'group',
      label: '3 · Geschenkideen (Weihnachten, Firmen …) / Gift ideas',
      fields: [
        show('gift ideas'),
        text('eyebrow', 'Kleine Zeile / Small line'),
        text('headline', 'Überschrift / Headline'),
        area('intro', 'Einleitung / Intro'),
        {
          name: 'rows',
          type: 'array',
          label: 'Anlässe / Occasions',
          labels: { singular: 'Anlass', plural: 'Anlässe' },
          maxRows: 6,
          admin: {
            description: 'Eine Zeile pro Anlass. Foto und Text wechseln automatisch die Seite (links, rechts, links …).',
            initCollapsed: true,
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Foto / Photo',
              admin: { description: 'Querformat, mind. 1200 px breit. Wird auf 5:4 zugeschnitten.' },
            },
            text('label', 'Kleine Zeile (Anlass) / Small line', 'z. B. „Weihnachtsgeschenk“'),
            text('title', 'Überschrift / Headline', undefined, { required: true }),
            area('text', 'Text'),
            {
              name: 'bullets',
              type: 'array',
              label: 'Stichpunkte / Bullet points',
              labels: { singular: 'Stichpunkt', plural: 'Stichpunkte' },
              maxRows: 4,
              fields: [text('text', 'Text', undefined, { required: true })],
            },
            {
              name: 'ctaKind',
              type: 'select',
              label: 'Button führt zu / Button goes to',
              defaultValue: 'buy',
              options: [
                { label: 'Gutschein kaufen / Buy a voucher', value: 'buy' },
                { label: 'Andere Seite (z. B. Kontakt) / Another page', value: 'link' },
              ],
            },
            {
              ...amountField('ctaAmount', [99, 50, 30, 20], 'Welcher Gutschein / Which voucher', 'Ist im Kauf-Fenster vorausgewählt.'),
              defaultValue: '99',
              admin: {
                description: 'Ist im Kauf-Fenster vorausgewählt.',
                condition: (_, sibling) => sibling?.ctaKind !== 'link',
              },
            } as Field,
            {
              name: 'ctaHref',
              type: 'text',
              label: 'Link',
              admin: { description: 'z. B. /contact', condition: (_, sibling) => sibling?.ctaKind === 'link' },
            },
            text('ctaLabel', 'Button-Text / Button text'),
          ],
        },
      ],
    },
    {
      name: 'print',
      type: 'group',
      label: '4 · Grußkarte zum Ausdrucken / Printable greeting card',
      fields: [
        show('greeting card'),
        text('eyebrow', 'Kleine Zeile / Small line'),
        text('headline', 'Überschrift / Headline'),
        area('text', 'Text'),
        text('button', 'Download-Button / Download button'),
        text('note', 'Zeile neben dem Button / Next to the button', 'z. B. „A5 quer, Vorder- und Rückseite.“'),
        text('cardAlt', 'Bildbeschreibung der Karte / Card picture description'),
        {
          name: 'card',
          type: 'group',
          label: 'Texte auf der gezeichneten Karte / Text on the drawn card',
          admin: {
            description:
              'Nur die Vorschau auf der Seite. Das PDF zum Herunterladen ändert sich dadurch nicht (dafür bitte bei Rafaela melden).',
          },
          fields: [
            text('frontEyebrow', 'Vorderseite: kleine Zeile / Front: small line'),
            area('frontWords', 'Vorderseite: große Worte / Front: big words', 'Zeilenumbruch = neue Zeile, z. B. „Von“ ⏎ „Herzen“'),
            text('backEyebrow', 'Rückseite: kleine Zeile / Back: small line'),
            text('backFor', 'Rückseite: „Das hier ist für“ / Back: “This is for”'),
            text('backFrom', 'Rückseite: „Von“ / Back: “From”'),
          ],
        },
      ],
    },
    {
      name: 'how',
      type: 'group',
      label: '5 · So funktioniert’s / How it works',
      fields: [text('eyebrow', 'Kleine Zeile / Small line'), points('Bis zu vier Schritte.')],
    },
    {
      name: 'faq',
      type: 'group',
      label: '6 · Häufige Fragen / FAQ',
      admin: { description: 'Die Fragen erscheinen auch direkt in den Google-Ergebnissen.' },
      fields: [
        show('FAQ'),
        text('eyebrow', 'Kleine Zeile / Small line'),
        text('title', 'Überschrift / Headline'),
        area('description', 'Text unter der Überschrift / Text below the headline'),
        text('more', '„Noch Fragen?“ / “More questions?”'),
        text('moreLink', 'Link-Text zum Kontakt / Contact link text', 'z. B. „Schreib uns“'),
        {
          name: 'items',
          type: 'array',
          label: 'Fragen / Questions',
          labels: { singular: 'Frage', plural: 'Fragen' },
          admin: { initCollapsed: true },
          fields: [
            text('question', 'Frage / Question', undefined, { required: true }),
            area('answer', 'Antwort / Answer'),
          ],
        },
      ],
    },
    {
      name: 'buy',
      type: 'group',
      label: 'Kauf-Fenster (öffnet sich beim Klick auf „Verschenken“) / Buy panel',
      fields: [
        text('title', 'Titel / Title', 'z. B. „Gutschein kaufen“'),
        text('amountLabel', 'Überschrift der Beträge / Amounts heading'),
        text('workshopChip', 'Zeile unter €99 / Line under €99', 'z. B. „Workshop“'),
        area('deliveryNote', 'Hinweis zur Zustellung / Delivery note'),
        text('yourName', 'Feld „Name“ / Name field'),
        text('yourNamePlaceholder', 'Platzhalter im Namensfeld / Name placeholder'),
        text('yourEmail', 'Feld „E-Mail“ / Email field'),
        text('submit', 'Button (ohne Betrag) / Button (without amount)', 'Der Betrag wird automatisch angehängt, z. B. „Weiter zur Zahlung · €99“.'),
        text('secure', 'Zeile unter dem Button / Line under the button'),
      ],
    },
  ],
}
