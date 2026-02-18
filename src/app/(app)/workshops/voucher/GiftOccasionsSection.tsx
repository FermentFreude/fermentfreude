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
    <section className="w-full py-12 md:py-24 bg-[#1D1D1D]">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex flex-col items-center gap-8 md:gap-12">
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center">
            {heading}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
            {occasions.map((occasion, idx) => (
              <div key={idx} className="flex flex-col gap-3 md:gap-4">
                {occasion.image && (
                  <div className="relative w-full aspect-square min-h-[150px] md:min-h-0 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <Media
                      resource={occasion.image}
                      fill
                      size="(max-width: 768px) 50vw, 25vw"
                      imgClassName="object-cover hover:scale-105 transition-transform duration-300"
                      priority={idx < 2}
                    />
                  </div>
                )}
                <p className="font-display text-base md:text-lg font-bold text-white text-center">
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
