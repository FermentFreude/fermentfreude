import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidateTag } from 'next/cache'

export const revalidateWorkshopsNav: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (context?.disableRevalidate) return doc

  payload.logger.info('Revalidating workshops nav cache')
  revalidateTag('workshops')

  return doc
}

export const revalidateWorkshopsNavAfterDelete: CollectionAfterDeleteHook = ({
  req: { payload, context },
}) => {
  if (context?.disableRevalidate) return

  payload.logger.info('Revalidating workshops nav cache after delete')
  revalidateTag('workshops')
}
