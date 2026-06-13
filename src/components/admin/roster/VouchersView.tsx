'use client'

import React, { useState, useTransition } from 'react'

import { createVoucher, deleteVoucher } from './actions'
import type { VoucherRow } from './types'

interface Props {
  vouchers: VoucherRow[]
  onRefresh: () => Promise<void>
}

const STATUS_CONFIG = {
  active: { label: 'Aktiv', bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  redeemed: { label: 'Eingelöst', bg: '#ede9fe', color: '#5b21b6', dot: '#8b5cf6' },
  expired: { label: 'Abgelaufen', bg: 'var(--theme-elevation-100)', color: 'var(--theme-text)', dot: '#9ca3af' },
}

function StatusBadge({ status }: { status: VoucherRow['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.active
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
      background: cfg.bg, color: cfg.color,
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button
      onClick={copy}
      title="Code kopieren"
      style={{
        border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px 6px',
        borderRadius: '4px', fontSize: '11px', color: copied ? '#22c55e' : 'var(--theme-text)',
        opacity: copied ? 1 : 0.45, transition: 'all 0.15s',
      }}
    >
      {copied ? '✓' : '⎘'}
    </button>
  )
}

const EMPTY_FORM = { value: '', purchaserName: '', recipientName: '', recipientEmail: '', personalNote: '' }

export function VouchersView({ vouchers, onRefresh }: Props) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'redeemed'>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [lastCreated, setLastCreated] = useState<{ code: string; value: number } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; code: string } | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  const active = vouchers.filter((v) => v.status === 'active').length
  const redeemed = vouchers.filter((v) => v.status === 'redeemed').length
  const totalValue = vouchers.reduce((s, v) => s + v.value, 0)
  const redeemedValue = vouchers.filter((v) => v.status === 'redeemed').reduce((s, v) => s + v.value, 0)

  const filtered = vouchers.filter((v) => {
    if (filter === 'active' && v.status !== 'active') return false
    if (filter === 'redeemed' && v.status !== 'redeemed') return false
    if (query.trim()) {
      const q = query.toLowerCase()
      if (
        !v.code.toLowerCase().includes(q) &&
        !v.purchaserName.toLowerCase().includes(q) &&
        !v.purchaserEmail.toLowerCase().includes(q) &&
        !v.recipientName.toLowerCase().includes(q) &&
        !v.recipientEmail.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  const handleCreate = () => {
    const value = parseFloat(form.value)
    if (!form.value || isNaN(value) || value <= 0) {
      setFormError('Bitte einen gültigen Betrag eingeben.')
      return
    }
    setFormError('')
    startTransition(async () => {
      const result = await createVoucher({
        value,
        purchaserName: form.purchaserName || undefined,
        recipientName: form.recipientName || undefined,
        recipientEmail: form.recipientEmail || undefined,
        personalNote: form.personalNote || undefined,
      })
      setLastCreated({ code: result.code, value })
      setForm(EMPTY_FORM)
      setShowForm(false)
      await onRefresh()
    })
  }

  const handleDelete = () => {
    if (!confirmDelete) return
    startDeleteTransition(async () => {
      await deleteVoucher(confirmDelete.id)
      setConfirmDelete(null)
      await onRefresh()
    })
  }

  return (
    <div style={{ padding: '40px', maxWidth: '960px' }}>
      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: 'var(--theme-elevation-0)', borderRadius: '14px',
            padding: '28px 32px', maxWidth: '420px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: 'var(--theme-text)' }}>
                Gutschein löschen?
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--theme-text)', opacity: 0.6, lineHeight: 1.5 }}>
                Gutschein{' '}
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--theme-text)', opacity: 1 }}>
                  {confirmDelete.code}
                </span>{' '}
                wird permanent gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={isDeleting}
                style={{
                  padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                  fontWeight: 500, background: 'transparent', border: '1px solid var(--theme-elevation-200)',
                  color: 'var(--theme-text)', opacity: isDeleting ? 0.5 : 1,
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 600, background: '#dc2626', color: '#fff',
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                {isDeleting ? 'Wird gelöscht…' : 'Ja, löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--theme-text)', margin: 0 }}>Gutscheine</h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--theme-text)', opacity: 0.55 }}>
            Gutscheine erstellen, drucken und verwalten
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setLastCreated(null) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
            borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: '#111827', color: '#fff', fontSize: '14px', fontWeight: 600,
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>{showForm ? '×' : '+'}</span>
          {showForm ? 'Abbrechen' : 'Neuen Gutschein erstellen'}
        </button>
      </div>

      {/* Success banner */}
      {lastCreated && (
        <div style={{
          marginBottom: '24px', padding: '16px 20px', borderRadius: '10px',
          background: '#f0fdf4', border: '1px solid #86efac',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#166534' }}>
              Gutschein erstellt!
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, color: '#166534', letterSpacing: '0.05em' }}>
                {lastCreated.code}
              </span>
              <CopyButton text={lastCreated.code} />
              <span style={{ fontSize: '13px', color: '#166534', opacity: 0.7 }}>· €{lastCreated.value}</span>
            </div>
          </div>
          <a
            href={`/api/voucher/generate-pdf?code=${lastCreated.code}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px',
              borderRadius: '8px', background: '#166534', color: '#fff',
              textDecoration: 'none', fontSize: '13px', fontWeight: 600, flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            PDF herunterladen
          </a>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div style={{
          marginBottom: '32px', padding: '24px', borderRadius: '12px',
          background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-100)',
        }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600, color: 'var(--theme-text)' }}>
            Neuen Gutschein erstellen
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--theme-text)', opacity: 0.6, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Wert (€) *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="z.B. 99"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '14px',
                  border: '1px solid var(--theme-elevation-200)', background: 'var(--theme-elevation-0)',
                  color: 'var(--theme-text)', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--theme-text)', opacity: 0.6, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Name Käufer:in
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={form.purchaserName}
                onChange={(e) => setForm((f) => ({ ...f, purchaserName: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '14px',
                  border: '1px solid var(--theme-elevation-200)', background: 'var(--theme-elevation-0)',
                  color: 'var(--theme-text)', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--theme-text)', opacity: 0.6, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Name Empfänger:in
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={form.recipientName}
                onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '14px',
                  border: '1px solid var(--theme-elevation-200)', background: 'var(--theme-elevation-0)',
                  color: 'var(--theme-text)', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--theme-text)', opacity: 0.6, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                E-Mail Empfänger:in
              </label>
              <input
                type="email"
                placeholder="Optional"
                value={form.recipientEmail}
                onChange={(e) => setForm((f) => ({ ...f, recipientEmail: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '14px',
                  border: '1px solid var(--theme-elevation-200)', background: 'var(--theme-elevation-0)',
                  color: 'var(--theme-text)', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--theme-text)', opacity: 0.6, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Persönliche Nachricht
            </label>
            <textarea
              placeholder="Optional — erscheint auf dem Gutschein"
              value={form.personalNote}
              onChange={(e) => setForm((f) => ({ ...f, personalNote: e.target.value }))}
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '14px',
                border: '1px solid var(--theme-elevation-200)', background: 'var(--theme-elevation-0)',
                color: 'var(--theme-text)', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>
          {formError && (
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#dc2626' }}>{formError}</p>
          )}
          <button
            onClick={handleCreate}
            disabled={isPending}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: '#111827', color: '#fff', fontSize: '14px', fontWeight: 600,
              opacity: isPending ? 0.5 : 1,
            }}
          >
            {isPending ? 'Wird erstellt…' : 'Gutschein erstellen'}
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Gesamt Gutscheine', value: vouchers.length },
          { label: 'Aktiv', value: active, accent: 'green' },
          { label: 'Eingelöst', value: redeemed, accent: 'purple' },
          { label: 'Gesamtwert verkauft', value: `€${totalValue}` },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{
            background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-100)',
            borderRadius: '10px', padding: '16px 18px',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', marginBottom: '10px',
              background: accent === 'green' ? '#dcfce7' : accent === 'purple' ? '#ede9fe' : 'var(--theme-elevation-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
            }}>
              {accent === 'green' ? '✓' : accent === 'purple' ? '★' : '🎟'}
            </div>
            <p style={{ margin: '0 0 2px', fontSize: '12px', color: 'var(--theme-text)', opacity: 0.55 }}>{label}</p>
            <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--theme-text)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: 'var(--theme-elevation-100)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
          {([['all', 'Alle'], ['active', 'Aktiv'], ['redeemed', 'Eingelöst']] as ['all' | 'active' | 'redeemed', string][]).map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: filter === val ? 600 : 400,
                background: filter === val ? 'var(--theme-elevation-0)' : 'transparent',
                color: 'var(--theme-text)',
                boxShadow: filter === val ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--theme-elevation-100)', borderRadius: '8px', padding: '8px 12px', flex: 1, minWidth: '200px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45, flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche nach Code, Name oder E-Mail..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: 'var(--theme-text)', width: '100%' }}
          />
        </div>
      </div>

      {/* Voucher list */}
      {filtered.length === 0 ? (
        <p style={{ color: 'var(--theme-text)', opacity: 0.5, padding: '20px 0' }}>
          {vouchers.length === 0 ? 'Noch keine Gutscheine vorhanden.' : 'Keine Ergebnisse für diesen Filter.'}
        </p>
      ) : (
        <div style={{
          background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-100)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--theme-elevation-100)' }}>
                {['Code', 'Wert', 'Status', 'Käufer:in → Empfänger:in', 'Erstellt', 'PDF', ''].map((col) => (
                  <th key={col} style={{
                    padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: '11px',
                    textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--theme-text)', opacity: 0.55,
                    whiteSpace: 'nowrap',
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} style={{ borderTop: '1px solid var(--theme-elevation-100)' }}>
                  <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: 'var(--theme-text)', letterSpacing: '0.04em' }}>
                        {v.code}
                      </span>
                      <CopyButton text={v.code} />
                    </div>
                    {v.redeemedForWorkshop && (
                      <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--theme-text)', opacity: 0.45 }}>
                        Eingelöst für: {v.redeemedForWorkshop}
                        {v.redeemedOn ? ` · ${v.redeemedOn}` : ''}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontWeight: 700, fontSize: '15px', color: 'var(--theme-text)', whiteSpace: 'nowrap' }}>
                    €{v.value}
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                    <StatusBadge status={v.status} />
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                    {v.purchaserName || v.purchaserEmail ? (
                      <div>
                        <span style={{ color: 'var(--theme-text)', fontWeight: 500 }}>{v.purchaserName || v.purchaserEmail}</span>
                        {v.recipientName && (
                          <span style={{ color: 'var(--theme-text)', opacity: 0.5 }}> → {v.recipientName}</span>
                        )}
                      </div>
                    ) : (
                      <span style={{ opacity: 0.35 }}>—</span>
                    )}
                    {v.personalNote && (
                      <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--theme-text)', opacity: 0.45, fontStyle: 'italic' }}>
                        &bdquo;{v.personalNote.slice(0, 60)}{v.personalNote.length > 60 ? '…' : ''}&ldquo;
                      </p>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'middle', color: 'var(--theme-text)', opacity: 0.55, whiteSpace: 'nowrap' }}>
                    {v.createdAt}
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                    <a
                      href={`/api/voucher/generate-pdf?code=${encodeURIComponent(v.code)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="PDF herunterladen"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '6px', textDecoration: 'none',
                        background: 'var(--theme-elevation-100)', color: 'var(--theme-text)',
                        fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      PDF
                    </a>
                  </td>
                  <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                    <button
                      onClick={() => setConfirmDelete({ id: v.id, code: v.code })}
                      title="Gutschein löschen"
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '32px', height: '32px', borderRadius: '6px', border: 'none',
                        cursor: 'pointer', background: 'transparent', color: '#dc2626',
                        opacity: 0.6, transition: 'opacity 0.15s, background 0.15s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.6'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {redeemed > 0 && filter !== 'active' && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--theme-elevation-100)', fontSize: '12px', color: 'var(--theme-text)', opacity: 0.45 }}>
              Eingelöster Gesamtwert: €{redeemedValue}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
