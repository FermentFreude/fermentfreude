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
    <section id={id ?? undefined} className="section-padding-lg bg-ff-cream">
      <div className="container mx-auto container-padding">
        <div className="mx-auto max-w-[var(--content-wide)]">
          {/* Eyebrow + heading */}
          <div className="text-center">
            <span className="text-eyebrow text-ff-gold-accent">{resolvedLabel}</span>
            <h2 className="mt-2 text-ff-black">{resolvedHeading}</h2>
            {/* Thin gold divider */}
            <div className="mx-auto mt-4 h-px w-16 bg-ff-gold-accent" />
          </div>
          {/* Pull quote — subheading as blockquote */}
          <blockquote className="mt-6 text-center font-sans text-body-lg italic leading-relaxed text-ff-olive">
            &ldquo;{resolvedSubheading}&rdquo;
          </blockquote>
          {/* Two-column paragraphs with numbered watermarks */}
          <div className="mt-12 grid gap-8 md:grid-cols-2 md:gap-12">
            {resolvedParagraphs.map((paragraph: string, idx: number) => (
              <div key={idx} className="relative">
                <span
                  className="absolute -left-2 -top-2 font-display text-6xl font-bold text-ff-gold-accent/20"
                  aria-hidden
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <p className="relative text-body text-ff-black/85 leading-relaxed">{paragraph}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
