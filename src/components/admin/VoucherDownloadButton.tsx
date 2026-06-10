'use client'

import { useFormFields } from '@payloadcms/ui'

export function VoucherDownloadButton() {
  const code = useFormFields(([fields]) => fields.code?.value as string | undefined)

  if (!code) return null

  const url = `/api/voucher/generate-pdf?code=${encodeURIComponent(code)}`

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
        ↓ Download Voucher PDF
      </a>
    </div>
  )
}
