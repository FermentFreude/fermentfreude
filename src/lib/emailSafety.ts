/**
 * Email safety net — outside production, Brevo only ever reaches the team.
 *
 * Why: localhost and staging use the staging database, which still contains a
 * few real customer accounts (users collection), and the Brevo account is
 * shared with production. Without this guard a test booking, a password reset
 * or a dashboard test could email a real customer.
 *
 * Rule: email goes out to anyone ONLY when this is the production deployment
 * (VERCEL_ENV === 'production') AND the database is not the staging one.
 * Everywhere else (localhost, staging, preview, scripts) only allowlisted
 * addresses receive mail; everybody else is dropped and logged.
 *
 * Allowlist = every @fermentfreude.at / @fermentfreude.de address
 *           + ADMIN_NOTIFICATION_EMAIL (team inboxes)
 *           + EMAIL_TEST_ALLOWLIST (comma-separated, e.g. a personal test inbox)
 *
 * There is deliberately no "turn this off" switch for non-production.
 */

const TEAM_DOMAINS = ['fermentfreude.at', 'fermentfreude.de']

function splitList(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.includes('@'))
}

/** True only on the real production deployment talking to the production database. */
export function isLiveEmailEnvironment(): boolean {
  if (process.env.VERCEL_ENV !== 'production') return false
  const db = process.env.DATABASE_URL ?? ''
  if (db.includes('fermentfreude-staging')) return false
  return true
}

export function testAllowlist(): string[] {
  return [
    ...splitList(process.env.ADMIN_NOTIFICATION_EMAIL),
    ...splitList(process.env.EMAIL_TEST_ALLOWLIST),
  ]
}

export function isAllowedTestRecipient(email: string): boolean {
  const e = email.trim().toLowerCase()
  const domain = e.split('@')[1] ?? ''
  if (TEAM_DOMAINS.includes(domain)) return true
  return testAllowlist().includes(e)
}

/**
 * Filters a recipient list. In production returns it unchanged.
 * Elsewhere keeps only allowlisted recipients and logs who was blocked.
 */
export function filterRecipients<T extends { email: string }>(
  to: T[],
  context: string,
): { allowed: T[]; blocked: string[] } {
  if (isLiveEmailEnvironment()) return { allowed: to, blocked: [] }
  const allowed: T[] = []
  const blocked: string[] = []
  for (const r of to) {
    if (isAllowedTestRecipient(r.email)) allowed.push(r)
    else blocked.push(r.email)
  }
  if (blocked.length > 0) {
    console.warn(
      `[Email safety] Not production — blocked ${blocked.length} recipient(s) for ${context}. ` +
        'Add a test inbox to EMAIL_TEST_ALLOWLIST to receive it.',
    )
  }
  return { allowed, blocked }
}
