/**
 * Minimal bootstrap seed — creates Home, About, and Contact pages WITHOUT requiring seed-assets images.
 * Use this when you don't have the seed-assets folder (e.g. fresh clone, CI).
 *
 * Creates:
 *   - Home page (slug: home) with lowImpact hero, empty layout
 *   - About page (slug: about) with lowImpact hero, OurStory, TeamCards, SponsorsBar, ReadyToLearnCTA (no images)
 *   - Contact page (slug: contact) — only if not already present (contact seed can run without images)
 *   - Both DE and EN locales
 *
 * Run: pnpm seed bootstrap
 * Or:  npx tsx src/scripts/seed-bootstrap.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import type { Page } from '@/payload-types'

import {
  ourStoryDE,
  ourStoryEN,
  readyToLearnDE,
  readyToLearnEN,
  sponsorsBarDE,
  sponsorsBarEN,
  teamCardsDE,
  teamCardsEN,
} from './data/about'

const homeLayoutDE = [readyToLearnDE()]
const homeLayoutEN = [readyToLearnEN()]

/* Hero Slider slides — same as HeroSlider DEFAULT_SLIDES, no images required */
const heroSlidesDE = [
  {
    slideId: 'lakto',
    eyebrow: 'Workshop Experience',
    title: 'Entdecke die Kunst der Lakto-Fermentation!',
    description:
      'Unser Workshop führt dich durch traditionelle Milchsäuregärung – von einfachem Gemüse zu probiotischen Delikatessen.',
    attributes: [{ text: 'Natürlich' }, { text: 'Probiotisch' }, { text: 'Mit Liebe gemacht' }],
    ctaLabel: 'Mehr erfahren',
    ctaHref: '/workshops/lakto',
    panelColor: '#555954',
    bgColor: '#D2DFD7',
  },
  {
    slideId: 'kombucha',
    eyebrow: 'Workshop Experience',
    title: 'Tauche ein in die Welt des Kombucha!',
    description:
      'Lerne, deinen eigenen Kombucha von Grund auf zu brauen – vom SCOBY bis zur perfekten Flasche.',
    attributes: [{ text: 'Lebende Kulturen' }, { text: 'Natürlich prickelnd' }, { text: 'Handgemacht' }],
    ctaLabel: 'Mehr erfahren',
    ctaHref: '/workshops/kombucha',
    panelColor: '#555954',
    bgColor: '#F6F0E8',
  },
  {
    slideId: 'tempeh',
    eyebrow: 'Workshop Experience',
    title: 'Meistere die Kunst der Tempeh-Herstellung!',
    description:
      'Entdecke die indonesische Tradition – kultiviere deine eigenen Kulturen und erschaffe proteinreiches Ferment.',
    attributes: [{ text: 'Hoher Proteingehalt' }, { text: 'Traditionell' }, { text: 'Pflanzlich' }],
    ctaLabel: 'Mehr erfahren',
    ctaHref: '/workshops/tempeh',
    panelColor: '#737672',
    bgColor: '#F6F3F0',
  },
  {
    slideId: 'basics',
    eyebrow: 'Workshop Experience',
    title: 'Starte deine Reise mit Fermentations-Basics!',
    description:
      'Der perfekte Einstieg – lerne Wissenschaft, Sicherheit und Techniken, um selbstbewusst zu fermentieren.',
    attributes: [{ text: 'Anfängerfreundlich' }, { text: 'Wissenschaftsbasiert' }, { text: 'Praktisch' }],
    ctaLabel: 'Mehr erfahren',
    ctaHref: '/workshops/basics',
    panelColor: '#000000',
    bgColor: '#AEB1AE',
  },
]

