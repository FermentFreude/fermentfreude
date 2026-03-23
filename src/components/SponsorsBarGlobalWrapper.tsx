import { SponsorsBarBlock } from '@/blocks/SponsorsBar/Component'
import { getLocale } from '@/utilities/getLocale'
import { getSponsorsBarGlobal } from '@/utilities/getSponsorsBarGlobal'

interface SponsorsBarGlobalWrapperProps {
  id?: string
}

/**
 * Server component that fetches global sponsors bar data and renders it.
 * Edit once in /admin → Website → Sponsors Bar, appears everywhere.
 */
export async function SponsorsBarGlobalWrapper({ id }: SponsorsBarGlobalWrapperProps) {
  const locale = await getLocale()
  const data = await getSponsorsBarGlobal(locale)

  return (
    <SponsorsBarBlock
      id={id}
      blockType="sponsorsBar"
      heading={data.heading}
      sponsors={data.sponsors ?? []}
    />
  )
}
