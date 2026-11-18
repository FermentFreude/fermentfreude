/**
 * Text-only editing of Brevo email template HTML — paragraph based.
 *
 * The founders may change what an email SAYS, never how it works.
 *
 * A "paragraph" is one flow of text between block-level tags (<td>, <p>, <h1>…).
 * Inline tags inside it (<strong>, <a>, <br>, <span>) do NOT split it any more:
 * the whole sentence is ONE field, so it can be reworded freely.
 *
 * Inside a paragraph, pieces that carry meaning for the machine are shown as
 * chips ⟦…⟧:
 *  - FREE chips: placeholders ({{ params.X }}) — also when wrapped in <strong>…
 *    These can be moved, deleted, duplicated and inserted from the email's own
 *    list (only placeholders that already occur in this email).
 *  - FIXED chips: Liquid ({% if %}), email addresses, URLs and the start/end of
 *    bold/link/format spans that contain words. They must stay, in order.
 *
 * Saving splices ONLY the changed paragraph ranges into the original string;
 * everything else stays byte-for-byte identical. A final check blanks all
 * editable ranges and requires the rest of the document to be unchanged.
 */

export type FieldKind = 'preheader' | 'heading' | 'text' | 'link' | 'alt' | 'title'

type TokClass = 'free' | 'fixed'
type TokKind = 'placeholder' | 'wrapped' | 'liquid' | 'email' | 'url' | 'struct'
type Part =
  | { kind: 'lit'; text: string }
  | { kind: 'tok'; raw: string; marker: string; cls: TokClass; tk: TokKind }

type Segment = {
  id: string
  kind: FieldKind
  start: number
  end: number
  mode: 'text' | 'attr'
  parts: Part[]
  /** The <br> form used in the source (re-used when a line break is typed). */
  brForm: string
  /** Only text, line breaks and free chips: can be edited right in the preview. */
  inline: boolean
}

export type TemplateField = {
  id: string
  kind: FieldKind
  /** Text as edited: locked/free parts shown as ⟦markers⟧, line breaks as \n. */
  value: string
  markers: string[]
  /** Markers that must stay (Liquid, addresses, link/bold spans). */
  fixed: string[]
  /** The Liquid markers among `fixed` (the editor shows them as separate versions). */
  liquid: string[]
  inline: boolean
}

export type ChipInfo = { fixed: boolean; sample: string }
export type PaletteChip = { marker: string; label: string; sample: string }

export type TemplateAnalysis = {
  fields: TemplateField[]
  subject: { value: string; markers: string[]; fixed: string[]; liquid: string[] }
  chips: Record<string, ChipInfo>
  palette: PaletteChip[]
}

export class TemplateEditError extends Error {
  constructor(
    message: string,
    public fieldId?: string,
  ) {
    super(message)
  }
}

const OPEN = '⟦'
const CLOSE = '⟧'
const MARK_RE = /⟦[^⟧]*⟧/g

const INLINE = new Set([
  'a', 'strong', 'b', 'em', 'i', 'u', 'span', 'font', 'small', 'sup', 'sub', 'abbr', 's', 'strike', 'big', 'mark', 'br',
])
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const SKIP_CONTENT = new Set(['style', 'script', 'title'])

const NAMED: Record<string, string> = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", copy: '©', middot: '·',
  auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß',
  bdquo: '„', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', sbquo: '‚',
  ndash: '–', mdash: '—', hellip: '…', euro: '€', reg: '®', trade: '™', bull: '•',
  eacute: 'é', egrave: 'è', agrave: 'à', laquo: '«', raquo: '»', times: '×', shy: '­',
}

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return Number.isFinite(n) ? String.fromCodePoint(n) : m
    }
    return NAMED[code] ?? m
  })
}

