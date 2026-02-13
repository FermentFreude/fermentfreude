import type { CollectionAfterChangeHook, Field } from 'payload'

import { translateBatchToEnglish } from '@/utilities/translate'

/**
 * Generic auto-translate hook for collections.
 * Walks all localized text fields and translates DE → EN via DeepL.
 * Only fills in EN translations if they are empty or identical to DE.
 *
 * Usage: Add to `hooks.afterChange` on any collection with localized fields.
 */
export const autoTranslateCollection: CollectionAfterChangeHook = async ({
  doc,
  collection,
  req,
}) => {
  const { payload, locale, context } = req

  // Only run when saving in German (default locale)
  if (locale !== 'de' && locale !== undefined) return doc
  if (context?.skipAutoTranslate) return doc
  if (!process.env.DEEPL_API_KEY) return doc

  try {
    // Fetch the EN version to check what's already translated
    const enDoc = await payload.findByID({
      collection: collection.slug,
      id: doc.id,
      locale: 'en',
      depth: 0,
    })

    // Collect localized text field paths
    const localizedPaths = collectLocalizedTextPaths(collection.fields)

    // Gather texts that need translation
    const textsToTranslate: string[] = []
    const paths: string[] = []

    for (const fieldPath of localizedPaths) {
      const deValue = getNestedValue(doc as unknown as Record<string, unknown>, fieldPath)
      const enValue = getNestedValue(enDoc as unknown as Record<string, unknown>, fieldPath)

      if (typeof deValue === 'string' && deValue.trim()) {
        // Translate if EN is empty, missing, or identical to DE
        if (!enValue || enValue === deValue) {
          textsToTranslate.push(deValue)
          paths.push(fieldPath)
        }
      }
    }

    if (textsToTranslate.length === 0) return doc

    payload.logger.info(
      `[AutoTranslate] Translating ${textsToTranslate.length} field(s) for ${collection.slug}/${doc.id} → EN`,
    )

    const translated = await translateBatchToEnglish(textsToTranslate)

    // Build update data with only the translated fields
    const updateData: Record<string, unknown> = {}
    paths.forEach((fieldPath, i) => {
      setNestedValue(updateData, fieldPath, translated[i])
    })

    await payload.update({
      collection: collection.slug,
      id: doc.id,
      locale: 'en',
      data: updateData,
      context: { skipAutoTranslate: true, skipRevalidate: true },
    })

    payload.logger.info(
      `[AutoTranslate] ✓ ${textsToTranslate.length} field(s) auto-translated to EN for ${collection.slug}/${doc.id}`,
    )
  } catch (error) {
    payload.logger.error(`[AutoTranslate] Failed for ${collection.slug}/${doc.id}: ${error}`)
  }

  return doc
}

/**
 * Recursively collect dot-notation paths of localized text fields.
 * Handles groups, tabs, rows, and arrays (for simple text fields at root level of arrays).
 * Skips richText fields as they require AST-level translation.
 */
function collectLocalizedTextPaths(fields: Field[], prefix = ''): string[] {
  const paths: string[] = []

  for (const field of fields) {
    if ('name' in field && field.name) {
      const path = prefix ? `${prefix}.${field.name}` : field.name

      if ((field.type === 'text' || field.type === 'textarea') && field.localized) {
        paths.push(path)
      }

      // Recurse into sub-fields
      if (field.type === 'group' && 'fields' in field) {
        paths.push(...collectLocalizedTextPaths(field.fields, path))
      }
    }

    // Row and collapsible fields (no name, just contain fields)
    if (field.type === 'row' || field.type === 'collapsible') {
      if ('fields' in field) {
        paths.push(...collectLocalizedTextPaths(field.fields, prefix))
      }
    }

    // Tabs
    if (field.type === 'tabs' && 'tabs' in field) {
      for (const tab of field.tabs) {
        if ('name' in tab && tab.name) {
          paths.push(
            ...collectLocalizedTextPaths(tab.fields, prefix ? `${prefix}.${tab.name}` : tab.name),
          )
        } else {
          paths.push(...collectLocalizedTextPaths(tab.fields, prefix))
        }
      }
    }
  }

  return paths
}

/** Get a nested value from an object using dot notation */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj as unknown)
}

/** Set a nested value on an object using dot notation */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
      current[keys[i]] = {}
    }
    current = current[keys[i]] as Record<string, unknown>
  }
  current[keys[keys.length - 1]] = value
}
