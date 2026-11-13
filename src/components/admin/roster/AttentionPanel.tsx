'use client'

import React, { useMemo, useState, useTransition } from 'react'

import {
  acknowledgeAutoItem,
  createAttentionNote,
  setAttentionNoteStatus,
  updateAttentionNote,
  type NoteInput,
} from './attentionActions'
import type { AttentionNoteRow, AttentionSeverity } from './attentionTypes'
import { detectAttentionItems } from './autoAttention'
import { WELCOME, type Lang } from './rosterI18n'
import { BRAND, STATUS } from './rosterTheme'
import type { RosterData } from './types'

const SEV_TONE: Record<AttentionSeverity, keyof typeof STATUS> = { info: 'info', attention: 'warning', urgent: 'danger' }
const SEV_RANK: Record<AttentionSeverity, number> = { urgent: 0, attention: 1, info: 2 }

type Entry =
  | { type: 'auto'; key: string; severity: AttentionSeverity; title: string; detail: string; appointmentId?: string }
  | { type: 'note'; note: AttentionNoteRow }

const ghost: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  background: 'var(--theme-elevation-0)',
  color: 'var(--theme-text)',
  borderRadius: '8px',
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
}
const field: React.CSSProperties = {
  width: '100%',
  padding: '9px 10px',
  borderRadius: '8px',
  border: '1px solid var(--theme-elevation-150)',
  background: 'var(--theme-elevation-0)',
  color: 'var(--theme-text)',
  fontSize: '14px',
}

export function useAttentionCount(data: RosterData): number {
  return useMemo(() => {
    const acks = new Set(data.attentionAcks)
    return detectAttentionItems(data).filter((i) => !acks.has(i.key)).length + data.attentionNotes.filter((n) => n.status === 'open').length
  }, [data])
}

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
  const t = WELCOME[lang]
  const [editing, setEditing] = useState<AttentionNoteRow | 'new' | null>(null)
  const [showDone, setShowDone] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const entries: Entry[] = useMemo(() => {
    const acks = new Set(data.attentionAcks)
    const auto: Entry[] = detectAttentionItems(data)
      .filter((i) => !acks.has(i.key))
      .map((i) => {
        const p = i.params
        const text =
          i.rule === 'seat-mismatch'
            ? t.rule.seatMismatch(p as never)
            : i.rule === 'no-receipt'
              ? t.rule.noReceipt(p as never)
              : t.rule.refundOpen(p as never)
        return { type: 'auto' as const, key: i.key, severity: i.severity, appointmentId: i.appointmentId, ...text }
      })
    const notes: Entry[] = data.attentionNotes.filter((n) => n.status === 'open').map((note) => ({ type: 'note' as const, note }))
    const sev = (e: Entry) => (e.type === 'auto' ? e.severity : e.note.severity)
    return [...auto, ...notes].sort((a, b) => SEV_RANK[sev(a)] - SEV_RANK[sev(b)])
  }, [data, t])

  const doneNotes = data.attentionNotes.filter((n) => n.status === 'done')

  const run = (fn: () => Promise<{ ok: boolean; error?: string } | { ok: true } | { ok: false; error: string }>) => {
    setError('')
    startTransition(async () => {
      const r = await fn()
      if (!r.ok) setError((r as { error: string }).error)
      else await onRefresh()
    })
  }

  const apptLabel = (id: string) => {
    const a = data.appointments.find((x) => x.id === id)
    return a ? `${a.workshopTitle}, ${a.date}` : ''
  }

  return (
    <section
      aria-labelledby="attention-title"
      style={{
        background: 'var(--theme-elevation-0)',
        borderRadius: '14px',
        border: '1px solid var(--theme-elevation-100)',
        marginBottom: '24px',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '18px 24px', display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap', borderBottom: '1px solid var(--theme-elevation-100)' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <h2 id="attention-title" style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--theme-text)' }}>
            {t.attentionTitle}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--theme-text)', opacity: 0.55 }}>{t.attentionSub}</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          style={{ ...ghost, background: BRAND.gold, borderColor: BRAND.gold, color: BRAND.nearBlack }}
        >
          {t.addNote}
        </button>
      </div>

      {error && <p role="alert" style={{ margin: 0, padding: '10px 24px', background: STATUS.danger.bg, color: STATUS.danger.color }}>{error}</p>}

      {editing && (
        <NoteForm
          key={editing === 'new' ? 'new' : editing.id}
          lang={lang}
          note={editing === 'new' ? null : editing}
          data={data}
          busy={pending}
          onCancel={() => setEditing(null)}
          onSave={(input) =>
            run(async () => {
              const r = editing === 'new' ? await createAttentionNote(input) : await updateAttentionNote(editing.id, input)
              if (r.ok) setEditing(null)
              return r
            })
          }
        />
      )}

      {entries.length === 0 && !editing && (
        <p style={{ margin: 0, padding: '20px 24px', color: 'var(--theme-text)', opacity: 0.55 }}>{t.empty}</p>
      )}

      {entries.map((e) => {
        const sev = e.type === 'auto' ? e.severity : e.note.severity
        const tone = STATUS[SEV_TONE[sev]]
        const title = e.type === 'auto' ? e.title : e.note.title
        const detail = e.type === 'auto' ? e.detail : e.note.body
        const apptId = e.type === 'auto' ? e.appointmentId : e.note.appointmentId
        return (
          <div
            key={e.type === 'auto' ? e.key : e.note.id}
            style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap', padding: '14px 24px', borderTop: '1px solid var(--theme-elevation-100)' }}
          >
            <span style={{ padding: '2px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: tone.bg, color: tone.color, marginTop: '2px' }}>
              {t.sev[sev]}
            </span>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--theme-text)' }}>{title}</p>
              {detail && <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--theme-text)', opacity: 0.7, whiteSpace: 'pre-wrap' }}>{detail}</p>}
              <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'var(--theme-text)', opacity: 0.5 }}>
                {e.type === 'auto' ? t.system : t.by(e.note.createdByName || 'Admin')}
                {e.type === 'note' && apptId && apptLabel(apptId) ? ` · ${apptLabel(apptId)}` : ''}
                {e.type === 'note' && e.note.dueDate ? ` · ${t.due(e.note.dueDate)}` : ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {apptId && (
                <button type="button" style={ghost} onClick={() => onOpenAppointment(apptId)}>
                  {t.open}
                </button>
              )}
              {e.type === 'note' ? (
                <>
                  <button type="button" style={ghost} onClick={() => setEditing(e.note)}>{t.edit}</button>
                  <button type="button" style={ghost} disabled={pending} onClick={() => run(() => setAttentionNoteStatus(e.note.id, 'done'))}>{t.done}</button>
                </>
              ) : (
                <button type="button" style={ghost} disabled={pending} title={t.acknowledgeHint} onClick={() => run(() => acknowledgeAutoItem(e.key))}>
                  {t.acknowledge}
                </button>
              )}
            </div>
          </div>
        )
      })}

      {doneNotes.length > 0 && (
        <div style={{ borderTop: '1px solid var(--theme-elevation-100)', padding: '10px 24px' }}>
          <button type="button" style={{ ...ghost, border: 'none', padding: '4px 0', opacity: 0.7 }} onClick={() => setShowDone((v) => !v)} aria-expanded={showDone}>
            {showDone ? t.hideDone : t.showDone(doneNotes.length)}
          </button>
          {showDone &&
            doneNotes.map((n) => (
              <div key={n.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', padding: '8px 0', opacity: 0.7 }}>
                <span style={{ flex: 1, minWidth: '180px', textDecoration: 'line-through', color: 'var(--theme-text)' }}>{n.title}</span>
                <span style={{ fontSize: '12px', color: 'var(--theme-text)' }}>{t.doneBy(n.doneByName || 'Admin')}</span>
                <button type="button" style={ghost} disabled={pending} onClick={() => run(() => setAttentionNoteStatus(n.id, 'open'))}>{t.reopen}</button>
              </div>
            ))}
        </div>
      )}
    </section>
  )
}

