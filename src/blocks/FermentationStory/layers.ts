// Pictures of the Fermentation Story cards — Kittl cut-outs built into the website
// (public/fermentation). One picture per card. Phone/tablet: always centred under the
// big word. Desktop: at the word's end with the button beside it — or, for pictures
// with `aroundWord`, placed at the word itself (sized in em, so they scale with it).
export type PictureSlot = 'intro' | 'alive' | 'natural' | 'everyday' | 'protein' | 'experts'

export const PICTURE_SLOTS: { label: string; value: PictureSlot }[] = [
  { label: 'Gesund — chef pulling an apple', value: 'intro' },
  { label: 'Lebendig — chef riding a carrot', value: 'alive' },
  { label: 'Natürlich — chef pulling broccoli', value: 'natural' },
  { label: 'Alltag — chef hugging a jar of kimchi', value: 'everyday' },
  { label: 'Protein — chef peeking over a tempeh block', value: 'protein' },
  { label: 'Experten — chef riding a leek', value: 'experts' },
]

export type StoryPicture = {
  src: string
  width: number
  height: number
  /** Desktop only: position around the big word (em of the word) instead of under it */
  aroundWord?: string
}

export const PICTURE_BY_SLOT: Record<PictureSlot, StoryPicture> = {
  // GESUND: chef pulling an apple, at the bottom right of the word
  intro: {
    src: '/fermentation/apple-chef.webp',
    width: 1260,
    height: 864,
    aroundWord: '-bottom-[0.55em] -right-[0.8em] w-[1.35em]',
  },
  // LEBENDIG: chef riding a carrot, flying in at the top right of the word
  alive: {
    src: '/fermentation/carrot-chef.webp',
    width: 1260,
    height: 764,
    aroundWord: '-right-[0.55em] -top-[0.85em] w-[1.5em] -rotate-6',
  },
  natural: { src: '/fermentation/broccoli-chef.webp', width: 1200, height: 812 },
  everyday: { src: '/fermentation/kimchi-chef.webp', width: 1400, height: 1218 },
  protein: { src: '/fermentation/tempeh-chef.webp', width: 1400, height: 791 },
  // EXPERTEN: chef riding a leek, above the top right corner of the word
  experts: {
    src: '/fermentation/leek.webp',
    width: 1400,
    height: 824,
    aroundWord: 'bottom-full -right-[0.15em] mb-[0.06em] w-[1.25em]',
  },
}

/** Width ÷ height of the most upright picture — the one that fills the full
 *  picture height; the wider ones are shrunk so every picture has the same area */
export const UPRIGHT_RATIO = Math.min(
  ...Object.values(PICTURE_BY_SLOT).map((p) => p.width / p.height),
)
