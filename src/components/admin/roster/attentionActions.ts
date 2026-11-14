'use server'

import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { sendTransactionalEmail } from '@/lib/brevo'
import { getServerSideURL } from '@/utilities/getURL'

import type { AttentionSeverity } from './attentionTypes'
import { adminDisplayName, requireAdminUser } from './requireAdmin'

/*
 * Notes and conversations for the founders' dashboard ("Notizen").
 * Every action is admin-only (requireAdminUser at the top). Sequential writes
 * only (MongoDB Atlas M0). Email alerts go only to team members whose
 * setting allows it — and outside production only to allowlisted team
 * addresses (src/lib/emailSafety.ts).
 */

type Result<T = null> = { ok: true; data: T } | { ok: false; error: string }
type AdminUser = Awaited<ReturnType<typeof requireAdminUser>>

const SEVERITIES = ['info', 'attention', 'urgent'] as const
const MAX_IMAGES = 6
const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

function fail(e: unknown): { ok: false; error: string } {
  if (e instanceof Error && e.message === 'Unauthorized') return { ok: false, error: 'Keine Berechtigung.' }
  console.error('[attentionActions]', e)
  return { ok: false, error: e instanceof Error ? e.message : 'Konnte nicht gespeichert werden.' }
}

type StoredMessage = {
  byId?: string | null
  byName?: string | null
  at: string
  text?: string | null
  images?: string[] | null
  event?: 'asked' | 'done' | 'reopened' | null
  eventTo?: string | null
}

function plainMessages(msgs: unknown): StoredMessage[] {
  type Raw = Omit<StoredMessage, 'images'> & { images?: (string | { id: string | number })[] | null }
  return ((msgs as Raw[] | null) ?? []).map((m) => ({
    byId: m.byId ?? '',
    byName: m.byName ?? '',
    at: m.at,
    text: m.text ?? '',
    images: (m.images ?? []).map((i) => (typeof i === 'object' && i !== null ? String(i.id) : String(i))),
    event: m.event ?? null,
    eventTo: m.eventTo ?? '',
  }))
}

function seenMap(v: unknown): Record<string, number> {
  return v && typeof v === 'object' && !Array.isArray(v) ? { ...(v as Record<string, number>) } : {}
}

async function loadNote(payload: Payload, id: string) {
  return payload.findByID({ collection: 'attention-notes', id, depth: 0, overrideAccess: true })
}

async function validImageIds(payload: Payload, ids: string[] | undefined): Promise<string[]> {
  const out: string[] = []
  for (const id of (ids ?? []).slice(0, MAX_IMAGES)) {
    try {
      const m = await payload.findByID({ collection: 'media', id, depth: 0, overrideAccess: true })
      if (m) out.push(String(m.id))
    } catch {
      /* skip unknown ids */
    }
  }
  return out
}

/** Email the people a note concerns, if their alert setting allows it. Never the sender. */
async function alertTeam(
  payload: Payload,
  opts: { noteId: string; title: string; severity: string; to: string; senderId: string; senderName: string; text: string },
): Promise<string[]> {
  const team = await payload.find({
    collection: 'users',
    where: { roles: { contains: 'admin' } },
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })
  const targets = team.docs.filter((u) => {
    const id = String(u.id)
    if (id === opts.senderId) return false
    if (opts.to !== 'all' && opts.to !== id) return false
    const pref = (u as { noteEmailPref?: string | null }).noteEmailPref ?? 'all'
    return pref === 'all' || (pref === 'urgent' && opts.severity === 'urgent')
  })
  const link = `${getServerSideURL().replace(/\/$/, '')}/admin/workshop-roster?note=${encodeURIComponent(opts.noteId)}`
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const notified: string[] = []
  for (const u of targets) {
    if (!u.email) continue
    const html = `<!doctype html><html lang="de"><body style="margin:0;background:#F5F3EE;font-family:Helvetica,Arial,sans-serif;color:#2A2C28">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#7A540C;margin:0 0 8px">Fermentfreude Dashboard</p>
<h1 style="font-size:22px;margin:0 0 16px">${esc(opts.title)}</h1>
<p style="margin:0 0 6px;color:#6F726B">${esc(opts.senderName)} schreibt:</p>
<div style="background:#fff;border:1px solid #E6E2D7;border-radius:12px;padding:14px 16px;white-space:pre-wrap">${esc(opts.text || '(ohne Text)')}</div>
<p style="margin:24px 0"><a href="${link}" style="background:#E6BE68;color:#2A2C28;text-decoration:none;font-weight:700;padding:11px 18px;border-radius:10px;display:inline-block">Im Dashboard öffnen</a></p>
<p style="font-size:12px;color:#6F726B">Diese Hinweise kannst du im Dashboard unter deinem Profil ausschalten.</p>
</div></body></html>`
    const r = await sendTransactionalEmail({
      to: [{ email: u.email, name: (u as { name?: string | null }).name ?? undefined }],
      subject: `${opts.severity === 'urgent' ? 'Dringend: ' : ''}${opts.title} — Notiz im Dashboard`,
      htmlContent: html,
    })
    if (r.success && !r.blocked) notified.push((u as { name?: string | null }).name || u.email)
  }
  return notified
}

