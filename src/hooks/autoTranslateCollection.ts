import type { CollectionAfterChangeHook, Field } from 'payload'

import { translateBatchToEnglish } from '@/utilities/translate'

/**
 * Generic auto-translate hook for collections.
 * Walks all localized text/textarea fields — including inside arrays, blocks,
 * groups, tabs, rows, and collapsibles — and translates DE → EN via DeepL.
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

    // Collect texts that need translation by walking schema + documents together
    const textsToTranslate: string[] = []
    const operations: Array<{ path: string; value: string }> = []

    collectTranslations(
      collection.fields,
      doc as unknown as Record<string, unknown>,
      enDoc as unknown as Record<string, unknown>,
      '',
      textsToTranslate,
      operations,
    )

    if (textsToTranslate.length === 0) return doc

    payload.logger.info(
      `[AutoTranslate] Translating ${textsToTranslate.length} field(s) for ${collection.slug}/${doc.id} → EN`,
    )

    const translated = await translateBatchToEnglish(textsToTranslate)

    // Build update data with only the translated fields
    const updateData: Record<string, unknown> = {}
    operations.forEach((op, i) => {
      setNestedValue(updateData, op.path, translated[i])
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
 * Recursively walk the field schema + document data together, collecting
 * localized text/textarea values that need translation.
 *
 * IMPORTANT: `deDoc` / `enDoc` are always scoped to the CURRENT level
 * (root document, group sub-object, or array/block item). `absolutePrefix`
 * tracks the full path for building the update payload.
 *
 * Handles: text, textarea, group, row, collapsible, tabs, array, blocks.
 * Skips: richText (stored as Lexical JSON AST — requires manual translation).
 */
function collectTranslations(
  fields: Field[],
  deDoc: Record<string, unknown>,
  enDoc: Record<string, unknown>,
  absolutePrefix: string,
  texts: string[],
  operations: Array<{ path: string; value: string }>,
): void {
  for (const field of fields) {
    if ('name' in field && field.name) {
      const absolutePath = absolutePrefix ? `${absolutePrefix}.${field.name}` : field.name

      // ── Localized text / textarea ──
      if ((field.type === 'text' || field.type === 'textarea') && field.localized) {
        const deValue = deDoc[field.name] as string | undefined
        const enValue = enDoc[field.name] as string | undefined

        if (deValue && deValue.trim() && (!enValue || enValue === deValue)) {
          texts.push(deValue)
          operations.push({ path: absolutePath, value: deValue })
        }
      }

      // ── Group — recurse into sub-fields with narrowed doc scope ──
      if (field.type === 'group' && 'fields' in field) {
        const deGroup = (deDoc[field.name] as Record<string, unknown>) || {}
        const enGroup = (enDoc[field.name] as Record<string, unknown>) || {}
        collectTranslations(field.fields, deGroup, enGroup, absolutePath, texts, operations)
      }

      // ── Array — iterate items and recurse with narrowed doc scope ──
      if (field.type === 'array' && 'fields' in field) {
        const deArray = deDoc[field.name]
        if (Array.isArray(deArray)) {
          const enArray = (enDoc[field.name] as Array<Record<string, unknown>>) || []
          deArray.forEach((deItem: Record<string, unknown>, idx: number) => {
            const enItem = enArray[idx] || {}
            const itemPrefix = `${absolutePath}.${idx}`
            collectTranslations(field.fields, deItem, enItem, itemPrefix, texts, operations)
          })
        }
      }

      // ── Blocks — iterate items, lookup block config, and recurse ──
      if (field.type === 'blocks' && 'blocks' in field) {
        const deBlocks = deDoc[field.name]
        if (Array.isArray(deBlocks)) {
          const enBlocks = (enDoc[field.name] as Array<Record<string, unknown>>) || []
          deBlocks.forEach((deItem: Record<string, unknown>, idx: number) => {
            const blockType = deItem.blockType as string | undefined
            if (!blockType) return
            const blockConfig = field.blocks.find((b) => b.slug === blockType)
            if (!blockConfig) return
            const enItem = enBlocks[idx] || {}
            const itemPrefix = `${absolutePath}.${idx}`
            collectTranslations(blockConfig.fields, deItem, enItem, itemPrefix, texts, operations)
          })
        }
      }
    }

    // ── Row / Collapsible (no name, just contain fields) ──
    if (field.type === 'row' || field.type === 'collapsible') {
      if ('fields' in field) {
        collectTranslations(field.fields, deDoc, enDoc, absolutePrefix, texts, operations)
      }
    }

    // ── Tabs ──
    if (field.type === 'tabs' && 'tabs' in field) {
      for (const tab of field.tabs) {
        if ('name' in tab && tab.name) {
          const tabPrefix = absolutePrefix ? `${absolutePrefix}.${tab.name}` : tab.name
          const deTab = (deDoc[tab.name] as Record<string, unknown>) || {}
          const enTab = (enDoc[tab.name] as Record<string, unknown>) || {}
          collectTranslations(tab.fields, deTab, enTab, tabPrefix, texts, operations)
        } else {
          // Unnamed tabs — fields live directly on parent doc
          collectTranslations(tab.fields, deDoc, enDoc, absolutePrefix, texts, operations)
        }
      }
    }
  }
}

/** Set a nested value on an object using dot notation (handles numeric array indices) */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.')
  let current: unknown = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    const nextKey = keys[i + 1]
    const isNextNumeric = /^\d+$/.test(nextKey)

    if (typeof current === 'object' && current !== null) {
      const currentObj = current as Record<string, unknown>
      if (!currentObj[key] || typeof currentObj[key] !== 'object') {
        currentObj[key] = isNextNumeric ? [] : {}
      }
      current = currentObj[key]
    }
  }

  const lastKey = keys[keys.length - 1]
  if (typeof current === 'object' && current !== null) {
    if (Array.isArray(current)) {
      current[parseInt(lastKey, 10)] = value
    } else {
      ;(current as Record<string, unknown>)[lastKey] = value
    }
  }
}
