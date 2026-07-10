'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createBacklogItem, deleteBacklogItem, fetchBacklogItems, updateBacklogItem } from './api'
import {
  ACCENT,
  CATEGORY_COLORS,
  CATEGORY_OPTIONS,
  EFFORT_OPTIONS,
  EFF_ORDER,
  FNAV,
  matchesFilter,
  OWNER_LABELS,
  OWNER_OPTIONS,
  PRIORITY_OPTIONS,
  PRI_COLORS,
  PRI_LABELS,
  PRI_ORDER,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from './types'
import type { BacklogItem, Board, Category, Effort, FilterId, Owner, Priority, Status } from './types'

type ModalState = { open: boolean; editingId: string | null }

const EMPTY_FORM = {
  title: '',
  category: 'bug' as Category,
  status: 'open' as Status,
  priority: 'must' as Priority,
  effort: 'M' as Effort,
  owners: [] as Owner[],
  slug: '',
  description: '',
  response: '',
}

function nextItemId(items: BacklogItem[], board: Board): string {
  if (board === 'current') {
    const nums = items
      .filter((i) => i.board === 'current')
      .map((i) => parseInt(i.itemId.replace('WEB-', ''), 10))
      .filter((n) => !isNaN(n))
    return 'WEB-' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')
  }
  const nums = items
    .filter((i) => i.board === 'new' && /^CASE-\d+$/.test(i.itemId))
    .map((i) => parseInt(i.itemId.replace('CASE-', ''), 10))
    .filter((n) => !isNaN(n))
  return 'CASE-' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(2, '0')
}

function StatTile({ label, value, danger, onClick }: { label: string; value: number | string; danger?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-border-color)',
        borderRadius: 8,
        padding: '10px 14px',
        textAlign: 'left',
        cursor: onClick ? 'pointer' : 'default',
        flex: 1,
        minWidth: 100,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: danger ? '#DC2626' : 'var(--theme-text)' }}>{value}</div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--theme-text-dim)', marginTop: 4 }}>{label}</div>
    </button>
  )
}

function CategoryBadge({ category }: { category: Category }) {
  const c = CATEGORY_COLORS[category]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 7px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        border: `1px solid ${c.br}`,
        background: c.bg,
        color: c.ink,
        whiteSpace: 'nowrap',
      }}
    >
      {category}
    </span>
  )
}

