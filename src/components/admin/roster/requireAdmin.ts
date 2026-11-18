import { headers as getHeaders } from 'next/headers.js'
import type { Payload } from 'payload'

/**
 * Admin gate for Server Actions and API routes.
 *
 * Server Actions are network-callable regardless of which page renders the
 * button, so every mutating action calls this at the top (CLAUDE.md →
 * Security). Same rule as /api/admin/roster/route.ts.
 */
export function isAdminUser(user: unknown): boolean {
  if (!user || typeof user !== 'object') return false
  const u = user as { role?: string; roles?: string[]; admin?: unknown }
  return u.role === 'admin' || (Array.isArray(u.roles) && u.roles.includes('admin')) || u.admin === true
}

export async function requireAdminUser(payload: Payload, headers?: Headers) {
  const { user } = await payload.auth({ headers: headers ?? (await getHeaders()) })
  if (!user || !isAdminUser(user)) throw new Error('Unauthorized')
  return user
}

/** How an admin is named in history entries and conversations. */
export function adminDisplayName(user: { email?: string | null; name?: unknown; firstName?: unknown }): string {
  const first = typeof user.firstName === 'string' ? user.firstName.trim() : ''
  const name = typeof user.name === 'string' ? user.name.trim() : ''
  return first || name || user.email || 'Admin'
}
