/** Reuse Payload block + nested array IDs when saving EN locale for workshop pages. */
const BLOCK_ARRAY_FIELDS: Record<string, string[]> = {
  hero: ['heroAttributes'],
  booking: ['bookingAttributes', 'schedule', 'includedItems', 'whyPoints', 'experienceCards'],
  faq: ['faqItems'],
  voucher: ['voucherPills'],
}

export function mergeWorkshopPageSectionIds(
  savedDetail: Record<string, unknown> | undefined,
  enDetail: Record<string, unknown>,
): Record<string, unknown> {
  const enData = { ...enDetail }
  const savedSections = (savedDetail?.pageSections as Array<Record<string, unknown>>) ?? []
  const enSections = (enData.pageSections as Array<Record<string, unknown>>) ?? []

  for (let i = 0; i < Math.min(savedSections.length, enSections.length); i++) {
    const savedBlock = savedSections[i]
    const enBlock = enSections[i]
    if (!savedBlock || !enBlock || savedBlock.blockType !== enBlock.blockType) continue
    if (savedBlock.id) enBlock.id = savedBlock.id

    const arrayFields = BLOCK_ARRAY_FIELDS[enBlock.blockType as string] ?? []
    for (const field of arrayFields) {
      const savedArr = (savedBlock[field] as Array<{ id?: string }>) ?? []
      const enArr = (enBlock[field] as Array<Record<string, unknown>>) ?? []
      if (savedArr.length === enArr.length) {
        for (let j = 0; j < enArr.length; j++) {
          if (savedArr[j]?.id) enArr[j].id = savedArr[j].id
        }
      }
    }
  }

  return enData
}
