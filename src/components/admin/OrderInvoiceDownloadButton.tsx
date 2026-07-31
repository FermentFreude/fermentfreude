'use client'

import { useDocumentInfo } from '@payloadcms/ui'

export function OrderInvoiceDownloadButton() {
  const { id } = useDocumentInfo()

  if (!id) return null

  const url = `/api/admin/orders/${id}/receipt`

  return (
    <div className="field-type ui">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          width: '100%',
          padding: '8px 0',
          backgroundColor: '#4a7c59',
          color: '#fff',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}
      >
        ↓ Download Invoice
      </a>
    </div>
  )
}