function encodeText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;')
}
function encodeAttr(s: string): string {
  return encodeText(s).replace(/"/g, '&quot;')
}
/** Source whitespace (indentation, line breaks) is not meaningful in HTML text. */
const collapse = (s: string) => s.replace(/[ \t\r\n\f]+/g, ' ')

/** Pieces the machine owns inside text: placeholders, Liquid, emails, URLs. */
const TOKEN_RE =
  /\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|https?:\/\/[^\s<"]+|www\.[^\s<"]+/gi
const ADDRESS_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|https?:\/\/[^\s<"]+|www\.[^\s<"]+/i

/** German labels for the placeholders the site passes (fallback: the param name). */
const PARAM_LABELS: Record<string, string> = {
  FIRST_NAME: 'Vorname', FIRSTNAME: 'Vorname', LAST_NAME: 'Nachname', NAME: 'Name', CUSTOMER_NAME: 'Name',
  WORKSHOP_TITLE: 'Workshop', NEW_WORKSHOP_TITLE: 'neuer Workshop', WORKSHOP_DATE: 'Datum', NEW_WORKSHOP_DATE: 'neues Datum',
  WORKSHOP_TIME: 'Uhrzeit', NEW_WORKSHOP_TIME: 'neue Uhrzeit', WORKSHOP_LOCATION: 'Ort', BOOKING_REF: 'Buchungsnummer',
  ORDER_ID: 'Bestellnummer', ORDER_NUMBER: 'Bestellnummer', VOUCHER_CODE: 'Gutscheincode', VOUCHER_VALUE: 'Gutscheinwert',
  AMOUNT: 'Betrag', TOTAL: 'Summe', CARRIER: 'Versandart', TRACKING_NUMBER: 'Sendungsnummer', COURSE_TITLE: 'Kurs',
  GUEST_COUNT: 'Personen', RECIPIENT_NAME: 'Empfänger:in', SENDER_NAME: 'Absender:in', PERSONAL_MESSAGE: 'persönliche Nachricht',
  IS_RECIPIENT: 'Mail an Beschenkte', PERSONAL_NOTE: 'persönliche Nachricht', PURCHASER_NAME: 'Käufer:in', COMPANY_NAME: 'Firma',
  LOCATION: 'Ort', DEVICE: 'Gerät', LOGIN_DATE: 'Anmeldezeit', EXPIRY_TIME: 'gültig bis', ESTIMATED_DELIVERY: 'Lieferdatum',
  NEW_DATE: 'neues Datum', NEW_TIME: 'neue Uhrzeit', OLD_DATE: 'altes Datum', OLD_TIME: 'alte Uhrzeit',
  OLD_WORKSHOP_TITLE: 'alter Workshop', ORIGINAL_DATE: 'ursprüngliches Datum', REASON: 'Grund', SUBTOTAL: 'Zwischensumme',
  TOTAL_PRICE: 'Gesamtpreis', VOUCHER_AMOUNT: 'Gutscheinwert', VOUCHER_EXPIRY: 'gültig bis', REWARD_AMOUNT: 'Prämie',
  WHAT_TO_BRING: 'Was mitbringen', PREP_TIPS: 'Tipps', ITEMS: 'Artikel', ORDER_ITEMS_HTML: 'Artikelliste',
  WORKSHOP_BOOKINGS_HTML: 'Buchungsliste',
}

/** Example values for previews and test emails (German, realistic, no real people). */
export const SAMPLE_PARAMS: Record<string, string> = {
  FIRST_NAME: 'Anna', LAST_NAME: 'Beispiel', WORKSHOP_TITLE: 'Lakto-fermentiertes Gemüse', WORKSHOP_DATE: 'Sa, 13.12.2026',
  WORKSHOP_TIME: '10:00', WORKSHOP_LOCATION: 'Ginery, Graz', LOCATION: 'Graz', BOOKING_REF: 'WEB-2026-0099', GUEST_COUNT: '2',
  NEW_WORKSHOP_TITLE: 'Lakto-fermentiertes Gemüse', NEW_DATE: 'So, 10.01.2027', NEW_TIME: '10:00',
  OLD_WORKSHOP_TITLE: 'Lakto-fermentiertes Gemüse', OLD_DATE: 'Sa, 13.12.2026', OLD_TIME: '10:00', ORIGINAL_DATE: 'Sa, 13.12.2026',
  ORDER_ID: 'WEB-2026-0099', ORDER_NUMBER: 'WEB-2026-0099', TOTAL: '99,00 €', SUBTOTAL: '99,00 €', TOTAL_PRICE: '198,00 €',
  AMOUNT: '99,00 €', VOUCHER_CODE: 'FF-BEISPIEL', VOUCHER_AMOUNT: '99 €', VOUCHER_EXPIRY: '13.11.2029', REWARD_AMOUNT: '10 €',
  PURCHASER_NAME: 'Max Beispiel', PERSONAL_NOTE: 'Alles Gute zum Geburtstag!', CARRIER: 'Österreichische Post',
  TRACKING_NUMBER: 'AT123456789', ESTIMATED_DELIVERY: 'in 2–3 Werktagen', COURSE_TITLE: 'Fermentieren für Einsteiger',
  DEVICE: 'Chrome auf macOS', LOGIN_DATE: '13.11.2026, 10:15', EXPIRY_TIME: '1 Stunde', REASON: 'Krankheit der Kursleitung',
  COMPANY_NAME: 'Beispiel GmbH', WHAT_TO_BRING: 'Schürze und zwei leere Gläser', PREP_TIPS: '',
}

/* ── Lexicon: one marker ↔ raw bytes dictionary per template ───────────── */

class Lexicon {
  byMarker = new Map<string, { raw: string; cls: TokClass; tk: TokKind }>()
  byRaw = new Map<string, string>()
  private next = new Map<string, number>()
  /** `key` identifies the chip (default: the raw bytes). Placeholders use their param name. */
  intern(raw: string, base: string, cls: TokClass, tk: TokKind, key = raw): string {
    const have = this.byRaw.get(key)
    if (have) return have
    let n = this.next.get(base) ?? 0
    let marker: string
    do {
      n++
      marker = `${OPEN}${n > 1 ? `${base} ${n}` : base}${CLOSE}`
    } while (this.byMarker.has(marker))
    this.next.set(base, n)
    this.byMarker.set(marker, { raw, cls, tk })
    this.byRaw.set(key, marker)
    return marker
  }
}

const paramOf = (raw: string) => decodeEntities(raw).match(/params\.([A-Z0-9_]+)/i)?.[1]
const placeholderBase = (raw: string) => {
  const p = paramOf(raw)
  return p ? (PARAM_LABELS[p.toUpperCase()] ?? p) : 'Platzhalter'
}

function liquidBase(raw: string): string {
  const dec = decodeEntities(raw)
  const tag = dec.slice(2).trim().split(/\s+/)[0]?.toLowerCase()
  const param = paramOf(dec)
  const pl = param ? (PARAM_LABELS[param.toUpperCase()] ?? param) : ''
  const cmp = dec.match(/(==|!=)\s*"([^"]*)"/)
  const cond = pl ? (cmp ? ` ${pl} ${cmp[1] === '==' ? '=' : '≠'} ${cmp[2]}` : ` ${pl} vorhanden`) : ''
  return tag === 'if' ? `Wenn${cond}`
    : tag === 'unless' ? `Wenn nicht${cond}`
    : tag === 'elsif' ? `Oder wenn${cond}`
    : tag === 'else' ? 'Sonst'
    : tag === 'endif' || tag === 'endunless' ? 'Ende'
    : tag === 'for' ? 'Liste'
    : tag === 'endfor' ? 'Ende Liste'
    : 'Regel'
}