function StatusPill({ status }: { status: Status }) {
  const color = STATUS_COLORS[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 7px',
        borderRadius: 100,
        fontSize: 11,
        fontWeight: 500,
        background: color + '22',
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

export const BacklogClient: React.FC = () => {
  const [items, setItems] = useState<BacklogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeBoard, setActiveBoard] = useState<Board>('current')
  const [activeFilter, setActiveFilter] = useState<FilterId>('all')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<Category | ''>('')
  const [sortBy, setSortBy] = useState<'priority' | 'id' | 'effort' | 'status'>('priority')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [modal, setModal] = useState<ModalState>({ open: false, editingId: null })
  const [form, setForm] = useState({ ...EMPTY_FORM })

  const [toast, setToast] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBacklogItems()
      .then((docs) => setItems(docs))
      .catch((e) => setError(e.message === 'unauthorized' ? 'You need admin access to view the backlog.' : 'Could not load the backlog.'))
      .finally(() => setLoading(false))
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  const boardItems = useMemo(() => items.filter((i) => i.board === activeBoard), [items, activeBoard])
  const newCount = useMemo(() => items.filter((i) => i.board === 'new').length, [items])

  const filterCounts = useMemo(() => {
    const counts: Partial<Record<FilterId, number>> = {}
    for (const f of FNAV) {
      if (f.sep) continue
      counts[f.id] = boardItems.filter((i) => matchesFilter(i, f.id)).length
    }
    return counts
  }, [boardItems])

  const visibleItems = useMemo(() => {
    let list = boardItems.filter((i) => matchesFilter(i, activeFilter))
    if (catFilter) list = list.filter((i) => i.category === catFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.itemId.toLowerCase().includes(q) ||
          (i.description || '').toLowerCase().includes(q) ||
          (i.slug || '').toLowerCase().includes(q),
      )
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'priority') return PRI_ORDER[a.priority] - PRI_ORDER[b.priority] || a.itemId.localeCompare(b.itemId)
      if (sortBy === 'id') return a.itemId.localeCompare(b.itemId)
      if (sortBy === 'effort') return EFF_ORDER[a.effort] - EFF_ORDER[b.effort]
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      return 0
    })
  }, [boardItems, activeFilter, catFilter, search, sortBy])

  const selected = items.find((i) => i.id === selectedId) || null

  function setBoard(b: Board) {
    if (b === activeBoard) return
    setActiveBoard(b)
    setActiveFilter('all')
    setSearch('')
    setCatFilter('')
    setSelectedId(null)
  }

  function jumpTo(itemId: string) {
    const it = items.find((i) => i.itemId === itemId)
    if (!it) return
    setActiveBoard(it.board)
    setActiveFilter('all')
    setSearch('')
    setCatFilter('')
    setSelectedId(it.id)
  }

  async function patchItem(id: string, patch: Partial<BacklogItem>) {
    const prev = items
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, ...patch } : i)))
    try {
      await updateBacklogItem(id, patch)
    } catch {
      setItems(prev)
      showToast('Save failed — try again')
    }
  }

  function openNewModal() {
    setModal({ open: true, editingId: null })
    setForm({ ...EMPTY_FORM })
  }
  function openEditModal(item: BacklogItem) {
    setModal({ open: true, editingId: item.id })
    setForm({
      title: item.title,
      category: item.category === 'decision' ? 'bug' : item.category,
      status: item.status,
      priority: item.priority,
      effort: item.effort,
      owners: item.owners || [],
      slug: item.slug || '',
      description: item.description || '',
      response: item.response || '',
    })
  }
  function closeModal() {
    setModal({ open: false, editingId: null })
  }

  function toggleOwner(o: Owner) {
    setForm((f) => ({ ...f, owners: f.owners.includes(o) ? f.owners.filter((x) => x !== o) : [...f.owners, o] }))
  }

  async function saveModal() {
    const title = form.title.trim()
    if (!title) return
    const owners = form.owners.length ? form.owners : (['dev'] as Owner[])
    const data = {
      title,
      category: form.category,
      status: form.status,
      priority: form.priority,
      effort: form.effort,
      owners,
      slug: form.slug.replace(/^\/+/, '').trim(),
      description: form.description.trim(),
      response: form.response.trim(),
    }
    setSaving(true)
    try {
      if (modal.editingId) {
        const updated = await updateBacklogItem(modal.editingId, data)
        setItems((cur) => cur.map((i) => (i.id === modal.editingId ? { ...i, ...updated } : i)))
        showToast('Saved')
      } else {
        const itemId = nextItemId(items, activeBoard)
        const created = await createBacklogItem({ ...data, itemId, board: activeBoard, notes: '' })
        setItems((cur) => [...cur, created])
        showToast('Item created')
      }
      closeModal()
    } catch {
      showToast('Save failed — try again')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const item = items.find((i) => i.id === id)
    if (!item) return
    if (!confirm(`Delete ${item.itemId}? This cannot be undone.`)) return
    const prev = items
    setItems((cur) => cur.filter((i) => i.id !== id))
    if (selectedId === id) setSelectedId(null)
    closeModal()
    try {
      await deleteBacklogItem(id)
      showToast(`${item.itemId} deleted`)
    } catch {
      setItems(prev)
      showToast('Delete failed — try again')
    }
  }

  if (loading) {
    return <div style={{ padding: 24, color: 'var(--theme-text-dim)' }}>Loading backlog…</div>
  }
  if (error) {
    return <div style={{ padding: 24, color: '#DC2626' }}>{error}</div>
  }

  return (
    <div style={{ padding: '20px 24px 40px', color: 'var(--theme-text)', maxWidth: 1400 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Backlog</h1>
          <div style={{ fontSize: 12, color: 'var(--theme-text-dim)', marginTop: 2 }}>
            Shared with the whole team — everyone sees the same board.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setBoard('current')}
            style={tabStyle(activeBoard === 'current')}
          >
            Current Backlog
          </button>
          <button onClick={() => setBoard('new')} style={tabStyle(activeBoard === 'new')}>
            New — David&rsquo;s Brief ({newCount})
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {activeBoard === 'new' ? (
          <>
            <StatTile
              label="Decisions answered"
              value={`${boardItems.filter((i) => i.category === 'decision' && i.decision?.choice).length}/${boardItems.filter((i) => i.category === 'decision').length}`}
              onClick={() => setActiveFilter('decisions')}
            />
            <StatTile label="Critical" value={filterCounts.critical ?? 0} danger onClick={() => setActiveFilter('critical')} />
            <StatTile label="Total items" value={boardItems.length} onClick={() => setActiveFilter('all')} />
            <StatTile label="Open" value={filterCounts.open ?? 0} onClick={() => setActiveFilter('open')} />
          </>
        ) : (
          <>
            <StatTile label="Critical" value={filterCounts.critical ?? 0} danger onClick={() => setActiveFilter('critical')} />
            <StatTile label="Open" value={filterCounts.open ?? 0} onClick={() => setActiveFilter('open')} />
            <StatTile label="Done" value={filterCounts.done ?? 0} onClick={() => setActiveFilter('done')} />
            <StatTile label="Their action" value={filterCounts['their-action'] ?? 0} onClick={() => setActiveFilter('their-action')} />
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <nav
          style={{
            width: 190,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            background: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-border-color)',
            borderRadius: 8,
            padding: 8,
            maxHeight: 640,
            overflowY: 'auto',
          }}
        >
          {FNAV.map((f, idx) =>
            f.sep ? (
              <div key={idx} style={{ height: 1, background: 'var(--theme-border-color)', margin: '5px 2px' }} />
            ) : (
              <button
                key={`${f.id}-${idx}`}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '6px 8px',
                  background: activeFilter === f.id ? 'var(--theme-elevation-100)' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  color: 'var(--theme-text)',
                  fontSize: 13,
                  fontWeight: activeFilter === f.id ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {f.dot ? (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.dot, flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 8, flexShrink: 0 }} />
                )}
                <span style={{ flex: 1 }}>{f.label}</span>
                <span style={{ fontSize: 11, color: 'var(--theme-text-dim)' }}>{filterCounts[f.id]}</span>
              </button>
            ),
          )}
        </nav>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="search"
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle({ flex: 1, maxWidth: 260 })}
            />
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value as Category | '')} style={selectStyle()}>
              <option value="">All categories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c[0].toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} style={selectStyle()}>
              <option value="priority">Sort: Priority</option>
              <option value="id">Sort: ID</option>
              <option value="effort">Sort: Effort</option>
              <option value="status">Sort: Status</option>
            </select>
            <div style={{ flex: 1 }} />
            <button onClick={openNewModal} style={redBtnStyle()}>
              + New item
            </button>
          </div>

          <div
            style={{
              border: '1px solid var(--theme-border-color)',
              borderRadius: 8,
              maxHeight: 620,
              overflowY: 'auto',
              padding: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {visibleItems.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--theme-text-dim)' }}>
                <strong style={{ display: 'block', fontSize: 14, marginBottom: 4, color: 'var(--theme-text)' }}>No items found</strong>
                Try a different filter or search.
              </div>
            ) : (
              visibleItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 36,
                    border: `1px solid ${item.id === selectedId ? ACCENT : 'var(--theme-border-color)'}`,
                    boxShadow: item.id === selectedId ? `0 0 0 1px ${ACCENT}` : undefined,
                    borderRadius: 6,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    background: 'var(--theme-elevation-0)',
                  }}
                >
                  <div style={{ width: 3, alignSelf: 'stretch', background: PRI_COLORS[item.priority], flexShrink: 0 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, padding: '0 10px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--theme-text-dim)', width: 56, flexShrink: 0 }}>{item.itemId}</span>
                    {item.decision && (
                      <span style={{ fontSize: 10, color: item.decision.choice ? '#22C55E' : ACCENT }} title={item.decision.choice ? 'Answered' : 'Needs an answer'}>
                        ●
                      </span>
                    )}
                    <span style={{ fontSize: 13, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
                    <CategoryBadge category={item.category} />
                    <StatusPill status={item.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selected && (
          <DetailPanel
            item={selected}
            onClose={() => setSelectedId(null)}
            onEdit={() => openEditModal(selected)}
            onDelete={() => handleDelete(selected.id)}
            onPatch={(patch) => patchItem(selected.id, patch)}
            onJump={jumpTo}
            onToast={showToast}
          />
        )}
      </div>

      {modal.open && (
        <ItemModal
          form={form}
          setForm={setForm}
          editing={!!modal.editingId}
          saving={saving}
          onToggleOwner={toggleOwner}
          onClose={closeModal}
          onSave={saveModal}
          onDelete={modal.editingId ? () => handleDelete(modal.editingId!) : undefined}
        />
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 22,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--theme-text)',
            color: 'var(--theme-bg)',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            zIndex: 200,
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 12px',
    borderRadius: 6,
    border: `1px solid ${active ? ACCENT : 'var(--theme-border-color)'}`,
    background: active ? ACCENT + '1F' : 'var(--theme-elevation-0)',
    color: active ? ACCENT : 'var(--theme-text)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }
}
function inputStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    height: 32,
    border: '1px solid var(--theme-border-color)',
    borderRadius: 6,
    padding: '0 10px',
    fontSize: 13,
    background: 'var(--theme-elevation-0)',
    color: 'var(--theme-text)',
    outline: 'none',
    ...extra,
  }
}
function selectStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    height: 32,
    border: '1px solid var(--theme-border-color)',
    borderRadius: 6,
    padding: '0 8px',
    fontSize: 12,
    background: 'var(--theme-elevation-0)',
    color: 'var(--theme-text)',
    cursor: 'pointer',
    ...extra,
  }
}
function redBtnStyle(): React.CSSProperties {
  return {
    height: 32,
    padding: '0 14px',
    background: ACCENT,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }
}
function ghostBtnStyle(): React.CSSProperties {
  return {
    height: 32,
    padding: '0 13px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    border: '1px solid var(--theme-border-color)',
    background: 'var(--theme-elevation-0)',
    color: 'var(--theme-text)',
  }
}

