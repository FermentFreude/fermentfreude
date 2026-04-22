import { WorkshopCardsSection } from '@/components/WorkshopCardsSection'
import { getLocale } from '@/utilities/getLocale'
import { getNextWorkshopDatesByHref } from '@/utilities/getNextWorkshopDatesByHref'
import { getWorkshopCardsGlobal } from '@/utilities/getWorkshopCardsGlobal'

interface WorkshopCardsGlobalWrapperProps {
  id?: string
  layout?: 'centered' | 'inline'
}

/**
 * Server component that fetches global workshop cards data and renders it.
 * Automatically overlays next appointment dates from the workshop-appointments collection.
 * Edit once in /admin → Website → Workshop Cards, appears everywhere.
 */
export async function WorkshopCardsGlobalWrapper({
  id: _id,
  layout = 'inline',
}: WorkshopCardsGlobalWrapperProps) {
  const locale = await getLocale()
  const [data, nextDates] = await Promise.all([
    getWorkshopCardsGlobal(locale),
    getNextWorkshopDatesByHref(locale === 'en' ? 'en' : 'de'),
  ])

  // Overlay dynamic dates from workshop-appointments onto each card
  const cards = (data.cards ?? []).map((card) => {
    const nextDateData = card.buttonUrl ? nextDates[card.buttonUrl] : undefined
    return {
      ...card,
      nextDate: nextDateData?.date || card.nextDate || null,
      availableSpots: nextDateData?.availableSpots,
    }
  })

  return (
    <WorkshopCardsSection
      title={data.title}
      subtitle={data.subtitle ?? null}
      clarification={data.clarification ?? null}
      nextDateLabel={data.nextDateLabel ?? null}
      viewAllLabel={data.viewAllLabel ?? null}
      viewAllUrl={data.viewAllUrl ?? null}
      cards={cards}
      layout={layout}
      locale={locale as 'de' | 'en'}
    />
  )
}
