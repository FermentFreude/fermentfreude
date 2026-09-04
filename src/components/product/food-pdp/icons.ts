import type { LucideIcon } from 'lucide-react'
import {
  CalendarClock,
  CheckIcon,
  ChefHat,
  Flame,
  Leaf,
  MapPin,
  MapPinned,
  Package,
  Scale,
  ShieldAlert,
  Snowflake,
  Sparkles,
  Sprout,
  WheatOff,
} from 'lucide-react'

export const FOOD_BADGE_ICONS: Record<
  string,
  { icon: LucideIcon; accent: string }
> = {
  vegan: { icon: Sprout, accent: '#403c39' },
  organic: { icon: Leaf, accent: '#403c39' },
  'gluten-free': { icon: WheatOff, accent: '#403c39' },
  fermented: { icon: Flame, accent: '#403c39' },
  refrigerated: { icon: Snowflake, accent: '#403c39' },
}

export const GLANCE_ICONS: Record<string, LucideIcon> = {
  weight: Scale,
  portion: Package,
  origin: MapPin,
  madeIn: MapPinned,
  shelfLife: CheckIcon,
  storage: Snowflake,
}

/** Panel icons only — colors come from food-pdp/theme (beige + black/gold) */
export const PANEL_ICONS = {
  ingredients: Leaf,
  allergens: ShieldAlert,
  storage: Snowflake,
  afterOpening: CalendarClock,
  taste: Flame,
  usage: ChefHat,
} as const

export const TRUST_ICONS: LucideIcon[] = [MapPin, Sprout, Sparkles, Package]

export const USAGE_ICONS: LucideIcon[] = [ChefHat, Flame, Sparkles]
