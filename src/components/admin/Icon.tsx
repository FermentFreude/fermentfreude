'use client'

import { useTheme } from '@payloadcms/ui'
import React from 'react'

export const Icon: React.FC = () => {
  const { theme } = useTheme()

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={theme === 'dark' ? '/submark-dark.png' : '/submark-light.png'}
      alt="Fermentfreude"
      style={{
        width: '36px',
        height: '36px',
        objectFit: 'contain',
      }}
    />
  )
}
