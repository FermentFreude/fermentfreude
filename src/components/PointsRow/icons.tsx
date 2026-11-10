import {
  Award,
  Bean,
  BicepsFlexed,
  CalendarCheck,
  ChefHat,
  Clock,
  Droplets,
  Flame,
  Gift,
  GraduationCap,
  Heart,
  Leaf,
  Microscope,
  Package,
  ShieldCheck,
  Slice,
  Sparkles,
  Sprout,
  Users,
  UtensilsCrossed,
  Vegan,
  Wheat,
  type LucideProps,
} from 'lucide-react'
import type React from 'react'

/* Thin-line icons for the points rows. Values match `POINT_ICON_OPTIONS` in
 * `src/fields/pointIcon.ts`. Two are drawn by hand (no fitting Lucide icon). */

const STROKE = 1.25

function JarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={STROKE} {...props}>
      <path d="M8 3h8" />
      <path d="M7.5 5.5h9" />
      <path d="M7 5.5v2.2c-1.2.9-2 2.3-2 3.8V18a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-6.5c0-1.5-.8-2.9-2-3.8V5.5" />
      <path d="M8.5 13h7" />
    </svg>
  )
}

function BowlIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={STROKE} {...props}>
      <path d="M3 11h18a9 9 0 0 1-18 0Z" />
      <path d="M7.5 11c.6-2 2.4-3.3 4.5-3.3s3.9 1.3 4.5 3.3" />
      <path d="M9 20.5h6" />
    </svg>
  )
}

const LUCIDE: Record<string, React.ComponentType<LucideProps>> = {
  leaf: Leaf,
  sprout: Sprout,
  vegan: Vegan,
  bean: Bean,
  wheat: Wheat,
  box: Package,
  gift: Gift,
  heart: Heart,
  microscope: Microscope,
  sparkles: Sparkles,
  chefHat: ChefHat,
  utensils: UtensilsCrossed,
  graduationCap: GraduationCap,
  users: Users,
  award: Award,
  shieldCheck: ShieldCheck,
  clock: Clock,
  calendar: CalendarCheck,
  muscle: BicepsFlexed,
  flame: Flame,
  slice: Slice,
  droplets: Droplets,
}

export function PointIcon({ icon, className }: { icon?: string | null; className?: string }) {
  if (icon === 'jar') return <JarIcon className={className} aria-hidden />
  if (icon === 'bowl') return <BowlIcon className={className} aria-hidden />
  const Icon = (icon && LUCIDE[icon]) || Leaf
  return <Icon className={className} strokeWidth={STROKE} aria-hidden />
}
