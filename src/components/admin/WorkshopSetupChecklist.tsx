'use client'

import { useFormFields } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { WorkshopSetupStatus } from '@/utilities/workshopProvisioning/getWorkshopSetupStatus'

function useWorkshopDocumentId(): string | null {
  const pathname = usePathname()
  return useMemo(() => {
    const match = pathname?.match(/\/admin\/collections\/workshops\/([a-f0-9]{24})\b/i)
    return match?.[1] ?? null
  }, [pathname])
}

function StatusRow({
  ok,
  label,
  href,
  hint,
}: {
  ok: boolean
  label: string
  href?: string | null
  hint?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '8px 0',
        borderBottom: '1px solid var(--theme-elevation-150)',
      }}
    >
      <span style={{ fontSize: '16px', lineHeight: 1.2 }}>{ok ? '✅' : '⬜'}</span>
      <div style={{ flex: 1 }}>
        {href ? (
          <a
            href={href}
            style={{ color: 'var(--theme-text)', fontWeight: 600, textDecoration: 'underline' }}
          >
            {label}
          </a>
        ) : (
          <span style={{ fontWeight: 600 }}>{label}</span>
        )}
        {hint ? (
          <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '2px' }}>{hint}</div>
        ) : null}
      </div>
    </div>
  )
}

export function WorkshopSetupChecklist() {
  const documentId = useWorkshopDocumentId()
  const slug = useFormFields(([fields]) => fields.slug?.value as string | undefined)
  const [status, setStatus] = useState<WorkshopSetupStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!documentId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/workshop-setup-status?workshopId=${documentId}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? 'Could not load setup status')
      }
      const data = (await res.json()) as WorkshopSetupStatus
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup status unavailable')
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [documentId])

  useEffect(() => {
    void load()
  }, [load])

  if (!documentId) {
    return (
      <div className="field-type ui" style={{ padding: '12px 0' }}>
        <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
          Save this workshop first — we will automatically create the shop product and public page.
          {slug ? ` (slug: ${slug})` : null}
        </p>
      </div>
    )
  }

  return (
    <div
      className="field-type ui"
      style={{
        padding: '14px',
        borderRadius: '8px',
        border: '1px solid var(--theme-elevation-150)',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '14px' }}>Launch checklist</strong>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          style={{
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid var(--theme-elevation-250)',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          {loading ? '…' : 'Refresh'}
        </button>
      </div>

      <p style={{ margin: '8px 0 12px', fontSize: '12px', opacity: 0.8, lineHeight: 1.45 }}>
        Product + page are created automatically when you save. Add appointment dates manually,
        then customize copy and images on the page.
      </p>

      {error ? <p style={{ color: 'var(--theme-error-500)', fontSize: '12px' }}>{error}</p> : null}

      {status ? (
        <>
          <StatusRow ok={true} label="Workshop record" hint={`Slug: ${status.dbSlug}`} />
          <StatusRow
            ok={status.hasProduct}
            label={`Shop product (${status.productSlug})`}
            href={status.productAdminUrl}
            hint="Created automatically for cart & checkout"
          />
          <StatusRow
            ok={status.hasPage}
            label={`Public page (${status.publicUrl})`}
            href={status.pageAdminUrl}
            hint="Standard workshop UI — edit hero, FAQ, booking text here"
          />
          <StatusRow
            ok={status.hasAppointments}
            label={`Appointment dates (${status.appointmentCount} upcoming)`}
            href={status.appointmentsAdminUrl}
            hint="Required before customers can book"
          />
          <StatusRow
            ok={status.isActive}
            label="Visible in navigation"
            hint={status.isActive ? 'Active — shows in Workshops menu' : 'Inactive — hidden from menu'}
          />

          <div style={{ marginTop: '12px', fontSize: '12px', lineHeight: 1.5 }}>
            {status.readyForBooking && status.readyForPublic ? (
              <span style={{ color: 'var(--theme-success-500)', fontWeight: 600 }}>
                Ready — customers can view and book this workshop.
              </span>
            ) : (
              <span style={{ opacity: 0.85 }}>
                {!status.hasAppointments
                  ? 'Next step: add at least one future appointment date.'
                  : !status.hasPage
                    ? 'Save again if the public page is still missing.'
                    : 'Complete the checklist above to go live.'}
              </span>
            )}
            {status.readyForPublic ? (
              <>
                {' '}
                <a href={status.publicUrl} target="_blank" rel="noopener noreferrer">
                  Preview page →
                </a>
              </>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}
