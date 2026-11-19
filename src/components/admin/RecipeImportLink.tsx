import Link from 'next/link'
import React from 'react'

/* Shown above the recipe list in /admin: shortcut to the bulk import. */
export const RecipeImportLink: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 0 16px' }}>
    <Link
      href="/admin/rezepte-import"
      style={{
        border: '1px solid var(--theme-elevation-300)',
        borderRadius: 6,
        padding: '8px 14px',
        fontWeight: 600,
        textDecoration: 'none',
        color: 'var(--theme-text)',
      }}
    >
      Viele Rezepte auf einmal importieren →
    </Link>
  </div>
)