const STRUCT_NAMES: Record<string, string> = {
  strong: 'Fett', b: 'Fett', em: 'Kursiv', i: 'Kursiv', a: 'Link', u: 'Unterstrichen',
  s: 'Durchgestrichen', strike: 'Durchgestrichen', small: 'Klein', sup: 'Hochgestellt', sub: 'Tiefgestellt',
}
const structName = (name: string) => STRUCT_NAMES[name] ?? (name === 'br' ? 'Zeilenumbruch' : 'Format')

/** "Fett" → "fett an", "/Fett" → "fett aus", everything else as is. */
export function markerDisplay(marker: string): string {
  const inner = marker.slice(1, -1)
  if (inner.startsWith('/')) return `${inner.slice(1)} aus`
  if (/^(Fett|Kursiv|Link|Format|Unterstrichen|Durchgestrichen|Klein|Hochgestellt|Tiefgestellt)( \d+)?$/.test(inner)) return `${inner} an`
  return inner
}

const tok = (raw: string, marker: string, cls: TokClass, tk: TokKind): Part => ({ kind: 'tok', raw, marker, cls, tk })
const structTok = (raw: string, name: string, closing: boolean, lex: Lexicon): Part =>
  tok(raw, lex.intern(raw, `${closing ? '/' : ''}${structName(name)}`, 'fixed', 'struct'), 'fixed', 'struct')

function textParts(raw: string, lex: Lexicon): Part[] {
  const parts: Part[] = []
  let last = 0
  const lit = (s: string) => {
    if (s) parts.push({ kind: 'lit', text: collapse(decodeEntities(s)) })
  }
  for (const m of raw.matchAll(TOKEN_RE)) {
    const at = m.index ?? 0
    lit(raw.slice(last, at))
    const t = m[0]
    if (t.startsWith('{{')) {
      const p = paramOf(t)
      parts.push(tok(t, lex.intern(t, placeholderBase(t), 'free', 'placeholder', p ? `ph:${p.toUpperCase()}` : t), 'free', 'placeholder'))
    }
    else if (t.startsWith('{%')) parts.push(tok(t, lex.intern(t, liquidBase(t), 'fixed', 'liquid'), 'fixed', 'liquid'))
    else {
      const tk: TokKind = t.includes('@') && !/^(https?:|www\.)/i.test(t) ? 'email' : 'url'
      parts.push(tok(t, lex.intern(t, t, 'fixed', tk), 'fixed', tk))
    }
    last = at + t.length
  }
  lit(raw.slice(last))
  return parts
}

const WORD_RE = /[\p{L}\p{N}]/u
const hasWordsParts = (parts: Part[]) => parts.some((p) => p.kind === 'lit' && WORD_RE.test(p.text))
const wordsInRaw = (raw: string) => WORD_RE.test(decodeEntities(raw.replace(/<[^>]*>/g, '').replace(TOKEN_RE, '')))
const valueOf = (parts: Part[]) => parts.map((p) => (p.kind === 'lit' ? p.text : p.marker)).join('')

/* ── Low-level HTML scanning (quotes and Liquid aware) ─────────────────── */

function skipLiquid(html: string, i: number): number {
  if (html.startsWith('{{', i)) {
    const j = html.indexOf('}}', i + 2)
    return j === -1 ? i : j + 2
  }
  if (html.startsWith('{%', i)) {
    const j = html.indexOf('%}', i + 2)
    return j === -1 ? i : j + 2
  }
  return i
}

function tagEnd(html: string, i: number): number {
  let q: string | null = null
  for (let k = i + 1; k < html.length; k++) {
    const c = html[k]
    if (q) {
      if (c === q) q = null
      continue
    }
    if (c === '"' || c === "'") q = c
    else if (c === '{') {
      const next = skipLiquid(html, k)
      if (next > k) k = next - 1
    } else if (c === '>') return k
  }
  return html.length - 1
}

