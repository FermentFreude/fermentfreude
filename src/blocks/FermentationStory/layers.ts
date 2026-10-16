// Pictures of the Fermentation Story cards — built into the website (public/fermentation).
// One slot per card; a card whose slot is empty simply shows without a picture.
export type StoryLayer = { src: string; width: number; height: number; alt: string }

export type PictureSlot = 'intro' | 'alive' | 'natural' | 'everyday' | 'protein' | 'experts'

export const PICTURE_SLOTS: { label: string; value: PictureSlot }[] = [
  { label: 'Intro (GESUND)', value: 'intro' },
  { label: 'Lebendig — chef on a carrot', value: 'alive' },
  { label: 'Natürlich — chef pulling broccoli', value: 'natural' },
  { label: 'Alltag — chef riding a leek', value: 'everyday' },
  { label: 'Protein', value: 'protein' },
  { label: 'Experten — chef peeking over a tempeh block', value: 'experts' },
]

export const FERMENTATION_LAYERS: Partial<Record<PictureSlot, StoryLayer>> = {}

/* Small Kittl cut-outs placed around a card's big word (public/fermentation).
 * Sizes/positions are in em of the big word, so they scale with it. */
export type Decor = {
  src: string
  width: number
  height: number
  /** Position around the big word (em of the word) — not used for 'below' */
  className: string
  /** 'below' = in its own space under the word, sized to fit (never on the letters) */
  placement?: 'word' | 'below'
}

export const FERMENTATION_DECOR = {
  leek: { src: '/fermentation/leek.webp', width: 1400, height: 824 },
  broccoliChef: { src: '/fermentation/broccoli-chef.webp', width: 1200, height: 812 },
  carrotChef: { src: '/fermentation/carrot-chef.webp', width: 1260, height: 764 },
  appleChef: { src: '/fermentation/apple-chef.webp', width: 1260, height: 864 },
  jar: { src: '/fermentation/jar.webp', width: 192, height: 218 },
  garlic: { src: '/fermentation/garlic.webp', width: 726, height: 726 },
  tempehChef: { src: '/fermentation/tempeh-chef.webp', width: 1400, height: 791 },
} as const

/** Intro card (GESUND): chef pulling an apple, bottom right of the word */
export const INTRO_DECOR: Decor[] = [
  {
    ...FERMENTATION_DECOR.appleChef,
    className: '-bottom-[0.55em] -right-[0.8em] w-[1.35em] max-md:-right-[0.5em] max-md:w-[1.7em]',
  },
]

/** Cut-outs per picture slot (the "More cards" picture select) */
export const DECOR_BY_SLOT: Partial<Record<PictureSlot, Decor[]>> = {
  // LEBENDIG: chef riding a carrot, flying in at the top right of the word
  alive: [
    {
      ...FERMENTATION_DECOR.carrotChef,
      className:
        '-right-[0.55em] -top-[0.85em] w-[1.5em] -rotate-6 max-md:-right-[0.3em] max-md:w-[1.8em]',
    },
  ],
  // NATÜRLICH: chef pulling a broccoli — in its own space under the word, fully on
  // the cream: right-aligned on desktop, centred above the swipe capsule on phone/tablet.
  natural: [
    {
      ...FERMENTATION_DECOR.broccoliChef,
      className: '',
      placement: 'below',
    },
  ],
  // ALLTAG: leek-riding chef at the top right corner of the word — above the
  // letters, fully on the cream
  everyday: [
    {
      ...FERMENTATION_DECOR.leek,
      className:
        'bottom-full -right-[0.15em] mb-[0.06em] w-[1.25em] max-md:right-0 max-md:w-[1.9em] max-md:[@media(max-height:620px)]:w-[1.3em]',
    },
  ],
  // EXPERTEN: chef peeking over a block of tempeh — like NATÜRLICH, in its own
  // space under the word (right-aligned on desktop, centred on phone/tablet)
  experts: [
    {
      ...FERMENTATION_DECOR.tempehChef,
      className: '',
      placement: 'below',
    },
  ],
}
