import { RequiredDataFromCollectionSlug } from 'payload'

export const homeStaticData: () => RequiredDataFromCollectionSlug<'pages'> = () => {
  return {
    slug: 'home',
    _status: 'published',
    hero: {
      type: 'heroCarousel',
      slides: [
        {
          image: '' as unknown as string,
          title: 'Learn with us',
          description:
            'We create fermented foods and share the knowledge behind them. Through workshops, products, and education, we make fermentation accessible and enjoyable.',
          buttonLabel: 'Discover More',
          buttonUrl: '/about',
        },
        {
          image: '' as unknown as string,
          title: 'Lacto Vegetables',
          description:
            'Discover the art of lacto-fermented vegetables. Crisp, tangy, and full of probiotics.',
          buttonLabel: 'Book Workshop',
          buttonUrl: '/workshops/lakto-gemuese',
        },
        {
          image: '' as unknown as string,
          title: 'Tempeh at Home',
          description:
            'Learn to craft traditional tempeh with modern techniques. Rich, nutty, versatile.',
          buttonLabel: 'Learn More',
          buttonUrl: '/workshops/tempeh',
        },
      ],
      richText: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Gutes Essen',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              tag: 'h1',
              version: 1,
            },
            {
              type: 'heading',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Bessere Gesundheit',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              tag: 'h1',
              version: 1,
            },
            {
              type: 'heading',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Echte Freude',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              tag: 'h1',
              version: 1,
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Wir machen Fermentation zugänglich & freudvoll — für bessere Darmgesundheit durch Geschmack, Bildung und handgemachte Lebensmittel.',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      links: [
        {
          link: {
            type: 'custom',
            label: 'Shop',
            url: '/shop',
            appearance: 'default',
          },
        },
        {
          link: {
            type: 'custom',
            label: 'Workshops',
            url: '/workshops',
            appearance: 'outline',
          },
        },
      ],
    },
    layout: [],
    meta: {
      description: 'FermentFreude — Fermentation zugänglich & freudvoll machen.',
      title: 'FermentFreude — Gutes Essen, Bessere Gesundheit, Echte Freude',
    },
    title: 'Home',
  }
}
