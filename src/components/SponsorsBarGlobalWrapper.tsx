import { SponsorsBarBlock } from '@/blocks/SponsorsBar/Component'
import { getLocale } from '@/utilities/getLocale'
import { getSponsorsBarGlobal } from '@/utilities/getSponsorsBarGlobal'

interface SponsorsBarGlobalWrapperProps {
  id?: string
  fallbackData?: Record<string, unknown>
}

/**
 * Server component that fetches global sponsors bar data and renders it.
 * Falls back to block-level data when the global is empty.
 */
export async function SponsorsBarGlobalWrapper({
  id,
  fallbackData,
}: SponsorsBarGlobalWrapperProps) {
  const locale = await getLocale()
  const data = await getSponsorsBarGlobal(locale)

  // Use global data if it has sponsors, otherwise fall back to block-level data
  const hasGlobalContent = (data.sponsors?.length ?? 0) > 0
  const fb = fallbackData ?? {}

  return (
    <SponsorsBarBlock
      id={id}
      blockType="sponsorsBar"
      heading={hasGlobalContent ? data.heading : ((fb.heading as string) ?? undefined)}
      sponsors={hasGlobalContent ? (data.sponsors ?? []) : ((fb.sponsors as [] | undefined) ?? [])}
    />
  )
}
