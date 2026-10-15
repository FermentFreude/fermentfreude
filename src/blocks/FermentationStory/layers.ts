// Pictures of the Fermentation Story cards — built into the website (public/fermentation).
// One slot per card; a card whose slot is empty simply shows without a picture.
export type StoryLayer = { src: string; width: number; height: number; alt: string }

export type PictureSlot = 'intro' | 'alive' | 'craft' | 'research' | 'kitchen'

export const PICTURE_SLOTS: { label: string; value: PictureSlot }[] = [
  { label: '1 · Intro (GESUND)', value: 'intro' },
  { label: '2 · Alive', value: 'alive' },
  { label: '3 · Craft', value: 'craft' },
  { label: '4 · Research', value: 'research' },
  { label: '5 · Kitchen', value: 'kitchen' },
]

export const FERMENTATION_LAYERS: Partial<Record<PictureSlot, StoryLayer>> = {}

/* Small Kittl cut-outs placed around a card's big word (public/fermentation).
 * Sizes/positions are in em of the big word, so they scale with it. */
export type Decor = { src: string; width: number; height: number; className: string }

export const FERMENTATION_DECOR = {
  broccoliChef: { src: '/fermentation/broccoli-chef.webp', width: 1200, height: 812 },
  carrotChef: { src: '/fermentation/carrot-chef.webp', width: 1260, height: 764 },
  appleChef: { src: '/fermentation/apple-chef.webp', width: 1260, height: 864 },
  jar: { src: '/fermentation/jar.webp', width: 192, height: 218 },
  garlic: { src: '/fermentation/garlic.webp', width: 726, height: 726 },
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
  // HANDWERK: chef pulling a broccoli, coming in at the bottom left of the word
  craft: [
    {
      ...FERMENTATION_DECOR.broccoliChef,
      className:
        '-bottom-[0.65em] -left-[0.05em] w-[1.4em] max-md:left-0 max-md:w-[1.7em] md:[@media(max-height:800px)]:-bottom-[0.42em] md:[@media(max-height:800px)]:w-[1.15em]',
    },
  ],
}
