import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateGlobal: GlobalAfterChangeHook = ({
  doc,
  global,
  req: { payload, context },
}) => {
  if (context?.skipRevalidate) return doc
  payload.logger.info(`Revalidating global: ${global.slug}`)
  revalidateTag(`global_${global.slug}`)
  return doc
}
