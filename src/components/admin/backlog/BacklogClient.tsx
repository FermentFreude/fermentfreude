'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createBacklogItem, deleteBacklogItem, fetchBacklogItems, updateBacklogItem } from './api'
import {
  ACCENT,
  BORDER,
  BILLING_SCOPE_LABELS,
  BILLING_SCOPE_OPTIONS,
  BOARD_LABELS,
  BOARD_SUBTITLES,
  BUSINESS_VALUE_LABELS,
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  EFFORT_OPTIONS,
  EFF_ORDER,
  FNAV,
  INK,
  INK_SOFT,
  matchesFilter,
  MUTED,
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
import type { BacklogItem, BillingScope, Board, Category, Effort, FilterId, Owner, Priority, Status } from './types'

// Brand typography — loaded once, scoped to this view only (doesn't affect the rest of admin).
const FONT_DISPLAY = "'neue-haas-grotesk-display', 'Helvetica Neue', Arial, sans-serif"
const FONT_BODY = "'neue-haas-grotesk-text', 'Helvetica Neue', Arial, sans-serif"

function useBrandFont() {
  useEffect(() => {
    if (document.getElementById('ff-backlog-typekit')) return
    const link = document.createElement('link')
    link.id = 'ff-backlog-typekit'
    link.rel = 'stylesheet'
    link.href = 'https://use.typekit.net/dtk7kir.css'
    document.head.appendChild(link)
  }, [])
}

// Below ~860px (tablet/phone): the content list + detail panel stop sitting
// side by side (there isn't room) and stack instead; the detail panel fills
// the available width instead of a fixed 380px; Kanban columns narrow so more
// than one is visible at once while still scrolling horizontally.
function useResponsiveStyles() {
  useEffect(() => {
    if (document.getElementById('ff-backlog-responsive')) return
    const style = document.createElement('style')
    style.id = 'ff-backlog-responsive'
    style.textContent = `
      @media (max-width: 860px) {
        .ff-content-row { flex-direction: column !important; }
        .ff-detail-panel { width: 100% !important; max-height: 70vh !important; }
        .ff-kanban-column { width: 72vw !important; max-width: 300px !important; }
      }
      @media (max-width: 480px) {
        .ff-toolbar-row > input,
        .ff-toolbar-row > select { flex: 1 1 auto !important; min-width: 0 !important; max-width: none !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

type ModalState = { open: boolean; editingId: string | null }

const EMPTY_FORM = {
  title: '',
  folderLabel: '',
  category: 'bug' as Category,
  status: 'open' as Status,
  priority: 'must' as Priority,
  effort: 'M' as Effort,
  billingScope: 'included' as BillingScope,
  parent: '',
  plannedFor: '',
  owners: [] as Owner[],
  slug: '',
  description: '',
  response: '',
}

function nextItemId(items: BacklogItem[], board: Board): string {
  if (board === 'roadmap') {
    const nums = items
      .filter((i) => i.board === 'roadmap' && /^WEB-\d+$/.test(i.itemId))
      .map((i) => parseInt(i.itemId.replace('WEB-', ''), 10))
      .filter((n) => !isNaN(n))
    return 'WEB-' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')
  }
  if (board === 'features') {
    const nums = items
      .filter((i) => i.board === 'features' && /^FEAT-\d+$/.test(i.itemId))
      .map((i) => parseInt(i.itemId.replace('FEAT-', ''), 10))
      .filter((n) => !isNaN(n))
    return 'FEAT-' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(2, '0')
  }
  // Seeded backlog items use WEB-0xx-B / DEV-01 naming, not BL-xx — so count
  // existing items on this board instead of pattern-matching an id scheme
  // nothing actually uses, to avoid new items looking like they "reset" to BL-01.
  const bare = items
    .filter((i) => i.board === 'backlog' && /^BL-\d+$/.test(i.itemId))
    .map((i) => parseInt(i.itemId.replace('BL-', ''), 10))
    .filter((n) => !isNaN(n))
  const next = Math.max(items.filter((i) => i.board === 'backlog').length, bare.length ? Math.max(...bare) : 0) + 1
  return 'BL-' + String(next).padStart(2, '0')
}

// Climbs an item's parent chain past single-child "passthrough" wrappers (e.g. a Case
// item like FEAT-01 whose only purpose is bridging to its epic) and stops at the nearest
// real branch point (an ancestor with 2+ children) or the root. Drives the folder view —
// a folder only "exists" where there's an actual fork, so thin wrapper levels stay invisible.
function climbToFolder(item: BacklogItem, byId: Map<string, BacklogItem>, childCountById: Map<string, number>): BacklogItem {
  let current = item
  while (current.parent) {
    const parent = byId.get(current.parent)
    if (!parent) break
    current = parent
    if ((childCountById.get(parent.id) || 0) >= 2) break
  }
  return current
}

type FolderGroup = { folder: BacklogItem; members: BacklogItem[] }

function buildFolderGroups(boardItems: BacklogItem[], byId: Map<string, BacklogItem>, childCountById: Map<string, number>): FolderGroup[] {
  const groups = new Map<string, FolderGroup>()
  for (const it of boardItems) {
    const folder = climbToFolder(it, byId, childCountById)
    const existing = groups.get(folder.id)
    if (existing) existing.members.push(it)
    else groups.set(folder.id, { folder, members: [it] })
  }
  for (const g of groups.values()) {
    g.members.sort((a, b) => PRI_ORDER[a.priority] - PRI_ORDER[b.priority] || a.itemId.localeCompare(b.itemId))
  }
  return Array.from(groups.values())
}

function matchesSearch(i: BacklogItem, search: string): boolean {
  if (!search) return true
  const q = search.toLowerCase()
  return (
    i.title.toLowerCase().includes(q) ||
    i.itemId.toLowerCase().includes(q) ||
    (i.description || '').toLowerCase().includes(q) ||
    (i.slug || '').toLowerCase().includes(q)
  )
}

function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 8px',
        borderRadius: 4,
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: '.02em',
        border: `1px solid ${BORDER}`,
        background: 'transparent',
        color: 'var(--theme-text-dim)',
        whiteSpace: 'nowrap',
        fontFamily: FONT_BODY,
      }}
    >
      {CATEGORY_LABELS[category]}
    </span>
  )
}

function BillingBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 8px',
        borderRadius: 4,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '.02em',
        border: `1px solid ${ACCENT}`,
        background: 'transparent',
        color: ACCENT,
        whiteSpace: 'nowrap',
        fontFamily: FONT_BODY,
      }}
      title="Outside partnership scope — needs separate agreement"
    >
      Extra billing
    </span>
  )
}

function StatusPill({ status }: { status: Status }) {
  const color = STATUS_COLORS[status]
  const outline = status === 'done' || status === 'future'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: 20,
        padding: '0 8px',
        borderRadius: 100,
        fontSize: 10.5,
        fontWeight: 600,
        border: `1px solid ${outline ? BORDER : color}`,
        background: outline ? 'transparent' : color,
        color: outline ? 'var(--theme-text-dim)' : status === 'their-action' ? INK : '#FFFEF9',
        whiteSpace: 'nowrap',
        fontFamily: FONT_BODY,
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

function DoneButton({ onClick, size = 20 }: { onClick: (e: React.MouseEvent) => void; size?: number }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick(e)
      }}
      title="Mark done"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        border: `1.5px solid ${MUTED}`,
        background: 'transparent',
        color: MUTED,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size >= 20 ? 11 : 10,
        padding: 0,
        lineHeight: 1,
      }}
    >
      ✓
    </button>
  )
}

function UndoButton({ onClick, size = 20 }: { onClick: (e: React.MouseEvent) => void; size?: number }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick(e)
      }}
      title="Reopen"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        border: `1.5px solid ${MUTED}`,
        background: 'transparent',
        color: MUTED,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size >= 20 ? 12 : 11,
        padding: 0,
        lineHeight: 1,
      }}
    >
      ↺
    </button>
  )
}

function ItemRow({
  item,
  items,
  selected,
  onClick,
  onMarkDone,
  onReopen,
}: {
  item: BacklogItem
  items: BacklogItem[]
  selected: boolean
  onClick: () => void
  onMarkDone?: (id: string) => void
  onReopen?: (id: string) => void
}) {
  const childCount = items.filter((i) => i.parent === item.id).length
  const childDone = childCount ? items.filter((i) => i.parent === item.id && i.status === 'done').length : 0
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        minHeight: 36,
        border: `1px solid ${selected ? ACCENT : 'var(--theme-border-color)'}`,
        boxShadow: selected ? `0 0 0 1px ${ACCENT}` : undefined,
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
          <span style={{ fontSize: 10, color: item.decision.choice ? MUTED : ACCENT }} title={item.decision.choice ? 'Answered' : 'Needs an answer'}>
            ●
          </span>
        )}
        <span style={{ fontSize: 13, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
        {childCount > 0 && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: childDone === childCount ? ACCENT : 'var(--theme-text-dim)',
              border: '1px solid var(--theme-border-color)',
              borderRadius: 100,
              padding: '1px 6px',
              whiteSpace: 'nowrap',
            }}
            title="Sub-items done"
          >
            {childDone}/{childCount}
          </span>
        )}
        {item.links && item.links.length > 0 && (
          <span style={{ fontSize: 10.5, color: 'var(--theme-text-dim)', whiteSpace: 'nowrap' }} title="Links">
            🔗{item.links.length}
          </span>
        )}
        {item.billingScope === 'extra' && <BillingBadge />}
        <CategoryBadge category={item.category} />
        <StatusPill status={item.status} />
        {onMarkDone && item.status !== 'done' && <DoneButton onClick={() => onMarkDone(item.id)} />}
        {onReopen && item.status === 'done' && <UndoButton onClick={() => onReopen(item.id)} />}
      </div>
    </div>
  )
}

function folderName(folder: BacklogItem): string {
  return folder.folderLabel || folder.title
}

function PriorityChip({ priority }: { priority: Priority }) {
  const color = PRI_COLORS[priority]
  const filled = priority === 'critical' || priority === 'must'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 17,
        padding: '0 6px',
        borderRadius: 4,
        fontSize: 9,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '.03em',
        border: `1px solid ${color}`,
        background: filled ? color : 'transparent',
        color: filled ? (priority === 'critical' ? INK : '#FFFEF9') : color,
        whiteSpace: 'nowrap',
      }}
    >
      {PRI_LABELS[priority].replace('-have', '').replace(' to have', '')}
    </span>
  )
}

function OwnerAvatars({ owners }: { owners?: Owner[] }) {
  if (!owners || owners.length === 0) return null
  return (
    <div style={{ display: 'flex', flexShrink: 0 }}>
      {owners.slice(0, 3).map((o, idx) => (
        <span
          key={o}
          title={OWNER_LABELS[o]}
          style={{
            width: 17,
            height: 17,
            borderRadius: '50%',
            background: INK,
            color: '#FFFEF9',
            fontSize: 8.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: idx === 0 ? 0 : -5,
            border: '1.5px solid var(--theme-elevation-0)',
          }}
        >
          {OWNER_LABELS[o][0]}
        </span>
      ))}
    </div>
  )
}

function KanbanCard({
  item,
  items,
  selected,
  onClick,
  onMarkDone,
}: {
  item: BacklogItem
  items: BacklogItem[]
  selected: boolean
  onClick: () => void
  onMarkDone: (id: string) => void
}) {
  const childCount = items.filter((i) => i.parent === item.id).length
  const childDone = childCount ? items.filter((i) => i.parent === item.id && i.status === 'done').length : 0
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', item.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onClick={onClick}
      style={{
        background: 'var(--theme-elevation-0)',
        border: `1px solid ${selected ? ACCENT : 'var(--theme-border-color)'}`,
        boxShadow: selected ? `0 0 0 1px ${ACCENT}` : undefined,
        borderRadius: 8,
        padding: 10,
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
        <PriorityChip priority={item.priority} />
        {item.billingScope === 'extra' && <BillingBadge />}
        {item.decision && !item.decision.choice && (
          <span style={{ fontSize: 9, fontWeight: 700, color: ACCENT }} title="Decision needed">
            ● decision needed
          </span>
        )}
        <div style={{ flex: 1 }} />
        <DoneButton onClick={() => onMarkDone(item.id)} size={18} />
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.4, fontWeight: 500 }}>{item.title}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2, gap: 6 }}>
        <span style={{ fontSize: 10, color: 'var(--theme-text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.itemId}
          {item.plannedFor ? ` · ${item.plannedFor}` : ''}
          {childCount > 0 ? ` · ${childDone}/${childCount}` : ''}
          {item.links && item.links.length > 0 ? ` · 🔗${item.links.length}` : ''}
        </span>
        <OwnerAvatars owners={item.owners} />
      </div>
    </div>
  )
}

function KanbanColumn({ title, count, onDropItem, children }: { title: string; count: number; onDropItem: (itemId: string) => void; children: React.ReactNode }) {
  const [dragOver, setDragOver] = useState(false)
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (!dragOver) setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const itemId = e.dataTransfer.getData('text/plain')
        if (itemId) onDropItem(itemId)
      }}
      className="ff-kanban-column"
      style={{ width: 248, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 12.5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={title}
        >
          {title}
        </span>
        <span style={{ fontSize: 11, color: 'var(--theme-text-dim)', flexShrink: 0, marginLeft: 6 }}>{count}</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          minHeight: 60,
          borderRadius: 8,
          padding: 4,
          background: dragOver ? 'var(--theme-elevation-50)' : 'transparent',
          border: `1.5px dashed ${dragOver ? ACCENT : 'transparent'}`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Done items move to the Archive view instead of sitting in a column — the active
// board should only ever show live work.
const ACTIVE_STATUS_OPTIONS = STATUS_OPTIONS.filter((s) => s !== 'done')

function KanbanBoard({
  boardItems,
  filteredItems,
  selectedId,
  onSelect,
  onMoveItem,
  onMarkDone,
}: {
  boardItems: BacklogItem[]
  filteredItems: BacklogItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onMoveItem: (itemId: string, columnKey: string) => void
  onMarkDone: (id: string) => void
}) {
  const filteredIds = useMemo(() => new Set(filteredItems.map((i) => i.id)), [filteredItems])

  const columns = useMemo(
    () =>
      ACTIVE_STATUS_OPTIONS.map((s) => ({
        key: s,
        label: STATUS_LABELS[s],
        items: boardItems.filter((i) => i.status === s && filteredIds.has(i.id)).sort((a, b) => PRI_ORDER[a.priority] - PRI_ORDER[b.priority]),
      })),
    [boardItems, filteredIds],
  )

  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
      {columns.map((col) => (
        <KanbanColumn key={col.key} title={col.label} count={col.items.length} onDropItem={(itemId) => onMoveItem(itemId, col.key)}>
          {col.items.length === 0 ? (
            <div style={{ fontSize: 11, color: 'var(--theme-text-dim)', padding: '10px 2px' }}>No items</div>
          ) : (
            col.items.map((it) => <KanbanCard key={it.id} item={it} items={boardItems} selected={it.id === selectedId} onClick={() => onSelect(it.id)} onMarkDone={onMarkDone} />)
          )}
        </KanbanColumn>
      ))}
    </div>
  )
}

function ArchiveView({
  items,
  boardItems,
  selectedId,
  onSelect,
  onReopen,
}: {
  items: BacklogItem[]
  boardItems: BacklogItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onReopen: (id: string) => void
}) {
  const groups = useMemo(() => {
    const byCategory = new Map<Category, BacklogItem[]>()
    for (const it of items) {
      if (!byCategory.has(it.category)) byCategory.set(it.category, [])
      byCategory.get(it.category)!.push(it)
    }
    return CATEGORY_OPTIONS.filter((c) => byCategory.has(c)).map((c) => ({ category: c, items: byCategory.get(c)! }))
  }, [items])

  if (groups.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--theme-text-dim)' }}>
        <strong style={{ display: 'block', fontSize: 14, marginBottom: 4, color: 'var(--theme-text)' }}>Archive is empty</strong>
        Items marked done show up here, grouped by category.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {groups.map((g) => (
        <div key={g.category}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--theme-text-dim)', marginBottom: 6 }}>
            {CATEGORY_LABELS[g.category]} ({g.items.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {g.items.map((it) => (
              <ItemRow key={it.id} item={it} items={boardItems} selected={it.id === selectedId} onClick={() => onSelect(it.id)} onReopen={onReopen} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export const BacklogClient: React.FC = () => {
  useBrandFont()
  useResponsiveStyles()
  const [items, setItems] = useState<BacklogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeBoard, setActiveBoard] = useState<Board>('backlog')
  const [activeFilter, setActiveFilter] = useState<FilterId>('all')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<Category | ''>('')
  const [sortBy, setSortBy] = useState<'priority' | 'id' | 'effort' | 'status'>('priority')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [boardView, setBoardView] = useState<'status' | 'list' | 'archive'>('status')
  const [sidebarPriority, setSidebarPriority] = useState<Priority | ''>('')
  const [sidebarOwner, setSidebarOwner] = useState<Owner | ''>('')
  const [sidebarTopic, setSidebarTopic] = useState<string>('')
  const [clusteringBusy, setClusteringBusy] = useState(false)

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

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])
  const childCountById = useMemo(() => {
    const m = new Map<string, number>()
    for (const it of items) {
      if (it.parent) m.set(it.parent, (m.get(it.parent) || 0) + 1)
    }
    return m
  }, [items])

  const boardItems = useMemo(() => items.filter((i) => i.board === activeBoard), [items, activeBoard])

  // Topic axis for Features/Backlog — same climb-to-branch-point grouping as before,
  // just rendered as Kanban columns now instead of a click-into-folder drill-down.
  const topicGroups = useMemo(() => buildFolderGroups(boardItems, byId, childCountById), [boardItems, byId, childCountById])

  // Sidebar quick-filters (priority/owner/topic) + search + category, applied together
  // for Features/Backlog. Roadmap keeps using the untouched activeFilter/FNAV path.
  const baseFiltered = useMemo(() => {
    let list = boardItems
    if (sidebarPriority) list = list.filter((i) => i.priority === sidebarPriority)
    if (sidebarOwner) list = list.filter((i) => (i.owners || []).includes(sidebarOwner))
    if (sidebarTopic) list = list.filter((i) => climbToFolder(i, byId, childCountById).id === sidebarTopic)
    if (catFilter) list = list.filter((i) => i.category === catFilter)
    if (search) list = list.filter((i) => matchesSearch(i, search))
    return list
  }, [boardItems, sidebarPriority, sidebarOwner, sidebarTopic, catFilter, search, byId, childCountById])

  // Done items live in the Archive, not the active Board/List — keeps "the actual
  // backlog" free of clutter from finished work.
  const nonRoadmapFiltered = useMemo(() => baseFiltered.filter((i) => i.status !== 'done'), [baseFiltered])
  const archiveFiltered = useMemo(() => baseFiltered.filter((i) => i.status === 'done'), [baseFiltered])

  const nonRoadmapSorted = useMemo(
    () =>
      [...nonRoadmapFiltered].sort((a, b) => {
        if (sortBy === 'priority') return PRI_ORDER[a.priority] - PRI_ORDER[b.priority] || a.itemId.localeCompare(b.itemId)
        if (sortBy === 'id') return a.itemId.localeCompare(b.itemId)
        if (sortBy === 'effort') return EFF_ORDER[a.effort] - EFF_ORDER[b.effort]
        if (sortBy === 'status') return a.status.localeCompare(b.status)
        return 0
      }),
    [nonRoadmapFiltered, sortBy],
  )

  // Backlog items with no parent yet, sharing an exact area or slug — likely worth
  // batching into one trip instead of fixing separately. Deterministic text match only
  // (no fuzzy/semantic matching), so it's transparent why something was suggested.
  const suggestedClusters = useMemo(() => {
    if (activeBoard !== 'backlog') return []
    const candidates = boardItems.filter((i) => !i.parent && i.status !== 'done')
    const byArea = new Map<string, BacklogItem[]>()
    const bySlug = new Map<string, BacklogItem[]>()
    for (const it of candidates) {
      const area = (it.area || '').trim().toLowerCase()
      if (area) (byArea.get(area) || byArea.set(area, []).get(area)!).push(it)
      const slug = (it.slug || '').trim().toLowerCase()
      if (slug) (bySlug.get(slug) || bySlug.set(slug, []).get(slug)!).push(it)
    }
    const clusters: { key: string; label: string; members: BacklogItem[] }[] = []
    for (const [, members] of byArea) {
      if (members.length >= 2) clusters.push({ key: `area:${members[0].area}`, label: `Area: ${members[0].area}`, members })
    }
    for (const [, members] of bySlug) {
      if (members.length >= 2) clusters.push({ key: `slug:${members[0].slug}`, label: `Page: /${members[0].slug}`, members })
    }
    return clusters
  }, [boardItems, activeBoard])
  const boardCounts = useMemo(
    () => ({
      roadmap: items.filter((i) => i.board === 'roadmap').length,
      backlog: items.filter((i) => i.board === 'backlog').length,
      features: items.filter((i) => i.board === 'features').length,
    }),
    [items],
  )

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
    setSidebarPriority('')
    setSidebarOwner('')
    setSidebarTopic('')
  }

  async function acceptCluster(cluster: { key: string; label: string; members: BacklogItem[] }) {
    setClusteringBusy(true)
    try {
      const itemId = nextItemId(items, 'backlog')
      const priority = cluster.members.reduce((best, m) => (PRI_ORDER[m.priority] < PRI_ORDER[best] ? m.priority : best), cluster.members[0].priority)
      const container = await createBacklogItem({
        itemId,
        board: 'backlog',
        title: cluster.label,
        category: cluster.members[0].category,
        priority,
        status: 'open',
        effort: 'M',
        billingScope: 'included',
        owners: ['dev'],
        notes: '',
        description: `Auto-suggested grouping — ${cluster.members.length} items sharing this ${cluster.key.startsWith('area:') ? 'area' : 'page'}.`,
      })
      setItems((cur) => [...cur, container])
      // Sequential, not Promise.all — MongoDB Atlas M0 has no transactions.
      for (const m of cluster.members) {
        const updated = await updateBacklogItem(m.id, { parent: container.id })
        setItems((cur) => cur.map((i) => (i.id === m.id ? { ...i, ...updated } : i)))
      }
      showToast(`Grouped ${cluster.members.length} items under ${container.itemId}`)
    } catch {
      showToast('Grouping failed — try again')
    } finally {
      setClusteringBusy(false)
    }
  }

  function jumpTo(itemId: string) {
    const it = items.find((i) => i.itemId === itemId)
    if (!it) return
    jumpToDoc(it.id)
  }

  function jumpToDoc(docId: string) {
    const it = items.find((i) => i.id === docId)
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

  function handleMoveItem(itemId: string, columnKey: string) {
    const item = items.find((i) => i.id === itemId)
    if (!item || item.status === columnKey) return
    patchItem(itemId, { status: columnKey as Status })
  }

  function markDone(itemId: string) {
    patchItem(itemId, { status: 'done' })
  }

  function markUndone(itemId: string) {
    patchItem(itemId, { status: 'open' })
  }

  function openNewModal() {
    setModal({ open: true, editingId: null })
    setForm({ ...EMPTY_FORM })
  }
  function openEditModal(item: BacklogItem) {
    setModal({ open: true, editingId: item.id })
    setForm({
      title: item.title,
      folderLabel: item.folderLabel || '',
      category: item.category,
      status: item.status,
      priority: item.priority,
      effort: item.effort,
      billingScope: item.billingScope || 'included',
      parent: item.parent || '',
      plannedFor: item.plannedFor || '',
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
      folderLabel: form.folderLabel.trim(),
      category: form.category,
      status: form.status,
      priority: form.priority,
      effort: form.effort,
      billingScope: form.billingScope,
      parent: form.parent || null,
      plannedFor: form.plannedFor.trim(),
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
    return <div style={{ padding: 24, color: 'var(--theme-text-dim)', fontFamily: FONT_BODY }}>Loading backlog…</div>
  }
  if (error) {
    return <div style={{ padding: 24, color: INK, fontFamily: FONT_BODY }}>{error}</div>
  }

  return (
    <div style={{ padding: '20px 24px 40px', color: 'var(--theme-text)', maxWidth: 1440, fontFamily: FONT_BODY }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Backlog</h1>
          <div style={{ fontSize: 12, color: 'var(--theme-text-dim)', marginTop: 3 }}>{BOARD_SUBTITLES[activeBoard]}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['roadmap', 'features', 'backlog'] as Board[]).map((b) => (
            <button key={b} onClick={() => setBoard(b)} style={tabStyle(activeBoard === b)}>
              {BOARD_LABELS[b]} ({boardCounts[b]})
            </button>
          ))}
        </div>
      </div>

      <div className="ff-content-row" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="ff-toolbar-row" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="search"
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle({ flex: 1, maxWidth: 220 })}
            />
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value as Category | '')} style={selectStyle()}>
              <option value="">All categories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
            {activeBoard === 'roadmap' ? (
              <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value as FilterId)} style={selectStyle()}>
                {FNAV.filter((f) => !f.sep).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <select value={sidebarPriority} onChange={(e) => setSidebarPriority(e.target.value as Priority | '')} style={selectStyle()}>
                  <option value="">All priorities</option>
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {PRI_LABELS[p]}
                    </option>
                  ))}
                </select>
                <select value={sidebarTopic} onChange={(e) => setSidebarTopic(e.target.value)} style={selectStyle()}>
                  <option value="">All topics</option>
                  {topicGroups.map((g) => (
                    <option key={g.folder.id} value={g.folder.id}>
                      {folderName(g.folder)}
                    </option>
                  ))}
                </select>
                <select value={sidebarOwner} onChange={(e) => setSidebarOwner(e.target.value as Owner | '')} style={selectStyle()}>
                  <option value="">All owners</option>
                  {OWNER_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {OWNER_LABELS[o]}
                    </option>
                  ))}
                </select>
              </>
            )}
            {(activeBoard === 'roadmap' || boardView === 'list') && (
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} style={selectStyle()}>
                <option value="priority">Sort: Priority</option>
                <option value="id">Sort: ID</option>
                <option value="effort">Sort: Effort</option>
                <option value="status">Sort: Status</option>
              </select>
            )}
            {activeBoard !== 'roadmap' && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setBoardView('status')} style={tabStyle(boardView === 'status')}>
                  Board
                </button>
                <button onClick={() => setBoardView('list')} style={tabStyle(boardView === 'list')}>
                  List
                </button>
                <button onClick={() => setBoardView('archive')} style={tabStyle(boardView === 'archive')}>
                  Archive ({archiveFiltered.length})
                </button>
              </div>
            )}
            <div style={{ flex: 1 }} />
            <button onClick={openNewModal} style={primaryBtnStyle()}>
              + New item
            </button>
          </div>

          {activeBoard === 'roadmap' ? (
            <div
              style={{
                border: '1px solid var(--theme-border-color)',
                borderRadius: 8,
                maxHeight: 620,
                overflowY: 'auto',
                padding: 8,
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
                  <ItemRow key={item.id} item={item} items={items} selected={item.id === selectedId} onClick={() => setSelectedId(item.id)} onMarkDone={markDone} onReopen={markUndone} />
                ))
              )}
            </div>
          ) : boardView === 'list' ? (
            <div
              style={{
                border: '1px solid var(--theme-border-color)',
                borderRadius: 8,
                maxHeight: 620,
                overflowY: 'auto',
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {nonRoadmapSorted.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--theme-text-dim)' }}>
                  <strong style={{ display: 'block', fontSize: 14, marginBottom: 4, color: 'var(--theme-text)' }}>No items found</strong>
                  Try a different filter or search.
                </div>
              ) : (
                nonRoadmapSorted.map((item) => (
                  <ItemRow key={item.id} item={item} items={items} selected={item.id === selectedId} onClick={() => setSelectedId(item.id)} onMarkDone={markDone} onReopen={markUndone} />
                ))
              )}
            </div>
          ) : boardView === 'archive' ? (
            <div
              style={{
                border: '1px solid var(--theme-border-color)',
                borderRadius: 8,
                maxHeight: 620,
                overflowY: 'auto',
                padding: 12,
              }}
            >
              <ArchiveView items={archiveFiltered} boardItems={boardItems} selectedId={selectedId} onSelect={setSelectedId} onReopen={markUndone} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeBoard === 'backlog' && suggestedClusters.length > 0 && (
                <div style={{ border: `1px dashed ${ACCENT}`, borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--theme-text-dim)' }}>
                    Suggested groupings — items that touch the same spot
                  </div>
                  {suggestedClusters.map((c) => (
                    <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12 }}>
                      <span style={{ fontWeight: 600 }}>{c.label}:</span>
                      <span style={{ color: 'var(--theme-text-dim)' }}>{c.members.map((m) => m.itemId).join(', ')}</span>
                      <button
                        onClick={() => acceptCluster(c)}
                        disabled={clusteringBusy}
                        style={{ ...primaryBtnStyle(), height: 24, padding: '0 10px', fontSize: 11, opacity: clusteringBusy ? 0.6 : 1 }}
                      >
                        Group these
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <KanbanBoard
                boardItems={boardItems}
                filteredItems={nonRoadmapFiltered}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onMoveItem={handleMoveItem}
                onMarkDone={markDone}
              />
            </div>
          )}
        </div>

        {selected && (
          <DetailPanel
            item={selected}
            items={items}
            onClose={() => setSelectedId(null)}
            onEdit={() => openEditModal(selected)}
            onDelete={() => handleDelete(selected.id)}
            onPatch={(patch) => patchItem(selected.id, patch)}
            onJump={jumpTo}
            onJumpToDocId={jumpToDoc}
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
          parentOptions={items.filter((i) => i.id !== modal.editingId)}
        />
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 22,
            left: '50%',
            transform: 'translateX(-50%)',
            background: INK,
            color: '#FFFEF9',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            zIndex: 200,
            whiteSpace: 'nowrap',
            fontFamily: FONT_BODY,
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
    padding: '8px 13px',
    borderRadius: 6,
    border: `1px solid ${active ? INK : 'var(--theme-border-color)'}`,
    background: active ? INK : 'var(--theme-elevation-0)',
    color: active ? '#FFFEF9' : 'var(--theme-text)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: FONT_DISPLAY,
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
    fontFamily: FONT_BODY,
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
    fontFamily: FONT_BODY,
    ...extra,
  }
}
function primaryBtnStyle(): React.CSSProperties {
  return {
    height: 32,
    padding: '0 14px',
    background: INK,
    color: '#FFFEF9',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: FONT_DISPLAY,
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
    fontFamily: FONT_BODY,
  }
}

function DetailPanel({
  item,
  items,
  onClose,
  onEdit,
  onDelete,
  onPatch,
  onJump,
  onJumpToDocId,
  onToast,
}: {
  item: BacklogItem
  items: BacklogItem[]
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onPatch: (patch: Partial<BacklogItem>) => void
  onJump: (itemId: string) => void
  onJumpToDocId: (docId: string) => void
  onToast: (msg: string) => void
}) {
  const parentItem = item.parent ? items.find((i) => i.id === item.parent) : undefined
  const children = items.filter((i) => i.parent === item.id)
  const doneChildren = children.filter((i) => i.status === 'done').length
  const allChildrenDone = children.length > 0 && doneChildren === children.length

  const [notes, setNotes] = useState(item.notes || '')
  const [todoText, setTodoText] = useState('')
  const [decisionNotes, setDecisionNotes] = useState(item.decision?.notes || '')
  const [expanded, setExpanded] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkLabel, setLinkLabel] = useState('')

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
  function addLink() {
    let url = linkUrl.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`
    const links = [...(item.links || []), { url, label: linkLabel.trim() }]
    onPatch({ links })
    setLinkUrl('')
    setLinkLabel('')
  }
  function deleteLink(idx: number) {
    const links = (item.links || []).filter((_, i) => i !== idx)
    onPatch({ links })
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
    <>
      {expanded && (
        <div onClick={() => setExpanded(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 150 }} />
      )}
      <aside
        className={expanded ? undefined : 'ff-detail-panel'}
        style={
          expanded
            ? {
                position: 'fixed',
                top: '4vh',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(880px, 92vw)',
                maxHeight: '92vh',
                zIndex: 151,
                background: 'var(--theme-elevation-0)',
                border: '1px solid var(--theme-border-color)',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 12px 32px rgba(0,0,0,.35)',
                fontFamily: FONT_BODY,
              }
            : {
                width: 380,
                flexShrink: 0,
                background: 'var(--theme-elevation-0)',
                border: '1px solid var(--theme-border-color)',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 640,
                fontFamily: FONT_BODY,
              }
        }
      >
        <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid var(--theme-border-color)', borderLeft: `3px solid ${PRI_COLORS[item.priority]}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
              <CategoryBadge category={item.category} />
              <StatusPill status={item.status} />
            </div>
            <button onClick={() => setExpanded((v) => !v)} style={{ ...ghostBtnStyle(), width: 28, padding: 0 }} title={expanded ? 'Shrink' : 'Full size'}>
              {expanded ? '⤡' : '⤢'}
            </button>
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
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{item.title}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: 16 }}>
          <MetaField label="Priority">
            <span style={{ color: PRI_COLORS[item.priority], fontWeight: 600, fontSize: 13 }}>{PRI_LABELS[item.priority]}</span>
          </MetaField>
          <MetaField label="Effort">
            <span style={etagStyle()}>{item.effort}</span>
          </MetaField>
          <MetaField label="Billing scope">
            {item.billingScope === 'extra' ? (
              <BillingBadge />
            ) : (
              <span style={{ fontSize: 13 }}>{BILLING_SCOPE_LABELS.included}</span>
            )}
          </MetaField>
          {item.businessValue && (
            <MetaField label="Business value">
              <span style={{ fontSize: 13, fontWeight: 600, color: item.businessValue === 'critical' ? ACCENT : 'var(--theme-text)' }}>
                {BUSINESS_VALUE_LABELS[item.businessValue]}
              </span>
            </MetaField>
          )}
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
          {item.area && (
            <MetaField label="Area / URL">
              <span style={{ fontSize: 13 }}>{item.area}</span>
            </MetaField>
          )}
          {item.related && (
            <MetaField label="Related">
              <span style={{ color: INK, textDecoration: 'underline', cursor: 'pointer', fontWeight: 600, fontSize: 13 }} onClick={() => onJump(item.related!)}>
                {item.related} →
              </span>
            </MetaField>
          )}
          {parentItem && (
            <MetaField label={`Parent (${BOARD_LABELS[parentItem.board]})`}>
              <span style={{ color: INK, textDecoration: 'underline', cursor: 'pointer', fontWeight: 600, fontSize: 13 }} onClick={() => onJumpToDocId(parentItem.id)}>
                {parentItem.itemId} — {folderName(parentItem)} →
              </span>
            </MetaField>
          )}
          {item.plannedFor && (
            <MetaField label="Planned for">
              <span style={{ fontSize: 13, fontWeight: 600 }}>{item.plannedFor}</span>
            </MetaField>
          )}
        </div>

        {children.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={sectionLabelStyle()}>Sub-items</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: allChildrenDone ? ACCENT : 'var(--theme-text-dim)' }}>
                {doneChildren}/{children.length} done
              </div>
            </div>
            <div style={{ border: '1px solid var(--theme-border-color)', borderRadius: 6, overflow: 'hidden', marginBottom: allChildrenDone && item.status !== 'done' ? 8 : 0 }}>
              {children.map((c, idx) => (
                <div
                  key={c.id}
                  onClick={() => onJumpToDocId(c.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 10px',
                    cursor: 'pointer',
                    borderBottom: idx < children.length - 1 ? '1px solid var(--theme-border-color)' : 'none',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.status === 'done' ? MUTED : STATUS_COLORS[c.status], flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--theme-text-dim)', flexShrink: 0 }}>{c.itemId}</span>
                  <span style={{ fontSize: 13, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: c.status === 'done' ? 'line-through' : 'none', color: c.status === 'done' ? 'var(--theme-text-dim)' : 'var(--theme-text)' }}>
                    {c.title}
                  </span>
                  {c.board !== item.board && (
                    <span style={{ fontSize: 9, color: 'var(--theme-text-dim)', flexShrink: 0 }}>{BOARD_LABELS[c.board]}</span>
                  )}
                </div>
              ))}
            </div>
            {allChildrenDone && item.status !== 'done' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  border: `1px solid ${ACCENT}`,
                  borderRadius: 6,
                  background: 'var(--theme-elevation-50)',
                }}
              >
                <span style={{ fontSize: 12, flex: 1 }}>All sub-items are done — mark this one done too?</span>
                <button onClick={() => onPatch({ status: 'done' })} style={{ ...primaryBtnStyle(), height: 26, padding: '0 10px', fontSize: 11 }}>
                  Mark done
                </button>
              </div>
            )}
          </div>
        )}

        {item.description && <Section label="Description">{item.description}</Section>}
        {item.response && (
          <Section label="Response / Plan" boxed>
            {item.response}
          </Section>
        )}
        {item.sourceContext && <Section label="Source / Context">{item.sourceContext}</Section>}
        {item.dependencies && <Section label="Dependencies">{item.dependencies}</Section>}
        {item.nextActionText && <Section label="Next Action">{item.nextActionText}</Section>}

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
                      border: `1.5px solid ${sel ? INK : 'var(--theme-border-color)'}`,
                      background: sel ? 'var(--theme-elevation-100)' : 'transparent',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: `2px solid ${sel ? INK : 'var(--theme-border-color)'}`,
                        flexShrink: 0,
                        marginTop: 2,
                        position: 'relative',
                      }}
                    >
                      {sel && <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: INK }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {o.label}
                        {o.recommended && (
                          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: INK, background: ACCENT, padding: '1px 6px', borderRadius: 100 }}>
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
            <button onClick={saveDecisionNotes} style={{ ...primaryBtnStyle(), marginTop: 8 }}>
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
                  <input type="checkbox" checked={t.done} onChange={() => toggleTodo(idx)} style={{ accentColor: INK, cursor: 'pointer' }} />
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
            <button onClick={addTodo} style={{ ...primaryBtnStyle(), height: 30, padding: '0 10px', fontSize: 12 }}>
              Add
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={sectionLabelStyle()}>Links</div>
          {(item.links || []).length ? (
            <div style={{ border: '1px solid var(--theme-border-color)', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
              {(item.links || []).map((l, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 10px',
                    borderBottom: idx < (item.links!.length - 1) ? '1px solid var(--theme-border-color)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 13, flexShrink: 0 }}>🔗</span>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ flex: 1, fontSize: 13, color: INK, textDecoration: 'underline', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {l.label || l.url}
                  </a>
                  <button onClick={() => deleteLink(idx)} style={{ background: 'none', border: 'none', color: 'var(--theme-text-dim)', cursor: 'pointer', fontSize: 13 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--theme-text-dim)', padding: '8px 0' }}>No links yet — Drive, Figma, Notion, screenshots…</div>
          )}
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLink()}
              placeholder="Paste a link (Drive, Figma, Notion…)"
              style={inputStyle({ flex: 1, height: 30, fontSize: 12 })}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLink()}
              placeholder="Label (optional)"
              style={inputStyle({ flex: 1, height: 30, fontSize: 12 })}
            />
            <button onClick={addLink} style={{ ...primaryBtnStyle(), height: 30, padding: '0 10px', fontSize: 12 }}>
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
        <button onClick={saveNotes} style={primaryBtnStyle()}>
          Save notes
        </button>
        <button onClick={onDelete} style={{ ...ghostBtnStyle(), color: INK_SOFT, border: 'none', background: 'none' }}>
          Delete
        </button>
      </div>
      </aside>
    </>
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
    fontFamily: FONT_BODY,
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
  parentOptions,
}: {
  form: typeof EMPTY_FORM
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>
  editing: boolean
  saving: boolean
  onToggleOwner: (o: Owner) => void
  onClose: () => void
  onSave: () => void
  onDelete?: () => void
  parentOptions: BacklogItem[]
}) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ background: 'var(--theme-elevation-0)', borderRadius: 12, width: '100%', maxWidth: 548, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,.3)', fontFamily: FONT_BODY }}>
        <div style={{ padding: '18px 18px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, flex: 1 }}>{editing ? 'Edit item' : 'New item'}</div>
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
          <Field label="Folder name (only shown if this becomes a folder — 2+ children)">
            <input
              value={form.folderLabel}
              onChange={(e) => setForm((f) => ({ ...f, folderLabel: e.target.value }))}
              placeholder="e.g. Refund & Cancellation Architecture — leave blank to just use the title"
              style={inputStyle({ width: '100%', height: 36, boxSizing: 'border-box' })}
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
                      background: sel ? 'var(--theme-elevation-100)' : 'var(--theme-elevation-50)',
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
                    {CATEGORY_LABELS[c]}
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
                      border: `1px solid ${sel ? INK : 'var(--theme-border-color)'}`,
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: sel ? INK : 'var(--theme-elevation-50)',
                      color: sel ? '#FFFEF9' : 'var(--theme-text-dim)',
                    }}
                  >
                    {e}
                  </button>
                )
              })}
            </div>
          </Field>
          <Field label="Billing scope">
            <div style={{ display: 'flex', gap: 7 }}>
              {BILLING_SCOPE_OPTIONS.map((b) => {
                const sel = form.billingScope === b
                return (
                  <button
                    key={b}
                    onClick={() => setForm((f) => ({ ...f, billingScope: b }))}
                    style={{
                      flex: 1,
                      height: 36,
                      border: `1px solid ${sel ? INK : 'var(--theme-border-color)'}`,
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: sel ? INK : 'var(--theme-elevation-50)',
                      color: sel ? '#FFFEF9' : 'var(--theme-text-dim)',
                    }}
                  >
                    {BILLING_SCOPE_LABELS[b]}
                  </button>
                )
              })}
            </div>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Parent item">
              <select
                value={form.parent}
                onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}
                style={selectStyle({ width: '100%', height: 36 })}
              >
                <option value="">None — top-level item</option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.itemId} — {BOARD_LABELS[p.board]} — {p.title.slice(0, 40)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Planned for">
              <input
                value={form.plannedFor}
                onChange={(e) => setForm((f) => ({ ...f, plannedFor: e.target.value }))}
                placeholder="e.g. Week of Jul 14"
                style={inputStyle({ width: '100%', height: 36, boxSizing: 'border-box' })}
              />
            </Field>
          </div>
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
                      border: `1px solid ${sel ? INK : 'var(--theme-border-color)'}`,
                      borderRadius: 100,
                      fontSize: 12,
                      cursor: 'pointer',
                      background: sel ? INK : 'var(--theme-elevation-50)',
                      color: sel ? '#FFFEF9' : 'var(--theme-text-dim)',
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
            <button onClick={onDelete} style={{ ...ghostBtnStyle(), color: INK_SOFT, border: 'none', background: 'none', marginRight: 'auto' }}>
              Delete
            </button>
          )}
          <button onClick={onClose} style={ghostBtnStyle()}>
            Cancel
          </button>
          <button onClick={onSave} disabled={saving} style={{ ...primaryBtnStyle(), opacity: saving ? 0.6 : 1 }}>
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
