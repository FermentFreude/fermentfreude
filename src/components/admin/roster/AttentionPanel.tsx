'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  acknowledgeAutoItem,
  createAttentionNote,
  markNoteSeen,
  reassignNote,
  replyToNote,
  setAttentionNoteStatus,
  updateAttentionNote,
  updateMyProfile,
  uploadNoteImage,
} from './attentionActions'
import type { AttentionNoteRow, AttentionSeverity, NoteMessage, TeamMember } from './attentionTypes'
import { detectAttentionItems } from './autoAttention'
import { LOCALE, WELCOME, type Lang } from './rosterI18n'
import { useToast } from './RosterToast'
import type { RosterData } from './types'
import { UserAvatar } from './UserAvatar'

/* ── Texts ─────────────────────────────────────────────── */

const NT = {
  de: {
    title: 'Notizen',
    sub: 'Notizen zwischen euch und Dinge, die das System gefunden hat. Wer gefragt wird, bekommt einen Hinweis.',
    add: 'Notiz hinzufügen',
    fMe: 'Für mich', fAll: 'Alle offenen', fBy: 'Von mir gefragt', fSys: 'System', fDone: 'Erledigt',
    isNew: 'Neu', waitFor: (n: string) => `Wartet auf ${n}`, waitAll: 'Wartet auf alle', everyone: 'Alle', system: 'System',
    ask: 'Fragen …', known: 'Bekannt', openWs: 'Workshop öffnen',
    replyPh: 'Antwort schreiben. Einen Screenshot kannst du mit Strg+V oder Cmd+V einfügen.',
    attach: 'Bild anhängen', send: 'Senden', rmImg: 'Bild entfernen', uploading: 'Lädt hoch …',
    emailAlso: (n: string) => `${n} auch eine E-Mail senden`, emailOff: (n: string) => `${n} hat E-Mail-Hinweise ausgeschaltet`,
    emailAll: 'Dem Team auch eine E-Mail senden',
    markDone: 'Als erledigt markieren', reopen: 'Wieder öffnen', reassign: 'Jemand anderen fragen', edit: 'Bearbeiten',
    closed: (n: string) => `Abgeschlossen von ${n}`,
    evAsked: (a: string, b: string) => `${a} hat ${b} gefragt`, evDone: (a: string) => `${a} hat das als erledigt markiert`,
    evReopen: (a: string) => `${a} hat das wieder geöffnet`,
    askT: 'Jemanden fragen', askHint: 'Die Person bekommt einen Hinweis im Dashboard und eine E-Mail, wenn ihre Hinweise an sind. Der Systempunkt wandert ins Gespräch.',
    askWho: 'Wer soll sich das ansehen?', askMsg: 'Nachricht',
    knownT: 'Als bekannt markieren', knownHint: 'Schreib kurz den Grund. Er wird mit deinem Namen gespeichert, damit das Team später weiß, warum das ignoriert wurde.',
    knownWhy: 'Grund', knownNeed: 'Bitte kurz den Grund schreiben.', save: 'Speichern',
    addT: 'Neue Notiz', editT: 'Notiz bearbeiten', fTitle: 'Titel *', fMsg: 'Nachricht', fSev: 'Wichtigkeit', fWho: 'Für', nobody: 'Niemand bestimmtes',
    fWs: 'Workshop (optional)', fNoWs: 'Kein Workshop', fDue: 'Fällig am (optional)', titleNeed: 'Bitte einen Titel angeben.', cancel: 'Abbrechen',
    sentTo: (n: string) => `Gesendet. E-Mail an ${n}.`, posted: 'Notiz hinzugefügt.', known2: 'Als bekannt markiert.', sent: 'Gesendet.',
    profT: 'Mein Profil', photo: 'Foto', upload: 'Foto hochladen', remove: 'Foto entfernen',
    photoHint: 'Ein quadratisches Foto passt am besten. Es erscheint neben deinen Nachrichten.',
    emailPref: 'E-Mail-Hinweise', ep1: 'Wenn mich jemand fragt oder antwortet', ep2: 'Nur dringende Notizen', ep3: 'Aus', close: 'Schließen',
    profSaved: 'Profil gespeichert.',
    empty: 'Im Moment nichts.', showAll: (n: number) => `Alle ${n} anzeigen`, showLess: 'Weniger anzeigen',
    due: (d: string) => `fällig ${d}`, to: 'für', you: 'du',
    sev: { info: 'Info', attention: 'Achtung', urgent: 'Dringend' } as Record<AttentionSeverity, string>,
    knownBy: (n: string, r: string) => `Bekannt von ${n}: ${r}`,
  },
  en: {
    title: 'Notes',
    sub: 'Notes between you and things the system found. Whoever is asked gets a notice.',
    add: 'Add note',
    fMe: 'For me', fAll: 'All open', fBy: 'Asked by me', fSys: 'System', fDone: 'Done',
    isNew: 'New', waitFor: (n: string) => `Waiting for ${n}`, waitAll: 'Waiting for everyone', everyone: 'Everyone', system: 'System',
    ask: 'Ask…', known: 'Known', openWs: 'Open workshop',
    replyPh: 'Write a reply. Paste a screenshot with Ctrl+V or Cmd+V.',
    attach: 'Attach image', send: 'Send', rmImg: 'Remove image', uploading: 'Uploading…',
    emailAlso: (n: string) => `Also send ${n} an email`, emailOff: (n: string) => `${n} has email alerts turned off`,
    emailAll: 'Also email the team',
    markDone: 'Mark as done', reopen: 'Reopen', reassign: 'Ask someone else', edit: 'Edit',
    closed: (n: string) => `Closed by ${n}`,
    evAsked: (a: string, b: string) => `${a} asked ${b}`, evDone: (a: string) => `${a} marked this as done`,
    evReopen: (a: string) => `${a} reopened this`,
    askT: 'Ask someone', askHint: 'The person gets a notice in the dashboard and an email if their alerts are on. The system item moves into the conversation.',
    askWho: 'Who should look at this?', askMsg: 'Message',
    knownT: 'Mark as known', knownHint: 'Write the reason briefly. It is saved with your name so the team knows later why this was ignored.',
    knownWhy: 'Reason', knownNeed: 'Please write a short reason.', save: 'Save',
    addT: 'New note', editT: 'Edit note', fTitle: 'Title *', fMsg: 'Message', fSev: 'Importance', fWho: 'For', nobody: 'Nobody in particular',
    fWs: 'Workshop (optional)', fNoWs: 'No workshop', fDue: 'Due (optional)', titleNeed: 'Please add a title.', cancel: 'Cancel',
    sentTo: (n: string) => `Sent. Email to ${n}.`, posted: 'Note added.', known2: 'Marked as known.', sent: 'Sent.',
    profT: 'My profile', photo: 'Photo', upload: 'Upload photo', remove: 'Remove photo',
    photoHint: 'A square photo works best. It appears next to your messages.',
    emailPref: 'Email alerts', ep1: 'When someone asks me or replies', ep2: 'Only urgent notes', ep3: 'Off', close: 'Close',
    profSaved: 'Profile saved.',
    empty: 'Nothing right now.', showAll: (n: number) => `Show all ${n}`, showLess: 'Show less',
    due: (d: string) => `due ${d}`, to: 'for', you: 'you',
    sev: { info: 'Info', attention: 'Attention', urgent: 'Urgent' } as Record<AttentionSeverity, string>,
    knownBy: (n: string, r: string) => `Known by ${n}: ${r}`,
  },
}
type NDict = (typeof NT)['de']

