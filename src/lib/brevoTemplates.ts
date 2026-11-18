/**
 * Server-side Brevo template API (read, update, test copies).
 * Only used by the dashboard's E-Mails tab, always behind requireAdminUser().
 */
import { createHash } from 'node:crypto'

import { getBrevoApiKey } from './brevo'

const API = 'https://api.brevo.com/v3/smtp/templates'

export type BrevoTemplate = {
  id: number
  name: string
  subject: string
  htmlContent: string
  isActive: boolean
  modifiedAt: string
  sender?: { name?: string; email?: string }
  replyTo?: string
  tag?: string
}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const key = getBrevoApiKey()
  if (!key) throw new Error('BREVO_API_KEY fehlt.')
  const res = await fetch(url, {
    ...init,
    headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': key, ...(init?.headers ?? {}) },
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`[Brevo templates] ${init?.method ?? 'GET'} ${url} → ${res.status}: ${body}`)
    throw new Error(`Brevo hat die Anfrage abgelehnt (${res.status}).`)
  }
  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export async function listBrevoTemplates(): Promise<BrevoTemplate[]> {
  const out: BrevoTemplate[] = []
  for (let offset = 0; offset < 2000; offset += 500) {
    const page = await call<{ templates?: BrevoTemplate[]; count?: number }>(`${API}?limit=500&offset=${offset}&sort=desc`)
    out.push(...(page.templates ?? []))
    if (!page.templates || page.templates.length < 500) break
  }
  return out
}

export function getBrevoTemplate(id: number): Promise<BrevoTemplate> {
  return call<BrevoTemplate>(`${API}/${id}`)
}

export async function updateBrevoTemplate(id: number, data: { subject: string; htmlContent: string }): Promise<void> {
  await call(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function createBrevoTemplate(data: {
  templateName: string
  subject: string
  htmlContent: string
  sender: { name?: string; email?: string }
  replyTo?: string
  isActive: boolean
}): Promise<number> {
  const r = await call<{ id: number }>(API, { method: 'POST', body: JSON.stringify(data) })
  return r.id
}

export async function deleteBrevoTemplate(id: number): Promise<void> {
  await call(`${API}/${id}`, { method: 'DELETE' })
}

/** Version token: changes whenever subject or HTML changes in Brevo. */
export function templateHash(t: { subject: string; htmlContent: string }): string {
  return createHash('sha256').update(t.subject).update('\u0000').update(t.htmlContent).digest('hex').slice(0, 24)
}
