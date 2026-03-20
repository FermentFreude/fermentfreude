'use client'

import { useTheme } from '@payloadcms/ui'
import React from 'react'

export const Icon: React.FC = () => {
  const { theme } = useTheme()

  return (
    <img
      src={theme === 'dark' ? '/submark-dark.png' : '/submark-light.png'}
      alt="FermentFreude"
      style={{
        width: '36px',
        height: '36px',
        objectFit: 'contain',
      }}
    />
  )
}
