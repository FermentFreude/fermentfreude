import { FadeIn } from '@/components/FadeIn'
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
    <section id={id ?? undefined} className="bg-ff-warm-gray section-padding-sm container-padding">
      <div className="container mx-auto flex flex-col items-center gap-(--space-content-lg)">
        <FadeIn>
          <h3 className="text-ff-black text-center">{resolvedHeading}</h3>
        </FadeIn>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 w-full content-wide mx-auto">
          {resolvedSponsors.map((sponsor, index) => {
            const logo = sponsor.logo
            const content = (
              <FadeIn
                key={index}
                delay={index * 100}
                className="flex items-center justify-center h-8 md:h-10 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300"
              >
                {logo && typeof logo === 'object' ? (
                  <Media
                    resource={logo as MediaType}
                    className="h-full w-auto object-contain max-w-32"
                  />
                ) : (
                  <div className="h-full w-28 bg-ff-sponsor-placeholder rounded-(--radius-md)" />
                )}
              </FadeIn>
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
