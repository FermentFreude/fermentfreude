import type { Media } from '@/payload-types'

type AboutSeedArgs = {
  heroImage?: Media
  marcelImage?: Media
  davidImage?: Media
  sponsorLogos?: Media[]
}

// ── Hero (page-level, not a block) — Carousel with multiple slides ──
export const aboutHeroSlidesDE = (args: AboutSeedArgs = {}) =>
  args.heroImage && args.marcelImage && args.davidImage
    ? [
        {
          image: args.heroImage.id,
          title: 'Über uns',
          description:
            'Ihr Partner für Fermentation — Workshops, Beratung und handgemachte Produkte für Gastronomie und Privatkunden.',
          buttonLabel: 'Workshops entdecken',
          buttonUrl: '/workshops',
        },
        {
          image: args.marcelImage.id,
          title: 'Unser Team',
          description:
            'Erfahrene Köche und Ernährungsexperten vermitteln praxisnahes Wissen in Workshops und Kursen.',
          buttonLabel: 'Team kennenlernen',
          buttonUrl: '/about#team',
        },
        {
          image: args.davidImage.id,
          title: 'Workshops & Kurse',
          description:
            'Von Lakto-Gemüse über Kombucha bis Tempeh — praxisorientierte Fermentationstechniken für jeden Anspruch.',
          buttonLabel: 'Workshop buchen',
          buttonUrl: '/workshops',
        },
      ]
    : []

export const aboutHeroSlidesEN = (args: AboutSeedArgs = {}) =>
  args.heroImage && args.marcelImage && args.davidImage
    ? [
        {
          image: args.heroImage.id,
          title: 'About Us',
          description:
            'Your partner for fermentation — workshops, consulting, and handmade products for gastronomy and private customers.',
          buttonLabel: 'Explore Workshops',
          buttonUrl: '/workshops',
        },
        {
          image: args.marcelImage.id,
          title: 'Our Team',
          description:
            'Experienced chefs and nutrition experts deliver hands-on knowledge through workshops and courses.',
          buttonLabel: 'Meet the Team',
          buttonUrl: '/about#team',
        },
        {
          image: args.davidImage.id,
          title: 'Workshops & Courses',
          description:
            'From lacto vegetables to kombucha and tempeh — practical fermentation techniques for every level.',
          buttonLabel: 'Book Workshop',
          buttonUrl: '/workshops',
        },
      ]
    : []

// ── OurStory block ─────────────────────────────────────────
export const ourStoryDE = () => ({
  blockType: 'ourStory' as const,
  label: 'Unsere Geschichte',
  heading: 'Freude an der Fermentation',
  subheading:
    'Fermentation zugänglich und genussvoll — Darmgesundheit durch Geschmack, Bildung und qualitativ hochwertige handgemachte Lebensmittel.',
  paragraphs: [
    {
      text: 'FermentFreude ist ein österreichisches Food-Tech-Unternehmen, das Fermentation durch praxisnahe Workshops und hochwertige fermentierte Produkte vermittelt. Wir verbinden Gesundheit, Genuss und Wissen, um Fermentation zum selbstverständlichen Teil des Alltags zu machen.',
    },
    {
      text: 'Durch die Verbindung traditioneller Methoden mit moderner Wissenschaft und regionaler Beschaffung ermöglichen wir Hobbyköchen und Profis einen selbstbewussten, neugierigen Zugang zu fermentierten Lebensmitteln.',
    },
  ],
})

export const ourStoryEN = () => ({
  blockType: 'ourStory' as const,
  label: 'Our Story',
  heading: 'Bringing Joy to Fermentation',
  subheading:
    'Making fermentation accessible and enjoyable — gut health through taste, education, and quality handmade foods.',
  paragraphs: [
    {
      text: 'FermentFreude is an Austrian food-tech company that teaches fermentation through hands-on workshops and premium fermented products. We combine health, enjoyment, and knowledge to make fermentation a natural part of everyday life.',
    },
    {
      text: 'By merging traditional methods with modern science and regional sourcing, we empower home cooks and professionals to approach fermented foods with confidence and curiosity.',
    },
  ],
})

// ── Values block ───────────────────────────────────────────
export const valuesDE = () => ({
  blockType: 'values' as const,
  label: 'Unsere Werte',
  heading: 'Wofür wir stehen',
  items: [
    {
      title: 'Tradition trifft Wissenschaft',
      description:
        'Wir verbinden bewährte Fermentationsmethoden mit moderner Forschung für sichere, köstliche Ergebnisse.',
    },
    {
      title: 'Qualität vor Quantität',
      description:
        'Regionale Zutaten, sorgfältige Verarbeitung und keine Kompromisse beim Geschmack.',
    },
    {
      title: 'Bildung & Zugänglichkeit',
      description:
        'Fermentation für alle — von Hobbyköchen bis Profis, in Workshops und Online-Kursen.',
    },
    {
      title: 'Nachhaltigkeit',
      description:
        'Lange Haltbarkeit ohne Kühlung, weniger Verschwendung, regionale Kreisläufe.',
    },
  ],
})

export const valuesEN = () => ({
  blockType: 'values' as const,
  label: 'Our Values',
  heading: 'What We Stand For',
  items: [
    {
      title: 'Tradition Meets Science',
      description:
        'We combine time-tested fermentation methods with modern research for safe, delicious results.',
    },
    {
      title: 'Quality over Quantity',
      description:
        'Regional ingredients, careful processing, and no compromises on flavour.',
    },
    {
      title: 'Education & Accessibility',
      description:
        'Fermentation for everyone — from home cooks to professionals, in workshops and online courses.',
    },
    {
      title: 'Sustainability',
      description:
        'Long shelf life without refrigeration, less waste, regional cycles.',
    },
  ],
})

