import { WorkshopCardsSection } from '@/components/WorkshopCardsSection'
import { getLocale } from '@/utilities/getLocale'
import { buildSyncedWorkshopCards } from '@/utilities/gastronomyWorkshopCards'
import { getNextWorkshopDatesByHref } from '@/utilities/getNextWorkshopDatesByHref'
import { getWorkshopCardsGlobal } from '@/utilities/getWorkshopCardsGlobal'
import { getWorkshopPageCardDataByHref } from '@/utilities/workshopHeroImages'

function coerceNextDate(value: unknown): string | null {
  if (typeof value === 'string') return value

  if (value && typeof value === 'object' && 'date' in value) {
    const date = (value as { date?: unknown }).date
    return typeof date === 'string' ? date : null
  }

  return null
}

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
  const [data, nextDates, workshopPageData] = await Promise.all([
    getWorkshopCardsGlobal(locale),
    getNextWorkshopDatesByHref(locale === 'en' ? 'en' : 'de'),
    getWorkshopPageCardDataByHref(locale as 'de' | 'en'),
  ])

  const cards = buildSyncedWorkshopCards(
    (data.cards ?? []).map((card) => ({
      ...card,
      nextDate: coerceNextDate(card.nextDate),
    })),
    workshopPageData,
    locale as 'de' | 'en',
    nextDates,
  )

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
