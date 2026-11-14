'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { markerDisplay, type ChipInfo, type PaletteChip } from '@/lib/emailTemplateText'

/**
 * A text field where machine-filled parts (first name, date, …) are chips.
 * Value format: plain text, line breaks as "\n", chips as ⟦marker⟧ — the same
 * string the email engine uses (src/lib/emailTemplateText.ts).
 *
 *  - Free chips (colored) can be deleted (×, Backspace), cut/pasted to move them,
 *    and inserted from the "Einfügen" row.
 *  - Fixed chips (grey) must stay; the engine refuses a save without them.
 *  - Pasting always inserts plain text (no foreign formatting); pasted ⟦…⟧ become chips.
 */

const MARK = /⟦[^⟧]*⟧/g

const text = (s: string) => document.createTextNode(s)

function chipNode(marker: string, chips: Record<string, ChipInfo>, readOnly: boolean): HTMLElement {
  const info = chips[marker]
  const el = document.createElement('span')
  el.className = `ff-chipx${info?.fixed ? ' is-fixed' : ''}${info ? '' : ' is-unknown'}`
  el.contentEditable = 'false'
  el.dataset.m = marker
  el.title = info?.fixed ? 'Bleibt stehen' : info ? (info.sample ? `Beispiel: ${info.sample}` : '') : 'Unbekannt'
  const label = document.createElement('span')
  label.textContent = markerDisplay(marker)
  el.appendChild(label)
  if (info && !info.fixed && !readOnly) {
    const x = document.createElement('i')
    x.dataset.x = '1'
    x.textContent = '×'
    x.setAttribute('role', 'button')
    x.setAttribute('aria-label', 'Baustein entfernen')
    el.appendChild(x)
  }
  return el
}

function buildNodes(value: string, chips: Record<string, ChipInfo>, readOnly: boolean): Node[] {
  const nodes: Node[] = []
  const pushText = (t: string) =>
    t.split('\n').forEach((line, i) => {
      if (i > 0) nodes.push(document.createElement('br'))
      if (line) nodes.push(text(line))
    })
  let last = 0
  for (const m of value.matchAll(MARK)) {
    pushText(value.slice(last, m.index))
    nodes.push(chipNode(m[0], chips, readOnly))
    last = (m.index ?? 0) + m[0].length
  }
  pushText(value.slice(last))
  return nodes
}

function ser(node: Node): string {
  let out = ''
  node.childNodes.forEach((c) => {
    if (c.nodeType === 3) out += c.nodeValue ?? ''
    else if (c.nodeType === 1) {
      const el = c as HTMLElement
      if (el.dataset?.m) out += el.dataset.m
      else if (el.tagName === 'BR') out += '\n'
      else if (el.tagName === 'DIV' || el.tagName === 'P') out += `\n${ser(el)}`
      else out += ser(el)
    }
  })
  return out
}
const serialize = (node: Node) => ser(node).replace(/ /g, ' ').replace(/ {2,}/g, ' ')

