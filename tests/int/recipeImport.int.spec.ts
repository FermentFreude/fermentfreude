import { describe, expect, it } from 'vitest'

import {
  parseFermentLog,
  parseIngredients,
  parseRecipeImport,
  parseSteps,
  parseTable,
  TEMPLATE_COLUMNS,
  TEMPLATE_EXAMPLE,
} from '@/lib/recipeImport'

const csv = (rows: string[][], d = ';') =>
  rows.map((r) => r.map((c) => (/[";\n,\t]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(d)).join('\r\n')

describe('parseTable', () => {
  it('reads semicolon CSV (German Excel) with quotes and line breaks in cells', () => {
    const t = parseTable('﻿Titel;Zutaten\r\n"Kraut";"500 g Kohl\n10 g Salz"\r\n')
    expect(t).toEqual([
      ['Titel', 'Zutaten'],
      ['Kraut', '500 g Kohl\n10 g Salz'],
    ])
  })
  it('reads rows pasted from Google Sheets (tabs)', () => {
    expect(parseTable('Titel\tKategorie\nA\tTempeh')).toEqual([
      ['Titel', 'Kategorie'],
      ['A', 'Tempeh'],
    ])
  })
  it('reads comma CSV with escaped quotes', () => {
    expect(parseTable('a,b\n"x ""y""",z')).toEqual([
      ['a', 'b'],
      ['x "y"', 'z'],
    ])
  })
})

describe('parseIngredients', () => {
  it('splits "amount | name | note" and groups by "#"', () => {
    const g = parseIngredients('# Für die Lake\n1 l | Wasser\n20 g | Salz | unjodiert\n# Gemüse\n- 2 Karotten')
    expect(g).toEqual([
      { title: 'Für die Lake', items: [{ amount: '1 l', name: 'Wasser' }, { amount: '20 g', name: 'Salz', note: 'unjodiert' }] },
      { title: 'Gemüse', items: [{ amount: '2', name: 'Karotten' }] },
    ])
  })
  it('guesses amount from free text', () => {
    expect(parseIngredients('ca. 60 g Trauben, eine Handvoll\nSalz')[0].items).toEqual([
      { amount: 'ca. 60 g', name: 'Trauben', note: 'eine Handvoll' },
      { name: 'Salz' },
    ])
  })
})

describe('parseSteps', () => {
  it('removes numbering and reads short titles', () => {
    expect(parseSteps('1. Vorbereiten: Kohl hobeln\n2) Salzen und kneten, bis Saft austritt')).toEqual([
      { title: 'Vorbereiten', text: 'Kohl hobeln' },
      { text: 'Salzen und kneten, bis Saft austritt' },
    ])
  })
})

describe('parseFermentLog', () => {
  it('reads "Tag 1: …", "Day 3 – …", "5) …" and "Heute: …", sorted by day', () => {
    expect(parseFermentLog('Tag 3: Riecht säuerlich\nHeute: Ansetzen\nDay 7 – fertig\n5) Bläschen\nohne Tag')).toEqual([
      { day: 0, text: 'Ansetzen' },
      { day: 3, text: 'Riecht säuerlich' },
      { day: 5, text: 'Bläschen' },
      { day: 7, text: 'fertig' },
    ])
  })
})

describe('parseRecipeImport', () => {
  it('turns the template example into a complete recipe', () => {
    const { rows, error } = parseRecipeImport(csv([TEMPLATE_COLUMNS, TEMPLATE_EXAMPLE]))
    expect(error).toBeUndefined()
    expect(rows).toHaveLength(1)
    const r = rows[0].recipe!
    expect(rows[0].errors).toEqual([])
    expect(r).toMatchObject({
      title: 'Trauben-Kombucha',
      category: 'kombucha',
      prepMinutes: 5,
      fermentationDays: 3,
      difficulty: 'leicht',
      yield: '1 Bügelflasche',
    })
    expect(r.ingredientGroups[0].items).toHaveLength(2)
    expect(r.steps[0]).toEqual({ title: 'Vorbereiten', text: 'Trauben waschen und halbieren.' })
    expect(r.tips).toHaveLength(1)
    expect(r.fermentLog).toEqual([
      { day: 1, text: 'Erste kleine Bläschen am Flaschenhals' },
      { day: 3, text: 'Prickelt und riecht fruchtig – fertig zum Kühlen' },
    ])
  })

  it('accepts category names in several spellings', () => {
    const { rows } = parseRecipeImport(
      csv([['Titel', 'Kategorie'], ['A', 'Gemüse fermentieren'], ['B', 'einlegen'], ['C', 'Tempeh & Kochen'], ['D', 'Kombucha']]),
    )
    expect(rows.map((r) => r.recipe?.category)).toEqual(['fermentieren', 'einlegen', 'tempeh', 'kombucha'])
  })

  it('reports rows with missing title or unknown category, with the spreadsheet row number', () => {
    const { rows } = parseRecipeImport(csv([['Titel', 'Kategorie'], ['', 'Tempeh'], ['X', 'Brot']]))
    expect(rows[0]).toMatchObject({ row: 2, recipe: undefined })
    expect(rows[0].errors[0]).toMatch(/Titel fehlt/)
    expect(rows[1].errors[0]).toMatch(/Kategorie „Brot" unbekannt/)
  })

  it('refuses a sheet without the required columns', () => {
    expect(parseRecipeImport('Name;Zutaten\nA;B').error).toMatch(/Kategorie/)
  })
})
