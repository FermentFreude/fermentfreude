'use client'

import Link from 'next/link'
import React, { useRef, useState } from 'react'

import { TEMPLATE_COLUMNS, TEMPLATE_EXAMPLE } from '@/lib/recipeImport'

import { importRecipes, previewRecipeImport, type ImportResult, type PreviewRow } from './actions'

/* ═══════════════════════════════════════════════════════════════
 *  /admin/rezepte-import — bulk-add recipes from a spreadsheet.
 *  1 download template · 2 fill it (one recipe per row) · 3 upload
 *  the CSV or paste rows from Google Sheets · preview · import as
 *  drafts. Photos are added afterwards in each recipe.
 * ═══════════════════════════════════════════════════════════════ */

const box: React.CSSProperties = {
  background: 'var(--theme-elevation-50)',
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  padding: '20px 24px',
}
const btn: React.CSSProperties = {
  background: 'var(--theme-elevation-900)',
  color: 'var(--theme-elevation-0)',
  border: 0,
  borderRadius: 6,
  padding: '10px 18px',
  fontWeight: 600,
  cursor: 'pointer',
}
const btnQuiet: React.CSSProperties = {
  ...btn,
  background: 'transparent',
  color: 'var(--theme-text)',
  border: '1px solid var(--theme-elevation-300)',
}

const STATUS: Record<PreviewRow['status'], { label: string; color: string }> = {
  new: { label: 'Neu – wird importiert', color: 'var(--theme-success-500)' },
  exists: { label: 'Gibt es schon – wird übersprungen', color: 'var(--theme-elevation-500)' },
  duplicate: { label: 'Doppelt in der Datei – übersprungen', color: 'var(--theme-warning-500)' },
  error: { label: 'Fehler', color: 'var(--theme-error-500)' },
}