export function ChipEditor({
  id,
  value,
  onChange,
  chips,
  palette,
  readOnly,
  single,
  invalid,
  label,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  chips: Record<string, ChipInfo>
  palette?: PaletteChip[]
  readOnly?: boolean
  single?: boolean
  invalid?: boolean
  label: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const saved = useRef<Range | null>(null)
  const [focused, setFocused] = useState(false)

  // Show the current value — but never rebuild while the DOM already says the same
  // (that would throw the cursor away on every keystroke).
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (serialize(el) !== value || (value !== '' && !el.hasChildNodes())) el.replaceChildren(...buildNodes(value, chips, !!readOnly))
  }, [value, chips, readOnly])

  const emit = useCallback(() => {
    if (ref.current) onChange(serialize(ref.current))
  }, [onChange])

  useEffect(() => {
    const onSel = () => {
      const sel = window.getSelection()
      const el = ref.current
      if (sel && sel.rangeCount && el && el.contains(sel.anchorNode)) saved.current = sel.getRangeAt(0).cloneRange()
    }
    document.addEventListener('selectionchange', onSel)
    return () => document.removeEventListener('selectionchange', onSel)
  }, [])

  const place = (nodes: Node[]) => {
    const el = ref.current
    if (!el || readOnly) return
    el.focus()
    const sel = window.getSelection()
    if (!sel) return
    let r: Range
    if (saved.current && el.contains(saved.current.commonAncestorContainer)) r = saved.current
    else if (sel.rangeCount && el.contains(sel.getRangeAt(0).commonAncestorContainer)) r = sel.getRangeAt(0)
    else {
      r = document.createRange()
      r.selectNodeContents(el)
      r.collapse(false)
    }
    r.deleteContents()
    const frag = document.createDocumentFragment()
    nodes.forEach((n) => frag.appendChild(n))
    const last = frag.lastChild
    r.insertNode(frag)
    if (last) {
      r.setStartAfter(last)
      r.collapse(true)
    }
    sel.removeAllRanges()
    sel.addRange(r)
    saved.current = r.cloneRange()
    emit()
  }

  const selectionText = (): { text: string; range: Range } | null => {
    const sel = window.getSelection()
    const el = ref.current
    if (!sel || !sel.rangeCount || !el || !el.contains(sel.anchorNode) || sel.isCollapsed) return null
    const range = sel.getRangeAt(0)
    const box = document.createElement('div')
    box.appendChild(range.cloneContents())
    return { text: serialize(box), range }
  }

  return (
    <div
      className={`ff-ce${invalid ? ' is-bad' : ''}${readOnly ? ' is-readonly' : ''}${focused ? ' is-focused' : ''}`}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      <div
        ref={ref}
        id={id}
        className="ff-ce-box"
        role="textbox"
        aria-multiline={!single}
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-readonly={readOnly || undefined}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        spellCheck={false}
        data-single={single ? '1' : undefined}
        onInput={emit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            if (!single) document.execCommand('insertLineBreak')
          }
        }}
        onPaste={(e) => {
          e.preventDefault()
          let t = e.clipboardData.getData('text/plain').replace(/[<>]/g, '')
          if (single) t = t.replace(/\s*\n\s*/g, ' ')
          place(buildNodes(t, chips, false))
        }}
        onCopy={(e) => {
          const s = selectionText()
          if (!s) return
          e.preventDefault()
          e.clipboardData.setData('text/plain', s.text)
        }}
        onCut={(e) => {
          const s = selectionText()
          if (!s || readOnly) return
          e.preventDefault()
          e.clipboardData.setData('text/plain', s.text)
          s.range.deleteContents()
          emit()
        }}
        onClick={(e) => {
          const t = e.target as HTMLElement
          if (t.dataset?.x && !readOnly) {
            t.closest<HTMLElement>('[data-m]')?.remove()
            emit()
          }
        }}
      />
      {focused && !readOnly && palette && palette.length > 0 && (
        <div className="ff-ce-insert" aria-label="Einfügen">
          <span>Einfügen:</span>
          {palette.map((p) => (
            <button
              key={p.marker}
              type="button"
              className="ff-chipx is-btn"
              title={p.sample ? `Beispiel: ${p.sample}` : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => place([chipNode(p.marker, chips, false)])}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Splits a value at its Liquid markers: [{ marker: null, text }, { marker, text }, …]. */
export function splitVariants(value: string, liquid: string[]): { marker: string | null; text: string }[] {
  const set = new Set(liquid)
  const out: { marker: string | null; text: string }[] = [{ marker: null, text: '' }]
  let last = 0
  for (const m of value.matchAll(MARK)) {
    if (!set.has(m[0])) continue
    out[out.length - 1].text = value.slice(last, m.index)
    out.push({ marker: m[0], text: '' })
    last = (m.index ?? 0) + m[0].length
  }
  out[out.length - 1].text = value.slice(last)
  return out
}

const variantLabel = (marker: string) => {
  const inner = marker.slice(1, -1)
  if (inner === 'Ende' || inner === 'Ende Liste') return 'Danach (immer)'
  if (inner === 'Sonst') return 'Fassung · sonst'
  return `Fassung · ${inner}`
}

/**
 * One paragraph. If it has Liquid conditions ("wenn Abholung … sonst …") each version
 * gets its own labelled field, so nobody has to touch the condition itself.
 */
export function ParagraphEditor({
  id,
  value,
  liquid,
  onChange,
  chips,
  palette,
  readOnly,
  single,
  invalid,
  label,
}: {
  id: string
  value: string
  liquid: string[]
  onChange: (v: string) => void
  chips: Record<string, ChipInfo>
  palette?: PaletteChip[]
  readOnly?: boolean
  single?: boolean
  invalid?: boolean
  label: string
}) {
  if (liquid.length === 0) {
    return <ChipEditor id={id} value={value} onChange={onChange} chips={chips} palette={palette} readOnly={readOnly} single={single} invalid={invalid} label={label} />
  }
  const pieces = splitVariants(value, liquid)
  const join = (list: typeof pieces) => list.map((p) => (p.marker ?? '') + p.text).join('')
  return (
    <div className="ff-variants">
      {pieces.map((p, i) => {
        const after = p.marker === 'Ende' || p.marker?.startsWith('⟦Ende')
        if (!p.marker && !p.text) return null
        if (after && !p.text) return null
        return (
          <div key={i} className="ff-variant">
            {p.marker && <div className="ff-variant-label">{variantLabel(p.marker)}</div>}
            <ChipEditor
              id={i === 0 || (pieces[0] && !pieces[0].text && i === 1) ? id : undefined}
              value={p.text}
              onChange={(v) => onChange(join(pieces.map((q, j) => (j === i ? { ...q, text: v } : q))))}
              chips={chips}
              palette={palette}
              readOnly={readOnly}
              single={single}
              invalid={invalid}
              label={`${label}${p.marker ? ` – ${variantLabel(p.marker)}` : ''}`}
            />
          </div>
        )
      })}
    </div>
  )
}
