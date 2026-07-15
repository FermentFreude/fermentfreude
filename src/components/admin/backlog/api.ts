import type { BacklogItem } from './types'

const BASE = '/api/backlog-items'

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('unauthorized')
    throw new Error(`Request failed (${res.status})`)
  }
  return res.json()
}

export async function fetchBacklogItems(): Promise<BacklogItem[]> {
  const data = await req<{ docs: BacklogItem[] }>(`${BASE}?limit=500&depth=0&sort=itemId`)
  return data.docs
}

export async function createBacklogItem(data: Partial<BacklogItem>): Promise<BacklogItem> {
  const res = await req<{ doc: BacklogItem }>(BASE, { method: 'POST', body: JSON.stringify(data) })
  return res.doc
}

export async function updateBacklogItem(id: string, data: Partial<BacklogItem>): Promise<BacklogItem> {
  const res = await req<{ doc: BacklogItem }>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  return res.doc
}

export async function deleteBacklogItem(id: string): Promise<void> {
  await req(`${BASE}/${id}`, { method: 'DELETE' })
}