const SEV_TONE: Record<AttentionSeverity, string> = { info: 'info', attention: 'warn', urgent: 'bad' }
const SEV_RANK: Record<AttentionSeverity, number> = { urgent: 0, attention: 1, info: 2 }

/* ── Conversation logic (same rules as the mock-up) ────── */

const realMessages = (n: AttentionNoteRow) => n.messages.filter((m) => !m.event)
const lastMsg = (n: AttentionNoteRow): NoteMessage | undefined => realMessages(n).at(-1) ?? n.messages.at(-1)
/** Whose turn it is: the asked person, or the asker once the asked person has answered. */
function waitingOn(n: AttentionNoteRow): string {
  if (!n.assignedTo) return ''
  if (n.assignedTo === 'all') return 'all'
  return lastMsg(n)?.byId === n.assignedTo ? n.createdById : n.assignedTo
}
function isUnread(n: AttentionNoteRow, me: string) {
  if (!me || n.status !== 'open') return false
  const involved = n.createdById === me || n.assignedTo === me || n.assignedTo === 'all'
  return involved && n.messages.length > n.seenCount && lastMsg(n)?.byId !== me
}
const isForMe = (n: AttentionNoteRow, me: string) =>
  n.status === 'open' && !!me && (waitingOn(n) === me || (n.assignedTo === 'all' && n.createdById !== me))
const isByMe = (n: AttentionNoteRow, me: string) =>
  n.status === 'open' && !!me && n.createdById === me && !!n.assignedTo && n.assignedTo !== me

export function useUnreadNoteCount(data: RosterData): number {
  return useMemo(() => data.attentionNotes.filter((n) => isUnread(n, data.me)).length, [data])
}

