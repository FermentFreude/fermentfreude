import { WorkshopSliderBlock } from '@/blocks/WorkshopSlider/Component'
import { getLocale } from '@/utilities/getLocale'
import { getWorkshopSliderGlobal } from '@/utilities/getWorkshopSliderGlobal'

interface WorkshopSliderGlobalWrapperProps {
  id?: string
  fallbackData?: Record<string, unknown>
}

/**
 * Server component that fetches global workshop slider data and renders it.
 * Falls back to block-level data when the global is empty.
 */
export async function WorkshopSliderGlobalWrapper({
  id,
  fallbackData,
}: WorkshopSliderGlobalWrapperProps) {
  const locale = await getLocale()
  const data = await getWorkshopSliderGlobal(locale)

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
    />
  )
}
