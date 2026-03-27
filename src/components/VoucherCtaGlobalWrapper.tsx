import { LaktoVoucherCta } from '@/app/(app)/workshops/[slug]/LaktoVoucherCta'
import type { Media } from '@/payload-types'
import { getLocale } from '@/utilities/getLocale'
import { getVoucherCtaGlobal } from '@/utilities/getVoucherCtaGlobal'

interface VoucherCtaGlobalWrapperProps {
  id?: string
  fallbackData?: Record<string, unknown>
}

/**
 * Server component that fetches global voucher CTA data and renders LaktoVoucherCta.
 * Falls back to block-level data when the global is empty.
 */
export async function VoucherCtaGlobalWrapper({ id: _id, fallbackData }: VoucherCtaGlobalWrapperProps) {
  const locale = await getLocale()
  const data = await getVoucherCtaGlobal(locale)

  const hasGlobalContent = Boolean(data.eyebrow || data.title)
  const fb = fallbackData ?? {}

  return (
    <LaktoVoucherCta
      cms={{
        eyebrow: hasGlobalContent ? data.eyebrow : ((fb.eyebrow as string) ?? undefined),
        title: hasGlobalContent ? data.title : ((fb.title as string) ?? undefined),
        description: hasGlobalContent
          ? data.description
          : ((fb.description as string) ?? undefined),
        backgroundImage: hasGlobalContent
          ? (data.backgroundImage as Media | string | null)
          : ((fb.backgroundImage as Media | string | null) ?? null),
        primaryLabel: hasGlobalContent
          ? data.primaryLabel
          : ((fb.primaryLabel as string) ?? undefined),
        primaryHref: hasGlobalContent
          ? data.primaryHref
          : ((fb.primaryHref as string) ?? undefined),
        secondaryLabel: hasGlobalContent
          ? data.secondaryLabel
          : ((fb.secondaryLabel as string) ?? undefined),
        secondaryHref: hasGlobalContent
          ? data.secondaryHref
          : ((fb.secondaryHref as string) ?? undefined),
        pills: hasGlobalContent
          ? ((data.pills as Array<{ text?: string | null }>) ?? null)
          : ((fb.pills as Array<{ text?: string | null }>) ?? null),
      }}
    />
  )
}
