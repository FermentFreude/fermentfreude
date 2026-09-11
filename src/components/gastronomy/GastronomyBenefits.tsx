import { SentenceBreakText } from '@/components/gastronomy/SentenceBreakText'
import {
  ChefHat,
  Flame,
  Heart,
  Leaf,
  Sparkles,
  Sprout,
  UtensilsCrossed,
  Wheat,
  type LucideIcon,
} from 'lucide-react'
import React from 'react'

export type BenefitIconId =
  | 'utensils'
  | 'sparkles'
  | 'leaf'
  | 'chefHat'
  | 'flame'
  | 'wheat'
  | 'heart'
  | 'sprout'

export type Benefit = {
  id?: string | null
  icon?: BenefitIconId | string | null
  title: string
  text?: string | null
}

type Props = {
  title: string
  items: Benefit[]
}

const ICONS: Record<BenefitIconId, LucideIcon> = {
  utensils: UtensilsCrossed,
  sparkles: Sparkles,
  leaf: Leaf,
  chefHat: ChefHat,
  flame: Flame,
  wheat: Wheat,
  heart: Heart,
  sprout: Sprout,
}

const ICON_BY_INDEX: BenefitIconId[] = ['utensils', 'sparkles', 'leaf', 'chefHat']

const DELAYS = [
  'animate-fade-in-up',
  'animate-fade-in-up animate-delay-200',
  'animate-fade-in-up animate-delay-400',
  'animate-fade-in-up animate-delay-600',
]

function isBenefitIcon(value: string | null | undefined): value is BenefitIconId {
  return Boolean(value && value in ICONS)
}

function iconFor(item: Benefit, index: number): LucideIcon {
  if (isBenefitIcon(item.icon)) return ICONS[item.icon]
  const t = item.title.toLowerCase()
  if (/vielseitig|versatile/.test(t)) return ICONS.utensils
  if (/charakter|character/.test(t)) return ICONS.sparkles
  if (/pflanzlich|plant/.test(t)) return ICONS.leaf
  if (/einfach|easy/.test(t)) return ICONS.chefHat
  return ICONS[ICON_BY_INDEX[index % ICON_BY_INDEX.length]]
}

export function GastronomyBenefits({ title, items }: Props) {
  if (items.length === 0) return null

  return (
    <section className="bg-white section-padding-md" aria-label={title}>
      <div className="container mx-auto container-padding">
        <h2 className="mx-auto max-w-2xl text-center font-display text-section-heading font-bold tracking-tight text-ff-black">
          {title}
        </h2>
        <ul className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = iconFor(item, i)

            return (
              <li
                key={item.id ?? `${item.title}-${i}`}
                className={`group text-center ${DELAYS[i] ?? DELAYS[0]}`}
              >
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-ff-gold/15 text-ff-gold transition-transform duration-300 group-hover:scale-110">
                  <Icon
                    className="h-5 w-5 animate-[gentle-float_3s_ease-in-out_infinite]"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>
                <h3 className="font-display text-subheading font-bold text-ff-black">{item.title}</h3>
                {item.text?.trim() ? (
                  <SentenceBreakText
                    text={item.text}
                    className="mt-2 text-body-sm leading-relaxed text-ff-gray-text"
                  />
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
