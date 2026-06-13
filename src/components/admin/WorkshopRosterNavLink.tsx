'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export const WorkshopRosterNavLink: React.FC = () => {
  const pathname = usePathname()
  const isActive = pathname?.startsWith('/admin/workshop-roster')

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
        Tagesübersicht
      </Link>
    </div>
  )
}
