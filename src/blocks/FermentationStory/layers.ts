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
  ginger: { src: '/fermentation/ginger.webp', width: 181, height: 146 },
  jar: { src: '/fermentation/jar.webp', width: 192, height: 218 },
  garlic: { src: '/fermentation/garlic.webp', width: 147, height: 149 },
} as const

/** Intro card (GESUND): ginger top left of the word, just touching its corner */
export const INTRO_DECOR: Decor[] = [
  { ...FERMENTATION_DECOR.ginger, className: '-left-[0.5em] -top-[0.4em] w-[0.75em] -rotate-12' },
]
