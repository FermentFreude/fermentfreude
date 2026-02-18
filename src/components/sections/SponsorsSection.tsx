import { Media } from '@/components/Media'

export type SponsorLogo = {
  image?: unknown
  alt?: string
}

export type SponsorsSectionProps = {
  heading: string
  logos: SponsorLogo[]
  className?: string
}

function getImageUrl(image: unknown): string {
  if (!image) return ''
  if (typeof image === 'string') return image
  if (typeof image === 'object' && image !== null && 'url' in image) {
    const url = (image as { url?: string }).url
    if (!url) return ''
    return url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_SERVER_URL || ''}${url}`
  }
  return ''
}

function getImageAlt(image: unknown): string {
  if (!image) return ''
  if (typeof image === 'object' && image !== null && 'alt' in image) {
    const alt = (image as { alt?: string | { de?: string; en?: string } }).alt
    if (typeof alt === 'string') return alt
    if (typeof alt === 'object' && alt !== null) {
      return alt.de || alt.en || ''
    }
  }
  return ''
}

/**
 * Reusable Sponsors section with heading and logo grid.
 * Use on About page, footer, or any page that displays sponsor logos.
 * Only renders when logos array has items.
 */
export function SponsorsSection({ heading, logos, className }: SponsorsSectionProps) {
  if (logos.length === 0) return null

  return (
    <section className={`w-full bg-[#ECE5DE] py-12 pb-16 md:py-24 ${className ?? ''}`}>
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex flex-col items-center gap-12">
          <h2 className="font-display text-center text-3xl font-bold text-[#1D1D1D]">
            {heading}
          </h2>
          <div className="flex w-full flex-wrap items-center justify-center md:justify-between gap-16">
            {logos.map((logo: SponsorLogo, idx: number) => {
              const logoUrl = getImageUrl(logo.image)
              const logoAlt = getImageAlt(logo.image) || logo.alt || `Sponsor Logo ${idx + 1}`

              return (
                <div
                  key={idx}
                  className="flex h-24 w-48 items-center justify-center rounded-lg"
                >
                  {logoUrl ? (
                    <Media
                      resource={
                        logo.image as
                          | string
                          | number
                          | import('@/payload-types').Media
                          | undefined
                      }
                      imgClassName="h-full w-full object-contain"
                    />
                  ) : (
                    <img
                      src={`/assets/images/sponsor-logo-${idx + 1}.svg`}
                      alt={logoAlt}
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
