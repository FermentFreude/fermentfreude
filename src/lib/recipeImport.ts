import { RECIPE_CATEGORIES, RECIPE_DIFFICULTIES } from '@/collections/Recipes/categories'

/* ═══════════════════════════════════════════════════════════════
 *  Recipe import — turns spreadsheet rows into recipe data.
 *
 *  Input: CSV (comma or semicolon, as Excel saves it) or rows copied
 *  straight out of Google Sheets / Excel (tab-separated). First row =
 *  column names (German or English, any order, case doesn't matter).
 *  One row per recipe. Multi-line cells:
 *    Zutaten  one per line: "60 g | Trauben | eine Handvoll"
 *             (amount | name | note) — or just "60 g Trauben".
 *             A line starting with "#" starts a new group ("# Für die Lake").
 *    Schritte one per line, optional "Title: text", numbering is removed.
 *    Tipps    one per line.
 *  Pure functions, no database — used by the admin import page.
 * ═══════════════════════════════════════════════════════════════ */

export type ImportedIngredient = { amount?: string; name: string; note?: string }
export type ImportedRecipe = {
  title: string
  slug?: string
  category: string
  summary?: string
  prepMinutes?: number
  fermentationDays?: number
  yield?: string
  difficulty?: string
  vessel?: string
  whyItWorks?: string
  keywords?: string
  ingredientGroups: { title?: string; items: ImportedIngredient[] }[]
  steps: { title?: string; text: string }[]
  tips: { text: string }[]
  fermentLog: { day: number; text: string }[]
}

export type ParsedRow = {
  /** Spreadsheet row number (1 = header), for messages */
  row: number
  recipe?: ImportedRecipe
  errors: string[]
  warnings: string[]
}

export type ParseResult = { rows: ParsedRow[]; error?: string; columns: string[] }

/** Column names David can use → field. Compared lower-case without spaces/punctuation. */
const COLUMNS: Record<string, keyof ImportedRecipe | 'ingredients'> = {}
const alias = (field: keyof ImportedRecipe | 'ingredients', ...names: string[]) =>
  names.forEach((n) => (COLUMNS[key(n)] = field))
function key(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}
alias('title', 'Titel', 'Name', 'Rezept', 'Title')
alias('slug', 'URL', 'Slug')
alias('category', 'Kategorie', 'Category')
alias('summary', 'Kurzbeschreibung', 'Beschreibung', 'Summary', 'Description')
alias('prepMinutes', 'Zubereitung', 'Zubereitung Minuten', 'Zubereitung (Min.)', 'Minuten', 'Prep', 'Prep minutes')
alias('fermentationDays', 'Fermentation', 'Fermentation Tage', 'Fermentation (Tage)', 'Tage', 'Fermentation days')
alias('yield', 'Menge', 'Ergibt', 'Yield')
alias('difficulty', 'Schwierigkeit', 'Difficulty')
alias('vessel', 'Gefäß', 'Gefaess', 'Glas', 'Vessel')
alias('whyItWorks', 'Warum es funktioniert', 'Warum', 'Why it works')
alias('keywords', 'Stichwörter', 'Stichworte', 'Keywords', 'Suchbegriffe')
alias('ingredients', 'Zutaten', 'Ingredients')
alias('steps', 'Schritte', 'Zubereitungsschritte', 'Anleitung', 'Steps')
alias('tips', 'Tipps', 'Tips')
alias('fermentLog', 'Was du bemerkst', 'Beobachtungen', 'Tagebuch', "What you'll notice", 'Notice')

/** Column headers for the downloadable template, in this order. */
export const TEMPLATE_COLUMNS = [
  'Titel',
  'Kategorie',
  'Kurzbeschreibung',
  'Zubereitung (Min.)',
  'Fermentation (Tage)',
  'Menge',
  'Schwierigkeit',
  'Gefäß',
  'Warum es funktioniert',
  'Zutaten',
  'Schritte',
  'Tipps',
  'Was du bemerkst',
  'Stichwörter',
]