function NoteForm({
  lang,
  note,
  data,
  busy,
  onSave,
  onCancel,
}: {
  lang: Lang
  note: AttentionNoteRow | null
  data: RosterData
  busy: boolean
  onSave: (input: NoteInput) => void
  onCancel: () => void
}) {
  const t = WELCOME[lang]
  const [title, setTitle] = useState(note?.title ?? '')
  const [body, setBody] = useState(note?.body ?? '')
  const [severity, setSeverity] = useState<AttentionSeverity>(note?.severity ?? 'attention')
  const [appointmentId, setAppointmentId] = useState(note?.appointmentId ?? '')
  const [dueDate, setDueDate] = useState(note?.dueDate ?? '')
  const [err, setErr] = useState('')
  const label: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, margin: '0 0 4px', color: 'var(--theme-text)', opacity: 0.7 }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!title.trim()) return setErr(t.titleRequired)
        setErr('')
        onSave({ title, body, severity, appointmentId, dueDate })
      }}
      style={{ padding: '18px 24px', background: 'var(--theme-elevation-50)', display: 'grid', gap: '12px' }}
    >
      <strong style={{ color: 'var(--theme-text)' }}>{note ? t.formEdit : t.formNew}</strong>
      <div>
        <label htmlFor="an-title" style={label}>{t.fTitle}</label>
        <input id="an-title" style={field} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        {err && <span role="alert" style={{ color: STATUS.danger.color, fontSize: '12px' }}>{err}</span>}
      </div>
      <div>
        <label htmlFor="an-body" style={label}>{t.fNote}</label>
        <textarea id="an-body" style={{ ...field, minHeight: '70px' }} value={body} onChange={(e) => setBody(e.target.value)} maxLength={4000} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div>
          <label htmlFor="an-sev" style={label}>{t.fSeverity}</label>
          <select id="an-sev" style={field} value={severity} onChange={(e) => setSeverity(e.target.value as AttentionSeverity)}>
            {(['info', 'attention', 'urgent'] as const).map((s) => <option key={s} value={s}>{t.sev[s]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="an-appt" style={label}>{t.fWorkshop}</label>
          <select id="an-appt" style={field} value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)}>
            <option value="">{t.fNoWorkshop}</option>
            {data.appointments.filter((a) => !a.isPast).map((a) => <option key={a.id} value={a.id}>{a.date} · {a.workshopTitle}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="an-due" style={label}>{t.fDue}</label>
          <input id="an-due" type="date" style={field} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" disabled={busy} style={{ ...ghost, background: BRAND.gold, borderColor: BRAND.gold, color: BRAND.nearBlack }}>
          {busy ? t.saving : t.save}
        </button>
        <button type="button" style={ghost} onClick={onCancel}>{t.cancel}</button>
      </div>
    </form>
  )
}
