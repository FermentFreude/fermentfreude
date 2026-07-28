/** MongoDB ObjectId — 24 hex characters. */
export function isValidObjectId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value)
}

/** Normalize BSON ObjectId / string refs to a 24-char hex id. */
export function objectIdToString(value: unknown): string | null {
  if (isValidObjectId(value)) return value
  if (value && typeof value === 'object') {
    const record = value as { toHexString?: () => string; id?: unknown }
    if (typeof record.toHexString === 'function') {
      const hex = record.toHexString()
      if (isValidObjectId(hex)) return hex
    }
    // Relationship stub `{ id }` only — not Payload array rows `{ id, text, … }`.
    if (isValidObjectId(record.id)) {
      const keys = Object.keys(record as object)
      if (keys.length === 1 && keys[0] === 'id') return record.id as string
    }
    const asString = String(value)
    if (isValidObjectId(asString)) return asString
  }
  return null
}

/** True when value is a bare media/relationship id ref (not a CMS row with an `id` field). */
export function isObjectIdRef(value: unknown): boolean {
  if (isValidObjectId(value)) return true
  if (value && typeof value === 'object') {
    const record = value as { toHexString?: () => string }
    if (typeof record.toHexString === 'function') {
      return isValidObjectId(record.toHexString())
    }
  }
  return false
}

/** Drop relationship IDs Payload/Mongo cannot populate (stale or block ids). */
export function filterValidObjectIds(values: unknown[]): string[] {
  return values.filter(isValidObjectId)
}