const isTagStart = (s: string, i: number) => s[i] === '<' && /[a-zA-Z/!]/.test(s[i + 1] ?? '')
const tagName = (tag: string) => tag.replace(/^<\/?/, '').match(/^[a-zA-Z][a-zA-Z0-9-]*/)?.[0].toLowerCase() ?? ''

function findClose(raw: string, name: string, from: number, limit = raw.length): { start: number; end: number } | null {
  let depth = 1
  for (let j = from; j < limit; j++) {
    const c = raw[j]
    if (c === '{') {
      const n = skipLiquid(raw, j)
      if (n > j) {
        j = n - 1
        continue
      }
    }
    if (c === '<' && /[a-zA-Z/]/.test(raw[j + 1] ?? '')) {
      const te = tagEnd(raw, j)
      const tag = raw.slice(j, te + 1)
      if (tagName(tag) === name) {
        if (tag.startsWith('</')) {
          depth--
          if (depth === 0) return { start: j, end: te + 1 }
        } else if (!tag.endsWith('/>')) depth++
      }
      j = te
    }
  }
  return null
}

/** A sentence as the reader sees it: text, <br>, placeholders, and nested spans. */
function parseFlow(raw: string, lex: Lexicon, br: { form: string }): Part[] {
  const parts: Part[] = []
  let buf = ''
  const flush = () => {
    if (buf) {
      parts.push(...textParts(buf, lex))
      buf = ''
    }
  }
  let i = 0
  while (i < raw.length) {
    const c = raw[i]
    if (c === '{') {
      const n = skipLiquid(raw, i)
      if (n > i) {
        buf += raw.slice(i, n)
        i = n
        continue
      }
    }
    if (c === '<' && /[a-zA-Z/]/.test(raw[i + 1] ?? '')) {
      const te = tagEnd(raw, i)
      const tag = raw.slice(i, te + 1)
      const closing = tag.startsWith('</')
      const name = tagName(tag)
      flush()
      if (!closing && name === 'br' && /^<br\s*\/?>$/i.test(tag)) {
        if (!br.form) br.form = tag
        parts.push({ kind: 'lit', text: '\n' })
        i = te + 1
        continue
      }
      if (!closing && !tag.endsWith('/>') && name !== 'br') {
        const close = findClose(raw, name, te + 1)
        if (close) {
          const inner = raw.slice(te + 1, close.start)
          if (wordsInRaw(inner)) {
            // bold/link/format span with real words: its start and end are fixed chips
            parts.push(structTok(tag, name, false, lex))
            parts.push(...parseFlow(inner, lex, br))
            parts.push(structTok(raw.slice(close.start, close.end), name, true, lex))
          } else if (paramOf(inner)) {
            // <strong>{{ placeholder }}</strong>: one movable chip, formatting included
            const whole = raw.slice(i, close.end)
            const suffix = name === 'strong' || name === 'b' ? ' (fett)' : name === 'em' || name === 'i' ? ' (kursiv)' : ' (formatiert)'
            parts.push(tok(whole, lex.intern(whole, placeholderBase(inner) + suffix, 'free', 'wrapped'), 'free', 'wrapped'))
          } else {
            const whole = raw.slice(i, close.end)
            parts.push(tok(whole, lex.intern(whole, 'Zeichen', 'fixed', 'struct'), 'fixed', 'struct'))
          }
          i = close.end
          continue
        }
      }
      parts.push(structTok(tag, name, closing, lex))
      i = te + 1
      continue
    }
    buf += c
    i++
  }
  flush()
  return parts
}

/** No stray spaces around line breaks; no empty pieces. */
function tidy(parts: Part[]): Part[] {
  const out = parts.map((p) => ({ ...p })) as Part[]
  out.forEach((p, i) => {
    if (p.kind === 'lit' && p.text === '\n') {
      const prev = out[i - 1]
      const next = out[i + 1]
      if (prev?.kind === 'lit' && prev.text !== '\n') prev.text = prev.text.replace(/ +$/, '')
      if (next?.kind === 'lit' && next.text !== '\n') next.text = next.text.replace(/^ +/, '')
    }
  })
  return out.filter((p) => p.kind === 'tok' || p.text !== '')
}

function topLevelAnchors(html: string, s: number, e: number): { start: number; end: number }[] {
  const out: { start: number; end: number }[] = []
  for (let j = s; j < e; j++) {
    if (html[j] === '{') {
      const n = skipLiquid(html, j)
      if (n > j) {
        j = n - 1
        continue
      }
    }
    if (html[j] === '<' && /[a-zA-Z]/.test(html[j + 1] ?? '')) {
      const te = tagEnd(html, j)
      const tag = html.slice(j, te + 1)
      if (tagName(tag) === 'a' && !tag.endsWith('/>')) {
        const close = findClose(html, 'a', te + 1, e)
        if (close) {
          out.push({ start: j, end: close.end })
          j = close.end - 1
          continue
        }
      }
      j = te
    }
  }
  return out
}

