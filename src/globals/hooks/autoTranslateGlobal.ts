import type { GlobalAfterChangeHook } from 'payload'

import { translateBatchToEnglish } from '@/utilities/translate'

/**
 * Auto-translate localized fields from DE → EN using DeepL.
 * Runs after a global is saved in the 'de' locale.
 * Only fills in EN translations if they are empty (won't overwrite manual edits).
 *
 * To skip auto-translation, pass `context: { skipAutoTranslate: true }`.
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

    // Collect all texts that need translation from navItems
    const navItems = doc.navItems as Array<Record<string, unknown>> | undefined
    const enNavItems = enDoc.navItems as Array<Record<string, unknown>> | undefined

    if (!navItems?.length) return doc

    const textsToTranslate: string[] = []
    const positions: Array<{ itemIdx: number; field: string; subIdx?: number }> = []

    navItems.forEach((item, itemIdx) => {
      const link = item.link as Record<string, unknown> | undefined
      const enLink = (enNavItems?.[itemIdx]?.link as Record<string, unknown>) || {}

      // Nav item label
      const deLabel = link?.label as string
      const enLabel = enLink?.label as string
      if (deLabel && (!enLabel || enLabel === deLabel)) {
        textsToTranslate.push(deLabel)
        positions.push({ itemIdx, field: 'label' })
      }

      // Dropdown items
      const dropdownItems = item.dropdownItems as Array<Record<string, unknown>> | undefined
      const enDropdownItems = enNavItems?.[itemIdx]?.dropdownItems as
        | Array<Record<string, unknown>>
        | undefined

      dropdownItems?.forEach((sub, subIdx) => {
        const enSub = enDropdownItems?.[subIdx] || {}

        const deSubLabel = sub.label as string
        const enSubLabel = enSub.label as string
        if (deSubLabel && (!enSubLabel || enSubLabel === deSubLabel)) {
          textsToTranslate.push(deSubLabel)
          positions.push({ itemIdx, field: 'dropdownLabel', subIdx })
        }

        const deDesc = sub.description as string
        const enDesc = enSub.description as string
        if (deDesc && (!enDesc || enDesc === deDesc)) {
          textsToTranslate.push(deDesc)
          positions.push({ itemIdx, field: 'dropdownDescription', subIdx })
        }
      })
    })

    if (textsToTranslate.length === 0) return doc

    payload.logger.info(
      `[AutoTranslate] Translating ${textsToTranslate.length} text(s) for ${global.slug} → EN`,
    )

    const translated = await translateBatchToEnglish(textsToTranslate)

    // Build the EN update data
    const enUpdateNavItems = navItems.map((item, itemIdx) => {
      const link = item.link as Record<string, unknown>
      const dropdownItems = item.dropdownItems as Array<Record<string, unknown>> | undefined
      const enItem = enNavItems?.[itemIdx] || {}
      const enLink = (enItem.link as Record<string, unknown>) || {}
      const enDropdowns = (enItem.dropdownItems as Array<Record<string, unknown>>) || []

      const updatedLink = { ...link }
      const updatedDropdowns = dropdownItems?.map((sub, subIdx) => {
        const enSub = enDropdowns[subIdx] || {}
        return {
          ...sub,
          label: enSub.label || sub.label,
          description: enSub.description || sub.description,
        }
      })

      return {
        ...item,
        link: { ...updatedLink, label: enLink.label || link.label },
        dropdownItems: updatedDropdowns,
      }
    })

    // Apply translations from the batch
    positions.forEach((pos, i) => {
      const translatedText = translated[i]
      const navItem = enUpdateNavItems[pos.itemIdx]

      if (pos.field === 'label') {
        ;(navItem.link as Record<string, unknown>).label = translatedText
      } else if (pos.field === 'dropdownLabel' && pos.subIdx !== undefined) {
        const dropdowns = navItem.dropdownItems as Array<Record<string, unknown>>
        if (dropdowns?.[pos.subIdx]) {
          dropdowns[pos.subIdx].label = translatedText
        }
      } else if (pos.field === 'dropdownDescription' && pos.subIdx !== undefined) {
        const dropdowns = navItem.dropdownItems as Array<Record<string, unknown>>
        if (dropdowns?.[pos.subIdx]) {
          dropdowns[pos.subIdx].description = translatedText
        }
      }
    })

    // Save EN locale
    await payload.updateGlobal({
      slug: global.slug,
      locale: 'en',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { navItems: enUpdateNavItems } as any,
      context: { skipAutoTranslate: true, skipRevalidate: true },
    })

    payload.logger.info(
      `[AutoTranslate] ✓ ${textsToTranslate.length} text(s) auto-translated to EN for ${global.slug}`,
    )
  } catch (error) {
    payload.logger.error(`[AutoTranslate] Failed for ${global.slug}: ${error}`)
  }

  return doc
}
