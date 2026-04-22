import type { CollectionConfig } from 'payload'

export const BrevoEmailTemplates: CollectionConfig = {
  slug: 'brevo-email-templates',
  admin: {
    useAsTitle: 'templateName',
    description:
      '19 pre-built email templates from /public/email-templates — edit HTML content directly',
    defaultColumns: ['brevoTemplateId', 'templateName', 'syncStatus'],
  },
  access: {
    read: async () => true,
    create: async () => true,
    update: async () => true,
    delete: async () => false, // Never delete templates
  },
  fields: [
    {
      name: 'brevoTemplateId',
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
        description: 'Brevo API template ID (from Brevo platform)',
      },
    },
    {
      name: 'templateName',
      type: 'text',
      required: true,
      admin: {
        description: 'Friendly name for this email template (e.g., "Welcome Email")',
      },
    },
    {
      name: 'htmlContent',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'Complete HTML email content — edit exactly as needed. This is the full source.',
      },
    },
    {
      name: 'syncStatus',
      type: 'select',
      options: [
        { label: 'Never synced', value: 'never-synced' },
        { label: 'Synced', value: 'synced' },
        { label: 'Error', value: 'error' },
      ],
      defaultValue: 'never-synced',
      admin: {
        readOnly: true,
        description: 'Status of last sync to Brevo API',
      },
    },
    {
      name: 'lastSyncedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'When this template was last synced to Brevo',
      },
    },
    {
      name: 'syncError',
      type: 'textarea',
      admin: {
        readOnly: true,
        description: 'If sync failed, the error message appears here',
      },
    },
  ],
  hooks: {
    afterChange: [syncToBrevoAPI],
  },
}

async function syncToBrevoAPI({
  doc,
  req,
  operation,
  context,
}: {
  doc: any
  req: any
  operation: string
  context: any
}) {
  // Skip sync during seeding
  if (context?.skipBrevoSync) return
  if (operation !== 'update') return

  const brevoApiKey = process.env.BREVO_API_KEY
  if (!brevoApiKey) {
    req.payload.logger.error('[Brevo] BREVO_API_KEY not set')
    return
  }

  try {
    // Extract subject from HTML title tag
    const titleMatch = doc.htmlContent?.match(/<title[^>]*>([^<]+)<\/title>/i)
    const subject = titleMatch
      ? titleMatch[1].replace('FermentFreude — ', '').trim()
      : doc.templateName

    // Send to Brevo API
    const response = await fetch(`https://api.brevo.com/v3/smtp/templates/${doc.brevoTemplateId}`, {
      method: 'PUT',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject,
        htmlContent: doc.htmlContent,
        isActive: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Brevo API error: ${response.status} ${error}`)
    }

    // Update sync status
    await req.payload.update({
      collection: 'brevo-email-templates',
      id: doc.id,
      data: {
        syncStatus: 'synced',
        lastSyncedAt: new Date().toISOString(),
        syncError: null,
      },
      context: { skipBrevoSync: true },
    })

    req.payload.logger.info(`[Brevo] ✓ Template ${doc.brevoTemplateId} synced`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    req.payload.logger.error(`[Brevo] ✗ Sync failed: ${message}`)

    // Update with error
    await req.payload.update({
      collection: 'brevo-email-templates',
      id: doc.id,
      data: {
        syncStatus: 'error',
        syncError: message,
      },
      context: { skipBrevoSync: true },
    })
  }
}