function unwrap(html: string, s: number, e: number): { s: number; e: number; link: boolean } {
  let link = false
  for (;;) {
    if (html[s] !== '<') break
    const te = tagEnd(html, s)
    const tag = html.slice(s, te + 1)
    if (tag.startsWith('</') || tag.endsWith('/>')) break
    const name = tagName(tag)
    if (!INLINE.has(name) || name === 'br') break
    const close = findClose(html, name, te + 1, e)
    if (!close || close.end !== e) break
    if (name === 'a') link = true
    s = te + 1
    e = close.start
    while (s < e && /\s/.test(html[s])) s++
    while (e > s && /\s/.test(html[e - 1])) e--
  }
  return { s, e, link }
}

type StackEntry = { name: string; hidden: boolean }
function kindFromStack(stack: StackEntry[]): FieldKind {
  if (stack.some((s) => s.hidden)) return 'preheader'
  for (let k = stack.length - 1; k >= 0; k--) {
    const n = stack[k].name
    if (/^h[1-6]$/.test(n)) return 'heading'
    if (n === 'button') return 'link'
  }
  return 'text'
}

function scan(html: string, lex: Lexicon): Segment[] {
  const segs: Segment[] = []
  const stack: StackEntry[] = []
  let inHead = false
  let t = 0
  let a = 0
  let runStart = 0

  const emit = (s: number, e: number) => {
    const u = unwrap(html, s, e)
    if (u.s >= u.e || !wordsInRaw(html.slice(u.s, u.e))) return
    const br = { form: '' }
    const parts = tidy(parseFlow(html.slice(u.s, u.e), lex, br))
    if (!hasWordsParts(parts)) return
    const kind = u.link ? 'link' : kindFromStack(stack)
    segs.push({
      id: `t${t++}`,
      kind,
      start: u.s,
      end: u.e,
      mode: 'text',
      parts,
      brForm: br.form || '<br>',
      inline: kind !== 'preheader' && parts.every((p) => p.kind === 'lit' || p.cls === 'free'),
    })
  }

  const flushRun = (end: number) => {
    if (inHead) return
    let s = runStart
    let e = end
    while (s < e && /\s/.test(html[s])) s++
    while (e > s && /\s/.test(html[e - 1])) e--
    if (s >= e) return
    // Only links and separators (footer: Datenschutz · AGB · Impressum): one field per link.
    const anchors = topLevelAnchors(html, s, e)
    if (anchors.length > 0) {
      let rest = ''
      let at = s
      for (const an of anchors) {
        rest += html.slice(at, an.start)
        at = an.end
      }
      rest += html.slice(at, e)
      if (!wordsInRaw(rest)) {
        anchors.forEach((an) => emit(an.start, an.end))
        return
      }
    }
    emit(s, e)
  }

  let i = 0
  while (i < html.length) {
    if (html.startsWith('<!--', i)) {
      flushRun(i)
      const j = html.indexOf('-->', i + 4)
      i = j === -1 ? html.length : j + 3
      runStart = i
      continue
    }
    if (isTagStart(html, i)) {
      const end = tagEnd(html, i)
      const tag = html.slice(i, end + 1)
      const closing = tag.startsWith('</')
      const name = tagName(tag)
      if (!tag.startsWith('<!') && INLINE.has(name)) {
        i = end + 1 // inline tags stay inside the current run
        continue
      }
      flushRun(i)
      if (tag.startsWith('<!')) {
        i = end + 1
        runStart = i
        continue
      }
      if (closing) {
        if (name === 'head') inHead = false
        const at = stack.map((s) => s.name).lastIndexOf(name)
        if (at !== -1) stack.length = at
        i = end + 1
        runStart = i
        continue
      }
      if (SKIP_CONTENT.has(name)) {
        const close = html.toLowerCase().indexOf(`</${name}`, end + 1)
        i = close === -1 ? html.length : tagEnd(html, close) + 1
        runStart = i
        continue
      }
      if (name === 'head') inHead = true
      if (!inHead) {
        for (const m of tag.matchAll(/\s(alt|title)\s*=\s*"([^"]*)"/gi)) {
          const value = m[2]
          if (!wordsInRaw(value)) continue
          const valueStart = i + (m.index ?? 0) + m[0].length - 1 - value.length
          segs.push({
            id: `a${a++}`,
            kind: m[1].toLowerCase() === 'alt' ? 'alt' : 'title',
            start: valueStart,
            end: valueStart + value.length,
            mode: 'attr',
            parts: tidy(textParts(value, lex)),
            brForm: '',
            inline: false,
          })
        }
      }
      if (!VOID.has(name) && !tag.endsWith('/>')) {
        const style = tag.match(/\sstyle\s*=\s*"([^"]*)"/i)?.[1] ?? ''
        stack.push({ name, hidden: /display\s*:\s*none/i.test(style) })
      }
      i = end + 1
      runStart = i
      continue
    }
    if (html[i] === '{') {
      const n = skipLiquid(html, i)
      if (n > i) {
        i = n
        continue
      }
    }
    i++
  }
  flushRun(html.length)
  return segs.sort((x, y) => x.start - y.start)
}

