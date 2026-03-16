import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

interface GiftOccasion {
  image?: MediaType | string | null
  caption: string
}

interface GiftOccasionsSectionProps {
  heading: string
  occasions: GiftOccasion[]
}

export function GiftOccasionsSection({ heading, occasions }: GiftOccasionsSectionProps) {
  return (
    <section className="w-full py-12 md:py-14 bg-ff-near-black">
      <div className="mx-auto max-w-[var(--content-wide)] px-[var(--space-container-x)]">
        <div className="flex flex-col items-center gap-8 md:gap-12">
          <h2 className="font-display text-[length:var(--text-heading)] font-bold text-white text-center tracking-tight">
            {heading}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
            {occasions.map((occasion, idx) => (
              <div key={idx} className="flex flex-col gap-3 md:gap-4">
                {occasion.image && (
                  <div className="group/img relative w-full aspect-square min-h-[150px] md:min-h-0 overflow-hidden rounded-[var(--radius-xl)] shadow-lg transition-all duration-300 hover:shadow-xl after:pointer-events-none after:absolute after:inset-0 after:rounded-[var(--radius-xl)] after:bg-ff-gold-accent/0 after:transition-colors after:duration-300 hover:after:bg-ff-gold-accent/5">
                    <Media
                      resource={occasion.image}
                      fill
                      size="(max-width: 768px) 50vw, 25vw"
                      imgClassName="object-cover transition-transform duration-300 group-hover/img:scale-105"
                      priority={idx < 2}
                    />
                  </div>
                )}
                <p className="font-display text-[length:var(--text-body-lg)] font-semibold text-white text-center">
                  {occasion.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