export type NoteInput = {
  title: string
  body?: string
  severity: AttentionSeverity
  appointmentId?: string
  dueDate?: string
  /** user id, 'all' or '' */
  assignedTo?: string
  imageIds?: string[]
  notify?: boolean
  /** When the note grows out of an automatic item: that item's key (it is then hidden). */
  fromAutoKey?: string
}

function cleanMeta(input: NoteInput) {
  const title = input.title.trim()
  if (!title) throw new Error('Bitte einen Titel angeben.')
  return {
    title: title.slice(0, 200),
    severity: (SEVERITIES as readonly string[]).includes(input.severity) ? input.severity : 'attention',
    appointmentId: (input.appointmentId ?? '').trim(),
    dueDate: input.dueDate ? new Date(input.dueDate).toISOString() : null,
  }
}

export async function createAttentionNote(input: NoteInput): Promise<Result<{ id: string; notified: string[] }>> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    const me = String(user.id)
    const meta = cleanMeta(input)
    const text = (input.body ?? '').trim().slice(0, 4000)
    const images = await validImageIds(payload, input.imageIds)
    const to = (input.assignedTo ?? '').trim()
    const now = new Date().toISOString()
    const messages: StoredMessage[] = []
    if (text || images.length) messages.push({ byId: me, byName: adminDisplayName(user), at: now, text, images })
    if (to) messages.push({ byId: me, byName: adminDisplayName(user), at: now, event: 'asked', eventTo: to })
    const doc = await payload.create({
      collection: 'attention-notes',
      data: {
        kind: 'note',
        status: 'open',
        ...meta,
        body: text,
        createdByName: adminDisplayName(user),
        createdById: me,
        assignedTo: to,
        messages,
        seenBy: { [me]: messages.length },
      },
      overrideAccess: true,
    })
    if (input.fromAutoKey) await ackKey(payload, user, input.fromAutoKey, `Ins Gespräch übernommen: ${meta.title}`)
    const notified =
      input.notify && to
        ? await alertTeam(payload, {
            noteId: String(doc.id), title: meta.title, severity: meta.severity, to, senderId: me,
            senderName: adminDisplayName(user), text,
          })
        : []
    return { ok: true, data: { id: String(doc.id), notified } }
  } catch (e) {
    return fail(e)
  }
}

export async function updateAttentionNote(id: string, input: NoteInput): Promise<Result> {
  try {
    const payload = await getPayload({ config: configPromise })
    await requireAdminUser(payload)
    await payload.update({ collection: 'attention-notes', id, data: cleanMeta(input), overrideAccess: true })
    return { ok: true, data: null }
  } catch (e) {
    return fail(e)
  }
}

export async function replyToNote(params: {
  id: string
  text: string
  imageIds?: string[]
  notify?: boolean
}): Promise<Result<{ notified: string[] }>> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    const me = String(user.id)
    const text = params.text.trim().slice(0, 4000)
    const images = await validImageIds(payload, params.imageIds)
    if (!text && images.length === 0) return { ok: false, error: 'Bitte etwas schreiben oder ein Bild anhängen.' }
    const note = await loadNote(payload, params.id)
    const messages = plainMessages(note.messages)
    messages.push({ byId: me, byName: adminDisplayName(user), at: new Date().toISOString(), text, images })
    const seen = seenMap(note.seenBy)
    seen[me] = messages.length
    // A reply on a done note reopens it — the conversation is clearly not over.
    const reopen = note.status === 'done'
    await payload.update({
      collection: 'attention-notes',
      id: params.id,
      data: { messages, seenBy: seen, ...(reopen ? { status: 'open', doneByName: '', doneAt: null } : {}) },
      overrideAccess: true,
    })
    // Who should hear about it: the asked person, or — if they answered — the one who asked.
    const asked = note.assignedTo ?? ''
    const target = asked === 'all' ? 'all' : asked && asked !== me ? asked : (note.createdById ?? '')
    const notified =
      params.notify && target && target !== me
        ? await alertTeam(payload, {
            noteId: params.id, title: note.title ?? 'Notiz', severity: note.severity ?? 'attention', to: target,
            senderId: me, senderName: adminDisplayName(user), text,
          })
        : []
    return { ok: true, data: { notified } }
  } catch (e) {
    return fail(e)
  }
}

export async function reassignNote(params: { id: string; to: string; text?: string; notify?: boolean }): Promise<Result<{ notified: string[] }>> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    const me = String(user.id)
    const note = await loadNote(payload, params.id)
    const messages = plainMessages(note.messages)
    const now = new Date().toISOString()
    const text = (params.text ?? '').trim().slice(0, 4000)
    if (text) messages.push({ byId: me, byName: adminDisplayName(user), at: now, text })
    messages.push({ byId: me, byName: adminDisplayName(user), at: now, event: 'asked', eventTo: params.to })
    const seen = seenMap(note.seenBy)
    seen[me] = messages.length
    await payload.update({
      collection: 'attention-notes',
      id: params.id,
      data: { assignedTo: params.to, messages, seenBy: seen, status: 'open', doneByName: '', doneAt: null },
      overrideAccess: true,
    })
    const notified = params.notify
      ? await alertTeam(payload, {
          noteId: params.id, title: note.title ?? 'Notiz', severity: note.severity ?? 'attention', to: params.to,
          senderId: me, senderName: adminDisplayName(user), text,
        })
      : []
    return { ok: true, data: { notified } }
  } catch (e) {
    return fail(e)
  }
}

