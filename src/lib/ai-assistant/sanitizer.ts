const BLOCKED_FIELDS = [
  'password',
  'passwordHash',
  'salt',
  'apiKeys',
  'tokens',
  'secrets',
  'privateKeys',
  'stripeSecretKey',
  'stripePublishableKey',
  'emailPassword',
  'smtpPassword',
  'webhookSecret',
]

/**
 * Recursively remove sensitive fields from data before sending to AI.
 */
export function sanitizeData(data: unknown): unknown {
  if (data === null || data === undefined) return data
  if (typeof data !== 'object') return data

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item))
  }

  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    // Block specific field names
    if (BLOCKED_FIELDS.includes(key)) continue

    // Block fields matching sensitive patterns
    if (/password|secret|key|token|hash|salt/i.test(key)) continue

    // Block Payload internal fields (except _status)
    if (key.startsWith('_') && key !== '_status') continue

    sanitized[key] = sanitizeData(value)
  }

  return sanitized
}
