import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

interface VoucherAboutSectionProps {
  heading: string
  body: string
  benefits: string[]
  image?: MediaType | string | null
}

export function VoucherAboutSection({
  heading,
  body,
  benefits,
  image,
}: VoucherAboutSectionProps) {
  const paragraphs = body.split(/\n\n+/).filter(Boolean)
  const hasImage = image && typeof image === 'object' && image !== null && 'url' in image

  return (
    <section className="w-full bg-white">
      <div
        className={`mx-auto max-w-[var(--content-full)] px-[var(--space-container-x)] py-16 md:py-20 ${
          hasImage ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center' : ''
        }`}
      >
        <div className={hasImage ? 'order-2 lg:order-1' : 'max-w-[40rem]'}>
          <h2 className="font-display text-[length:var(--text-heading)] font-bold tracking-tight text-ff-near-black">
            {heading}
          </h2>
          <div className="mt-6 space-y-4">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="font-sans text-[length:var(--text-body)] leading-[1.65] text-ff-gray-text"
              >
                {p}
              </p>
            ))}
          </div>
          {benefits.length > 0 && (
            <ul className="mt-8 space-y-2">
              {benefits.map((text, i) => (
                <li
                  key={i}
                  className="font-sans text-[length:var(--text-body-sm)] text-ff-gray-text flex items-baseline gap-2"
                >
                  <span className="h-1 w-1 flex-shrink-0 rounded-full bg-ff-gray-text" aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
          )}
        </div>
        {hasImage && (
          <div className="relative aspect-[4/5] min-h-[240px] overflow-hidden rounded-xl bg-ff-warm-gray order-1 lg:order-2">
            <Media resource={image} fill imgClassName="object-cover" priority />
          </div>
        )}
      </div>
    </section>
  )
}