const heroSlidesEN = [
  {
    slideId: 'lakto',
    eyebrow: 'Workshop Experience',
    title: 'Discover the Art of Lakto-Fermentation!',
    description:
      'Our hands-on workshop takes you through traditional lacto-fermentation, turning simple vegetables into probiotic-rich delicacies.',
    attributes: [{ text: 'All-natural' }, { text: 'Probiotic-rich' }, { text: 'Made with Love' }],
    ctaLabel: 'Learn More',
    ctaHref: '/workshops/lakto',
    panelColor: '#555954',
    bgColor: '#D2DFD7',
  },
  {
    slideId: 'kombucha',
    eyebrow: 'Workshop Experience',
    title: 'Immerse Yourself in Kombucha Brewing!',
    description:
      'Learn to brew your own kombucha from scratch — from growing the SCOBY to bottling your perfect fizzy tea.',
    attributes: [{ text: 'Live cultures' }, { text: 'Naturally fizzy' }, { text: 'Handcrafted' }],
    ctaLabel: 'Learn More',
    ctaHref: '/workshops/kombucha',
    panelColor: '#555954',
    bgColor: '#F6F0E8',
  },
  {
    slideId: 'tempeh',
    eyebrow: 'Workshop Experience',
    title: 'Master the Craft of Tempeh Making!',
    description:
      'Explore the Indonesian tradition of tempeh — cultivate your own live cultures and create protein-rich fermented goodness.',
    attributes: [{ text: 'High protein' }, { text: 'Traditional' }, { text: 'Plant-based' }],
    ctaLabel: 'Learn More',
    ctaHref: '/workshops/tempeh',
    panelColor: '#737672',
    bgColor: '#F6F3F0',
  },
  {
    slideId: 'basics',
    eyebrow: 'Workshop Experience',
    title: 'Begin Your Journey with Fermentation Basics!',
    description:
      'The perfect starting point — learn fundamental fermentation science, safety, and techniques to confidently ferment at home.',
    attributes: [{ text: 'Beginner-friendly' }, { text: 'Science-based' }, { text: 'Practical' }],
    ctaLabel: 'Learn More',
    ctaHref: '/workshops/basics',
    panelColor: '#000000',
    bgColor: '#AEB1AE',
  },
]

const heroDE = {
  type: 'heroSlider' as const,
  heroSlides: heroSlidesDE,
}

const heroEN = {
  type: 'heroSlider' as const,
  heroSlides: heroSlidesEN,
}

