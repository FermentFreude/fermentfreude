/** MongoDB ObjectId — 24 hex characters. */
export function isValidObjectId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value)
}

/** Drop relationship IDs Payload/Mongo cannot populate (stale or block ids). */
export function filterValidObjectIds(values: unknown[]): string[] {
  return values.filter(isValidObjectId)
}
