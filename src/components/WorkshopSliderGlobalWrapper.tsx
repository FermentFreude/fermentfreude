import { WorkshopSliderBlock } from '@/blocks/WorkshopSlider/Component'
import { getLocale } from '@/utilities/getLocale'
import { getWorkshopSliderGlobal } from '@/utilities/getWorkshopSliderGlobal'

interface WorkshopSliderGlobalWrapperProps {
  id?: string
}

/**
 * Server component that fetches global workshop slider data and renders it.
 * Edit once in /admin → Website → Workshop Slider, appears everywhere.
 */
export async function WorkshopSliderGlobalWrapper({ id }: WorkshopSliderGlobalWrapperProps) {
  const locale = await getLocale()
  const data = await getWorkshopSliderGlobal(locale)

  return (
    <WorkshopSliderBlock
      id={id}
      blockType="workshopSlider"
      eyebrow={data.eyebrow ?? undefined}
      workshops={data.workshops ?? []}
      allWorkshopsButtonLabel={data.allWorkshopsButtonLabel ?? undefined}
      allWorkshopsLink={data.allWorkshopsLink ?? undefined}
    />
  )
}
