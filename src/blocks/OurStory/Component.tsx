import type { OurStoryBlock as OurStoryBlockType } from '@/payload-types'

const DEFAULTS = {
  label: 'Our Story',
  heading: 'Bringing Joy to Fermentation',
  subheading:
    'Making fermentation joyful & accessible while empowering gut health through taste, education, and quality handmade foods',
  paragraphs: [
    'FermentFreude is a modern Austrian food-tech startup helping people discover fermentation through fun workshops and premium fermented products. We combine health, enjoyment, and knowledge to make fermentation part of everyday life.',
    'By merging traditional fermentation methods with modern science and regional sourcing, we empower home cooks and professionals to approach food with confidence, curiosity, and pleasure.',
  ],
}

type Props = OurStoryBlockType & { id?: string }

export const OurStoryBlock: React.FC<Props> = ({ label, heading, subheading, paragraphs, id }) => {
  const resolvedLabel = label ?? DEFAULTS.label
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedSubheading = subheading ?? DEFAULTS.subheading
  const resolvedParagraphs =
    paragraphs && paragraphs.length > 0
      ? paragraphs.map((p) => p.text ?? '')
      : DEFAULTS.paragraphs

  return (
    <section id={id ?? undefined} className="w-full pt-4 pb-8 md:py-24">
      <div className="mx-auto max-w-350 px-6">
        <div className="flex flex-col items-center gap-12">
          <h2 className="font-display text-3xl font-bold text-[#E5B765]">{resolvedLabel}</h2>
          <h1 className="font-display text-center text-5xl font-bold leading-tight text-[#1D1D1D]">
            {resolvedHeading}
          </h1>
          <p className="max-w-4xl text-center font-display text-3xl font-bold leading-relaxed text-[#4B4F4A]">
            {resolvedSubheading}
          </p>
          <div className="flex w-full flex-col gap-1 bg-white py-4 -mt-12 text-center">
            {resolvedParagraphs.map((paragraph: string, idx: number) => (
              <p
                key={idx}
                className="font-display text-2xl font-normal leading-relaxed text-[#1D1D1D]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
