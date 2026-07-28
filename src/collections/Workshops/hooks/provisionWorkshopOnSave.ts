import type { CollectionAfterChangeHook } from 'payload'

import type { Workshop } from '@/payload-types'
import { provisionWorkshopResources } from '@/utilities/workshopProvisioning/provisionWorkshopResources'

export const provisionWorkshopOnSave: CollectionAfterChangeHook<Workshop> = async ({
  doc,
  req: { payload, context },
}) => {
  if (context?.skipWorkshopProvision) return doc
  if (!doc?.id || !doc.slug) return doc

  try {
    await provisionWorkshopResources(payload, doc)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    payload.logger.error(`[workshop-provision] Failed for ${doc.slug}: ${message}`)
  }

  return doc
}
