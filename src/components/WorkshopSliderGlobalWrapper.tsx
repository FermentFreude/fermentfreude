import { WorkshopSliderBlock } from '@/blocks/WorkshopSlider/Component'
import { getLocale } from '@/utilities/getLocale'
import { getNextWorkshopDatesByHref } from '@/utilities/getNextWorkshopDatesByHref'
import { getWorkshopSliderGlobal } from '@/utilities/getWorkshopSliderGlobal'

interface WorkshopSliderGlobalWrapperProps {
  id?: string
  fallbackData?: Record<string, unknown>
}

/**
 * Server component that fetches global workshop slider data and renders it.
 * Falls back to block-level data when the global is empty.
 * Also overlays live appointment availability per workshop href.
 */
export async function WorkshopSliderGlobalWrapper({
  id,
  fallbackData,
}: WorkshopSliderGlobalWrapperProps) {
  const locale = await getLocale()
  const normalizedLocale: 'de' | 'en' = locale === 'en' ? 'en' : 'de'
  const [data, availabilityByHref] = await Promise.all([
    getWorkshopSliderGlobal(locale),
    getNextWorkshopDatesByHref(normalizedLocale),
  ])

  // Use global data if it has workshops, otherwise fall back to block-level data
  const hasGlobalContent = (data.workshops?.length ?? 0) > 0
  const fb = fallbackData ?? {}

  return (
    <WorkshopSliderBlock
      id={id}
      blockType="workshopSlider"
      eyebrow={
        hasGlobalContent ? (data.eyebrow ?? undefined) : ((fb.eyebrow as string) ?? undefined)
      }
      workshops={
        hasGlobalContent ? (data.workshops ?? []) : ((fb.workshops as [] | undefined) ?? [])
      }
      allWorkshopsButtonLabel={
        hasGlobalContent
          ? (data.allWorkshopsButtonLabel ?? undefined)
          : ((fb.allWorkshopsButtonLabel as string) ?? undefined)
      }
      allWorkshopsLink={
        hasGlobalContent
          ? (data.allWorkshopsLink ?? undefined)
          : ((fb.allWorkshopsLink as string) ?? undefined)
      }
      availabilityByHref={availabilityByHref}
      locale={normalizedLocale}
    />
  )
}
