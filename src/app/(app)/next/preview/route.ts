import type { CollectionSlug, PayloadRequest } from 'payload'
import { getPayload } from 'payload'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import configPromise from '@payload-config'

export async function GET(req: Request): Promise<Response> {
  const payload = await getPayload({ config: configPromise })

  const { searchParams } = new URL(req.url)

  const path = searchParams.get('path')
  const collection = searchParams.get('collection') as CollectionSlug
  const slug = searchParams.get('slug')
  const previewSecret = searchParams.get('previewSecret')

  if (!path || !collection || !slug) {
    return new Response('Insufficient search params', { status: 404 })
  }

  if (!path.startsWith('/')) {
    return new Response('This endpoint can only be used for relative previews', { status: 500 })
  }

  // Auth check — authenticated admins can always preview without needing the secret.
  // External preview tools (e.g. Vercel preview URLs) must supply the correct secret.
  let user
  try {
    user = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    })
  } catch (error) {
    payload.logger.error({ err: error }, 'Error verifying token for live preview')
  }

  if (!user) {
    // Not authenticated — fall back to secret check for external preview tools
    if (previewSecret !== process.env.PREVIEW_SECRET) {
      return new Response('You are not allowed to preview this page', { status: 403 })
    }
  }

  const draft = await draftMode()
  draft.enable()

  redirect(path)
}
