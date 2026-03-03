import { FadeIn } from '@/components/FadeIn'
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
    <section id={id ?? undefined} className="section-padding-lg bg-ff-cream overflow-hidden relative bg-dot-pattern-light">
      <div className="container mx-auto container-padding relative">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col items-center text-center mb-12 md:mb-16">
            <span className="text-eyebrow text-ff-gold-accent tracking-widest">{resolvedLabel}</span>
            <h2 className="mt-2 text-ff-black">{resolvedHeading}</h2>
          </div>
        </FadeIn>

        {/* Creative split layout: subheading as pull-quote, paragraphs in two columns */}
        <div className="content-wide mx-auto">
          <FadeIn delay={100}>
            <blockquote className="relative text-body-lg md:text-xl text-ff-olive text-center font-medium italic max-w-2xl mx-auto mb-12 md:mb-16 leading-relaxed">
              <span className="block pt-6">
                <span className="text-ff-gold-accent text-3xl md:text-4xl mr-1 align-top" aria-hidden>"</span>
                {resolvedSubheading}
                <span className="text-ff-gold-accent text-3xl md:text-4xl ml-1 align-top" aria-hidden>"</span>
              </span>
            </blockquote>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            {resolvedParagraphs.map((paragraph: string, idx: number) => (
              <FadeIn key={idx} delay={200 + idx * 100} from="bottom">
                <div className="relative bg-white/60 backdrop-blur-sm rounded-(--radius-lg) p-6 md:p-8 border border-ff-border-light/80 shadow-sm">
                  <span className="absolute top-4 right-4 font-display text-4xl md:text-5xl font-bold text-ff-gold-accent/15 select-none" aria-hidden>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="relative text-body text-ff-olive leading-relaxed pr-12">
                    {paragraph}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