/** Open items for the KPI tile: unacknowledged system items + open notes. */
export function useAttentionCount(data: RosterData): number {
  return useMemo(() => {
    const acks = new Set(data.attentionAcks)
    return detectAttentionItems(data).filter((i) => !acks.has(i.key)).length + data.attentionNotes.filter((n) => n.status === 'open').length
  }, [data])
}

function ago(iso: string, lang: Lang) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  const rtf = new Intl.RelativeTimeFormat(LOCALE[lang], { numeric: 'auto' })
  if (diff < 60) return rtf.format(0, 'second')
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), 'minute')
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), 'hour')
  if (diff < 7 * 86400) return rtf.format(-Math.round(diff / 86400), 'day')
  return new Date(iso).toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'short', timeZone: 'Europe/Vienna' })
}

/* ── Image attachments (paste, pick, drop) ─────────────── */

type Attachment = { key: string; id?: string; url: string; busy: boolean; error?: string }

function useAttachments(onError: (msg: string) => void) {
  const [items, setItems] = useState<Attachment[]>([])
  const add = useCallback(
    async (files: File[]) => {
      for (const file of files.filter((f) => f.type.startsWith('image/')).slice(0, 6)) {
        const key = `${Date.now()}-${Math.random()}`
        const local = URL.createObjectURL(file)
        setItems((p) => [...p, { key, url: local, busy: true }])
        const fd = new FormData()
        fd.append('file', file)
        const r = await uploadNoteImage(fd)
        if (r.ok) setItems((p) => p.map((x) => (x.key === key ? { ...x, id: r.data.id, busy: false } : x)))
        else {
          setItems((p) => p.filter((x) => x.key !== key))
          onError(r.error)
        }
      }
    },
    [onError],
  )
  const remove = (key: string) => setItems((p) => p.filter((x) => x.key !== key))
  const clear = () => setItems([])
  const ids = items.filter((x) => x.id).map((x) => x.id!)
  const busy = items.some((x) => x.busy)
  return { items, add, remove, clear, ids, busy }
}

