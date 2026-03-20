'use client'

import { useTheme } from '@payloadcms/ui'
import React from 'react'

export const Logo: React.FC = () => {
  const { theme } = useTheme()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '2rem 0',
      }}
    >
      <img
        src={theme === 'dark' ? '/submark-dark.png' : '/submark-light.png'}
        alt="FermentFreude"
        style={{
          width: '320px',
          maxWidth: '80vw',
          height: 'auto',
          objectFit: 'contain',
        }}
      />
    </div>
  )
}
