'use server'

import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'

import type { AttentionSeverity } from './attentionTypes'

type Result = { ok: true } | { ok: false; error: string }

async function requireAdmin(payload: Payload) {
  const { user } = await payload.auth({ headers: await getHeaders() })
  const u = user as { role?: string; roles?: string[]; email?: string | null; name?: unknown } | null
  const isAdmin = u?.role === 'admin' || u?.roles?.includes('admin') || (user as Record<string, unknown> | null)?.['admin'] === true
  if (!user || !isAdmin) throw new Error('Unauthorized')
  return u as NonNullable<typeof u>
}

const who = (u: { email?: string | null; name?: unknown }) =>
  (typeof u.name === 'string' && u.name.trim()) || u.email || 'Admin'

export type NoteInput = {
  title: string
  body?: string
  severity: AttentionSeverity
  appointmentId?: string
  dueDate?: string
}

function clean(input: NoteInput) {
  const title = input.title.trim()
  if (!title) throw new Error('Title is required')
  return {
    title: title.slice(0, 200),
    body: (input.body ?? '').trim().slice(0, 4000),
    severity: (['info', 'attention', 'urgent'] as const).includes(input.severity) ? input.severity : 'attention',
    appointmentId: (input.appointmentId ?? '').trim(),
    dueDate: input.dueDate ? new Date(input.dueDate).toISOString() : null,
  }
}

export async function createAttentionNote(input: NoteInput): Promise<Result> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdmin(payload)
    await payload.create({
      collection: 'attention-notes',
      data: { kind: 'note', status: 'open', ...clean(input), createdByName: who(user) },
      overrideAccess: true,
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save' }
  }
}

export async function updateAttentionNote(id: string, input: NoteInput): Promise<Result> {
  try {
    const payload = await getPayload({ config: configPromise })
    await requireAdmin(payload)
    await payload.update({ collection: 'attention-notes', id, data: clean(input), overrideAccess: true })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save' }
  }
}

export async function setAttentionNoteStatus(id: string, status: 'open' | 'done'): Promise<Result> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdmin(payload)
    await payload.update({
      collection: 'attention-notes',
      id,
      data:
        status === 'done'
          ? { status, doneByName: who(user), doneAt: new Date().toISOString() }
          : { status, doneByName: '', doneAt: null },
      overrideAccess: true,
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save' }
  }
}

/** "Known, ignore" for an automatically detected item. Reappears if the underlying numbers change (key changes). */
export async function acknowledgeAutoItem(autoKey: string): Promise<Result> {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await requireAdmin(payload)
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
        data: { kind: 'ack', autoKey: key, title: key, createdByName: who(user) },
        overrideAccess: true,
      })
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save' }
  }
}
