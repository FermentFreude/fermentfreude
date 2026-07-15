'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export const BacklogNavLink: React.FC = () => {
  const pathname = usePathname()
  const isActive = pathname?.startsWith('/admin/backlog')

  return (
    <div style={{ padding: '0 8px 8px' }}>
      <Link
        href="/admin/backlog"
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
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        Backlog
      </Link>
    </div>
  )
}
