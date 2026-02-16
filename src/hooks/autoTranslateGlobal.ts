import type { Field, GlobalAfterChangeHook } from 'payload'

import { translateBatchToEnglish } from '@/utilities/translate'

/**
 * Generic auto-translate hook for globals.
 * Walks all localized text fields and translates DE → EN via DeepL.
 * Only fills in EN translations if they are empty or identical to DE.
 *
 * For array fields, it walks each item and translates localized text fields within.
 *
 * Usage: Add to `hooks.afterChange` on any global with localized fields.
 */
export const autoTranslateGlobal: GlobalAfterChangeHook = async ({ doc, global, req }) => {
  const { payload, locale, context } = req

  // Only run when saving in German (default locale)
  if (locale !== 'de' && locale !== undefined) return doc
  if (context?.skipAutoTranslate) return doc
  if (!process.env.DEEPL_API_KEY) return doc

  try {
    // Fetch the EN version to check what's already translated
    const enDoc = await payload.findGlobal({
      slug: global.slug,
      locale: 'en',
    })

    // Collect texts that need translation by walking the schema
    const textsToTranslate: string[] = []
    const operations: Array<{ path: string; value: string }> = []

    collectTranslations(
      global.fields,
      doc as unknown as Record<string, unknown>,
      enDoc as unknown as Record<string, unknown>,
      '',
      textsToTranslate,
      operations,
    )

    if (textsToTranslate.length === 0) return doc

    payload.logger.info(
      `[AutoTranslate] Translating ${textsToTranslate.length} text(s) for global/${global.slug} → EN`,
    )

    const translated = await translateBatchToEnglish(textsToTranslate)

    // Build update data
    const updateData: Record<string, unknown> = {}
    operations.forEach((op, i) => {
      setNestedValue(updateData, op.path, translated[i])
    })

    // Merge with existing EN doc to avoid wiping non-translated fields
    const mergedData = deepMergeForUpdate(enDoc as unknown as Record<string, unknown>, updateData)

    await payload.updateGlobal({
      slug: global.slug,
      locale: 'en',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: mergedData as any,
      context: { skipAutoTranslate: true, skipRevalidate: true },
    })

    payload.logger.info(
      `[AutoTranslate] ✓ ${textsToTranslate.length} text(s) auto-translated to EN for global/${global.slug}`,
    )
  } catch (error) {
    payload.logger.error(`[AutoTranslate] Failed for global/${global.slug}: ${error}`)
  }

  return doc
}

/**
 * Recursively walk fields schema and collect localized text values needing translation.
 *
 * IMPORTANT: `deDoc` / `enDoc` are always scoped to the CURRENT level
 * (root document, group sub-object, or array/block item). `absolutePrefix`
 * tracks the full path for building the update payload.
 *
 * Handles: text, textarea, group, row, collapsible, tabs, array, blocks.
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

      // Localized text/textarea field
      if ((field.type === 'text' || field.type === 'textarea') && field.localized) {
        const deValue = deDoc[field.name] as string | undefined
        const enValue = enDoc[field.name] as string | undefined

        if (deValue && deValue.trim() && (!enValue || enValue === deValue)) {
          texts.push(deValue)
          operations.push({ path: absolutePath, value: deValue })
        }
      }

      // Group — recurse into sub-fields with narrowed doc scope
      if (field.type === 'group' && 'fields' in field) {
        const deGroup = (deDoc[field.name] as Record<string, unknown>) || {}
        const enGroup = (enDoc[field.name] as Record<string, unknown>) || {}
        collectTranslations(field.fields, deGroup, enGroup, absolutePath, texts, operations)
      }

      // Array — iterate items and recurse with narrowed doc scope
      if (field.type === 'array' && 'fields' in field) {
        const deArray = deDoc[field.name]
        if (Array.isArray(deArray)) {
          const enArray = (enDoc[field.name] as Array<Record<string, unknown>>) || []
          deArray.forEach((deItem, idx) => {
            const enItem = enArray[idx] || {}
            const itemPrefix = `${absolutePath}.${idx}`
            collectTranslations(field.fields, deItem, enItem, itemPrefix, texts, operations)
          })
        }
      }

      // Blocks — iterate items, lookup block config, and recurse
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

    // Row / collapsible — no name, just recurse
    if (field.type === 'row' || field.type === 'collapsible') {
      if ('fields' in field) {
        collectTranslations(field.fields, deDoc, enDoc, absolutePrefix, texts, operations)
      }
    }

    // Tabs — recurse into each tab
    if (field.type === 'tabs' && 'tabs' in field) {
      for (const tab of field.tabs) {
        if ('name' in tab && tab.name) {
          const tabPath = absolutePrefix ? `${absolutePrefix}.${tab.name}` : tab.name
          const deTab = (deDoc[tab.name] as Record<string, unknown>) || {}
          const enTab = (enDoc[tab.name] as Record<string, unknown>) || {}
          collectTranslations(tab.fields, deTab, enTab, tabPath, texts, operations)
        } else {
          // Unnamed tabs — fields live directly on parent doc
          collectTranslations(tab.fields, deDoc, enDoc, absolutePrefix, texts, operations)
        }
      }
    }
  }
}

/** Set a nested value on an object using dot notation (supports numeric indices for arrays) */
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

/** Deep merge source into target, only overriding with non-undefined values from source */
function deepMergeForUpdate(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMergeForUpdate(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>,
      )
    } else if (source[key] !== undefined) {
      result[key] = source[key]
    }
  }
  return result
}
