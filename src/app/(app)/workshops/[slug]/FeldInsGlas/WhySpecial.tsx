/**
 * FeldInsGlas - why special: image-led editorial bands
 */

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import type { FeldInsGlasCopy } from './data'

type Card = { title: string; text: string }

const CARDS_DE: Card[] = [
  {
    title: 'Anderer Ort',
    text: 'Nicht im Studio, sondern im Marktgarten „Unser Bauerngarten“, dort wo das Gemüse wächst.',
  },
  {
    title: 'Vom Feld ins Glas',
    text: 'Ernte, Vorbereitung und Lakto-Fermentation in einem Nachmittag. Der Weg ist das Erlebnis.',
  },
  {
    title: 'Was du mitnimmst',
    text: 'Eigene Gläser, Rezeptnotizen und das Gefühl, Fermentation dort gelernt zu haben, wo sie beginnt.',
  },
]

const CARDS_EN: Card[] = [
  {
    title: 'Another place',
    text: 'Not in the studio, but at Marktgarten “Unser Bauerngarten”, where the vegetables grow.',
  },
  {
    title: 'Field to jar',
    text: 'Harvest energy, prep, and lacto-fermentation in one afternoon. The journey is the experience.',
  },
  {
    title: 'What you take home',
    text: 'Your own jars, recipe notes, and the feeling of learning fermentation where it starts.',
  },
]

export function FeldInsGlasWhySpecial({
  copy,
  locale,
  images,
}: {
  copy: FeldInsGlasCopy
  locale: 'de' | 'en'
  images?: Array<MediaType | null | undefined>
}) {
  const cards = locale === 'en' ? CARDS_EN : CARDS_DE
  const heading =
    locale === 'en' ? 'Why this workshop is special' : 'Warum dieser Workshop besonders ist'
  const sub =
    locale === 'en'
      ? 'Same craft as our lacto workshop, a different stage, story, and setting.'
      : 'Gleiches Handwerk wie unser Lakto-Workshop, andere Bühne, andere Geschichte, anderer Ort.'

  return (
    <section className="bg-white">
      <div className="section-padding-lg container-padding mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-[#555954]/70">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-section-heading font-black tracking-tight text-[#1a1c1a]">
            {heading}
          </h2>
          <p className="mt-4 text-body-sm leading-relaxed text-[#1a1c1a]/70 sm:text-body">{sub}</p>
        </div>

        <div className="mt-14 space-y-6 lg:space-y-8">
          {cards.map((card, i) => {
            const img = images?.[i]
            const hasImage = img && typeof img === 'object' && 'url' in img
            const reverse = i % 2 === 1

            return (
              <article
                key={card.title}
                className={`grid overflow-hidden bg-[#F6F3F0] lg:grid-cols-2 ${
                  reverse ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div className="relative min-h-52 lg:min-h-72">
                  {hasImage ? (
                    <Media resource={img} fill imgClassName="object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-[#ECE5DE]" />
                  )}
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14">
                  <span className="font-display text-[10px] font-bold text-[#555954]/35">
                    0{i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-subheading font-black tracking-tight text-[#1a1c1a]">
                    {card.title}
                  </h3>
                  <p className="mt-3 max-w-md text-body-sm leading-relaxed text-[#1a1c1a]/70">
                    {card.text}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
