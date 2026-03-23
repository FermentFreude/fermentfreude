import { LaktoVoucherCta } from '@/app/(app)/workshops/[slug]/LaktoVoucherCta'
import type { LaktoVoucherCtaBlock as LaktoVoucherCtaBlockType, Media } from '@/payload-types'
import React from 'react'

export const LaktoVoucherCtaBlockComponent: React.FC<LaktoVoucherCtaBlockType> = (props) => {
  const {
    visible,
    eyebrow,
    title,
    description,
    backgroundImage,
    primaryLabel,
    primaryHref,
    secondaryLabel,
    secondaryHref,
    pills,
  } = props

  if (visible === false) return null

  return (
    <LaktoVoucherCta
      cms={{
        eyebrow,
        title,
        description,
        backgroundImage: backgroundImage as Media | string | null | undefined,
        primaryLabel,
        primaryHref,
        secondaryLabel,
        secondaryHref,
        pills: pills?.map((p) => ({ text: p.text })) ?? null,
      }}
    />
  )
}
