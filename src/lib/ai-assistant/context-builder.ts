import type { Payload } from 'payload'
import type { AIContext } from './types'

/** Collections admins/editors may reference when chatting with the assistant. */
const ALLOWED_COLLECTIONS = [
  'workshops',
  'products',
  'posts',
  'pages',
  'media',
  'online-courses',
  'vouchers',
] as const

export type AllowedCollection = (typeof ALLOWED_COLLECTIONS)[number]

export function isAllowedCollection(slug: string): slug is AllowedCollection {
  return (ALLOWED_COLLECTIONS as readonly string[]).includes(slug)
}

/**
 * Build a safe, sanitised context object that gets injected into the system
 * prompt so the AI knows which collection / document the editor is working on.
 */
export async function buildContext({
  collection,
  documentId,
  payload,
}: {
  collection?: string
  documentId?: string
  payload: Payload
  user: { id: string }
}): Promise<AIContext> {
  const context: AIContext = {
    timestamp: new Date().toISOString(),
    userRole: 'admin',
  }

  // Attach schema information for the requested collection
  if (collection && isAllowedCollection(collection)) {
    const collectionConfig = payload.collections[collection]

    if (collectionConfig) {
      context.collection = {
        slug: collection,
        fields: collectionConfig.config.fields
          .filter((f) => 'name' in f && (f as { name?: string }).name)
          .map((f) => {
            const field = f as unknown as Record<string, unknown>
            return {
              name: field.name as string,
              type: field.type as string,
              label: field.label as string | Record<string, string> | undefined,
              required: (field.required as boolean) || false,
              ...(field.maxLength ? { maxLength: field.maxLength as number } : {}),
              ...(field.minLength ? { minLength: field.minLength as number } : {}),
            }
          }),
      }
    }
  }

  // Attach document summary (shallow, no relationship population)
  if (collection && documentId && isAllowedCollection(collection)) {
    try {
      const document = (await payload.findByID({
        collection: collection as AllowedCollection,
        id: documentId,
        depth: 0,
      })) as unknown as Record<string, unknown> | null

      if (document) {
        context.currentDocument = {
          id: documentId,
          title: (document.title as string) || undefined,
          description: (document.description as string) || undefined,
          status: (document._status as string) || undefined,
        }
      }
    } catch {
      // Document not found or access denied — continue without it
    }
  }

  return context
}