function downloadTemplate() {
  const quote = (c: string) => (/[";\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)
  const csv = [TEMPLATE_COLUMNS, TEMPLATE_EXAMPLE].map((r) => r.map(quote).join(';')).join('\r\n')
  // BOM so Excel shows ä/ö/ü correctly
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'rezepte-vorlage.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}

export function RecipeImportClient() {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<PreviewRow[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<'' | 'preview' | 'import'>('')
  const [result, setResult] = useState<Extract<ImportResult, { ok: true }> | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setRows(null)
    setResult(null)
    setError('')
  }

  const onFile = async (file?: File) => {
    if (!file) return
    reset()
    setFileName(file.name)
    setText(await file.text())
  }

  const preview = async () => {
    reset()
    if (!text.trim()) {
      setError('Bitte zuerst eine CSV-Datei wählen oder Zeilen einfügen.')
      return
    }
    setBusy('preview')
    const res = await previewRecipeImport(text)
    setBusy('')
    if (res.ok) setRows(res.rows)
    else setError(res.error)
  }

  const runImport = async () => {
    setBusy('import')
    setError('')
    const res = await importRecipes(text)
    setBusy('')
    if (res.ok) {
      setResult(res)
      setRows(null)
    } else setError(res.error)
  }

  const newCount = rows?.filter((r) => r.status === 'new').length ?? 0

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ margin: 0 }}>Rezepte importieren</h1>
        <p style={{ marginTop: 8, color: 'var(--theme-elevation-600)', maxWidth: 720 }}>
          Viele Rezepte auf einmal anlegen – aus einer Tabelle (Excel oder Google Sheets). Alle Rezepte kommen als{' '}
          <strong>Entwurf</strong> herein: Fotos ergänzen, prüfen, dann veröffentlichen. Bestehende Rezepte werden nie
          überschrieben.
        </p>
      </div>

      <section style={box}>
        <h3 style={{ marginTop: 0 }}>1 · Vorlage herunterladen und ausfüllen</h3>
        <ul style={{ margin: '0 0 16px', paddingLeft: 20, lineHeight: 1.7 }}>
          <li>Eine Zeile pro Rezept. Pflicht: <strong>Titel</strong> und <strong>Kategorie</strong> (Gemüse fermentieren, Einlegen, Tempeh, Kombucha).</li>
          <li>
            <strong>Zutaten</strong>: eine pro Zeile in der Zelle, z. B. <code>60 g | Trauben | eine Handvoll</code> (Menge | Name | Hinweis).
            Eine Zeile mit <code># Für die Lake</code> startet eine neue Gruppe.
          </li>
          <li>
            <strong>Schritte</strong>: einer pro Zeile, optional mit kurzem Titel: <code>Vorbereiten: Trauben waschen</code>.
            <strong> Tipps</strong>: einer pro Zeile. <strong>Was du bemerkst</strong>: <code>Tag 1: Erste kleine Bläschen</code>, eine Zeile pro Tag.
          </li>
          <li>Neue Zeile in einer Zelle: Excel <code>Alt+Enter</code> (Mac: <code>Ctrl+Option+Enter</code>), Google Sheets <code>Ctrl+Enter</code>.</li>
          <li>Speichern als <strong>CSV</strong> – oder die Zeilen in Google Sheets markieren, kopieren und unten einfügen.</li>
        </ul>
        <button type="button" style={btnQuiet} onClick={downloadTemplate}>
          Vorlage herunterladen (CSV)
        </button>
      </section>

      <section style={box}>
        <h3 style={{ marginTop: 0 }}>2 · Datei hochladen oder Zeilen einfügen</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/csv" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files?.[0])} />
          <button type="button" style={btnQuiet} onClick={() => fileRef.current?.click()}>
            CSV-Datei wählen
          </button>
          <span style={{ color: 'var(--theme-elevation-600)' }}>{fileName || 'oder unten einfügen (mit Spaltennamen in der ersten Zeile)'}</span>
        </div>
        <textarea
          aria-label="Tabellenzeilen"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setFileName('')
            reset()
          }}
          placeholder={'Titel\tKategorie\tZutaten\t…\nTrauben-Kombucha\tKombucha\t…'}
          rows={8}
          style={{
            width: '100%',
            fontFamily: 'monospace',
            fontSize: 13,
            padding: 12,
            borderRadius: 6,
            border: '1px solid var(--theme-elevation-200)',
            background: 'var(--theme-input-bg, var(--theme-elevation-0))',
            color: 'var(--theme-text)',
          }}
        />
        <div style={{ marginTop: 12 }}>
          <button type="button" style={btn} onClick={preview} disabled={busy !== ''}>
            {busy === 'preview' ? 'Wird geprüft …' : 'Vorschau'}
          </button>
        </div>
      </section>

      {error && (
        <p role="alert" style={{ ...box, borderColor: 'var(--theme-error-500)', color: 'var(--theme-error-500)', margin: 0 }}>
          {error}
        </p>
      )}

      {rows && (
        <section style={box}>
          <h3 style={{ marginTop: 0 }}>3 · Vorschau ({rows.length} Zeilen)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--theme-elevation-200)' }}>
                  {['Zeile', 'Titel', 'Kategorie', 'Zutaten', 'Schritte', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '8px 10px' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.row} style={{ borderBottom: '1px solid var(--theme-elevation-100)', verticalAlign: 'top' }}>
                    <td style={{ padding: '8px 10px' }}>{r.row}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>
                      {r.title || '–'}
                      {r.slug && <div style={{ fontWeight: 400, color: 'var(--theme-elevation-500)' }}>/rezepte/{r.slug}</div>}
                    </td>
                    <td style={{ padding: '8px 10px' }}>{r.category ?? '–'}</td>
                    <td style={{ padding: '8px 10px' }}>{r.ingredients}</td>
                    <td style={{ padding: '8px 10px' }}>{r.steps}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{ color: STATUS[r.status].color, fontWeight: 600 }}>{STATUS[r.status].label}</span>
                      {[...r.errors, ...r.warnings].map((m) => (
                        <div key={m} style={{ color: r.errors.includes(m) ? 'var(--theme-error-500)' : 'var(--theme-elevation-600)' }}>
                          {m}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            {newCount > 0 ? (
              <button type="button" style={btn} onClick={runImport} disabled={busy !== ''}>
                {busy === 'import' ? 'Wird importiert …' : `${newCount} ${newCount === 1 ? 'Rezept' : 'Rezepte'} als Entwurf importieren`}
              </button>
            ) : (
              <span>Nichts Neues zu importieren.</span>
            )}
          </div>
        </section>
      )}

      {result && (
        <section style={{ ...box, borderColor: 'var(--theme-success-500)' }}>
          <h3 style={{ marginTop: 0 }}>
            {result.created.length} {result.created.length === 1 ? 'Rezept' : 'Rezepte'} als Entwurf angelegt
            {result.skipped ? ` · ${result.skipped} übersprungen` : ''}
          </h3>
          {result.created.length > 0 && (
            <>
              <p style={{ marginTop: 0 }}>Nächster Schritt: in jedem Rezept ein Foto hinzufügen, prüfen und veröffentlichen.</p>
              <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
                {result.created.map((c) => (
                  <li key={c.id}>
                    <Link href={`/admin/collections/recipes/${c.id}`}>{c.title}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          {result.failed.length > 0 && (
            <ul style={{ paddingLeft: 20, color: 'var(--theme-error-500)' }}>
              {result.failed.map((f) => (
                <li key={f.title}>
                  {f.title}: {f.error}
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/collections/recipes">Zur Rezeptliste</Link>
        </section>
      )}
    </div>
  )
}
