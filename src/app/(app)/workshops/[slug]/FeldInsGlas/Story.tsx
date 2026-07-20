/**
 * FeldInsGlas -  editorial story section with image
 */

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import type { FeldInsGlasCopy } from './data'

const STEPS_DE = [
  { label: 'Feld', detail: 'Saisonal ernten' },
  { label: 'Gemüse', detail: 'Frisch verarbeiten' },
  { label: 'Glas', detail: 'Lakto-Ferment' },
]

const STEPS_EN = [
  { label: 'Field', detail: 'Seasonal harvest' },
  { label: 'Veg', detail: 'Prep fresh' },
  { label: 'Jar', detail: 'Lacto ferment' },
]

export function FeldInsGlasStory({
  copy,
  locale,
  image,
}: {
  copy: FeldInsGlasCopy
  locale: 'de' | 'en'
  image?: MediaType | null
}) {
  const steps = locale === 'en' ? STEPS_EN : STEPS_DE
  const hasImage = image && typeof image === 'object' && 'url' in image

  return (
    <section className="bg-[#F6F3F0]">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[320px] overflow-hidden lg:min-h-[560px]">
          {hasImage ? (
            <Media resource={image} fill imgClassName="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[#ECE5DE]" />
          )}
        </div>

        <div className="section-padding-lg container-padding flex flex-col justify-center">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-[#555954]/70">
            {copy.storyEyebrow}
          </p>
          <h2 className="mt-3 max-w-md font-display text-section-heading font-black tracking-tight text-[#1a1c1a]">
            {copy.storyTitle}
          </h2>
          <p className="mt-4 max-w-md text-body-sm leading-relaxed text-[#1a1c1a]/70 sm:text-body">
            {copy.storyText}
          </p>

          <ol className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            {steps.map((step, i) => (
              <li
                key={step.label}
                className="border border-[#555954]/15 bg-white/80 p-4 backdrop-blur-sm"
              >
                <span className="font-display text-[10px] font-bold text-[#555954]/35">
                  0{i + 1}
                </span>
                <p className="mt-3 font-display text-body font-black tracking-tight text-[#1a1c1a]">
                  {step.label}
                </p>
                <p className="mt-1 text-caption text-[#555954]/80">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
