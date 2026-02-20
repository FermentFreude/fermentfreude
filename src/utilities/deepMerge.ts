/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item))
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function deepMerge<T, R>(target: T, source: R): T & R {
  const output = { ...target } as Record<string, unknown>
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in (target as Record<string, unknown>))) {
          Object.assign(output, { [key]: source[key] })
        } else {
          output[key] = deepMerge(
            (target as Record<string, unknown>)[key] as Record<string, unknown>,
            source[key] as Record<string, unknown>,
          )
        }
      } else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }

  return output as T & R
}
