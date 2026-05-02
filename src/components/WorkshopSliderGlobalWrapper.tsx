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
 *
 * Also fetches the next bookable appointment per workshop (skipping
 * fully-booked ones) so the slider can show a live "Next date" badge.
 */
export async function WorkshopSliderGlobalWrapper({
  id,
  fallbackData,
}: WorkshopSliderGlobalWrapperProps) {
  const locale = await getLocale()
  const [data, upcomingDatesByHrefRaw] = await Promise.all([
    getWorkshopSliderGlobal(locale),
    getNextWorkshopDatesByHref(locale),
  ])

  // Slider only needs the formatted date string per href.
  const upcomingDatesByHref: Record<string, string> = Object.fromEntries(
    Object.entries(upcomingDatesByHrefRaw).map(([href, info]) => [href, info.date]),
  )

  const upcomingLabel = locale === 'en' ? 'Next date' : 'Nächster Termin'

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
      upcomingLabel={upcomingLabel}
      upcomingDatesByHref={upcomingDatesByHref}
    />
  )
}
