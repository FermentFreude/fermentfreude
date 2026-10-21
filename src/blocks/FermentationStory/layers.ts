// Pictures of the Fermentation Story cards — Kittl cut-outs built into the website
// (public/fermentation). One picture per card, centred under the big word.
export type PictureSlot = 'intro' | 'alive' | 'natural' | 'everyday' | 'protein' | 'experts'

export const PICTURE_SLOTS: { label: string; value: PictureSlot }[] = [
  { label: 'Gesund — chef pulling an apple', value: 'intro' },
  { label: 'Lebendig — chef riding a carrot', value: 'alive' },
  { label: 'Natürlich — chef pulling broccoli', value: 'natural' },
  { label: 'Alltag — chef hugging a jar of kimchi', value: 'everyday' },
  { label: 'Protein — chef peeking over a tempeh block', value: 'protein' },
  { label: 'Experten — chef riding a leek', value: 'experts' },
]

export type StoryPicture = { src: string; width: number; height: number }

export const PICTURE_BY_SLOT: Record<PictureSlot, StoryPicture> = {
  intro: { src: '/fermentation/apple-chef.webp', width: 1260, height: 864 },
  alive: { src: '/fermentation/carrot-chef.webp', width: 1260, height: 764 },
  natural: { src: '/fermentation/broccoli-chef.webp', width: 1200, height: 812 },
  everyday: { src: '/fermentation/kimchi-chef.webp', width: 1400, height: 1218 },
  protein: { src: '/fermentation/tempeh-chef.webp', width: 1400, height: 791 },
  experts: { src: '/fermentation/leek.webp', width: 1400, height: 824 },
}

/** Width ÷ height of the most upright picture — the one that fills the full
 *  picture height; the wider ones are shrunk so every picture has the same area */
export const UPRIGHT_RATIO = Math.min(
  ...Object.values(PICTURE_BY_SLOT).map((p) => p.width / p.height),
)