const aboutHeroDE = {
  type: 'lowImpact' as const,
  richText: {
    root: {
      type: 'root',
      children: [
        {
          type: 'heading',
          tag: 'h1',
          children: [{ type: 'text', text: 'Über uns', version: 1 }],
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  },
}

const aboutHeroEN = {
  type: 'lowImpact' as const,
  richText: {
    root: {
      type: 'root',
      children: [
        {
          type: 'heading',
          tag: 'h1',
          children: [{ type: 'text', text: 'About Us', version: 1 }],
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  },
}

async function seedBootstrap() {
  const payload = await getPayload({ config })

  console.log('🧪 Bootstrap: creating minimal home page (no images required)…')

  // Delete existing home page if any
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs.length > 0) {
    await payload.delete({
      collection: 'pages',
      id: existing.docs[0]!.id,
      context: { skipRevalidate: true, disableRevalidate: true },
    })
    console.log(`  🗑️  Deleted existing home page`)
  }

  // Create home page (DE)
  const homePage = await payload.create({
    collection: 'pages',
    locale: 'de',
    context: {
      skipRevalidate: true,
      disableRevalidate: true,
      skipAutoTranslate: true,
    },
    data: {
      title: 'Startseite',
      slug: 'home',
      _status: 'published',
      hero: heroDE,
      layout: homeLayoutDE as NonNullable<Page['layout']>,
    },
  })

  console.log(`  ✅ Created home page ${homePage.id} (DE)`)

  // Add EN locale
  await payload.update({
    collection: 'pages',
    id: homePage.id,
    locale: 'en',
    context: {
      skipRevalidate: true,
      disableRevalidate: true,
      skipAutoTranslate: true,
    },
    data: {
      title: 'Home',
      _status: 'published',
      hero: heroEN,
      layout: homeLayoutEN as NonNullable<Page['layout']>,
    },
  })

  console.log(`  ✅ Updated home page (EN)`)

  // ── About page (minimal, no images) ─────────────────────────
  console.log('🧪 Bootstrap: creating minimal About page…')

  const existingAbout = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'about' } },
    limit: 1,
    depth: 0,
  })

  if (existingAbout.docs.length > 0) {
    await payload.delete({
      collection: 'pages',
      id: existingAbout.docs[0]!.id,
      context: { skipRevalidate: true, disableRevalidate: true },
    })
    console.log(`  🗑️  Deleted existing about page`)
  }

  const aboutLayoutDE = [
    ourStoryDE(),
    teamCardsDE(), // no images
    sponsorsBarDE(), // empty sponsors
    readyToLearnDE(),
  ] as NonNullable<Page['layout']>

  const aboutPage = await payload.create({
    collection: 'pages',
    locale: 'de',
    context: {
      skipRevalidate: true,
      disableRevalidate: true,
      skipAutoTranslate: true,
    },
    data: {
      title: 'Über uns',
      slug: 'about',
      _status: 'published',
      hero: aboutHeroDE,
      layout: aboutLayoutDE,
    },
  })

  console.log(`  ✅ Created About page ${aboutPage.id} (DE)`)

  const createdAbout = await payload.findByID({
    collection: 'pages',
    id: aboutPage.id,
    depth: 0,
    locale: 'de',
  })

  const blocks = createdAbout.layout ?? []
  const ourStoryBlock = blocks[0] as unknown as Record<string, unknown>
  const teamCardsBlock = blocks[1] as unknown as Record<string, unknown>
  const sponsorsBarBlock = blocks[2] as unknown as Record<string, unknown>

  const paragraphIds = ((ourStoryBlock?.paragraphs ?? []) as Array<{ id?: string }>).map(
    (p) => p.id,
  )
  const memberIds = ((teamCardsBlock?.members ?? []) as Array<{ id?: string }>).map((m) => m.id)
  const sponsorIds = ((sponsorsBarBlock?.sponsors ?? []) as Array<{ id?: string }>).map((s) => s.id)

  const enOurStory = ourStoryEN()
  enOurStory.paragraphs = enOurStory.paragraphs.map((p, idx) => ({
    ...p,
    id: paragraphIds[idx],
  }))

  const enTeamCards = teamCardsEN()
  enTeamCards.members = enTeamCards.members.map((m, idx) => ({
    ...m,
    id: memberIds[idx],
  }))

  const enSponsorsBar = sponsorsBarEN()
  if (enSponsorsBar.sponsors && sponsorIds.length > 0) {
    enSponsorsBar.sponsors = enSponsorsBar.sponsors.map((s, idx) => ({
      ...s,
      id: sponsorIds[idx],
    }))
  }

  const blockIds = blocks.map((b) => (b as { id?: string }).id)

  await payload.update({
    collection: 'pages',
    id: aboutPage.id,
    locale: 'en',
    context: {
      skipRevalidate: true,
      disableRevalidate: true,
      skipAutoTranslate: true,
    },
    data: {
      title: 'About Us',
      _status: 'published',
      hero: aboutHeroEN,
      layout: [
        { ...enOurStory, id: blockIds[0] },
        { ...enTeamCards, id: blockIds[1] },
        { ...enSponsorsBar, id: blockIds[2] },
        { ...readyToLearnEN(), id: blockIds[3] },
      ] as NonNullable<Page['layout']>,
    },
  })

  console.log(`  ✅ Updated About page (EN)`)
  console.log('🎉 Bootstrap complete! Visit /, /about, and /contact')
}

seedBootstrap().catch((err) => {
  console.error('❌ Bootstrap failed:', err)
  process.exit(1)
})
