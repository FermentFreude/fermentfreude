import type { Media as MediaType } from '@/payload-types'

/* ═══════════════════════════════════════════════════════════════
 *  SLIDE TYPES & DEFAULTS — CMS-driven via heroSlides array field.
 *  DEFAULT_SLIDES are English fallbacks when CMS data is absent.
 * ═══════════════════════════════════════════════════════════════ */

export interface ResolvedSlide {
  slideId: string
  eyebrow: string
  title: string
  description: string
  attributes: string[]
  ctaLabel: string
  ctaHref: string
  panelColor: string
  bgColor: string
  leftImage: MediaType | null
  rightImage: MediaType | null
}

/** Type guard: check if a value is a resolved Media object (not just a string ID) */
export function isResolvedMedia(val: unknown): val is MediaType {
  return typeof val === 'object' && val !== null && 'url' in val
}

export const DEFAULT_SLIDES: ResolvedSlide[] = [
  {
    slideId: 'basics',
    eyebrow: 'Workshop Experience',
    title: 'Begin Your Journey with\nFermentation Basics!',
    description:
      'The perfect starting point — learn fundamental fermentation science, safety, and techniques to confidently ferment anything at home.',
    attributes: ['Beginner-friendly', 'Science-based', 'Practical'],
    ctaLabel: 'Learn More',
    ctaHref: '/workshops/basics',
    panelColor: '#000000',
    bgColor: '#AEB1AE',
    leftImage: null,
    rightImage: null,
  },
  {
    slideId: 'lakto',
    eyebrow: 'Workshop Experience',
    title: 'Discover the Art of\nLakto-Fermentation!',
    description:
      'Our hands-on workshop takes you on a journey through traditional lacto-fermentation, turning simple vegetables into probiotic-rich delicacies.',
    attributes: ['All-natural', 'Probiotic-rich', 'Made with Love'],
    ctaLabel: 'Learn More',
    ctaHref: '/workshops/lakto',
    panelColor: '#555954',
    bgColor: '#D2DFD7',
    leftImage: null,
    rightImage: null,
  },
  {
    slideId: 'kombucha',
    eyebrow: 'Workshop Experience',
    title: 'Immerse Yourself in\nKombucha Brewing!',
    description:
      'Learn to brew your own kombucha from scratch — from growing the SCOBY to bottling your perfect fizzy, probiotic tea.',
    attributes: ['Live cultures', 'Naturally fizzy', 'Handcrafted'],
    ctaLabel: 'Learn More',
    ctaHref: '/workshops/kombucha',
    panelColor: '#555954',
    bgColor: '#F6F0E8',
    leftImage: null,
    rightImage: null,
  },
  {
    slideId: 'tempeh',
    eyebrow: 'Workshop Experience',
    title: 'Master the Craft of\nTempeh Making!',
    description:
      'Explore the Indonesian tradition of tempeh — cultivate your own live cultures and create protein-rich, fermented goodness at home.',
    attributes: ['High protein', 'Traditional', 'Plant-based'],
    ctaLabel: 'Learn More',
    ctaHref: '/workshops/tempeh',
    panelColor: '#737672',
    bgColor: '#F6F3F0',
    leftImage: null,
    rightImage: null,
  },
]
