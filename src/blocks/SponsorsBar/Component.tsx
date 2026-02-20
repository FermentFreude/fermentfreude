import { Media } from '@/components/Media'
import type { Media as MediaType, SponsorsBarBlock as SponsorsBarBlockType } from '@/payload-types'

const DEFAULTS = {
  heading: 'This project is supported by:',
}

type Props = SponsorsBarBlockType & { id?: string }

export const SponsorsBarBlock: React.FC<Props> = ({ heading, sponsors, id }) => {
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedSponsors = sponsors ?? []

  return (
    <section id={id ?? undefined} className="bg-[#ece5de] px-6 py-12 md:py-16 lg:py-19.25">
      <div className="container mx-auto flex flex-col items-center gap-8 md:gap-10 lg:gap-12">
        <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-[45px] leading-[1.3] text-[#1d1d1d] text-center">
          {resolvedHeading}
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16 w-full max-w-300">
          {resolvedSponsors.map((sponsor, index) => {
            const logo = sponsor.logo
            const content = (
              <div
                key={index}
                className="flex items-center justify-center h-16 md:h-20 lg:h-25 w-auto opacity-80 hover:opacity-100 transition-opacity"
              >
                {logo && typeof logo === 'object' ? (
                  <Media
                    resource={logo as MediaType}
                    className="h-full w-auto object-contain max-w-50"
                  />
                ) : (
                  <div className="h-full w-40 bg-[#d9d2cb] rounded-lg" />
                )}
              </div>
            )

            if (sponsor.url) {
              return (
                <a
                  key={index}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  {content}
                </a>
              )
            }

            return content
          })}
        </div>
      </div>
    </section>
  )
}
