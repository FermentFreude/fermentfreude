import { Hand, Leaf, MapPin, type LucideIcon } from 'lucide-react'

export type TrustIconId = 'hand' | 'mapPin' | 'leaf'

export type TrustItem = {
  icon: TrustIconId
  label: string
}

type Props = {
  locale: 'de' | 'en'
  items?: TrustItem[] | null
}

const ICONS: Record<TrustIconId, LucideIcon> = {
  hand: Hand,
  mapPin: MapPin,
  leaf: Leaf,
}

const DEFAULT_ITEMS: Record<'de' | 'en', TrustItem[]> = {
  de: [
    { icon: 'hand', label: 'Handgemacht in Graz' },
    { icon: 'mapPin', label: 'Abholung vor Ort' },
    { icon: 'leaf', label: 'Jede Woche frisch' },
  ],
  en: [
    { icon: 'hand', label: 'Handmade in Graz' },
    { icon: 'mapPin', label: 'Local pickup' },
    { icon: 'leaf', label: 'Fresh every week' },
  ],
}

function resolveIcon(value: string | null | undefined): TrustIconId {
  if (value === 'hand' || value === 'mapPin' || value === 'leaf') return value
  return 'hand'
}

/** Calm trust strip between shop hero and product cards — copy from CMS when set */
export function ShopTrustRow({ locale, items }: Props) {
  const isDe = locale === 'de'
  const resolved =
    items && items.length > 0
      ? items.map((item) => ({
          icon: resolveIcon(item.icon),
          label: item.label.trim() || DEFAULT_ITEMS[isDe ? 'de' : 'en'][0].label,
        }))
      : DEFAULT_ITEMS[isDe ? 'de' : 'en']

  return (
    <section className="border-b border-ff-border-light bg-white" aria-label="Shop highlights">
      <div className="container mx-auto container-padding py-6 md:py-7">
        {/* Mobile: stacked · Desktop: equal outer margins (start / center / end) */}
        <ul className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-6 md:items-center">
          {resolved.map(({ icon, label }, index) => {
            const Icon = ICONS[icon]
            const align =
              index === 0
                ? 'justify-start md:justify-start'
                : index === 1
                  ? 'justify-start md:justify-center'
                  : 'justify-start md:justify-end'

            return (
              <li
                key={`${icon}-${label}-${index}`}
                className={`flex items-center gap-3 font-display text-[12px] md:text-[13px] font-bold uppercase tracking-[0.14em] text-ff-charcoal ${align}`}
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-ff-gold/40 bg-ff-gold/10 text-ff-charcoal"
                  aria-hidden
                >
                  <Icon className="size-4 stroke-[1.75]" />
                </span>
                {label}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
