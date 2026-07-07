import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Fermentations-Workshops in Graz — Kombucha, Tempeh, Lakto-Gemüse & mehr.',
  images: [],
  siteName: 'FermentFreude',
  title: 'FermentFreude | Fermentations-Workshops in Graz',
}

export const mergeOpenGraph = (og?: Partial<Metadata['openGraph']>): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