// ── Stats block ────────────────────────────────────────────
export const statsDE = () => ({
  blockType: 'stats' as const,
  label: 'In Zahlen',
  heading: 'FermentFreude in Zahlen',
  items: [
    { value: '500+', label: 'Workshops durchgeführt' },
    { value: '17', label: 'Jahre Erfahrung' },
    { value: '2', label: 'Gründer' },
    { value: '4', label: 'Workshop-Formate' },
  ],
})

export const statsEN = () => ({
  blockType: 'stats' as const,
  label: 'By the Numbers',
  heading: 'FermentFreude in Numbers',
  items: [
    { value: '500+', label: 'Workshops held' },
    { value: '17', label: 'Years of experience' },
    { value: '2', label: 'Founders' },
    { value: '4', label: 'Workshop formats' },
  ],
})

// ── TeamCards block ─────────────────────────────────────────
export const teamCardsDE = (args: AboutSeedArgs = {}) => ({
  blockType: 'teamCards' as const,
  label: 'Unser Team',
  heading: 'Die Experten hinter FermentFreude',
  members: [
    {
      image: args.marcelImage?.id ?? undefined,
      name: 'Marcel Rauminger',
      role: 'Fermentationsspezialist & Koch',
      description:
        'Mit über 17 Jahren Erfahrung als Koch und Zertifikat in veganer Küche entdeckte Marcel die Schlüssel zur Fermentation und hat sich zum Spezialisten für kreative fermentierte Küche entwickelt. In Workshops teilt er seine Leidenschaft für feinen Geschmack und praxisnahes Wissen.',
    },
    {
      image: args.davidImage?.id ?? undefined,
      name: 'David Heider',
      role: 'Ernährungsspezialist & Lebensmittelentwickler',
      description:
        'Mit Hintergrund in Lebensmittelwissenschaften und Wirtschaft macht David komplexe wissenschaftliche Konzepte verständlich. Er entwickelt Fermentationstechniken, die hervorragend schmecken, das Wohlbefinden fördern und die Brücke zwischen Wissenschaft und Handwerk schlagen.',
    },
  ],
})

export const teamCardsEN = (args: AboutSeedArgs = {}) => ({
  blockType: 'teamCards' as const,
  label: 'Our Team',
  heading: 'The Experts Behind FermentFreude',
  members: [
    {
      image: args.marcelImage?.id ?? undefined,
      name: 'Marcel Rauminger',
      role: 'Fermentation Specialist & Chef',
      description:
        'With over 17 years of experience as a chef and a certificate in vegan cooking, Marcel discovered the keys to fermentation and has become a specialist in creative fermented cuisine. In workshops, he shares his passion for fine flavor and hands-on knowledge.',
    },
    {
      image: args.davidImage?.id ?? undefined,
      name: 'David Heider',
      role: 'Nutrition Specialist & Food Developer',
      description:
        'With a background in food science and economics, David makes complex scientific concepts accessible. He develops fermentation techniques that taste exceptional, support wellbeing, and bridge the gap between science and craft.',
    },
  ],
})

// ── SponsorsBar block ──────────────────────────────────────
export const sponsorsBarDE = (args: AboutSeedArgs = {}) => ({
  blockType: 'sponsorsBar' as const,
  heading: 'Dieses Projekt wird unterstützt von:',
  sponsors: args.sponsorLogos
    ? args.sponsorLogos.map((logo, idx) => ({
        name: `Sponsor ${idx + 1}`,
        logo: logo.id,
      }))
    : [],
})

export const sponsorsBarEN = (args: AboutSeedArgs = {}) => ({
  blockType: 'sponsorsBar' as const,
  heading: 'This project is supported by:',
  sponsors: args.sponsorLogos
    ? args.sponsorLogos.map((logo, idx) => ({
        name: `Sponsor ${idx + 1}`,
        logo: logo.id,
      }))
    : [],
})

// ── ClosingTagline block ───────────────────────────────────
export const closingTaglineDE = () => ({
  blockType: 'closingTagline' as const,
  tagline: 'Lust auf Fermentation? Wir freuen uns auf Sie.',
  subtext: 'Workshops, Beratung oder einfach nur ein Gespräch — schreiben Sie uns.',
  linkLabel: 'Kontakt aufnehmen',
  linkUrl: '/contact',
})

export const closingTaglineEN = () => ({
  blockType: 'closingTagline' as const,
  tagline: 'Curious about fermentation? We\'d love to meet you.',
  subtext: 'Workshops, consulting, or just a chat — get in touch.',
  linkLabel: 'Get in touch',
  linkUrl: '/contact',
})

// ── ReadyToLearnCTA block ──────────────────────────────────
export const readyToLearnDE = () => ({
  blockType: 'readyToLearnCta' as const,
  heading: 'Bereit für den nächsten Schritt?',
  description:
    'Lernen Sie praktische Fermentationstechniken in unseren Workshops und Online-Kursen — und verbinden Sie sich mit einer Gemeinschaft von Gleichgesinnten.',
  primaryButton: {
    label: 'Workshops ansehen',
    href: '/workshops',
  },
  secondaryButton: {
    label: 'Online-Kurse durchsuchen',
    href: '/courses',
  },
})

export const readyToLearnEN = () => ({
  blockType: 'readyToLearnCta' as const,
  heading: 'Ready for the next step?',
  description:
    'Learn practical fermentation techniques in our workshops and online courses — and connect with a community of like-minded learners.',
  primaryButton: {
    label: 'View workshops',
    href: '/workshops',
  },
  secondaryButton: {
    label: 'Browse online courses',
    href: '/courses',
  },
})
