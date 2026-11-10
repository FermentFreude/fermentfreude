import type { SelectField } from 'payload'

/**
 * One icon list for every "points" row on the site (Tempeh slide, chefs banner,
 * voucher slide, "Warum Fermentation?"). The values map to the icons in
 * `src/components/PointsRow/icons.tsx` — add new ones in both places.
 */
export const POINT_ICON_OPTIONS = [
  { label: 'Leaf', value: 'leaf' },
  { label: 'Sprout', value: 'sprout' },
  { label: 'Vegan leaf', value: 'vegan' },
  { label: 'Bean', value: 'bean' },
  { label: 'Wheat', value: 'wheat' },
  { label: 'Jar', value: 'jar' },
  { label: 'Bowl', value: 'bowl' },
  { label: 'Box (kit)', value: 'box' },
  { label: 'Gift', value: 'gift' },
  { label: 'Heart', value: 'heart' },
  { label: 'Microscope (cultures)', value: 'microscope' },
  { label: 'Sparkles (flavour)', value: 'sparkles' },
  { label: 'Chef hat (kitchen)', value: 'chefHat' },
  { label: 'Cutlery (tasting, events)', value: 'utensils' },
  { label: 'Graduation cap (training)', value: 'graduationCap' },
  { label: 'People (team)', value: 'users' },
  { label: 'Award', value: 'award' },
  { label: 'Shield check (quality)', value: 'shieldCheck' },
  { label: 'Clock (shelf life)', value: 'clock' },
  { label: 'Calendar (choose a date)', value: 'calendar' },
  { label: 'Flexed arm (protein)', value: 'muscle' },
  { label: 'Flame (frying)', value: 'flame' },
  { label: 'Knife (cutting)', value: 'slice' },
  { label: 'Droplets (marinade)', value: 'droplets' },
] as const

export type PointIconName = (typeof POINT_ICON_OPTIONS)[number]['value']

/** Icon select for a points row, with the shared list */
export const pointIconField = (defaultValue: PointIconName = 'leaf'): SelectField => ({
  name: 'icon',
  type: 'select',
  label: 'Icon',
  defaultValue,
  options: [...POINT_ICON_OPTIONS],
  admin: { width: '25%' },
})