export const TEMPLATE_EXAMPLE = [
  'Trauben-Kombucha',
  'Kombucha & Drinks',
  'Fruchtig, prickelnd und in drei Tagen fertig.',
  '5',
  '3',
  '1 Bügelflasche',
  'Leicht',
  'Bügelflasche, 750 ml',
  'Der Zucker der Trauben füttert die Hefen – so entsteht die Kohlensäure.',
  'ca. 60 g | Trauben | eine Handvoll\nca. 650 ml | Frischer Kombucha | 3–5 Tage alt',
  'Vorbereiten: Trauben waschen und halbieren.\nAbfüllen: Trauben in die Flasche geben und mit Kombucha auffüllen.\nFermentieren: 3 Tage bei Zimmertemperatur stehen lassen, dann kühlen.',
  'Täglich kurz öffnen, damit der Druck entweicht.',
  'Tag 1: Erste kleine Bläschen am Flaschenhals\nTag 3: Prickelt und riecht fruchtig – fertig zum Kühlen',
  'kombucha, trauben, zweite fermentation',
]

/** RFC 4180 CSV/TSV parser: quotes, "" escapes and line breaks inside cells. */
export function parseTable(text: string): string[][] {
  const src = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n')
  const firstLine = src.split('\n', 1)[0] ?? ''
  const count = (ch: string) => firstLine.split(ch).length - 1
  const delim = count('\t') > 0 ? '\t' : count(';') > count(',') ? ';' : ','

  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"'
          i++
        } else quoted = false
      } else cell += ch
    } else if (ch === '"' && cell === '') quoted = true
    else if (ch === delim) {
      row.push(cell)
      cell = ''
    } else if (ch === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += ch
  }
  if (cell !== '' || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim()))
}

