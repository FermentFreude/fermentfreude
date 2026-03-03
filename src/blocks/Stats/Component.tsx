import { FadeIn } from '@/components/FadeIn'
import type { StatsBlock as StatsBlockType } from '@/payload-types'

const DEFAULTS = {
  label: 'By the Numbers',
  heading: 'FermentFreude in Numbers',
  items: [
    { value: '500+', label: 'Workshops held' },
    { value: '10', label: 'Years experience' },
    { value: '2', label: 'Founders' },
  ],
}

type Props = StatsBlockType & { id?: string }

export const StatsBlock: React.FC<Props> = ({ label, heading, items, id }) => {
  const resolvedLabel = label ?? DEFAULTS.label
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedItems = items && items.length > 0 ? items : DEFAULTS.items

  return (
    <section id={id ?? undefined} className="section-padding-lg bg-ff-cream overflow-hidden">
      <div className="container mx-auto container-padding">
        <FadeIn>
          <div className="flex flex-col items-center text-center mb-12 md:mb-16">
            <span className="text-eyebrow text-ff-gold-accent tracking-widest">{resolvedLabel}</span>
            <h2 className="mt-2 text-ff-black">{resolvedHeading}</h2>
            <div className="h-px w-16 bg-ff-gold-accent/60 mt-4" aria-hidden />
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 content-wide mx-auto">
          {resolvedItems.map((item, idx) => (
            <FadeIn key={idx} delay={idx * 120} from="bottom">
              <div className="flex flex-col items-center text-center">
                <span className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-ff-gold-accent tracking-tight">
                  {(item as { value?: string }).value ?? ''}
                </span>
                <p className="mt-2 text-body text-ff-olive font-medium">
                  {(item as { label?: string }).label ?? ''}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
