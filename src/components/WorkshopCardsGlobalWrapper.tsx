import { WorkshopCardsSection } from '@/components/WorkshopCardsSection'
import { getLocale } from '@/utilities/getLocale'
import { getWorkshopCardsGlobal } from '@/utilities/getWorkshopCardsGlobal'

interface WorkshopCardsGlobalWrapperProps {
  id?: string
  layout?: 'centered' | 'inline'
}

/**
 * Server component that fetches global workshop cards data and renders it.
 * Edit once in /admin → Website → Workshop Cards, appears everywhere.
 */
export async function WorkshopCardsGlobalWrapper({
  id: _id,
  layout = 'inline',
}: WorkshopCardsGlobalWrapperProps) {
  const locale = await getLocale()
  const data = await getWorkshopCardsGlobal(locale)

  return (
    <WorkshopCardsSection
      title={data.title}
      subtitle={data.subtitle ?? null}
      clarification={data.clarification ?? null}
      nextDateLabel={data.nextDateLabel ?? null}
      viewAllLabel={data.viewAllLabel ?? null}
      viewAllUrl={data.viewAllUrl ?? null}
      cards={data.cards ?? []}
      layout={layout}
    />
  )
}
