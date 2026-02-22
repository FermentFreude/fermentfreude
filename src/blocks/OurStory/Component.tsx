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
    paragraphs && paragraphs.length > 0 ? paragraphs.map((p) => p.text ?? '') : DEFAULTS.paragraphs

  return (
    <section id={id ?? undefined} className="section-padding-md">
      <div className="container mx-auto container-padding">
        <div className="flex flex-col items-center gap-(--space-content-xl) content-medium mx-auto">
          <span className="text-eyebrow text-ff-gold-accent">{resolvedLabel}</span>
          <h2 className="text-center text-ff-black">{resolvedHeading}</h2>
          <p className="text-body-lg text-center text-ff-olive content-medium">
            {resolvedSubheading}
          </p>
          <div className="flex w-full flex-col gap-(--space-content-sm) text-center content-medium">
            {resolvedParagraphs.map((paragraph: string, idx: number) => (
              <p key={idx} className="text-body text-ff-black/80">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
