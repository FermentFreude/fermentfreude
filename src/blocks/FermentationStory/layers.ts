// The one picture of the Fermentation Story — built into the website (public/fermentation).
// null until the image is added: the section then simply shows without it.
export type StoryLayer = { src: string; width: number; height: number; alt: string }

export const FERMENTATION_LAYER: StoryLayer | null = null