function AttachStrip({ items, onRemove, t }: { items: Attachment[]; onRemove: (k: string) => void; t: NDict }) {
  if (items.length === 0) return null
  return (
    <div className="ff-strip">
      {items.map((a) => (
        <span key={a.key} className={`ff-thumb${a.busy ? ' is-busy' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local preview of an upload */}
          <img src={a.url} alt="" />
          <button type="button" aria-label={t.rmImg} onClick={() => onRemove(a.key)}>
            ×
          </button>
        </span>
      ))}
    </div>
  )
}

/* ── Panel ─────────────────────────────────────────────── */

type Filter = 'me' | 'all' | 'by' | 'sys' | 'done'
type AutoEntry = { key: string; severity: AttentionSeverity; title: string; detail: string; appointmentId?: string }

export function AttentionPanel({
  data,
  lang,
  onRefresh,
  onOpenAppointment,
}: {
  data: RosterData
  lang: Lang
  onRefresh: () => void | Promise<void>
  onOpenAppointment: (id: string) => void
}) {
  const t = NT[lang]
  const w = WELCOME[lang]
  const toast = useToast()
  const me = data.me
  const team = data.team
  const [filter, setFilter] = useState<Filter | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<null | { kind: 'new' } | { kind: 'edit'; note: AttentionNoteRow } | { kind: 'ask'; item: AutoEntry } | { kind: 'known'; item: AutoEntry }>(null)
  const [showAll, setShowAll] = useState(false)

  // Deep link from an alert email: /admin/workshop-roster?note=<id>
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('note')
    if (id) setOpenId(id)
  }, [])

  const auto: AutoEntry[] = useMemo(() => {
    const acks = new Set(data.attentionAcks)
    return detectAttentionItems(data)
      .filter((i) => !acks.has(i.key))
      .map((i) => {
        const p = i.params
        const text =
          i.rule === 'seat-mismatch' ? w.rule.seatMismatch(p as never) : i.rule === 'no-receipt' ? w.rule.noReceipt(p as never) : w.rule.refundOpen(p as never)
        return { key: i.key, severity: i.severity, appointmentId: i.appointmentId, ...text }
      })
  }, [data, w])

  const open = data.attentionNotes.filter((n) => n.status === 'open')
  const lists: Record<Filter, AttentionNoteRow[]> = {
    me: open.filter((n) => isForMe(n, me)),
    all: open,
    by: open.filter((n) => isByMe(n, me)),
    sys: [],
    done: data.attentionNotes.filter((n) => n.status === 'done'),
  }
  const counts: Record<Filter, number> = { me: lists.me.length, all: open.length + auto.length, by: lists.by.length, sys: auto.length, done: lists.done.length }
  const active: Filter = filter ?? (me && counts.me > 0 ? 'me' : 'all')

  const byRecency = (a: AttentionNoteRow, b: AttentionNoteRow) =>
    Number(isUnread(b, me)) - Number(isUnread(a, me)) ||
    SEV_RANK[a.severity] - SEV_RANK[b.severity] ||
    (lastMsg(b)?.at ?? b.createdAt).localeCompare(lastMsg(a)?.at ?? a.createdAt)
  const notes = [...lists[active]].sort(byRecency)
  const showAuto = active === 'all' || active === 'sys'
  const rows: React.ReactNode[] = [
    ...(showAuto ? auto.map((a) => <AutoRow key={a.key} item={a} t={t} onAsk={() => setDialog({ kind: 'ask', item: a })} onKnown={() => setDialog({ kind: 'known', item: a })} onOpenAppointment={onOpenAppointment} />) : []),
    ...notes.map((n) => <NoteRow key={n.id} note={n} me={me} team={team} lang={lang} t={t} onOpen={() => setOpenId(n.id)} />),
  ]
  const LIMIT = 6
  const visible = showAll ? rows : rows.slice(0, LIMIT)
  const openNote = data.attentionNotes.find((n) => n.id === openId) ?? null

  return (
    <section className="ff-panel" aria-labelledby="notes-title" style={{ marginBottom: 24, overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px 12px', display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h2 id="notes-title" style={{ margin: 0, fontSize: 18 }}>{t.title}</h2>
          <p className="ff-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>{t.sub}</p>
        </div>
        <button type="button" className="ff-btn is-gold" onClick={() => setDialog({ kind: 'new' })}>+ {t.add}</button>
      </div>
      <div className="ff-fchips" role="group" aria-label={t.title}>
        {(['me', 'all', 'by', 'sys', 'done'] as Filter[]).map((f) => (
          <button key={f} type="button" className="ff-fchip" aria-pressed={active === f} onClick={() => { setFilter(f); setShowAll(false) }}>
            {{ me: t.fMe, all: t.fAll, by: t.fBy, sys: t.fSys, done: t.fDone }[f]} <b>{counts[f]}</b>
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="ff-muted" style={{ margin: 0, padding: '14px 20px 20px', borderTop: '1px solid var(--ff-line)' }}>{t.empty}</p>
      ) : (
        <div>{visible}</div>
      )}
      {rows.length > LIMIT && (
        <button type="button" className="ff-more" onClick={() => setShowAll((v) => !v)}>
          {showAll ? t.showLess : t.showAll(rows.length)}
        </button>
      )}

      {openNote && (
        <ThreadDialog
          note={openNote}
          data={data}
          lang={lang}
          t={t}
          onClose={() => setOpenId(null)}
          onRefresh={onRefresh}
          onOpenAppointment={(id) => { setOpenId(null); onOpenAppointment(id) }}
          onEdit={() => { setDialog({ kind: 'edit', note: openNote }); setOpenId(null) }}
        />
      )}
      {(dialog?.kind === 'new' || dialog?.kind === 'edit' || dialog?.kind === 'ask') && (
        <NoteForm
          data={data}
          t={t}
          mode={dialog.kind}
          note={dialog.kind === 'edit' ? dialog.note : undefined}
          item={dialog.kind === 'ask' ? dialog.item : undefined}
          onClose={() => setDialog(null)}
          onDone={async (msg) => { setDialog(null); toast(msg); await onRefresh() }}
        />
      )}
      {dialog?.kind === 'known' && (
        <KnownDialog t={t} item={dialog.item} onClose={() => setDialog(null)} onDone={async () => { setDialog(null); toast(t.known2); await onRefresh() }} />
      )}
    </section>
  )
}

function personName(id: string, team: TeamMember[], t: NDict, me: string) {
  if (id === 'all') return t.everyone
  if (id && id === me) return t.you
  return team.find((m) => m.id === id)?.name ?? '?'
}

function TeamAvatar({ id, team, size = 30 }: { id: string; team: TeamMember[]; size?: number }) {
  if (id === 'all') {
    return (
      <span className="ff-av is-grp" style={{ ['--s' as string]: `${size}px` }} aria-hidden>
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></svg>
      </span>
    )
  }
  const m = team.find((x) => x.id === id)
  return <UserAvatar name={m?.name ?? '?'} url={m?.avatarUrl} size={size} />
}

function NoteRow({ note, me, team, lang, t, onOpen }: { note: AttentionNoteRow; me: string; team: TeamMember[]; lang: Lang; t: NDict; onOpen: () => void }) {
  const unread = isUnread(note, me)
  const wait = note.status === 'open' ? waitingOn(note) : ''
  const last = lastMsg(note)
  const snippet = last?.text ? (last.text.length > 110 ? `${last.text.slice(0, 110)}…` : last.text) : note.body
  return (
    <button type="button" className={`ff-nrow${unread ? ' is-unread' : ''}${note.status === 'done' ? ' is-done' : ''}`} onClick={onOpen}>
      <span className="ff-avs" aria-hidden>
        <TeamAvatar id={note.createdById} team={team} />
        {note.assignedTo && (
          <>
            <i>→</i>
            <TeamAvatar id={note.assignedTo} team={team} size={24} />
          </>
        )}
      </span>
      <span className="ff-nmain">
        <b>
          {note.title}
          {unread && <em className="ff-newb">{t.isNew}</em>}
        </b>
        {snippet && <span className="ff-snip">{last?.byName ? `${last.byName}: ` : ''}{snippet}</span>}
        <small>
          {ago(last?.at || note.createdAt, lang)}
          {note.dueDate ? ` · ${t.due(new Date(note.dueDate).toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'short' }))}` : ''}
          {last?.images.length ? ' · 📎' : ''}
        </small>
      </span>
      <span className="ff-nside">
        <span className={`ff-pill ${SEV_TONE[note.severity]}`}>{t.sev[note.severity]}</span>
        {wait && <span className="ff-wchip">{wait === 'all' ? t.waitAll : t.waitFor(personName(wait, team, t, me))}</span>}
        {note.status === 'done' && note.doneByName && <span className="ff-wchip">{t.closed(note.doneByName)}</span>}
      </span>
    </button>
  )
}

function AutoRow({ item, t, onAsk, onKnown, onOpenAppointment }: { item: AutoEntry; t: NDict; onAsk: () => void; onKnown: () => void; onOpenAppointment: (id: string) => void }) {
  return (
    <div className="ff-nrow is-sys">
      <span className="ff-avs" aria-hidden>
        <span className="ff-av is-sys" style={{ ['--s' as string]: '30px' }}>!</span>
      </span>
      <span className="ff-nmain">
        <b>{item.title}</b>
        <span className="ff-snip">{item.detail}</span>
        <small>{t.system}</small>
      </span>
      <span className="ff-nside">
        <span className={`ff-pill ${SEV_TONE[item.severity]}`}>{t.sev[item.severity]}</span>
        <span className="ff-nbtns">
          {item.appointmentId && (
            <button type="button" className="ff-btn is-sm" onClick={() => onOpenAppointment(item.appointmentId!)}>{t.openWs}</button>
          )}
          <button type="button" className="ff-btn is-sm" onClick={onAsk}>{t.ask}</button>
          <button type="button" className="ff-btn is-sm" onClick={onKnown}>{t.known}</button>
        </span>
      </span>
    </div>
  )
}

/* ── Dialogs ──────────────────────────────────────────── */

function Dlg({ label, wide, children, onClose, onDropFiles, dropLabel }: {
  label: string; wide?: boolean; children: React.ReactNode; onClose: () => void; onDropFiles?: (files: File[]) => void; dropLabel?: string
}) {
  const [dropping, setDropping] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="ff-modal" role="presentation" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className={`ff-dlg${wide ? ' is-wide' : ''}${dropping ? ' is-dropping' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-drop={dropLabel}
        onDragOver={onDropFiles ? (e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDropping(true) } } : undefined}
        onDragLeave={onDropFiles ? () => setDropping(false) : undefined}
        onDrop={onDropFiles ? (e) => { e.preventDefault(); setDropping(false); onDropFiles([...e.dataTransfer.files]) } : undefined}
      >
        {children}
      </div>
    </div>
  )
}

function ThreadDialog({ note, data, lang, t, onClose, onRefresh, onOpenAppointment, onEdit }: {
  note: AttentionNoteRow; data: RosterData; lang: Lang; t: NDict; onClose: () => void; onRefresh: () => void | Promise<void>
  onOpenAppointment: (id: string) => void; onEdit: () => void
}) {
  const toast = useToast()
  const me = data.me
  const team = data.team
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [reassignTo, setReassignTo] = useState('')
  const [zoom, setZoom] = useState<string | null>(null)
  const att = useAttachments(setErr)
  const listRef = useRef<HTMLDivElement>(null)

  // Opening the thread marks it read for me.
  useEffect(() => {
    if (isUnread(note, me)) markNoteSeen(note.id).then(() => onRefresh())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id])
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [note.messages.length])

  const appt = data.appointments.find((a) => a.id === note.appointmentId)

  const send = async () => {
    if (!text.trim() && att.ids.length === 0) return
    setBusy(true)
    setErr('')
    const r = await replyToNote({ id: note.id, text, imageIds: att.ids })
    setBusy(false)
    if (!r.ok) return setErr(r.error)
    setText('')
    att.clear()
    toast(r.data.notified.length ? t.sentTo(r.data.notified.join(', ')) : t.sent)
    await onRefresh()
  }
  const status = async (s: 'open' | 'done') => {
    setBusy(true)
    const r = await setAttentionNoteStatus(note.id, s)
    setBusy(false)
    if (!r.ok) return setErr(r.error)
    await onRefresh()
  }
  const reassign = async () => {
    if (!reassignTo) return
    setBusy(true)
    const r = await reassignNote({ id: note.id, to: reassignTo, text })
    setBusy(false)
    if (!r.ok) return setErr(r.error)
    setText('')
    setReassignTo('')
    toast(r.data.notified.length ? t.sentTo(r.data.notified.join(', ')) : t.sent)
    await onRefresh()
  }

  return (
    <Dlg label={note.title} wide onClose={onClose} onDropFiles={(f) => att.add(f)} dropLabel={t.attach}>
      <div className="ff-thead">
        <div style={{ minWidth: 0 }}>
          <h3>{note.title}</h3>
          <div className="ff-tsub">
            <span className={`ff-pill ${SEV_TONE[note.severity]}`}>{t.sev[note.severity]}</span>
            {note.dueDate && <span className="ff-wchip">{t.due(new Date(note.dueDate).toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'short' }))}</span>}
            {appt && <button type="button" className="ff-link" style={{ fontSize: 12 }} onClick={() => onOpenAppointment(appt.id)}>{appt.workshopTitle} · {appt.date}</button>}
            <button type="button" className="ff-link" style={{ fontSize: 12 }} onClick={onEdit}>{t.edit}</button>
          </div>
        </div>
        <button type="button" className="ff-btn is-sm" onClick={onClose} aria-label={t.close}>×</button>
      </div>
      <div className="ff-tpeople">
        <TeamAvatar id={note.createdById} team={team} size={26} />
        <span>{personName(note.createdById, team, t, me)}</span>
        {note.assignedTo && (
          <>
            <i>→</i>
            <TeamAvatar id={note.assignedTo} team={team} size={26} />
            <span>{personName(note.assignedTo, team, t, me)}</span>
          </>
        )}
      </div>

      <div className="ff-msgs" ref={listRef}>
        {note.body && note.messages.length === 0 && <div className="ff-msg"><div className="ff-bub">{note.body}</div></div>}
        {note.messages.map((m, i) =>
          m.event ? (
            <div key={i} className="ff-mev">
              {m.event === 'asked'
                ? t.evAsked(m.byName, personName(m.eventTo, team, t, me))
                : m.event === 'done'
                  ? t.evDone(m.byName)
                  : t.evReopen(m.byName)}{' '}
              · {ago(m.at, lang)}
            </div>
          ) : (
            <div key={i} className={`ff-msg${m.byId === me ? ' is-mine' : ''}`}>
              <TeamAvatar id={m.byId} team={team} size={30} />
              <div className="ff-mb">
                <div className="ff-mh"><b>{m.byName}</b><small>{ago(m.at, lang)}</small></div>
                {(m.text || m.images.length > 0) && (
                  <div className="ff-bub">
                    {m.text}
                    {m.images.map((img) => (
                      <button key={img.id} type="button" className="ff-mimgbtn" onClick={() => setZoom(img.url)}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- message attachment from our media store */}
                        <img className="ff-mimg" src={img.thumb} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ),
        )}
      </div>

      <div className="ff-comp">
        <textarea
          className="ff-input"
          rows={3}
          value={text}
          placeholder={t.replyPh}
          onChange={(e) => setText(e.target.value)}
          onPaste={(e) => {
            const files = [...e.clipboardData.files]
            if (files.some((f) => f.type.startsWith('image/'))) {
              e.preventDefault()
              att.add(files)
            }
          }}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send() }}
        />
        <AttachStrip items={att.items} onRemove={att.remove} t={t} />
        <div className="ff-cbar">
          <label className="ff-btn is-sm" style={{ cursor: 'pointer' }}>
            📎 {t.attach}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden onChange={(e) => { att.add([...(e.target.files ?? [])]); e.target.value = '' }} />
          </label>
          <span style={{ flex: 1 }} />
          <button type="button" className="ff-btn is-gold" onClick={send} disabled={busy || att.busy || (!text.trim() && att.ids.length === 0)}>
            {att.busy ? t.uploading : t.send}
          </button>
        </div>
        {err && <div className="ff-err">{err}</div>}
      </div>

      <div className="ff-tfoot">
        {note.status === 'open' ? (
          <button type="button" className="ff-btn" onClick={() => status('done')} disabled={busy}>✓ {t.markDone}</button>
        ) : (
          <button type="button" className="ff-btn" onClick={() => status('open')} disabled={busy}>{t.reopen}</button>
        )}
        <span className="ff-sel">
          {t.reassign}
          <select className="ff-input" value={reassignTo} onChange={(e) => setReassignTo(e.target.value)}>
            <option value="">—</option>
            {team.filter((m) => m.id !== me).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            <option value="all">{t.everyone}</option>
          </select>
          {reassignTo && <button type="button" className="ff-btn is-sm is-gold" onClick={reassign} disabled={busy}>{t.send}</button>}
        </span>
      </div>

      {zoom && (
        <div className="ff-modal" role="presentation" onClick={() => setZoom(null)} style={{ zIndex: 70, cursor: 'zoom-out' }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- full-size attachment */}
          <img src={zoom} alt="" style={{ maxWidth: '94vw', maxHeight: '90vh', borderRadius: 12 }} />
        </div>
      )}
    </Dlg>
  )
}

function NoteForm({ data, t, mode, note, item, onClose, onDone }: {
  data: RosterData; t: NDict; mode: 'new' | 'edit' | 'ask'; note?: AttentionNoteRow; item?: AutoEntry
  onClose: () => void; onDone: (msg: string) => void | Promise<void>
}) {
  const me = data.me
  const team = data.team
  const others = team.filter((m) => m.id !== me)
  const [title, setTitle] = useState(note?.title ?? item?.title ?? '')
  const [body, setBody] = useState(item?.detail ?? '')
  const [severity, setSeverity] = useState<AttentionSeverity>(note?.severity ?? item?.severity ?? 'attention')
  const [to, setTo] = useState(mode === 'ask' ? (others[0]?.id ?? 'all') : '')
  const [appointmentId, setAppointmentId] = useState(note?.appointmentId ?? item?.appointmentId ?? '')
  const [due, setDue] = useState(note?.dueDate ?? '')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const att = useAttachments(setErr)
  const upcoming = data.appointments.filter((a) => !a.isPast)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return setErr(t.titleNeed)
    setBusy(true)
    setErr('')
    if (mode === 'edit' && note) {
      const r = await updateAttentionNote(note.id, { title, severity, appointmentId, dueDate: due })
      setBusy(false)
      if (!r.ok) return setErr(r.error)
      return onDone(t.save)
    }
    const r = await createAttentionNote({
      title, body, severity, appointmentId, dueDate: due, assignedTo: to, imageIds: att.ids, fromAutoKey: item?.key,
    })
    setBusy(false)
    if (!r.ok) return setErr(r.error)
    await onDone(r.data.notified.length ? t.sentTo(r.data.notified.join(', ')) : t.posted)
  }

  const heading = mode === 'edit' ? t.editT : mode === 'ask' ? t.askT : t.addT
  return (
    <Dlg label={heading} wide onClose={onClose} onDropFiles={mode === 'edit' ? undefined : (f) => att.add(f)} dropLabel={t.attach}>
      <h3>{heading}</h3>
      {mode === 'ask' && <p className="ff-muted" style={{ marginTop: 0 }}>{t.askHint}</p>}
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        {mode !== 'edit' && (
          <label className="ff-field"><span>{mode === 'ask' ? t.askWho : t.fWho}</span>
            <select className="ff-input" value={to} onChange={(e) => setTo(e.target.value)}>
              {mode !== 'ask' && <option value="">{t.nobody}</option>}
              {others.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              <option value="all">{t.everyone}</option>
            </select>
          </label>
        )}
        <label className="ff-field"><span>{t.fTitle}</span>
          <input className="ff-input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} autoFocus={mode !== 'ask'} />
        </label>
        {mode !== 'edit' && (
          <label className="ff-field"><span>{mode === 'ask' ? t.askMsg : t.fMsg}</span>
            <textarea
              className="ff-input"
              rows={4}
              value={body}
              placeholder={t.replyPh}
              onChange={(e) => setBody(e.target.value)}
              onPaste={(e) => {
                const files = [...e.clipboardData.files]
                if (files.some((f) => f.type.startsWith('image/'))) { e.preventDefault(); att.add(files) }
              }}
            />
          </label>
        )}
        {mode !== 'edit' && (
          <>
            <AttachStrip items={att.items} onRemove={att.remove} t={t} />
            <label className="ff-btn is-sm" style={{ cursor: 'pointer', justifySelf: 'start' }}>
              📎 {t.attach}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden onChange={(e) => { att.add([...(e.target.files ?? [])]); e.target.value = '' }} />
            </label>
          </>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
          <label className="ff-field"><span>{t.fSev}</span>
            <select className="ff-input" value={severity} onChange={(e) => setSeverity(e.target.value as AttentionSeverity)}>
              {(['info', 'attention', 'urgent'] as const).map((s) => <option key={s} value={s}>{t.sev[s]}</option>)}
            </select>
          </label>
          <label className="ff-field"><span>{t.fWs}</span>
            <select className="ff-input" value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)}>
              <option value="">{t.fNoWs}</option>
              {upcoming.map((a) => <option key={a.id} value={a.id}>{a.workshopTitle} · {a.date}</option>)}
            </select>
          </label>
          <label className="ff-field"><span>{t.fDue}</span>
            <input className="ff-input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
        </div>
        {err && <div className="ff-err">{err}</div>}
        <div className="ff-acts">
          <button type="button" className="ff-btn" onClick={onClose} disabled={busy}>{t.cancel}</button>
          <button type="submit" className="ff-btn is-gold" disabled={busy || att.busy}>{att.busy ? t.uploading : mode === 'edit' ? t.save : t.send}</button>
        </div>
      </form>
    </Dlg>
  )
}

function KnownDialog({ t, item, onClose, onDone }: { t: NDict; item: AutoEntry; onClose: () => void; onDone: () => void }) {
  const [why, setWhy] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const save = async () => {
    if (!why.trim()) return setErr(t.knownNeed)
    setBusy(true)
    const r = await acknowledgeAutoItem(item.key, why)
    setBusy(false)
    if (!r.ok) return setErr(r.error)
    onDone()
  }
  return (
    <Dlg label={t.knownT} onClose={onClose}>
      <h3>{t.knownT}</h3>
      <p style={{ margin: '0 0 6px' }}><strong>{item.title}</strong></p>
      <p className="ff-muted" style={{ marginTop: 0 }}>{t.knownHint}</p>
      <label className="ff-field"><span>{t.knownWhy}</span>
        <input className="ff-input" value={why} maxLength={300} autoFocus onChange={(e) => setWhy(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} />
      </label>
      {err && <div className="ff-err" style={{ marginTop: 10 }}>{err}</div>}
      <div className="ff-acts">
        <button type="button" className="ff-btn" onClick={onClose} disabled={busy}>{t.cancel}</button>
        <button type="button" className="ff-btn is-gold" onClick={save} disabled={busy}>{t.save}</button>
      </div>
    </Dlg>
  )
}

/** "Mein Profil": own photo and email alerts. Opened from the rail. */
export function ProfileDialog({ data, lang, onClose, onRefresh }: { data: RosterData; lang: Lang; onClose: () => void; onRefresh: () => void | Promise<void> }) {
  const t = NT[lang]
  const toast = useToast()
  const meRow = data.team.find((m) => m.id === data.me)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const pick = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setErr('')
    const fd = new FormData()
    fd.append('file', file)
    const up = await uploadNoteImage(fd)
    if (!up.ok) { setBusy(false); return setErr(up.error) }
    const r = await updateMyProfile({ avatarId: up.data.id })
    setBusy(false)
    if (!r.ok) return setErr(r.error)
    toast(t.profSaved)
    await onRefresh()
  }
  const set = async (p: Parameters<typeof updateMyProfile>[0]) => {
    setBusy(true)
    const r = await updateMyProfile(p)
    setBusy(false)
    if (!r.ok) return setErr(r.error)
    toast(t.profSaved)
    await onRefresh()
  }
  return (
    <Dlg label={t.profT} onClose={onClose}>
      <h3>{t.profT}</h3>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '8px 0 6px' }}>
        <UserAvatar name={meRow?.name ?? '?'} url={meRow?.avatarUrl} size={72} />
        <div style={{ display: 'grid', gap: 8 }}>
          <label className="ff-btn is-sm" style={{ cursor: 'pointer' }}>
            {t.upload}
            <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }} />
          </label>
          {meRow?.avatarUrl && <button type="button" className="ff-btn is-sm is-danger" onClick={() => set({ avatarId: null })} disabled={busy}>{t.remove}</button>}
        </div>
      </div>
      <p className="ff-muted" style={{ fontSize: 13, marginTop: 6 }}>{t.photoHint}</p>
      {err && <div className="ff-err" style={{ marginTop: 10 }}>{err}</div>}
      <div className="ff-acts">
        <button type="button" className="ff-btn" onClick={onClose}>{t.close}</button>
      </div>
    </Dlg>
  )
}
