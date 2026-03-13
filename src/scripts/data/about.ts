import type { Media } from '@/payload-types'

type AboutSeedArgs = {
  heroImage?: Media
  heroSplitImage?: Media
  marcelImage?: Media
  davidImage?: Media
  sponsorLogos?: Media[]
  workshopSlideImage?: Media
  b2bSlideImage?: Media
  voucherSlideImage?: Media
  ourStoryImage1?: Media
  ourStoryImage2?: Media
}

// ── Hero (page-level) — Split layout: text left, image right ───
export const aboutHeroDE = (args: AboutSeedArgs = {}) => ({
  type: 'heroSplit' as const,
  splitLabel: 'Über uns',
  splitHeading: 'Wo Tradition auf Wissenschaft trifft',
  splitDescription:
    'FermentFreude macht Fermentation zugänglich und genussvoll. Entdecke Workshops, Produkte und unser leidenschaftliches Team für Darmgesundheit.',
  splitCtaLabel: 'Mehr erfahren',
  splitCtaUrl: '/fermentation',
  splitMedia: args.heroSplitImage?.id ?? args.heroImage?.id ?? undefined,
})

export const aboutHeroEN = (args: AboutSeedArgs = {}) => ({
  type: 'heroSplit' as const,
  splitLabel: 'About Us',
  splitHeading: 'Where tradition meets science',
  splitDescription:
    'FermentFreude makes fermentation accessible and enjoyable. Discover workshops, products, and our passionate team dedicated to gut health.',
  splitCtaLabel: 'Learn more',
  splitCtaUrl: '/fermentation',
  splitMedia: args.heroSplitImage?.id ?? args.heroImage?.id ?? undefined,
})

// ── OurStory block ─────────────────────────────────────────
export const ourStoryDE = (args: AboutSeedArgs = {}) => ({
  blockType: 'ourStory' as const,
  label: 'Unsere Geschichte',
  heading: 'Unsere Geschichte',
  subheading:
    'Fermentation zugänglich und genussvoll machen, während wir Darmgesundheit durch Geschmack, Bildung und qualitativ hochwertige handgemachte Lebensmittel fördern',
  paragraphs: [
    {
      text: 'FermentFreude ist ein österreichisches Food-Tech-Unternehmen mit der Mission, Freude in die Fermentation zu bringen. Durch praktische Workshops und hochwertige fermentierte Produkte helfen wir Menschen zu entdecken, wie Darmgesundheit und Genuss zusammenkommen – und wie alte Handwerkskunst zum alltäglichen Vergnügen wird.',
      image: args.ourStoryImage1?.id ?? undefined,
    },
    {
      text: 'Wir verbinden traditionelle Fermentationspraktiken mit moderner Wissenschaft und regionaler Beschaffung und ermöglichen Hobbyköchen und Profis, Lebensmittel mit Selbstvertrauen, Neugier und echter Freude zu erfahren.',
      image: args.ourStoryImage2?.id ?? undefined,
    },
  ],
})

export const ourStoryEN = (args: AboutSeedArgs = {}) => ({
  blockType: 'ourStory' as const,
  label: 'Our Story',
  heading: 'Bringing Joy to Fermentation',
  subheading:
    'Making fermentation joyful & accessible while empowering gut health through taste, education, and quality handmade foods',
  paragraphs: [
    {
      text: 'FermentFreude is an Austrian food-tech company on a mission to bring joy to fermentation. Through hands-on workshops and premium fermented products, we help people discover how gut health meets delight—turning age-old craft into everyday pleasure.',
      image: args.ourStoryImage1?.id ?? undefined,
    },
    {
      text: 'We blend traditional fermentation practices with modern science and regional sourcing, empowering home cooks and professionals to approach food with confidence, curiosity, and genuine joy.',
      image: args.ourStoryImage2?.id ?? undefined,
    },
  ],
})

// ── TeamCards block ─────────────────────────────────────────
export const teamCardsDE = (args: AboutSeedArgs = {}) => ({
  blockType: 'teamCards' as const,
  blockName: 'our-team',
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
  blockName: 'our-team',
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
const SPONSOR_NAMES_DE = [
  'aws Sustainable Food Systems Initiative',
  'Austria Wirtschafts Service',
  'Science Park Graz',
  'Steiermärkische Sparkasse',
]
const SPONSOR_NAMES_EN = [
  'aws Sustainable Food Systems Initiative',
  'Austria Wirtschafts Service',
  'Science Park Graz',
  'Steiermärkische Sparkasse',
]

export const sponsorsBarDE = (args: AboutSeedArgs = {}) => ({
  blockType: 'sponsorsBar' as const,
  heading: 'Dieses Projekt wird unterstützt von:',
  sponsors: args.sponsorLogos
    ? args.sponsorLogos.map((logo, idx) => ({
        name: SPONSOR_NAMES_DE[idx] ?? `Sponsor ${idx + 1}`,
        logo: logo.id,
      }))
    : [],
})

export const sponsorsBarEN = (args: AboutSeedArgs = {}) => ({
  blockType: 'sponsorsBar' as const,
  heading: 'This project is supported by:',
  sponsors: args.sponsorLogos
    ? args.sponsorLogos.map((logo, idx) => ({
        name: SPONSOR_NAMES_EN[idx] ?? `Sponsor ${idx + 1}`,
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
