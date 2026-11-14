import { describe, expect, it } from 'vitest'

import {
  analyzeTemplate,
  applyFieldEdits,
  buildEditablePreview,
  editorToSubject,
  lockedFingerprint,
  renderPreview,
  TemplateEditError,
} from '@/lib/emailTemplateText'
import { dateOfferActions } from '@/lib/policyEngine'

const HTML = `<!DOCTYPE html><html><head><title>Hallo</title><style>.x{color:red}</style></head><body>
<div style="display:none">Vorschau für {{ params.WORKSHOP_TITLE | default: &quot;Workshop&quot; }}</div>
<img src="https://cdn.example/logo.png" alt="Fermentfreude Logo">
<h1 class="h">Dein Termin</h1>
<p>Hi {{ params.FIRST_NAME }}, dein Termin für <strong style="color:#000">{{ params.WORKSHOP_TITLE | default: "" }}</strong>
   am {{ params.WORKSHOP_DATE }} ist leider überbucht.<br>Schreib an kontakt@fermentfreude.at &amp; uns.</p>
<p>{% if params.CARRIER == "Ready for Pickup" %}Abholbereit{% else %}Unterwegs{% endif %}</p>
<p>Siehe <a href="https://x.example/agb">unsere AGB</a> für Details.</p>
<a href="{{ params.MANAGE_BOOKING_URL }}" style="display:block">Termin wählen</a>
<p><a href="https://x.example/datenschutz">Datenschutz</a> &middot; <a href="https://x.example/impressum">Impressum</a></p>
<p>&copy; Fermentfreude</p>
</body></html>`

const SUBJECT = 'Neuer Termin für &quot;{{ params.WORKSHOP_TITLE }}&quot;?'