export async function setAttentionNoteStatus(id: string, status: 'open' | 'done'): Promise<Result> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    const me = String(user.id)
    const note = await loadNote(payload, id)
    const messages = plainMessages(note.messages)
    messages.push({ byId: me, byName: adminDisplayName(user), at: new Date().toISOString(), event: status === 'done' ? 'done' : 'reopened' })
    const seen = seenMap(note.seenBy)
    seen[me] = messages.length
    await payload.update({
      collection: 'attention-notes',
      id,
      data: {
        messages,
        seenBy: seen,
        ...(status === 'done'
          ? { status, doneByName: adminDisplayName(user), doneAt: new Date().toISOString() }
          : { status, doneByName: '', doneAt: null }),
      },
      overrideAccess: true,
    })
    return { ok: true, data: null }
  } catch (e) {
    return fail(e)
  }
}

/** Opening a thread marks everything in it as read for the current user. */
export async function markNoteSeen(id: string): Promise<Result> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    const note = await loadNote(payload, id)
    const count = (note.messages ?? []).length
    const seen = seenMap(note.seenBy)
    if (seen[String(user.id)] === count) return { ok: true, data: null }
    seen[String(user.id)] = count
    await payload.update({ collection: 'attention-notes', id, data: { seenBy: seen }, overrideAccess: true })
    return { ok: true, data: null }
  } catch (e) {
    return fail(e)
  }
}

async function ackKey(payload: Payload, user: AdminUser, autoKey: string, reason: string) {
  const key = autoKey.trim().slice(0, 300)
  if (!key) throw new Error('Missing key')
  const existing = await payload.find({
    collection: 'attention-notes',
    where: { and: [{ kind: { equals: 'ack' } }, { autoKey: { equals: key } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.docs.length === 0) {
    await payload.create({
      collection: 'attention-notes',
      data: { kind: 'ack', autoKey: key, title: key, ackReason: reason.slice(0, 300), createdByName: adminDisplayName(user), createdById: String(user.id) },
      overrideAccess: true,
    })
  }
}

/** "Known" for an automatically detected item, with a short reason. Reappears if the numbers change (key changes). */
export async function acknowledgeAutoItem(autoKey: string, reason = ''): Promise<Result> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    await ackKey(payload, user, autoKey, reason.trim())
    return { ok: true, data: null }
  } catch (e) {
    return fail(e)
  }
}

/** Screenshot / photo for a message. Stored in Media (R2) like every other image. */
export async function uploadNoteImage(form: FormData): Promise<Result<{ id: string; url: string }>> {
  try {
    const payload = await getPayload({ config: configPromise })
    await requireAdminUser(payload)
    const file = form.get('file')
    if (!(file instanceof File)) return { ok: false, error: 'Keine Datei.' }
    if (!IMAGE_TYPES.includes(file.type)) return { ok: false, error: 'Bitte ein Bild (PNG, JPG, WebP oder GIF).' }
    if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: 'Das Bild ist größer als 8 MB.' }
    const ext = file.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'png'
    const doc = await payload.create({
      collection: 'media',
      data: { alt: 'Bild aus einer Dashboard-Notiz' },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type,
        name: `notiz-${Date.now()}.${ext}`,
        size: file.size,
      },
      overrideAccess: true,
      context: { skipAutoTranslate: true },
    })
    const d = doc as unknown as { id: string | number; url?: string | null; sizes?: { thumbnail?: { url?: string | null } } }
    return { ok: true, data: { id: String(d.id), url: d.sizes?.thumbnail?.url || d.url || '' } }
  } catch (e) {
    return fail(e)
  }
}

/** Own profile: photo and email alerts. Only ever the logged-in admin's own account. */
export async function updateMyProfile(params: {
  avatarId?: string | null
  emailPref?: 'all' | 'urgent' | 'off'
}): Promise<Result> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdminUser(payload)
    const data: Record<string, unknown> = {}
    if (params.avatarId !== undefined) {
      data.avatar = params.avatarId ? (await validImageIds(payload, [params.avatarId]))[0] ?? null : null
    }
    if (params.emailPref && ['all', 'urgent', 'off'].includes(params.emailPref)) data.noteEmailPref = params.emailPref
    if (Object.keys(data).length === 0) return { ok: true, data: null }
    await payload.update({
      collection: 'users',
      id: user.id,
      data,
      overrideAccess: true,
      context: { skipAutoTranslate: true },
    })
    return { ok: true, data: null }
  } catch (e) {
    return fail(e)
  }
}
