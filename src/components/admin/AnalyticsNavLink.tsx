'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export const AnalyticsNavLink: React.FC = () => {
  const pathname = usePathname()
  const isActive = pathname?.startsWith('/admin/analytics')

  return (
    <div style={{ padding: '0 8px 8px' }}>
      <Link
        href="/admin/analytics"
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
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        Analytics
      </Link>
    </div>
  )
}