const lines = (cell?: string) =>
  (cell ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

const UNIT = String.raw`(?:g|kg|mg|ml|cl|dl|l|el|tl|msp|stk\.?|stück|prise[n]?|bund|zehe[n]?|scheibe[n]?|blatt|blätter|cm|handvoll|tasse[n]?|becher|dose[n]?|glas|gläser)`
const AMOUNT_RE = new RegExp(String.raw`^((?:ca\.\s*)?[\d½¼¾⅓⅔.,/–-]+\s*${UNIT}?\.?)\s+(.+)$`, 'i')

export function parseIngredients(cell?: string): ImportedRecipe['ingredientGroups'] {
  const groups: ImportedRecipe['ingredientGroups'] = []
  let current: { title?: string; items: ImportedIngredient[] } = { items: [] }
  for (const raw of lines(cell)) {
    const line = raw.replace(/^[-•*]\s*/, '')
    if (line.startsWith('#')) {
      if (current.items.length || current.title) groups.push(current)
      current = { title: line.replace(/^#+\s*/, '') || undefined, items: [] }
      continue
    }
    if (line.includes('|')) {
      const [amount, name, ...note] = line.split('|').map((p) => p.trim())
      if (name) current.items.push({ amount: amount || undefined, name, note: note.join(' | ') || undefined })
      else if (amount) current.items.push({ name: amount })
      continue
    }
    const m = line.match(AMOUNT_RE)
    if (m) {
      // "60 g Trauben, eine Handvoll" → note after the first comma
      const [name, ...note] = m[2].split(',').map((p) => p.trim())
      current.items.push({ amount: m[1].trim(), name, note: note.join(', ') || undefined })
    } else {
      const [name, ...note] = line.split(',').map((p) => p.trim())
      current.items.push({ name, note: note.join(', ') || undefined })
    }
  }
  if (current.items.length || current.title) groups.push(current)
  return groups.filter((g) => g.items.length > 0)
}

export function parseSteps(cell?: string): ImportedRecipe['steps'] {
  return lines(cell).map((raw) => {
    const line = raw.replace(/^(?:schritt\s*)?\d+\s*[.):-]\s*/i, '')
    const colon = line.indexOf(':')
    // "Vorbereiten: Trauben waschen" → short title + text (only for short titles)
    if (colon > 0 && colon <= 40 && line.slice(colon + 1).trim()) {
      return { title: line.slice(0, colon).trim(), text: line.slice(colon + 1).trim() }
    }
    return { text: line }
  })
}

/** "Tag 1: Erste Bläschen" / "Day 3: smells sour" / "3: …" / "Heute: …" → { day, text }, sorted. */
export function parseFermentLog(cell?: string): ImportedRecipe['fermentLog'] {
  return lines(cell)
    .map((raw) => {
      const line = raw.replace(/^[-•*]\s*/, '')
      const today = line.match(/^(?:heute|today)\s*[:–-]\s*(.+)$/i)
      if (today) return { day: 0, text: today[1].trim() }
      const m = line.match(/^(?:tag|day)?\s*(\d{1,3})\s*[:.)–-]\s*(.+)$/i)
      return m ? { day: Number(m[1]), text: m[2].trim() } : null
    })
    .filter((x): x is { day: number; text: string } => !!x && !!x.text)
    .sort((a, b) => a.day - b.day)
}

function toCategory(v?: string): string | undefined {
  if (!v) return undefined
  const k = key(v)
  return RECIPE_CATEGORIES.find(
    (c) => key(c.value) === k || key(c.label.de) === k || key(c.label.en) === k || key(c.label.de).startsWith(k),
  )?.value
}

function toDifficulty(v?: string): string | undefined {
  if (!v) return undefined
  const k = key(v)
  return RECIPE_DIFFICULTIES.find((d) => key(d.value) === k || key(d.label.de) === k || key(d.label.en) === k)?.value
}

function toNumber(v?: string): number | undefined {
  if (!v?.trim()) return undefined
  const n = Number(v.replace(',', '.').replace(/[^\d.]/g, ''))
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined
}

export function parseRecipeImport(text: string): ParseResult {
  const table = parseTable(text)
  if (table.length < 2) {
    return { rows: [], columns: [], error: 'Keine Rezepte gefunden. Erste Zeile = Spaltennamen, darunter ein Rezept pro Zeile.' }
  }
  const header = table[0].map((h) => h.trim())
  const fields = header.map((h) => COLUMNS[key(h)])
  if (!fields.includes('title') || !fields.includes('category')) {
    return {
      rows: [],
      columns: header,
      error: 'Die Spalten „Titel" und „Kategorie" fehlen. Bitte die Vorlage verwenden.',
    }
  }

  const rows: ParsedRow[] = table.slice(1).map((cells, i) => {
    const get = (f: string) => {
      const idx = fields.indexOf(f as never)
      return idx >= 0 ? (cells[idx] ?? '').trim() : ''
    }
    const errors: string[] = []
    const warnings: string[] = []
    const title = get('title')
    if (!title) errors.push('Titel fehlt')
    const category = toCategory(get('category'))
    if (!category) errors.push(`Kategorie „${get('category') || '–'}" unbekannt (erlaubt: ${RECIPE_CATEGORIES.map((c) => c.label.de).join(', ')})`)
    const difficultyRaw = get('difficulty')
    const difficulty = toDifficulty(difficultyRaw)
    if (difficultyRaw && !difficulty) warnings.push(`Schwierigkeit „${difficultyRaw}" unbekannt – leer gelassen`)

    const ingredientGroups = parseIngredients(get('ingredients'))
    const steps = parseSteps(get('steps'))
    if (!ingredientGroups.length) warnings.push('Keine Zutaten')
    if (!steps.length) warnings.push('Keine Schritte')

    const recipe: ImportedRecipe | undefined =
      errors.length === 0
        ? {
            title,
            slug: get('slug') || undefined,
            category: category!,
            summary: get('summary') || undefined,
            prepMinutes: toNumber(get('prepMinutes')),
            fermentationDays: toNumber(get('fermentationDays')),
            yield: get('yield') || undefined,
            difficulty,
            vessel: get('vessel') || undefined,
            whyItWorks: get('whyItWorks') || undefined,
            keywords: get('keywords') || undefined,
            ingredientGroups,
            steps,
            tips: lines(get('tips')).map((t) => ({ text: t.replace(/^[-•*]\s*/, '') })),
            fermentLog: parseFermentLog(get('fermentLog')),
          }
        : undefined
    return { row: i + 2, recipe, errors, warnings }
  })

  return { rows, columns: header }
}