describe('emailTemplateText (paragraph editor)', () => {
  const a = analyzeTemplate(HTML, SUBJECT)
  const byValue = (needle: string) => a.fields.find((f) => f.value.includes(needle))!

  it('keeps a sentence in ONE field, even with a bold placeholder inside', () => {
    const f = byValue('dein Termin für')
    expect(f.value).toBe(
      'Hi ⟦Vorname⟧, dein Termin für ⟦Workshop (fett)⟧ am ⟦Datum⟧ ist leider überbucht.\nSchreib an ⟦kontakt@fermentfreude.at⟧ & uns.',
    )
    expect(f.inline).toBe(false) // has a fixed chip (the address) → edited in the panel
  })

  it('never reads head/style, finds links and alt, splits footer links', () => {
    expect(a.fields.some((f) => f.value === 'Hallo' || f.value.includes('color:red'))).toBe(false)
    expect(a.fields.filter((f) => f.kind === 'link').map((f) => f.value)).toEqual(['Termin wählen', 'Datenschutz', 'Impressum'])
    expect(a.fields.find((f) => f.kind === 'alt')?.value).toBe('Fermentfreude Logo')
  })

  it('shows inline links/bold-with-words as fixed chips inside the sentence', () => {
    const f = byValue('Siehe')
    expect(f.value).toBe('Siehe ⟦Link⟧unsere AGB⟦/Link⟧ für Details.')
    expect(f.fixed).toEqual(['⟦Link⟧', '⟦/Link⟧'])
  })

  it('shows Liquid versions as separate parts of one field', () => {
    const f = byValue('Abholbereit')
    expect(f.liquid.length).toBe(3)
    expect(f.value).toContain('⟦Sonst⟧Unterwegs⟦Ende⟧')
  })

  it('is byte-identical when nothing changes', () => {
    expect(applyFieldEdits(HTML, Object.fromEntries(a.fields.map((f) => [f.id, f.value])), SUBJECT)).toBe(HTML)
  })

  it('lets you reword freely and move, drop and repeat placeholders', () => {
    const f = byValue('Hi ⟦Vorname⟧')
    const out = applyFieldEdits(
      HTML,
      { [f.id]: 'Wir müssen deinen Workshop ⟦Workshop (fett)⟧ leider verschieben, ⟦Vorname⟧.\nNeues Datum folgt.\nSchreib an ⟦kontakt@fermentfreude.at⟧ & uns.' },
      SUBJECT,
    )
    expect(out).toContain('Wir müssen deinen Workshop <strong style="color:#000">{{ params.WORKSHOP_TITLE | default: "" }}</strong> leider verschieben, {{ params.FIRST_NAME }}.<br>Neues Datum folgt.<br>Schreib an kontakt@fermentfreude.at &amp; uns.')
    expect(lockedFingerprint(out)).toBe(lockedFingerprint(HTML))
  })

  it('inserts a placeholder that already exists in this email, with its own fallback text', () => {
    const h = a.fields.find((f) => f.kind === 'heading')!
    const out = applyFieldEdits(HTML, { [h.id]: 'Dein Termin, ⟦Vorname⟧ & ⟦Workshop⟧' }, SUBJECT)
    expect(out).toContain('<h1 class="h">Dein Termin, {{ params.FIRST_NAME }} &amp; {{ params.WORKSHOP_TITLE | default: &quot;Workshop&quot; }}</h1>')
  })

  it('refuses removed or reordered fixed parts, addresses, tags, code and unknown chips', () => {
    const f = byValue('Siehe')
    const mail = byValue('Hi ⟦Vorname⟧')
    expect(() => applyFieldEdits(HTML, { [f.id]: 'Siehe unsere AGB für Details.' }, SUBJECT)).toThrow(TemplateEditError)
    expect(() => applyFieldEdits(HTML, { [f.id]: 'Siehe ⟦/Link⟧unsere AGB⟦Link⟧ für Details.' }, SUBJECT)).toThrow(TemplateEditError)
    expect(() => applyFieldEdits(HTML, { [mail.id]: 'Hi ⟦Vorname⟧' }, SUBJECT)).toThrow(TemplateEditError)
    expect(() => applyFieldEdits(HTML, { [f.id]: `${f.value} schreib evil@example.com` }, SUBJECT)).toThrow(TemplateEditError)
    expect(() => applyFieldEdits(HTML, { [f.id]: `${f.value} <b>x</b>` }, SUBJECT)).toThrow(TemplateEditError)
    expect(() => applyFieldEdits(HTML, { [f.id]: `${f.value} {{ params.X }}` }, SUBJECT)).toThrow(TemplateEditError)
    expect(() => applyFieldEdits(HTML, { [f.id]: `${f.value} ⟦Gibt es nicht⟧` }, SUBJECT)).toThrow(TemplateEditError)
    expect(() => applyFieldEdits(HTML, { [a.fields.find((x) => x.kind === 'heading')!.id]: '  ' }, SUBJECT)).toThrow(TemplateEditError)
  })

  it('edits the subject with the same rules and keeps its quoting style', () => {
    expect(a.subject.value).toBe('Neuer Termin für "⟦Workshop⟧"?')
    expect(editorToSubject(SUBJECT, a.subject.value, HTML)).toBe(SUBJECT)
    expect(editorToSubject(SUBJECT, 'Bitte neuen Termin für "⟦Workshop⟧" wählen', HTML)).toBe(
      'Bitte neuen Termin für &quot;{{ params.WORKSHOP_TITLE }}&quot; wählen',
    )
    expect(() => editorToSubject(SUBJECT, '   ', HTML)).toThrow(TemplateEditError)
  })

  it('renders a preview with example values and resolves simple Liquid', () => {
    const out = renderPreview(HTML, { FIRST_NAME: 'Anna', CARRIER: 'Ready for Pickup' })
    expect(out).toContain('Hi Anna,')
    expect(out).toContain('Abholbereit')
    expect(out).not.toContain('Unterwegs')
    expect(out).not.toContain('{{')
  })

  it('builds a preview where plain paragraphs are editable and the rest only reacts to a click', () => {
    const p = buildEditablePreview(HTML, { FIRST_NAME: 'Anna' })
    const heading = a.fields.find((f) => f.kind === 'heading')!
    const sentence = byValue('Hi ⟦Vorname⟧')
    expect(p.segs[heading.id].edit).toBe(true)
    expect(p.segs[sentence.id].edit).toBe(false)
    expect(p.doc).toContain(`data-seg="${heading.id}" data-edit="1"`)
    expect(p.doc).not.toMatch(/\{\{|\{%/)
  })
})

describe('dateOfferActions ("choose your own date" links)', () => {
  const future = new Date(Date.now() + 3 * 86400_000).toISOString() // 3 days: normally too late to rebook
  const now = new Date()

  it('offers only rebooking, even inside the 14-day window and after a used self-rebook', () => {
    expect(dateOfferActions({ seatStatus: 'active', selfRebookingUsed: true }, { dateTime: future, status: 'SCHEDULED' }, now)).toEqual(['REBOOK_NOW'])
  })
  it('offers nothing for seats that already left the date, or once the date has started', () => {
    expect(dateOfferActions({ seatStatus: 'rebooked', selfRebookingUsed: false }, { dateTime: future, status: 'SCHEDULED' }, now)).toEqual([])
    const past = new Date(Date.now() - 3600_000).toISOString()
    expect(dateOfferActions({ seatStatus: 'active', selfRebookingUsed: false }, { dateTime: past, status: 'SCHEDULED' }, now)).toEqual([])
  })
  it('defers to the organiser-cancellation branch when the date was cancelled', () => {
    expect(dateOfferActions({ seatStatus: 'active', selfRebookingUsed: false }, { dateTime: future, status: 'CANCELLED_BY_ORGANISER' }, now)).toEqual([
      'SELECT_REPLACEMENT_WORKSHOP',
      'REQUEST_ORGANISER_CANCELLATION_REFUND',
    ])
  })
})
