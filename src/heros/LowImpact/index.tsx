import React from 'react'

import type { Page } from '@/payload-types'

import { RichText } from '@/components/RichText'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richTextLowImpact?: never
    }
  | (Page['hero'] & {
      children?: never
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richTextLowImpact }) => {
  return (
    <div className="container mt-16">
      <div className="max-w-3xl">
        {children || (richTextLowImpact && <RichText data={richTextLowImpact} enableGutter={false} />)}
      </div>
    </div>
  )
}
