import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const workshopSlugs = ['tempeh', 'lakto-gemuese', 'kombucha']
      const path =
        doc.slug === 'home'
          ? '/'
          : doc.slug === 'voucher'
            ? '/workshops/voucher'
            : workshopSlugs.includes(doc.slug ?? '')
              ? `/workshops/${doc.slug}`
              : `/${doc.slug}`

      payload.logger.info(`Revalidating page at path: ${path}`)

      revalidatePath(path)
      if (doc.slug === 'voucher') {
        revalidateTag('voucher')
      }
      //revalidateTag('pages-sitemap')
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const workshopSlugs = ['tempeh', 'lakto-gemuese', 'kombucha']
      const oldPath =
        previousDoc.slug === 'home'
          ? '/'
          : previousDoc.slug === 'voucher'
            ? '/workshops/voucher'
            : workshopSlugs.includes(previousDoc.slug ?? '')
              ? `/workshops/${previousDoc.slug}`
              : `/${previousDoc.slug}`

      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      revalidatePath(oldPath)
      if (previousDoc.slug === 'voucher') {
        revalidateTag('voucher')
      }
      //revalidateTag('pages-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const workshopSlugs = ['tempeh', 'lakto-gemuese', 'kombucha']
    const path =
      doc?.slug === 'home'
        ? '/'
        : doc?.slug === 'voucher'
          ? '/workshops/voucher'
          : workshopSlugs.includes(doc?.slug ?? '')
            ? `/workshops/${doc?.slug}`
            : `/${doc?.slug}`
    revalidatePath(path)
    if (doc?.slug === 'voucher') {
      revalidateTag('voucher')
    }
    //revalidateTag('pages-sitemap')
  }

  return doc
}
