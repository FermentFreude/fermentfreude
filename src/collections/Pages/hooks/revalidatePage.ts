import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context?.disableRevalidate) return doc

  const workshopDetailSlugs = ['tempeh', 'lakto-gemuese', 'kombucha', 'basics']

  // Always revalidate if workshops page changes (draft or published)
  if (doc.slug === 'workshops') {
    payload.logger.info(`Revalidating /workshops page`)
    revalidatePath('/workshops')
    return doc
  }

  // For other pages, only revalidate if published
  if (doc._status === 'published') {
    const path =
      doc.slug === 'home'
        ? '/'
        : doc.slug === 'voucher'
          ? '/workshops/voucher'
          : workshopDetailSlugs.includes(doc.slug ?? '')
            ? `/workshops/${doc.slug}`
            : `/${doc.slug}`

    payload.logger.info(`Revalidating page at path: ${path}`)
    revalidatePath(path)
    if (doc.slug === 'voucher') {
      revalidateTag('voucher')
    }
  }

  // If the page was previously published, we need to revalidate the old path
  if (previousDoc?._status === 'published' && doc._status !== 'published') {
    const oldPath =
      previousDoc.slug === 'home'
        ? '/'
        : previousDoc.slug === 'workshops'
          ? '/workshops'
          : previousDoc.slug === 'voucher'
            ? '/workshops/voucher'
            : workshopDetailSlugs.includes(previousDoc.slug ?? '')
              ? `/workshops/${previousDoc.slug}`
              : `/${previousDoc.slug}`

    payload.logger.info(`Revalidating old page at path: ${oldPath}`)
    revalidatePath(oldPath)
    if (previousDoc.slug === 'voucher') {
      revalidateTag('voucher')
    }
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const workshopDetailSlugs = ['tempeh', 'lakto-gemuese', 'kombucha', 'basics']
    const path =
      doc?.slug === 'home'
        ? '/'
        : doc?.slug === 'workshops'
          ? '/workshops'
          : doc?.slug === 'voucher'
            ? '/workshops/voucher'
            : workshopDetailSlugs.includes(doc?.slug ?? '')
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