function prepare(html: string, subject: string) {
  const lex = new Lexicon()
  const segs = scan(html, lex)
  const subjectParts = subject ? tidy(textParts(subject, lex)) : []
  return { lex, segs, subjectParts }
}

/* ── Rebuilding an edited paragraph ────────────────────────────────────── */

function rebuild(parts: Part[], edited: string, lex: Lexicon, fieldId: string, enc: (s: string) => string): string {
  const value = edited.replace(/\r\n?/g, '\n')
  const origFixed = parts.flatMap((p) => (p.kind === 'tok' && p.cls === 'fixed' ? [p.raw] : []))
  // A placeholder that was already in this paragraph keeps its own fallback text.
  const ownRaw = new Map<string, string>()
  for (const p of parts) if (p.kind === 'tok' && p.cls === 'free' && !ownRaw.has(p.marker)) ownRaw.set(p.marker, p.raw)
  const newFixed: string[] = []
  let out = ''
  let anyWord = false
  let last = 0
  const lit = (text: string) => {
    if (!text) return
    if (/[<>]|\{\{|\}\}|\{%|%\}|[⟦⟧]/.test(text)) {
      throw new TemplateEditError('Bitte keine Zeichen wie < > {{ }} {% %} verwenden.', fieldId)
    }
    if (ADDRESS_RE.test(text)) {
      throw new TemplateEditError(
        'Bitte keine E-Mail-Adressen oder Links in den Text schreiben. Die vorhandenen bleiben als graue Bausteine stehen.',
        fieldId,
      )
    }
    if (WORD_RE.test(text)) anyWord = true
    out += enc(text)
  }
  for (const m of value.matchAll(MARK_RE)) {
    const at = m.index ?? 0
    lit(value.slice(last, at))
    const entry = lex.byMarker.get(m[0])
    if (!entry) {
      throw new TemplateEditError(`Den Baustein ${m[0]} gibt es in dieser E-Mail nicht. Bitte über „Einfügen“ wählen.`, fieldId)
    }
    if (entry.cls === 'fixed') newFixed.push(entry.raw)
    out += entry.cls === 'free' ? (ownRaw.get(m[0]) ?? entry.raw) : entry.raw
    last = at + m[0].length
  }
  lit(value.slice(last))
  if (origFixed.length !== newFixed.length || origFixed.some((r, i) => r !== newFixed[i])) {
    const idx = origFixed.findIndex((r, i) => r !== newFixed[i])
    const raw = origFixed[idx === -1 ? origFixed.length - 1 : idx]
    const name = markerDisplay(lex.byRaw.get(raw) ?? '⟦?⟧')
    throw new TemplateEditError(
      `Der feste Baustein „${name}“ fehlt oder steht an anderer Stelle. Graue Bausteine müssen bleiben, in der gleichen Reihenfolge.`,
      fieldId,
    )
  }
  if (!anyWord && hasWordsParts(parts)) throw new TemplateEditError('Dieses Feld darf nicht leer sein.', fieldId)
  return out
}

