'use client'

import { FadeIn } from '@/components/FadeIn'
import React from 'react'

interface ContactCardAnimatedProps {
  children: React.ReactNode
}

export const ContactCardAnimated: React.FC<ContactCardAnimatedProps> = ({ children }) => {
  return (
    <FadeIn from="bottom" delay={0} duration={0.6}>
      {children}
    </FadeIn>
  )
}
