/**
 * One-off: creates the Brevo template for "choose your own date" links
 * (dashboard → workshop day → "Anderen Termin mailen" → "Alle wählen selbst").
 *
 * Built from template 99 (Organiser Cancelled), which already has the
 * personal-link button ({{ params.MANAGE_BOOKING_URL }}) and the same
 * placeholders — only the TEXT is changed, via the same text-only engine the
 * dashboard uses, so every link, placeholder and address stays identical.
 *
 * Additive only: creates one new template, changes nothing else. Skips if a
 * template with the same name already exists.
 *
 *   pnpm exec tsx src/scripts/create-brevo-date-offer-template.ts --dry   # print, create nothing
 *   pnpm exec tsx src/scripts/create-brevo-date-offer-template.ts         # create
 */
import 'dotenv/config'

import { createBrevoTemplate, getBrevoTemplate, listBrevoTemplates } from '../lib/brevoTemplates'
import { applyFieldEdits, editorToSubject, extractFields } from '../lib/emailTemplateText'

const NAME = 'Workshop – Neuen Termin wählen (Dashboard)'
const BASE_ID = 99

const TEXTS: Record<string, string> = {
  preheader: 'Für ⟦Workshop⟧ bitten wir dich, einen neuen Termin zu wählen.',
  heading: 'Bitte wähle einen neuen Termin',
  intro:
    'Hi ⟦Vorname⟧, für deinen gebuchten Workshop-Termin brauchen wir eine Änderung. Über den Button unten siehst du alle freien Termine und wählst den, der dir am besten passt.',
  badge: 'Neuer Termin gesucht',
  original: 'Dein bisheriger Termin',
  explain: 'Dein Platz bleibt reserviert, bis du gewählt hast. Es entstehen keine zusätzlichen Kosten.',
  button: 'Neuen Termin wählen',
  outro: 'Danke für dein Verständnis! Bei Fragen antworte einfach auf diese E-Mail.',
}

async function main() {
  const dry = process.argv.includes('--dry')
  const all = await listBrevoTemplates()
  const existing = all.find((t) => t.name === NAME)
  if (existing) {
    console.log(`Already exists: #${existing.id} "${existing.name}" — nothing to do.`)
    return
  }
  const base = await getBrevoTemplate(BASE_ID)
  const fields = extractFields(base.htmlContent)
  const byText = (needle: string) => {
    const f = fields.find((x) => x.value.includes(needle))
    if (!f) throw new Error(`Field containing "${needle}" not found in template ${BASE_ID}`)
    return f.id
  }
  const edits: Record<string, string> = {
    [fields.find((f) => f.kind === 'preheader')!.id]: TEXTS.preheader,
    [fields.find((f) => f.kind === 'heading')!.id]: TEXTS.heading,
    [byText('es tut uns sehr leid')]: TEXTS.intro,
    [byText('Abgesagt')]: TEXTS.badge,
    [byText('Ursprünglicher Termin')]: TEXTS.original,
    [byText('Über den Button unten')]: TEXTS.explain,
    [byText('Ersatztermin wählen oder Geld zurück')]: TEXTS.button,
    [byText('Nochmals Entschuldigung')]: TEXTS.outro,
  }
  const html = applyFieldEdits(base.htmlContent, edits)
  const subject = editorToSubject(base.subject, 'Bitte wähle einen neuen Termin für ⟦Workshop⟧')

  console.log(`Base #${BASE_ID} "${base.name}" → new "${NAME}"`)
  console.log(`Subject: ${subject}`)
  for (const f of extractFields(html)) if (f.kind !== 'alt') console.log(`  ${f.kind.padEnd(9)} ${f.value}`)
  if (dry) {
    console.log('\n(dry run — nothing created)')
    return
  }
  const id = await createBrevoTemplate({
    templateName: NAME,
    subject,
    htmlContent: html,
    sender: { name: 'Fermentfreude', email: base.sender?.email ?? 'kontakt@fermentfreude.at' },
    replyTo: base.replyTo || 'kontakt@fermentfreude.at',
    isActive: true,
  })
  console.log(`\n✓ Created Brevo template #${id}. Put this id into BREVO_TEMPLATES.WORKSHOP_DATE_OFFER (src/lib/brevo.ts).`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