const encText = (brForm: string) => (s: string) => encodeText(s).replace(/\n/g, brForm)
const encAttr = (s: string) => encodeAttr(s.replace(/\n/g, ' '))
const encSubject = (original: string) => (s: string) => {
  let r = s.replace(/\n/g, ' ')
  if (original.includes('&amp;')) r = r.replace(/&/g, '&amp;')
  if (original.includes('&quot;')) r = r.replace(/"/g, '&quot;')
  return r
}

/** Everything outside the editable ranges. Must be identical before and after an edit. */
export function lockedFingerprint(html: string): string {
  const segs = scan(html, new Lexicon())
  let out = ''
  let prev = 0
  for (const s of segs) {
    out += html.slice(prev, s.start) + '\u0001'
    prev = s.end
  }
  return out + html.slice(prev)
}

export function applyFieldEdits(html: string, edits: Record<string, string>, subject = ''): string {
  const { lex, segs } = prepare(html, subject)
  const byId = new Map(segs.map((s) => [s.id, s]))
  const changes: { seg: Segment; text: string }[] = []
  for (const [id, value] of Object.entries(edits)) {
    const seg = byId.get(id)
    if (!seg) throw new TemplateEditError('Die E-Mail wurde inzwischen verändert. Bitte neu laden.', id)
    if (value === valueOf(seg.parts)) continue
    changes.push({ seg, text: rebuild(seg.parts, value, lex, id, seg.mode === 'attr' ? encAttr : encText(seg.brForm)) })
  }
  changes.sort((x, y) => y.seg.start - x.seg.start)
  let out = html
  for (const { seg, text } of changes) out = out.slice(0, seg.start) + text + out.slice(seg.end)
  if (lockedFingerprint(out) !== lockedFingerprint(html)) {
    throw new TemplateEditError(
      'Gespeichert wird nicht: Die Änderung würde einen Link, eine Adresse oder die Gestaltung der E-Mail verändern.',
    )
  }
  return out
}

/* ── What the editor needs ─────────────────────────────────────────────── */

function sampleOfRaw(raw: string, params: Record<string, string>): string {
  const dec = decodeEntities(raw)
  const name = dec.match(/params\.([A-Z0-9_]+)/i)?.[1]
  if (name && params[name] !== undefined && params[name] !== '') return params[name]
  const def = dec.match(/default:\s*["']([^"']+)["']/)?.[1]
  return def || (name ? (PARAM_LABELS[name.toUpperCase()] ?? name) : '…')
}

const toField = (s: Segment): TemplateField => {
  const toks = s.parts.flatMap((p) => (p.kind === 'tok' ? [p] : []))
  return {
    id: s.id,
    kind: s.kind,
    value: valueOf(s.parts),
    markers: toks.map((p) => p.marker),
    fixed: [...new Set(toks.filter((p) => p.cls === 'fixed').map((p) => p.marker))],
    liquid: [...new Set(toks.filter((p) => p.tk === 'liquid').map((p) => p.marker))],
    inline: s.inline,
  }
}

export function analyzeTemplate(html: string, subject = ''): TemplateAnalysis {
  const { lex, segs, subjectParts } = prepare(html, subject)
  const chips: Record<string, ChipInfo> = {}
  for (const [marker, e] of lex.byMarker) chips[marker] = { fixed: e.cls === 'fixed', sample: e.cls === 'free' ? sampleOfRaw(e.raw, SAMPLE_PARAMS) : '' }
  const subjToks = subjectParts.flatMap((p) => (p.kind === 'tok' ? [p] : []))
  const palette: PaletteChip[] = []
  const seen = new Set<string>()
  const addPalette = (p: Part) => {
    if (p.kind !== 'tok' || p.cls !== 'free' || seen.has(p.marker)) return
    if (/_URL\b/i.test(p.raw)) return
    seen.add(p.marker)
    palette.push({ marker: p.marker, label: markerDisplay(p.marker), sample: chips[p.marker]?.sample ?? '' })
  }
  segs.filter((s) => s.mode === 'text').forEach((s) => s.parts.forEach(addPalette))
  subjectParts.forEach(addPalette)
  return {
    fields: segs.map(toField),
    subject: {
      value: valueOf(subjectParts),
      markers: subjToks.map((p) => p.marker),
      fixed: [...new Set(subjToks.filter((p) => p.cls === 'fixed').map((p) => p.marker))],
      liquid: [...new Set(subjToks.filter((p) => p.tk === 'liquid').map((p) => p.marker))],
    },
    chips,
    palette,
  }
}

export function extractFields(html: string, subject = ''): TemplateField[] {
  return analyzeTemplate(html, subject).fields
}

/** Subject as shown in lists (own marker numbering; use analyzeTemplate for editing). */
export function subjectToEditor(subject: string): { value: string; markers: string[] } {
  const parts = tidy(textParts(subject, new Lexicon()))
  return { value: valueOf(parts), markers: parts.flatMap((p) => (p.kind === 'tok' ? [p.marker] : [])) }
}

/** Edited subject → raw subject. Pass the template HTML so marker names match the editor's. */
export function editorToSubject(original: string, edited: string, html = ''): string {
  const { lex, subjectParts } = prepare(html, original)
  if (edited.replace(/\s*\n\s*/g, ' ') === valueOf(subjectParts)) return original
  const out = rebuild(subjectParts, edited, lex, 'subject', encSubject(original)).trim()
  if (!out) throw new TemplateEditError('Der Betreff darf nicht leer sein.', 'subject')
  return out
}

/* ── Preview ───────────────────────────────────────────────────────────── */

/**
 * Preview HTML for the dashboard: fills {{ params.X | default: "…" }} with
 * example values (or the default), resolves simple `{% if params.X %}` blocks
 * with the example values, and strips remaining Liquid tags.
 */
export function renderPreview(html: string, params: Record<string, string>): string {
  const val = (expr: string) => {
    const dec = decodeEntities(expr)
    const name = dec.match(/params\.([A-Z0-9_]+)/i)?.[1]
    if (name && params[name] !== undefined) return params[name]
    const def = dec.match(/default:\s*["']([^"']*)["']/)?.[1]
    return def ?? ''
  }
  let out = html
  for (let guard = 0; guard < 50; guard++) {
    const m = out.match(/\{%\s*if\s+([^%]*?)\s*%\}([\s\S]*?)(?:\{%\s*else\s*%\}([\s\S]*?))?\{%\s*endif\s*%\}/)
    if (!m || m.index === undefined) break
    const cond = decodeEntities(m[1])
    const eq = cond.match(/params\.([A-Z0-9_]+)\s*==\s*"([^"]*)"/i)
    const neq = cond.match(/params\.([A-Z0-9_]+)\s*!=\s*"([^"]*)"/i)
    const plain = cond.match(/^params\.([A-Z0-9_]+)$/i)
    let truthy = false
    if (eq) truthy = (params[eq[1]] ?? '') === eq[2]
    else if (neq) truthy = (params[neq[1]] ?? '') !== neq[2]
    else if (plain) truthy = Boolean(params[plain[1]])
    out = out.slice(0, m.index) + (truthy ? m[2] : (m[3] ?? '')) + out.slice(m.index + m[0].length)
  }
  out = out.replace(/\{%[\s\S]*?%\}/g, '')
  out = out.replace(/\{\{([\s\S]*?)\}\}/g, (_m, expr: string) => encodeText(val(expr)))
  return out
}

