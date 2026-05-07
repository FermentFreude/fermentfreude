import { randomUUID } from 'crypto'
import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Generate a stable download token for the order receipt PDF.
 *
 * Running this in beforeChange means the token is saved atomically with the
 * order document itself — the confirmation page and the email hook can both
 * read doc.downloadToken reliably, even if they race.
 *
 * Sequential write only (Atlas M0 has no transactions).
 */
export const generateDownloadToken: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation !== 'create') return data
  if ((data as { downloadToken?: string }).downloadToken) return data

  return {
    ...data,
    downloadToken: randomUUID(),
  }
}
