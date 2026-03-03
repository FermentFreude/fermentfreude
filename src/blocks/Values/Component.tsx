import { FadeIn } from '@/components/FadeIn'
import type { ValuesBlock as ValuesBlockType } from '@/payload-types'

const DEFAULTS = {
  label: 'Our Values',
  heading: 'What We Stand For',
  items: [
    { title: 'Tradition meets Science', description: '' },
    { title: 'Quality over Quantity', description: '' },
    { title: 'Education & Accessibility', description: '' },
  ],
}

type Props = ValuesBlockType & { id?: string }

export const ValuesBlock: React.FC<Props> = ({ label, heading, items, id }) => {
  const resolvedLabel = label ?? DEFAULTS.label
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedItems = items && items.length > 0 ? items : DEFAULTS.items

  return (
    <section id={id ?? undefined} className="section-padding-lg bg-ff-warm-gray overflow-hidden bg-dot-pattern">
      <div className="container mx-auto container-padding">
        <FadeIn>
          <div className="flex flex-col items-center text-center mb-12 md:mb-16">
            <span className="text-eyebrow text-ff-gold-accent tracking-widest">{resolvedLabel}</span>
            <h2 className="mt-2 text-ff-black">{resolvedHeading}</h2>
            <div className="h-px w-16 bg-ff-gold-accent/60 mt-4" aria-hidden />
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 content-wide mx-auto">
          {resolvedItems.map((item, idx) => (
            <FadeIn key={idx} delay={idx * 100} from="bottom">
              <div className="relative flex flex-col rounded-(--radius-xl) bg-white/90 backdrop-blur-sm border border-ff-border-light p-6 md:p-8 h-full transition-shadow duration-300 hover:shadow-lg">
                <div className="absolute top-4 left-4 w-8 h-0.5 bg-ff-gold-accent/70" aria-hidden />
                <h3 className="font-display text-subheading text-ff-black mt-6">
                  {(item as { title?: string }).title ?? ''}
                </h3>
                {(item as { description?: string | null }).description && (
                  <p className="mt-3 text-body text-ff-olive leading-relaxed">
                    {(item as { description?: string }).description}
                  </p>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
