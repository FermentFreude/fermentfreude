/**
 * Home: David's copy from the founders' doc
 * "Home Page Content_Fermentfreude Website 06-11-2026_edited" (edited 2026-11-07).
 *  - Hero: eyebrow, brand spelling, new paragraph
 *  - Tempeh slide: paragraph, Zubereitung steps; note under the button removed
 *  - Workshops slide: paragraph
 *  - Gutschein slide: label, paragraph, two point lines
 *  - Gastro banner: heading, paragraph, button "Mehr erfahren", three new points
 *  - Warum Fermentation: intro + 3 benefits, cards 2–4 new copy (card 4 = GESCHMACK),
 *    cards 5 + 6 (PROTEIN, EXPERTEN) removed
 *  - Team: paragraph
 * Not done here on purpose: the Tempeh price (6,40 € in the doc) is the product's
 * shop price — David sets it himself in the admin.
 * DE first, then EN with the same row IDs. Pictures, icons (except the gastro
 * points) and links stay as they are.
 *
 * Run:  npx tsx src/scripts/patch-home-copy-2026-11.ts   (staging DB only)
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

if (!(process.env.DATABASE_URL ?? '').includes('-staging')) {
  console.error('🚫 REFUSING TO RUN: DATABASE_URL does not look like the staging database.')
  process.exit(1)
}

type Point = { title: string; text: string }
const COPY = {
  de: {
    hero: {
      eyebrow: 'Marcel & David',
      title: 'Wir sind Fermentfreude.',
      description:
        'Bei uns trifft Kulinarik auf Wissenschaft. Gemeinsam entwickeln und produzieren wir Tempeh aus steirischen Käferbohnen und zeigen in unseren Workshops, wie einfach und sicher Fermentieren zu Hause gelingt.',
    },
    tempehText:
      'Unser Tempeh ist eine pflanzliche Spezialität aus fermentierten steirischen Käferbohnen. Mit angenehm festem Biss, nussigem Aroma und vielseitigen Zubereitungsmöglichkeiten – von der Alltagsküche bis zur Spitzengastronomie.',
    steps: [
      { text: 'Schneiden', detail: 'In fingerdicke Scheiben schneiden.' },
      {
        text: 'Anbraten',
        detail: 'Bei hoher Hitze in ausreichend Öl beidseitig 2–3 Minuten goldbraun anbraten.',
      },
      {
        text: 'Würzen',
        detail:
          'Vorab marinieren oder nach dem Braten mit Salz und Pfeffer würzen bzw. mit Sojasauce ablöschen.',
      },
    ],
    workshopsText:
      'Entdecke die faszinierende Welt der Fermentation! In unseren Workshops wird gemeinsam fermentiert, verkostet und genossen. Neben jeder Menge neuem Wissen nimmst du auch deine selbstgemachten Fermente mit nach Hause.',
    gift: {
      label: 'Fermentations-Workshop',
      text: 'Ob Kombucha, Tempeh oder fermentiertes Gemüse wie Kimchi – der Gutschein ist für alle unsere Workshops einlösbar und kommt sofort als PDF per E-Mail.',
      point0: 'Kombucha, Gemüse (inkl. Kimchi) oder Tempeh – frei wählbar',
      point2: 'Digital als PDF per E-Mail',
    },
    gastro: {
      heading: 'Steirischer Tempeh\nfür eure Küche.',
      description:
        'Käferbohne neu interpretiert. Handwerklich hergestellt in Graz, mit nussigem Aroma und angenehmem Biss. Ob als Hauptzutat, im Streetfood oder als Topping – unser Tempeh eröffnet vielseitige Möglichkeiten für moderne Wirtshausküche, Fine Dining und plant-forward Konzepte.',
      buttonLabel: 'Mehr erfahren',
      points: [
        {
          title: 'Pflanzlich & proteinreich',
          text: 'Für kreative Gerichte – vegan, vegetarisch oder in Kombination mit tierischen Zutaten.',
        },
        {
          title: 'Regionales Produkt',
          text: 'Aus nur 3 Zutaten. Vakuumiert und gekühlt ca. 6 Wochen haltbar.',
        },
        { title: 'Schulungen fürs Team', text: 'Fermentation praxisnah für eure Köch:innen.' },
      ] as Point[],
    },
    story: {
      intro:
        'Uralt und genial einfach: Fermentation macht Lebensmittel nicht nur haltbarer, sondern kann auch ihre Verdaulichkeit verbessern und die Verfügbarkeit von Nährstoffen erhöhen.',
      benefits: [
        {
          title: 'Lebende Kulturen',
          text: 'In vielen nicht erhitzten Fermenten wie Kimchi oder Sauerkraut befinden sich Mikroorganismen, die probiotisch wirken können.',
        },
        {
          title: 'Nährstoffe',
          text: 'Mineralstoffe können besser verfügbar und pflanzliche Proteine leichter verdaulich werden. Manche Mikroorganismen bilden sogar B-Vitamine.',
        },
        {
          title: 'Verdaulichkeit',
          text: 'Durch Fermentation können bestimmte schwer verdauliche Pflanzenstoffe abgebaut werden.',
        },
      ] as Point[],
      cards: [
        {
          title: 'Was im Ferment passiert.',
          text: 'Bakterien, Hefen und Edelschimmel verwandeln Lebensmittel und schaffen neue Aromen und Texturen. So wird aus Kohl Kimchi, aus Tee Kombucha und aus Käferbohnen Tempeh.',
        },
        {
          title: 'Wenige Zutaten. Etwas Zeit.',
          text: 'Gemüse, Salz und Geduld – mehr braucht es für viele Gemüsefermente nicht. Auch unser Käferbohnen-Tempeh entsteht aus nur drei Zutaten. Ganz ohne unnötige Zusätze.',
        },
        {
          bigWord: 'GESCHMACK',
          title: 'So schmeckt Fermentation.',
          text: 'Kimchi aufs Spiegelei, Kombucha statt Limo oder knuspriger Tempeh als Hauptzutat. Fermentation bringt neue Aromen, spannende Texturen und kreative Vielfalt auf den Teller.',
        },
      ] as { bigWord?: string; title: string; text: string }[],
    },
    team: 'Zwei Hintergründe, eine Leidenschaft: Fermentation. Marcel bringt seine Erfahrung aus Küche und Kulinarik ein, David seine Expertise in Wissenschaft und Ernährung. Gemeinsam entwickeln wir innovative Lebensmittel und teilen unsere Begeisterung fürs Fermentieren.',
  },
  en: {
    hero: {
      eyebrow: 'Marcel & David',
      title: 'We are Fermentfreude.',
      description:
        'Where culinary craft meets science. Together we develop and produce tempeh from Styrian runner beans, and in our workshops we show how easy and safe fermenting at home can be.',
    },
    tempehText:
      'Our tempeh is a plant-based speciality made from fermented Styrian runner beans. With a pleasantly firm bite, a nutty aroma and many ways to prepare it – from everyday cooking to fine dining.',
    steps: [
      { text: 'Slice', detail: 'Cut into finger-thick slices.' },
      {
        text: 'Sear',
        detail:
          'Fry on both sides for 2–3 minutes in plenty of oil over high heat until golden brown.',
      },
      {
        text: 'Season',
        detail:
          'Marinate beforehand, or season with salt and pepper after frying, or deglaze with soy sauce.',
      },
    ],
    workshopsText:
      'Discover the fascinating world of fermentation! In our workshops we ferment, taste and enjoy together. Along with plenty of new knowledge, you take your own homemade ferments home.',
    gift: {
      label: 'Fermentation workshop',
      text: 'Kombucha, tempeh or fermented vegetables like kimchi – the voucher is valid for all our workshops and arrives right away as a PDF by e-mail.',
      point0: 'Kombucha, vegetables (incl. kimchi) or tempeh – your choice',
      point2: 'Digitally as a PDF by e-mail',
    },
    gastro: {
      heading: 'Styrian tempeh\nfor your kitchen.',
      description:
        'Runner beans, reinvented. Handmade in Graz, with a nutty aroma and a pleasant bite. As a main ingredient, in street food or as a topping – our tempeh opens up many possibilities for modern inn cooking, fine dining and plant-forward concepts.',
      buttonLabel: 'Learn more',
      points: [
        {
          title: 'Plant-based & high in protein',
          text: 'For creative dishes – vegan, vegetarian or combined with animal ingredients.',
        },
        {
          title: 'Regional product',
          text: 'Just 3 ingredients. Vacuum-packed and chilled, keeps about 6 weeks.',
        },
        { title: 'Training for your team', text: 'Hands-on fermentation for your chefs.' },
      ] as Point[],
    },
    story: {
      intro:
        'Ancient and brilliantly simple: fermentation not only makes food keep longer – it can also make it easier to digest and its nutrients more available.',
      benefits: [
        {
          title: 'Live cultures',
          text: 'Many unheated ferments such as kimchi or sauerkraut contain microorganisms that can have a probiotic effect.',
        },
        {
          title: 'Nutrients',
          text: 'Minerals can become more available and plant proteins easier to digest. Some microorganisms even produce B vitamins.',
        },
        {
          title: 'Digestibility',
          text: 'Fermentation can break down certain plant compounds that are hard to digest.',
        },
      ] as Point[],
      cards: [
        {
          title: 'What happens in the ferment.',
          text: 'Bacteria, yeasts and noble moulds transform food and create new aromas and textures. That’s how cabbage becomes kimchi, tea becomes kombucha and runner beans become tempeh.',
        },
        {
          title: 'Few ingredients. A little time.',
          text: 'Vegetables, salt and patience – that’s all many vegetable ferments need. Our runner bean tempeh is also made from just three ingredients. No unnecessary additives.',
        },
        {
          bigWord: 'FLAVOUR',
          title: 'This is what fermentation tastes like.',
          text: 'Kimchi on your fried egg, kombucha instead of soda, or crispy tempeh as the main ingredient. Fermentation brings new aromas, exciting textures and creative variety to your plate.',
        },
      ] as { bigWord?: string; title: string; text: string }[],
    },
    team: 'Two backgrounds, one passion: fermentation. Marcel brings his experience in cooking and cuisine, David his expertise in science and nutrition. Together we develop innovative foods and share our enthusiasm for fermenting.',
  },
}

/** Icons for the three new gastro points (plant-based / regional bean / training) */
const GASTRO_ICONS = ['vegan', 'bean', 'graduationCap'] as const
/** Benefit 3 is now "Verdaulichkeit" instead of "Geschmack" */
const BENEFIT_ICONS = [null, null, 'bowl'] as const
const STORY_CARDS_KEPT = 3