function DetailPanel({
  item,
  onClose,
  onEdit,
  onDelete,
  onPatch,
  onJump,
  onToast,
}: {
  item: BacklogItem
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onPatch: (patch: Partial<BacklogItem>) => void
  onJump: (itemId: string) => void
  onToast: (msg: string) => void
}) {
  const [notes, setNotes] = useState(item.notes || '')
  const [todoText, setTodoText] = useState('')
  const [decisionNotes, setDecisionNotes] = useState(item.decision?.notes || '')

  useEffect(() => {
    setNotes(item.notes || '')
    setDecisionNotes(item.decision?.notes || '')
  }, [item.id])

  function addTodo() {
    const text = todoText.trim()
    if (!text) return
    const todos = [...(item.todos || []), { text, done: false }]
    onPatch({ todos })
    setTodoText('')
  }
  function toggleTodo(idx: number) {
    const todos = (item.todos || []).map((t, i) => (i === idx ? { ...t, done: !t.done } : t))
    onPatch({ todos })
  }
  function deleteTodo(idx: number) {
    const todos = (item.todos || []).filter((_, i) => i !== idx)
    onPatch({ todos })
  }
  function pickDecision(key: string) {
    if (!item.decision) return
    onPatch({ decision: { ...item.decision, choice: key } })
  }
  function saveDecisionNotes() {
    if (!item.decision) return
    onPatch({ decision: { ...item.decision, notes: decisionNotes } })
    onToast('Decision notes saved')
  }
  function saveNotes() {
    onPatch({ notes })
    onToast('Notes saved')
  }

  return (
    <aside
      style={{
        width: 360,
        flexShrink: 0,
        background: 'var(--theme-elevation-0)',
        border: '1px solid var(--theme-border-color)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 640,
      }}
    >
      <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid var(--theme-border-color)', borderLeft: `3px solid ${PRI_COLORS[item.priority]}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
            <CategoryBadge category={item.category} />
            <StatusPill status={item.status} />
          </div>
          <button onClick={onEdit} style={ghostBtnStyle()}>
            Edit
          </button>
          <button onClick={onClose} style={{ ...ghostBtnStyle(), width: 28, padding: 0 }}>
            ✕
          </button>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--theme-text-dim)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 5 }}>
          {item.itemId}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{item.title}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: 16 }}>
          <MetaField label="Priority">
            <span style={{ color: PRI_COLORS[item.priority], fontWeight: 600, fontSize: 13 }}>{PRI_LABELS[item.priority]}</span>
          </MetaField>
          <MetaField label="Effort">
            <span style={etagStyle()}>{item.effort}</span>
          </MetaField>
          <MetaField label="Owner">
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {(item.owners || []).map((o) => (
                <span key={o} style={ochipStyle()}>
                  {OWNER_LABELS[o]}
                </span>
              ))}
            </div>
          </MetaField>
          {item.slug && (
            <MetaField label="Page">
              <span style={{ fontFamily: 'monospace', fontSize: 12 }}>/{item.slug}</span>
            </MetaField>
          )}
          {item.related && (
            <MetaField label="Related">
              <span style={{ color: '#1D4ED8', cursor: 'pointer', fontWeight: 600, fontSize: 13 }} onClick={() => onJump(item.related!)}>
                {item.related} →
              </span>
            </MetaField>
          )}
        </div>

        {item.description && <Section label="Description">{item.description}</Section>}
        {item.response && (
          <Section label="Response / Plan" boxed>
            {item.response}
          </Section>
        )}

        {item.decision && (
          <div style={{ marginBottom: 16 }}>
            <div style={sectionLabelStyle()}>Decision needed</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{item.decision.question}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
              {Object.entries(item.decision.options).map(([key, o]) => {
                const sel = item.decision!.choice === key
                return (
                  <div
                    key={key}
                    onClick={() => pickDecision(key)}
                    style={{
                      display: 'flex',
                      gap: 10,
                      padding: '9px 10px',
                      border: `1px solid ${sel ? '#0E7490' : 'var(--theme-border-color)'}`,
                      background: sel ? '#ECFEFF14' : 'transparent',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: `2px solid ${sel ? '#0E7490' : 'var(--theme-border-color)'}`,
                        flexShrink: 0,
                        marginTop: 2,
                        position: 'relative',
                      }}
                    >
                      {sel && <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: '#0E7490' }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {o.label}
                        {o.recommended && (
                          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#0E7490', background: '#ECFEFF', padding: '1px 6px', borderRadius: 100 }}>
                            Recommended
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--theme-text-dim)', lineHeight: 1.5, marginTop: 2 }}>{o.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <textarea
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="Notes on this decision…"
              style={textareaStyle({ minHeight: 60 })}
            />
            <button onClick={saveDecisionNotes} style={{ ...redBtnStyle(), marginTop: 8 }}>
              Save decision notes
            </button>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <div style={sectionLabelStyle()}>Next Steps</div>
          {(item.todos || []).length ? (
            <div style={{ border: '1px solid var(--theme-border-color)', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
              {(item.todos || []).map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 10px',
                    borderBottom: idx < (item.todos!.length - 1) ? '1px solid var(--theme-border-color)' : 'none',
                  }}
                >
                  <input type="checkbox" checked={t.done} onChange={() => toggleTodo(idx)} style={{ accentColor: ACCENT, cursor: 'pointer' }} />
                  <span style={{ flex: 1, fontSize: 13, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--theme-text-dim)' : 'var(--theme-text)' }}>
                    {t.text}
                  </span>
                  <button onClick={() => deleteTodo(idx)} style={{ background: 'none', border: 'none', color: 'var(--theme-text-dim)', cursor: 'pointer', fontSize: 13 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--theme-text-dim)', padding: '8px 0' }}>No next steps yet.</div>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={todoText}
              onChange={(e) => setTodoText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add a next step…"
              style={inputStyle({ flex: 1, height: 30, fontSize: 12 })}
            />
            <button onClick={addTodo} style={{ ...redBtnStyle(), height: 30, padding: '0 10px', fontSize: 12 }}>
              Add
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={sectionLabelStyle()}>
            Notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(save with button)</span>
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Meeting notes, decisions, links…" style={textareaStyle({ minHeight: 80 })} />
        </div>
      </div>

      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--theme-border-color)', display: 'flex', gap: 8 }}>
        <button onClick={saveNotes} style={redBtnStyle()}>
          Save notes
        </button>
        <button onClick={onDelete} style={{ ...ghostBtnStyle(), color: ACCENT, border: 'none', background: 'none' }}>
          Delete
        </button>
      </div>
    </aside>
  )
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--theme-text-dim)', marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13 }}>{children}</div>
    </div>
  )
}
function Section({ label, boxed, children }: { label: string; boxed?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={sectionLabelStyle()}>{label}</div>
      <div
        style={
          boxed
            ? { fontSize: 13, lineHeight: 1.6, background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-border-color)', borderRadius: 6, padding: '9px 11px' }
            : { fontSize: 13, lineHeight: 1.6 }
        }
      >
        {children}
      </div>
    </div>
  )
}
function sectionLabelStyle(): React.CSSProperties {
  return { fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--theme-text-dim)', marginBottom: 6, fontWeight: 600 }
}
function etagStyle(): React.CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--theme-text-dim)',
    background: 'var(--theme-elevation-50)',
    border: '1px solid var(--theme-border-color)',
    borderRadius: 4,
    padding: '0 5px',
    height: 18,
    display: 'inline-flex',
    alignItems: 'center',
    letterSpacing: '.04em',
  }
}
function ochipStyle(): React.CSSProperties {
  return {
    fontSize: 10,
    color: 'var(--theme-text-dim)',
    background: 'var(--theme-elevation-50)',
    border: '1px solid var(--theme-border-color)',
    borderRadius: 100,
    padding: '0 6px',
    height: 18,
    display: 'inline-flex',
    alignItems: 'center',
  }
}
function textareaStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    width: '100%',
    border: '1px solid var(--theme-border-color)',
    borderRadius: 6,
    padding: '8px 10px',
    fontSize: 13,
    lineHeight: 1.5,
    background: 'var(--theme-elevation-0)',
    color: 'var(--theme-text)',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    ...extra,
  }
}

function ItemModal({
  form,
  setForm,
  editing,
  saving,
  onToggleOwner,
  onClose,
  onSave,
  onDelete,
}: {
  form: typeof EMPTY_FORM
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>
  editing: boolean
  saving: boolean
  onToggleOwner: (o: Owner) => void
  onClose: () => void
  onSave: () => void
  onDelete?: () => void
}) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ background: 'var(--theme-elevation-0)', borderRadius: 12, width: '100%', maxWidth: 548, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,.3)' }}>
        <div style={{ padding: '18px 18px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{editing ? 'Edit item' : 'New item'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--theme-text-dim)', cursor: 'pointer', fontSize: 16 }}>
            ✕
          </button>
        </div>
        <div style={{ padding: 18, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Title">
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Describe the issue or feature…"
              style={inputStyle({ width: '100%', height: 36, boxSizing: 'border-box' })}
              autoFocus
            />
          </Field>
          <Field label="Priority">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7 }}>
              {PRIORITY_OPTIONS.map((p) => {
                const sel = form.priority === p
                return (
                  <div
                    key={p}
                    onClick={() => setForm((f) => ({ ...f, priority: p }))}
                    style={{
                      border: `2px solid ${sel ? PRI_COLORS[p] : 'var(--theme-border-color)'}`,
                      borderRadius: 8,
                      padding: '9px 6px 8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: sel ? PRI_COLORS[p] + '18' : 'var(--theme-elevation-50)',
                    }}
                  >
                    <div style={{ width: 20, height: 4, borderRadius: 2, margin: '0 auto 5px', background: PRI_COLORS[p] }} />
                    <div style={{ fontSize: 11, fontWeight: 600, color: sel ? PRI_COLORS[p] : 'var(--theme-text-dim)' }}>{PRI_LABELS[p].replace('-have', '').replace(' to have', '')}</div>
                  </div>
                )
              })}
            </div>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Category">
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))} style={selectStyle({ width: '100%', height: 36 })}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c[0].toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))} style={selectStyle({ width: '100%', height: 36 })}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Effort">
            <div style={{ display: 'flex', gap: 7 }}>
              {EFFORT_OPTIONS.map((e) => {
                const sel = form.effort === e
                return (
                  <button
                    key={e}
                    onClick={() => setForm((f) => ({ ...f, effort: e }))}
                    style={{
                      flex: 1,
                      height: 32,
                      border: `1px solid ${sel ? 'var(--theme-text)' : 'var(--theme-border-color)'}`,
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: sel ? 'var(--theme-text)' : 'var(--theme-elevation-50)',
                      color: sel ? 'var(--theme-bg)' : 'var(--theme-text-dim)',
                    }}
                  >
                    {e}
                  </button>
                )
              })}
            </div>
          </Field>
          <Field label="Owner">
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {OWNER_OPTIONS.map((o) => {
                const sel = form.owners.includes(o)
                return (
                  <button
                    key={o}
                    onClick={() => onToggleOwner(o)}
                    style={{
                      height: 28,
                      padding: '0 12px',
                      border: `1px solid ${sel ? 'var(--theme-text)' : 'var(--theme-border-color)'}`,
                      borderRadius: 100,
                      fontSize: 12,
                      cursor: 'pointer',
                      background: sel ? 'var(--theme-text)' : 'var(--theme-elevation-50)',
                      color: sel ? 'var(--theme-bg)' : 'var(--theme-text-dim)',
                    }}
                  >
                    {OWNER_LABELS[o]}
                  </button>
                )
              })}
            </div>
          </Field>
          <Field label="Page slug (where on the site?)">
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="workshops/basics"
              style={inputStyle({ width: '100%', height: 36, boxSizing: 'border-box' })}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What is this about?"
              style={textareaStyle({ minHeight: 68 })}
            />
          </Field>
          <Field label="Response / plan">
            <textarea
              value={form.response}
              onChange={(e) => setForm((f) => ({ ...f, response: e.target.value }))}
              placeholder="Your answer or next steps…"
              style={textareaStyle({ minHeight: 68 })}
            />
          </Field>
        </div>
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--theme-border-color)', display: 'flex', gap: 8, alignItems: 'center' }}>
          {onDelete && (
            <button onClick={onDelete} style={{ ...ghostBtnStyle(), color: ACCENT, border: 'none', background: 'none', marginRight: 'auto' }}>
              Delete
            </button>
          )}
          <button onClick={onClose} style={ghostBtnStyle()}>
            Cancel
          </button>
          <button onClick={onSave} disabled={saving} style={{ ...redBtnStyle(), opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Save item'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--theme-text-dim)' }}>{label}</label>
      {children}
    </div>
  )
}
