import type { Media } from '@/payload-types'

type AboutSeedArgs = {
  heroImage?: Media
  marcelImage?: Media
  davidImage?: Media
  sponsorLogos?: Media[]
}

// ── Hero (page-level, not a block) ──────────────────────────
// No richText overlay — image only (text removed per design)
export const aboutHeroDE = (args: AboutSeedArgs = {}) => ({
  type: 'highImpact' as const,
  media: args.heroImage?.id ?? undefined,
})

export const aboutHeroEN = (args: AboutSeedArgs = {}) => ({
  type: 'highImpact' as const,
  media: args.heroImage?.id ?? undefined,
})

// ── OurStory block ─────────────────────────────────────────
export const ourStoryDE = () => ({
  blockType: 'ourStory' as const,
  label: 'Unsere Geschichte',
  heading: 'Freude an der Fermentation',
  subheading:
    'Fermentation zugänglich und genussvoll machen, während wir Darmgesundheit durch Geschmack, Bildung und qualitativ hochwertige handgemachte Lebensmittel fördern',
  paragraphs: [
    {
      text: 'FermentFreude ist ein modernes österreichisches Food-Tech-Startup, das Menschen hilft, Fermentation durch unterhaltsame Workshops und hochwertige fermentierte Produkte zu entdecken. Wir kombinieren Gesundheit, Genuss und Wissen, um Fermentation zu einem Teil des Alltags zu machen.',
    },
    {
      text: 'Durch die Verbindung traditioneller Fermentationsmethoden mit moderner Wissenschaft und regionaler Beschaffung ermöglichen wir Hobbyköchen und Profis, mit Selbstvertrauen, Neugier und Freude an Lebensmittel heranzugehen.',
    },
  ],
})

export const ourStoryEN = () => ({
  blockType: 'ourStory' as const,
  label: 'Our Story',
  heading: 'Bringing Joy to Fermentation',
  subheading:
    'Making fermentation joyful & accessible while empowering gut health through taste, education, and quality handmade foods',
  paragraphs: [
    {
      text: 'FermentFreude is a modern Austrian food-tech startup helping people discover fermentation through fun workshops and premium fermented products. We combine health, enjoyment, and knowledge to make fermentation part of everyday life.',
    },
    {
      text: 'By merging traditional fermentation methods with modern science and regional sourcing, we empower home cooks and professionals to approach food with confidence, curiosity, and pleasure.',
    },
  ],
})

// ── TeamCards block ─────────────────────────────────────────
export const teamCardsDE = (args: AboutSeedArgs = {}) => ({
  blockType: 'teamCards' as const,
  label: 'Unser Team',
  heading: 'Lernen Sie die Experten hinter FermentFreude kennen',
  members: [
    {
      image: args.marcelImage?.id ?? undefined,
      name: 'Marcel Rauminger',
      role: 'Fermentationsspezialist & Koch',
      description:
        'Mit über 17 Jahren als leidenschaftlicher Koch und Zertifikat in veganer Küche, angereichert durch Monate in einem thailändischen Kloster, entdeckte Marcel die Schlüssel zur Fermentation und ist zu einem Spezialisten für kreative fermentierte Küche geworden. Sein Wunsch, durch Workshops zu experten, neue Entdeckungen und Leidenschaft für feinen Geschmack zu teilen.',
    },
    {
      image: args.davidImage?.id ?? undefined,
      name: 'David Heider',
      role: 'Ernährungsspezialist & Lebensmittelentwickler',
      description:
        'Mit einem Hintergrund in Lebensmittelwissenschaften und Wirtschaftswissenschaften ist David leidenschaftlich daran interessiert, komplexe wissenschaftliche Konzepte für alle verdaulich zu machen. Er entwickelt quelloffene Fermentationstechniken basierend auf fermentierten Lebensmitteln, die fantastisch schmecken und das Wohlbefinden unterstützen und die perfekte Brücke zwischen Wissenschaft und Kunst von FermentFreude schaffen.',
    },
  ],
})

export const teamCardsEN = (args: AboutSeedArgs = {}) => ({
  blockType: 'teamCards' as const,
  label: 'Our Team',
  heading: 'Meet the Experts Behind FermentFreude',
  members: [
    {
      image: args.marcelImage?.id ?? undefined,
      name: 'Marcel Rauminger',
      role: 'Fermentation Specialist & Chef',
      description:
        'With over 17 years as a passionate chef and certificate in vegan cooking enriched by months in a Thai monastery, Marcel discovered the keys to fermentation and has become a specialist in creative fermented cuisine. His desire to expertise through workshops, sharing new discoveries and passion for fine flavor.',
    },
    {
      image: args.davidImage?.id ?? undefined,
      name: 'David Heider',
      role: 'Nutrition Specialist & Food Developer',
      description:
        'With a background in food science and economics, David is passionate about making complex scientific concepts digestible for everyone. He develops open-sourced fermentation techniques based fermented foods that taste amazing and support wellbeing, creating the perfect bridge between science and art of FermentFreude.',
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

// ── ReadyToLearnCTA block ──────────────────────────────────
export const readyToLearnDE = () => ({
  blockType: 'readyToLearnCta' as const,
  heading: 'Bereit zu lernen?',
  description:
    'Nehmen Sie an unseren Workshops und Online-Kursen teil, um praktische Fermentationstechniken zu erlernen, Fragen zu stellen und sich mit einer Gemeinschaft von Lernenden zu verbinden.',
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
  heading: 'Ready to learn?',
  description:
    'Join our workshops and online courses to learn hands-on fermentation techniques, ask questions, and connect with a community of learners.',
  primaryButton: {
    label: 'View workshops',
    href: '/workshops',
  },
  secondaryButton: {
    label: 'Browse online courses',
    href: '/courses',
  },
})
