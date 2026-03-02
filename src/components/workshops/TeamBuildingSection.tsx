import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import Link from 'next/link'

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

type Props = {
  eyebrow: string
  heading: string
  description: string
  bullets: string[]
  ctaLabel: string
  ctaHref: string
  image: MediaType | string | null | undefined
}

export function TeamBuildingSection({
  eyebrow,
  heading,
  description,
  bullets,
  ctaLabel,
  ctaHref,
  image,
}: Props) {
  return (
    <section className="section-padding-md container-padding overflow-hidden rounded-2xl bg-[#F5F4F2]">
      <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-2">
        {/* Left: text + CTA */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <span className="font-display text-sm font-bold uppercase tracking-wider text-[#E5B765]">
            {eyebrow}
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-[#1a1a1a] md:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 text-body-lg text-[#333]">{description}</p>
          {bullets.length > 0 && (
            <ul className="mt-6 space-y-2">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="shrink-0 font-display text-[#E5B765]">&gt;</span>
                  <span className="text-[#333]">{bullet}</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={ctaHref}
            className="mt-8 inline-flex w-fit items-center justify-center rounded-2xl bg-[#1a1a1a] px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#333]"
          >
            {ctaLabel}
          </Link>
        </div>
        {/* Right: image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto lg:min-h-[24rem]">
          {isResolvedMedia(image) ? (
            <Media resource={image} fill imgClassName="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-[#ECE5DE]" />
          )}
        </div>
      </div>
    </section>
  )
}