const PREVIEW_STYLE =
  '<style>[data-seg]{border-radius:3px;outline:2px solid transparent;outline-offset:1px;transition:outline-color .15s,background-color .15s}' +
  '[data-seg]:hover{outline-color:rgba(230,190,104,.8);background-color:rgba(230,190,104,.12)}' +
  '[data-seg][data-edit]{cursor:text}[data-seg]:not([data-edit]){cursor:pointer}' +
  '[data-seg]:focus{outline-color:#E6BE68;background-color:rgba(230,190,104,.18)}' +
  '.ffc{background:#FBF3E1;color:#7A540C;border-radius:4px;padding:0 4px;font-weight:600;white-space:nowrap}</style>'

const PREVIEW_SCRIPT =
  '<script>(function(){var P=parent;' +
  "function ser(n){var o='';n.childNodes.forEach(function(c){if(c.nodeType===3){o+=c.nodeValue}else if(c.nodeType===1){if(c.dataset&&c.dataset.m){o+=c.dataset.m}else if(c.tagName==='BR'){o+='\\n'}else if(c.tagName==='DIV'||c.tagName==='P'){o+='\\n'+ser(c)}else{o+=ser(c)}}});return o}" +
  "function seg(e){return e.target.closest&&e.target.closest('[data-seg]')}" +
  "document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(a)e.preventDefault();var s=seg(e);if(s)P.postMessage({ff:1,t:'focus',id:s.dataset.seg,edit:!!s.dataset.edit},'*')});" +
  "document.addEventListener('input',function(e){var s=seg(e);if(s&&s.dataset.edit)P.postMessage({ff:1,t:'edit',id:s.dataset.seg,value:ser(s).replace(/\\u00a0/g,' ').replace(/ {2,}/g,' ')},'*')});" +
  "document.addEventListener('paste',function(e){var s=seg(e);if(!s||!s.dataset.edit)return;e.preventDefault();var t=(e.clipboardData||window.clipboardData).getData('text/plain').replace(/[\\u27e6\\u27e7<>]/g,'');document.execCommand('insertText',false,t)});" +
  "document.addEventListener('keydown',function(e){var s=seg(e);if(s&&s.dataset.edit&&e.key==='Enter'){e.preventDefault();document.execCommand('insertLineBreak')}});" +
  "window.addEventListener('message',function(e){var d=e.data;if(!d||d.t!=='set')return;var s=document.querySelector('[data-seg=\"'+d.id+'\"]');if(s&&document.activeElement!==s)s.innerHTML=d.html});" +
  "document.querySelectorAll('[data-seg][data-edit]').forEach(function(s){s.setAttribute('contenteditable','true');s.setAttribute('spellcheck','false')});" +
  '})();</script>'

function previewChip(marker: string, sample: string): string {
  return `<span class="ffc" contenteditable="false" data-m="${encodeAttr(marker)}">${encodeText(sample)}</span>`
}

/**
 * The email with every text paragraph wrapped in <span data-seg>. Paragraphs made of
 * plain text and movable chips are editable right in the preview (contenteditable);
 * the others only report a click so the editor can jump to them.
 * `segs[id].html` is the content of each wrapper, for live updates.
 */
export function buildEditablePreview(
  html: string,
  params: Record<string, string>,
): { doc: string; segs: Record<string, { html: string; edit: boolean }> } {
  const lex = new Lexicon()
  const segs = scan(html, lex).filter((s) => s.mode === 'text' && s.kind !== 'preheader')
  const out: Record<string, { html: string; edit: boolean }> = {}
  let doc = ''
  let prev = 0
  for (const s of segs) {
    doc += html.slice(prev, s.start) + `${s.id}`
    prev = s.end
    out[s.id] = s.inline
      ? {
          edit: true,
          html: s.parts
            .map((p) => (p.kind === 'lit' ? encodeText(p.text).replace(/\n/g, '<br>') : previewChip(p.marker, sampleOfRaw(p.raw, params))))
            .join(''),
        }
      : { edit: false, html: renderPreview(html.slice(s.start, s.end), params) }
  }
  doc += html.slice(prev)
  doc = renderPreview(doc, params).replace(/(\w+)/g, (_m, id: string) =>
    out[id] ? `<span data-seg="${id}"${out[id].edit ? ' data-edit="1"' : ''}>${out[id].html}</span>` : '',
  )
  const tools = PREVIEW_STYLE + PREVIEW_SCRIPT
  doc = /<\/body>/i.test(doc) ? doc.replace(/<\/body>/i, () => `${tools}</body>`) : doc + tools
  return { doc, segs: out }
}
