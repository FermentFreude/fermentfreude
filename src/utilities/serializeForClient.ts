/** Strip non-serializable values (Date, etc.) before passing props to client components. */
export function serializeForClient<T>(value: T): T {
  if (value === undefined || value === null) return value

  try {
    const serialized = JSON.stringify(value)
    // JSON.stringify(undefined) returns undefined (not a string)
    if (serialized === undefined) return value
    return JSON.parse(serialized) as T
  } catch {
    return value
  }
}