type Row = { id?: string | null; [k: string]: unknown }
const rowsOf = (x: unknown) => (Array.isArray(x) ? (x as Row[]) : [])
type Block = { blockType: string; id?: string | null; [k: string]: unknown }

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

async function main() {
  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })
  const home = found.docs[0]
  if (!home) throw new Error('Home page not found')

  // An admin autosave draft would get published/unpublished by this write (Home 404, 2026-11-04)
  const latest = await payload.findVersions({
    collection: 'pages',
    where: { parent: { equals: home.id } },
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
  })
  if (latest.docs[0]?.version._status === 'draft') {
    console.error('🚫 Home has an unpublished admin draft. Publish or discard it in /admin first.')
    process.exit(1)
  }
  console.log('Home updatedAt before this run:', home.updatedAt)

  for (const locale of ['de', 'en'] as const) {
    const c = COPY[locale]
    const doc = await payload.findByID({ collection: 'pages', id: home.id, locale, depth: 0 })

    const hero = {
      ...doc.hero,
      cinematicSlides: rowsOf(doc.hero?.cinematicSlides).map((s, i) =>
        i === 0 ? { ...s, ...c.hero } : s,
      ),
    }

    const layout = (doc.layout ?? []).map((raw) => {
      const b = raw as unknown as Block
      switch (b.blockType) {
        case 'productShowcase':
          return {
            ...b,
            trustPoints: rowsOf(b.trustPoints).map((p, i) => ({ ...p, ...c.steps[i] })),
            slides: rowsOf(b.slides).map((s) =>
              s.slideType === 'workshops'
                ? { ...s, text: c.workshopsText }
                : { ...s, text: c.tempehText, buttonNote: null },
            ),
          }
        case 'voucherCta': {
          const g = (b.giftSlide ?? {}) as Row
          const points = rowsOf(g.points).map((p, i) =>
            i === 0 ? { ...p, text: c.gift.point0 } : i === 2 ? { ...p, text: c.gift.point2 } : p,
          )
          return { ...b, giftSlide: { ...g, label: c.gift.label, text: c.gift.text, points } }
        }
        case 'heroBanner': {
          const old = rowsOf(b.points)
          if (old.length !== 3)
            throw new Error(`Gastro banner: expected 3 points, found ${old.length}`)
          return {
            ...b,
            heading: c.gastro.heading,
            description: c.gastro.description,
            buttonLabel: c.gastro.buttonLabel,
            points: old.map((p, i) => ({ ...p, ...c.gastro.points[i], icon: GASTRO_ICONS[i] })),
          }
        }
        case 'fermentationStory': {
          const cards = rowsOf(b.slides)
          if (cards.length < STORY_CARDS_KEPT)
            throw new Error('Fermentation story: fewer cards than expected')
          return {
            ...b,
            intro: c.story.intro,
            benefits: rowsOf(b.benefits).map((p, i) => ({
              ...p,
              ...c.story.benefits[i],
              ...(BENEFIT_ICONS[i] ? { icon: BENEFIT_ICONS[i] } : {}),
            })),
            // Cards 5 + 6 (PROTEIN, EXPERTEN) removed — the rows are shared, so DE removes them for EN too
            slides: cards.slice(0, STORY_CARDS_KEPT).map((s, i) => ({ ...s, ...c.story.cards[i] })),
          }
        }
        case 'teamPreview':
          return { ...b, description: c.team }
        default:
          return b
      }
    })

    await payload.update({
      collection: 'pages',
      id: home.id,
      locale,
      data: { hero, layout, _status: 'published' } as never,
      context: ctx,
    })
    console.log(`✅ ${locale}`)
  }

  const check = await payload.findByID({ collection: 'pages', id: home.id, locale: 'de', depth: 0 })
  const story = (check.layout ?? []).find((b) => b.blockType === 'fermentationStory') as
    | Block
    | undefined
  console.log(
    'status:',
    check._status,
    '| story cards:',
    rowsOf(story?.slides)
      .map((s) => s.bigWord)
      .join(' / '),
  )
}

await main()
process.exit(0)
