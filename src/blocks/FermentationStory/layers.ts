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
