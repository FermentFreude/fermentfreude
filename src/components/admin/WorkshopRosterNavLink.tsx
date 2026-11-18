'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export const WorkshopRosterNavLink: React.FC = () => {
  const pathname = usePathname()
  const isActive = pathname?.startsWith('/admin/workshop-roster')
  const [unread, setUnread] = useState(0)
  const [refunds, setRefunds] = useState(0)
  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const r = await fetch('/api/admin/notification-count', { cache: 'no-store' })
        if (r.ok && alive) {
          const j = await r.json()
          setUnread(Number(j.unread) || 0)
          setRefunds(Number(j.refunds) || 0)
        }
      } catch {
        // badge is a convenience
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [pathname])

  return (
    <div style={{ padding: '0 8px 8px' }}>
      <Link
        href="/admin/workshop-roster"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: isActive ? 600 : 500,
          color: 'var(--theme-text)',
          textDecoration: 'none',
          background: isActive ? 'var(--theme-elevation-100)' : 'transparent',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'var(--theme-elevation-50)'
        }}
        onMouseLeave={(e) => {
          if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: isActive ? 1 : 0.65, flexShrink: 0 }}
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        Management
      </Link>
      <div style={{ display: 'grid', gap: 2, margin: '2px 0 0 22px', paddingLeft: 10, borderLeft: '1px solid var(--theme-elevation-150)' }}>
        {SUB_LINKS.map((l) => (
          <Link
            key={l.view}
            href={`/admin/workshop-roster?section=${l.view}`}
            style={{ padding: '6px 10px', borderRadius: 4, fontSize: 13, fontWeight: 500, color: 'var(--theme-text)', textDecoration: 'none', opacity: 0.85 }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              {l.label}
              {((l.view === 'dashboard' && unread > 0) || (l.view === 'refunds' && refunds > 0)) && (
                <span style={{ background: '#e6be68', color: '#2a2c28', borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '1px 7px', lineHeight: 1.5 }}>
                  {(() => { const n = l.view === 'refunds' ? refunds : unread; return n > 99 ? '99+' : n })()}
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

const SUB_LINKS = [
  { view: 'dashboard', label: 'Notifications' },
  { view: 'workshops', label: 'Workshops' },
  { view: 'participants', label: 'Participants' },
  { view: 'vouchers', label: 'Vouchers' },
  { view: 'orders', label: 'Shop' },
  { view: 'refunds', label: 'Requests' },
]
