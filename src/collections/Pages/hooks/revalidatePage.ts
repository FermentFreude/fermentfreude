import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath as nextRevalidatePath, revalidateTag as nextRevalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'

// A script that updates Pages via the Local API (no live Next.js request —
// e.g. a one-off migration or fix script) has no static-generation store, and
// revalidatePath/revalidateTag throw an Invariant in that case. That would
// otherwise abort the whole afterChange chain and, depending on timing, part
// of the write itself — for a cache-invalidation side effect that's meaningless
// outside a real request anyway. Swallow it there; real admin edits (always a
// live request) are unaffected. Use the site's own /api/revalidate-pages or
// /api/revalidate-global as the manual fallback after a script-driven write.
function revalidatePath(path: string) {
  try {
    nextRevalidatePath(path)
  } catch {
    // no static generation store — not a live request, nothing to revalidate
  }
}

function revalidateTag(tag: string) {
  try {
    nextRevalidateTag(tag)
  } catch {
    // no static generation store — not a live request, nothing to revalidate
  }
}

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context?.disableRevalidate) return doc

  const workshopDetailSlugs = ['tempeh', 'lakto-gemuese', 'kombucha', 'vom-feld-ins-glas']

  // Always revalidate if workshops page changes (draft or published)
  if (doc.slug === 'workshops') {
    payload.logger.info(`Revalidating /workshops page`)
    revalidatePath('/workshops')
    revalidateTag('pages')
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
    revalidateTag('pages')
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
    revalidateTag('pages')
    if (previousDoc.slug === 'voucher') {
      revalidateTag('voucher')
    }
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const workshopDetailSlugs = ['tempeh', 'lakto-gemuese', 'kombucha', 'vom-feld-ins-glas']
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
    revalidateTag('pages')
    if (doc?.slug === 'voucher') {
      revalidateTag('voucher')
    }
    //revalidateTag('pages-sitemap')
  }

  return doc
}
