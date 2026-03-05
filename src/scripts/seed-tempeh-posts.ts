/**
 * Seed the Posts (How-To Articles) collection — Tempeh Articles.
 *
 * Creates 6 educational tempeh fermentation articles in both DE and EN.
 * Non-destructive: skips posts that already exist (by slug).
 * Use --force to overwrite all existing posts.
 *
 * Run:  pnpm seed tempeh-posts
 *       pnpm seed tempeh-posts --force
 */
import { TEMPEH_ARTICLES } from '@/app/(app)/tipps/tempeh-articles'
import config from '@payload-config'
import { getPayload } from 'payload'

const isForce = process.argv.includes('--force')
const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

// ── Lexical JSON helpers ─────────────────────────────────────

type LexicalTextNode = {
  type: 'text'
  text: string
  format: number
  style: string
  mode: 'normal'
  detail: number
  version: 1
}

type LexicalHeadingNode = {
  type: 'heading'
  tag: 'h2' | 'h3'
  format: ''
  indent: number
  version: 1
  direction: 'ltr'
  children: LexicalTextNode[]
}

type LexicalParagraphNode = {
  type: 'paragraph'
  format: ''
  indent: number
  version: 1
  direction: 'ltr'
  textFormat: number
  textStyle: string
  children: LexicalTextNode[]
}

function textNode(text: string): LexicalTextNode {
  return { type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }
}

function heading(text: string): LexicalHeadingNode {
  return {
    type: 'heading',
    tag: 'h2',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [textNode(text)],
  }
}

function paragraph(text: string): LexicalParagraphNode {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    textFormat: 0,
    textStyle: '',
    children: [textNode(text)],
  }
}

function sectionsToLexical(sections: Array<{ heading: string; body: string[] }>) {
  const children: (LexicalHeadingNode | LexicalParagraphNode)[] = []
  for (const section of sections) {
    children.push(heading(section.heading))
    for (const p of section.body) {
      children.push(paragraph(p))
    }
  }
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1 as const,
      direction: 'ltr' as const,
      children,
    },
  }
}

// ── EN translations for tempeh articles ──────────────────────

const EN_OVERRIDES: Record<
  string,
  {
    title: string
    summary: string
    readTime: string
    sections: Array<{ heading: string; body: string[] }>
  }
> = {
  'tempeh-selbst-machen-leitfaden': {
    title: 'How to Make Tempeh. The Complete Guide',
    summary:
      'Everything you need to know: ingredients, equipment, legumes, step-by-step instructions, and answers to common questions. Your starting point for tempeh fermentation.',
    readTime: '15 min.',
    sections: [
      {
        heading: 'What is Tempeh?',
        body: [
          'Tempeh is a traditional Indonesian food made from fermented legumes — usually soybeans. Think of it as a firm, savory cheese made from soybeans instead of milk.',
          'Tempeh is highly nutritious, rich in protein, easy to digest, and delicious. It can be used like tofu or meat: marinated, cooked in various ways, and incorporated into many dishes.',
          'Tempeh is made from legumes, water, and tempeh starter culture (Rhizopus oligosporus or Rhizopus oryzae). After the legumes are cooked, the starter is added and the beans are incubated. During fermentation, the culture develops white filaments (a type of mycelium) that bind the legumes together.',
        ],
      },
      {
        heading: 'Which Legumes Work?',
        body: [
          'Traditional tempeh is made with soybeans, but you can use any legume: white beans, black beans, chickpeas, lentils, lupines — almost anything works!',
          'Important: The legume hulls must be removed or at least cracked so the starter culture can penetrate. The easiest option is hulled (split) soybeans, yellow or green lentils, or chickpeas (also called "Chana Dal").',
          'Chickpeas have a thick shell and either need to be roughly chopped in a food processor before cooking or manually hulled. With split soybeans and lentils, it\'s much simpler.',
        ],
      },
      {
        heading: 'What Equipment Do You Need?',
        body: [
          'Large saucepan, large bowl, large spoon, clean cloth, resealable plastic bags, cooking thermometer.',
          'Most importantly: a way to incubate the tempeh at the right temperature. The ideal temperature for tempeh incubation is about 30°C. If too low, development takes longer. If too high, the spores may die.',
          'Several options work: oven with the light on, dehydrator, thermocirculator with water bath, heating mat, or cooler with hot water. Temperature control is especially important for the first 12 hours. After 12 hours, turn off the heat since the tempeh starts producing its own heat and could overheat.',
        ],
      },
      {
        heading: 'Step-by-Step Instructions',
        body: [
          '1. Prepare legumes: Soak overnight, then lightly grind in a food processor (if needed) and remove hulls.',
          '2. Cook: Boil the legumes, but they should remain al dente (still slightly firm), not soft. Cooking continues during fermentation.',
          '3. Inoculate: After cooking, drain thoroughly and dry as much as possible. Then add vinegar, followed by the tempeh starter culture.',
          '4. Bag: Use resealable plastic bags with hand-made holes. This allows the culture to breathe while retaining some moisture. Don\'t pack too tightly and don\'t overfill (max. 1 inch / 3 cm thick).',
          '5. Incubate: Place bags in a warm environment (about 30°C). After 12 hours, monitor temperature and turn bags over to allow the culture to breathe. Incubation can take 24 to 72 hours. Tempeh is ready when the legumes are completely covered with a dense white film.',
        ],
      },
      {
        heading: 'How Long Does Tempeh Last?',
        body: [
          'Tempeh can be cooked and eaten immediately after production. If storing, place it in the refrigerator right away, in its fermentation container or other packaging that preserves moisture, for a maximum of one week. For longer storage: freezer, where it keeps for several months.',
        ],
      },
      {
        heading: 'Safety & Common Issues',
        body: [
          'Tempeh is much safer than many foods when simple rules are followed: clean and ideally sanitize equipment, use starter culture from a reliable source, monitor temperature carefully the first 12 hours, and add vinegar (protects against Bacillus cereus).',
          'If tempeh hasn\'t fermented after 48 hours: legumes weren\'t hulled enough, temperature was too low/high, insufficient airflow, or weak spores. Don\'t be discouraged! Small adjustments will help next time.',
        ],
      },
    ],
  },
  'tempeh-herstellung-tipps': {
    title: '6 Tips for Successful Tempeh Making',
    summary:
      'Making tempeh at home doesn\'t have to be complicated. These 6 practical tips will help you optimize your fermentation.',
    readTime: '5 min.',
    sections: [
      {
        heading: 'Tip 1: Prepare Legumes Correctly',
        body: [
          'The hull must go! This is the basic requirement. Choose hulled or split soybeans or lentils whenever possible — it saves time. If using other legumes (chickpeas, black beans), you\'ll need to either briefly pulse them in a food processor or manually remove the hulls.',
          'The culture can only penetrate if the legume is accessible.',
        ],
      },
      {
        heading: 'Tip 2: Don\'t Overcook',
        body: [
          'Surprise: tempeh gets slightly softer during fermentation. Cook legumes only until al dente — they should still be crispy. Overcooked legumes create mushy tempeh that also doesn\'t aerate well.',
          'Taste as you cook and evaluate critically!',
        ],
      },
      {
        heading: 'Tip 3: Dry Thoroughly After Cooking',
        body: [
          'Too much water promotes bacterial growth and slows tempeh culture colonization. Drain well, spread on a clean cloth, gently rub. A fan helps. But don\'t wait too long — legumes should retain some residual heat.',
        ],
      },
      {
        heading: 'Tip 4: Make Enough Holes in the Bags',
        body: [
          'Tempeh culture needs oxygen. Too little airflow = culture suffocation! Use a fork to generously pierce bags on both sides. More holes is better than less.',
        ],
      },
      {
        heading: 'Tip 5: Monitor Temperature Closely',
        body: [
          'Temperature during incubation is critical — should stay between 28–32°C. Especially the first 12 hours are crucial! After 12 hours turn off heating since tempeh produces its own heat.',
          'Use a cooking thermometer and measure the internal (not external) temperature of the bag.',
        ],
      },
      {
        heading: 'Tip 6: Store in Smaller Portions',
        body: [
          'Tempeh cools faster and more efficiently when divided into smaller portions. This better preserves quality and freshness.',
        ],
      },
    ],
  },
  'tempeh-burger-rezept': {
    title: 'Marinated Tempeh Burger',
    summary: 'A delicious plant-based burger with fermented tempeh, marinated and fried or breaded. Full of umami and satisfying.',
    readTime: '20 min.',
    sections: [
      {
        heading: 'Why Tempeh in a Burger?',
        body: [
          'Tempeh is much more than a meat substitute. It offers a firm, refined texture that holds together and marinates beautifully. Plus, natural umami flavor.',
          'High-quality, easily digestible plant protein thanks to fermentation — and you can make your own tempeh from different legumes.',
        ],
      },
      {
        heading: 'Marinade Ingredients',
        body: [
          '• 1 block of tempeh',
          '• 2 grated garlic cloves',
          '• 1 ½ tbsp grated ginger',
          '• 3 tbsp vegetable oil',
          '• 3 tbsp soy sauce',
          '• 3 tbsp lemon juice',
          '• 1 ½ tbsp maple syrup',
          '• 1 tsp spices of choice (smoked paprika, thyme, oregano, curry…)',
        ],
      },
      {
        heading: 'Breading Ingredients (Optional)',
        body: [
          '• All-purpose flour',
          '• 1 egg',
          '• Breadcrumbs',
          '• Salt and pepper',
        ],
      },
      {
        heading: 'For the Finished Burger',
        body: [
          '• Marinated tempeh block (breaded or not)',
          '• 2 burger buns',
          '• Vegetable oil for cooking',
          '• Toppings of choice: fermented pickles, sauerkraut, fresh lettuce',
          '• Cheese slice (optional)',
          '• Sauce of choice: miso mayonnaise, homemade mustard, ketchup…',
        ],
      },
      {
        heading: 'Instructions',
        body: [
          '1. Halve the tempeh block so it fits the buns.',
          '2. Place tempeh in an airtight container.',
          '3. Mix all marinade ingredients in a bowl.',
          '4. Pour over tempeh and seal the container.',
          '5. Marinate in the fridge for at least 4 hours (preferably overnight).',
          '6. Remove tempeh from marinade and fry: at medium heat, 7–8 minutes per side. Top with cheese at the end and let melt under a lid.',
          '7. (Optional for breaded tempeh:) Pat marinated tempeh dry, roll in flour, dip in whisked egg, then breadcrumbs. Chill 20 minutes. Then brown in a pan with oil or bake in the oven at 180°C for 20–25 minutes.',
          '8. Toast the buns.',
          '9. Assemble with sauce, toppings, and tempeh. Enjoy!',
        ],
      },
      {
        heading: 'Pro Tips',
        body: [
          'For softer tempeh: steam before marinating.',
          'For extra crunch: double the breading (egg → breadcrumbs → egg → breadcrumbs again).',
          'Vary the marinade: try fermented elements, garum, homemade plum sauce, or fermented brine.',
        ],
      },
    ],
  },
  'kichererbsen-tempeh-rezept': {
    title: 'Chickpea Tempeh Recipe',
    summary: 'Tempeh made from chickpeas: nutty, savory, and completely soy-free. Perfect for diverse vegan recipes.',
    readTime: '8 min.',
    sections: [
      {
        heading: 'Why Chickpea Tempeh?',
        body: [
          'Chickpeas give tempeh a stronger, slightly nutty flavor. The texture is firm and toothsome. An excellent alternative if you want soy-free fermentation.',
          'Note: Chickpeas have a thick shell that prevents the culture from penetrating. Hulled chickpeas (also called "Chana Dal") work much faster.',
        ],
      },
      {
        heading: 'What You Need',
        body: [
          '• 2.5 cups dried chickpeas',
          '• 2 tbsp white vinegar',
          '• 1 tsp tempeh starter culture',
          '• Water for cooking',
          '• Large saucepan, colander, clean cloth, stirring spoon, cooking thermometer, 3 resealable plastic bags',
        ],
      },
      {
        heading: 'Step by Step',
        body: [
          '1. Soak chickpeas overnight (or at least 6 hours) in double their volume of water.',
          '2. Pulse in a food processor in batches until coarsely broken. Don\'t over-process!',
          '3. Boil in unsalted water for 20 minutes until chickpeas are al dente. Skim foam.',
          '4. Drain very thoroughly, spread on a clean cloth, and lightly rub to reduce moisture.',
          '5. When no longer wet: add vinegar, mix well. Then add starter culture, mix thoroughly.',
          '6. Fill bags (not too full, max. 3 cm thick), seal, then pierce generously on both sides with a fork.',
          '7. Incubate at approximately 30°C. After 1 hour, check temperature and adjust if needed. After 12 hours, turn bags over. After 24–36 hours, white spots appear. After 36–48 hours, tempeh is ready when all chickpeas are covered with white film and hold together.',
          '8. Cool immediately or store (refrigerate max. 1 week, freeze for several months).',
        ],
      },
      {
        heading: 'Bonus: Chickpea-Quinoa Tempeh',
        body: [
          'For more flavor and texture: use white or red quinoa (or a mix). Since quinoa cooks faster than chickpeas: add quinoa 10 minutes before chickpeas finish cooking. Rest of instructions stay the same.',
          'This creates a visually interesting two-color tempeh with even more intense flavors.',
        ],
      },
    ],
  },
  'schwarzbohnen-tempeh-rezept': {
    title: 'Black Bean Tempeh Recipe',
    summary:
      'Tempeh made from black beans: robust, rustic, and perfect for Mexican-inspired dishes. Best choice for beginners.',
    readTime: '9 min.',
    sections: [
      {
        heading: 'Black Bean Tempeh: The Beginner\'s Best Friend',
        body: [
          'Black beans are an excellent tempeh choice, especially for beginners:',
          '• Affordable: dried black beans are found in every supermarket.',
          '• Easy: black beans have a very thin shell and need not be hulled.',
          '• Delicious: black bean tempeh is robust and wonderful with BBQ sauce or Mexican spices.',
          '• Versatile: perfect  grilled or fried, in sandwiches, poke bowls, or Tex-Mex salads.',
        ],
      },
      {
        heading: 'What You Need',
        body: [
          '• 500 g dried black beans',
          '• 2 tbsp white vinegar (or apple cider vinegar)',
          '• 1 tsp tempeh starter culture',
          '• Water for cooking',
          '• Large saucepan, colander, clean cloth, spoon, cooking thermometer, 3 resealable bags',
        ],
      },
      {
        heading: 'Instructions Step by Step',
        body: [
          '1. Place black beans in large saucepan, cover with double the water volume. Soak overnight (or at least 6 hours).',
          '2. Drain and roughly rinse beans.',
          '3. Fill a new saucepan with water and bring to boil. Add black beans and simmer 20 minutes until still firm (al dente). No salt! Skim foam as needed.',
          '4. Drain extremely thoroughly. Spread on clean cloth and lightly rub to remove as much moisture as possible. Pat dry or use a fan.',
          '5. When no longer wet: add vinegar and mix thoroughly. Then add tempeh starter culture and mix again thoroughly.',
          '6. Fill bags (not too full: max. 3 cm layer), seal bags. Pierce generously on both sides with a fork.',
          '7. Place in turned-off oven (light on, door slightly open), or on heating mat, or in cooler with hot water. Goal: reach and maintain 30°C.',
          '8. After 1 hour check temperature and adjust if needed. After 12 hours turn bags over. After 24–36 hours white spots appear. After 36–48 hours black bean tempeh should be completely covered with white film and cohesive.',
          '9. Cool immediately or store (refrigerator max. 1 week, freezer several months).',
        ],
      },
      {
        heading: 'How to Cook Black Bean Tempeh',
        body: [
          'Simply fry or grill. The robust flavor pairs perfectly with:',
          '• BBQ sauce',
          '• Mexican spices (cumin, chipotle, lime)',
          '• In tacos or burritos',
          '• On a grill plate with roasted vegetables',
        ],
      },
    ],
  },
  'linsen-tempeh-sojafrei': {
    title: 'Soy-Free: Lentil Tempeh Recipe',
    summary:
      'Tempeh without soy, made from split lentils: fast, easy, and absolutely delicious. The perfect starter project.',
    readTime: '6 min.',
    sections: [
      {
        heading: 'Why Lentil Tempeh?',
        body: [
          'Lentil tempeh is your starter project! Why?',
          '• No soaking needed – no hull fuss.',
          '• Extremely fast cooking: just 15 minutes.',
          '• Local ingredient: lentils are grown worldwide and affordable.',
          '• Soft, creamy flavor – perfect for beginners.',
          '• Yellow or green lentils work, or mix both for visual contrast.',
        ],
      },
      {
        heading: 'What You Need',
        body: [
          '• 2 cups yellow or green split lentils',
          '• 2 tbsp vinegar',
          '• 1 tsp tempeh starter culture',
          '• Water for cooking',
          '• Large saucepan, colander, clean cloth, spoon, cooking thermometer, 3 bags',
        ],
      },
      {
        heading: 'Step by Step Instructions',
        body: [
          '1. Fill large saucepan with water and bring to a boil.',
          '2. Add lentils.',
          '3. Simmer for 15 minutes uncovered until lentils are al dente and still firm. Skim foam.',
          '4. Drain very well, and rinse.',
          '5. Spread on clean cloth and gently pat dry (roll cloth and press lightly, or use fan).',
          '6. When no longer wet: add vinegar, mix thoroughly. Then add tempeh starter culture and mix again thoroughly.',
          '7. Fill bags (max. 3 cm thick), seal, then pierce on both sides with a fork.',
          '8. Incubate at approximately 30°C. After 1 hour check temperature. After 12 hours turn bags over. After 24–36 hours white spots appear. After 36–48 hours tempeh should be completely covered with white film.',
          '9. Cool immediately. Keeps in refrigerator about 1 week, in freezer several months.',
        ],
      },
      {
        heading: 'How to Cook Lentil Tempeh',
        body: [
          'Lentil tempeh has a mild, creamy flavor and works everywhere regular soy tempeh is used:',
          '• Simply fry or grill.',
          '• In burgers, bowls, or curries.',
          '• In stir-fries (add near the end so cultures survive).',
          '• Marinate and then fry or bake.',
        ],
      },
      {
        heading: 'Bonus: Storage & Info',
        body: [
          'Tempeh keeps in the refrigerator for about one week and in the freezer for at least 6 months. Always cook tempeh before eating — raw homemade tempeh should not be consumed.',
          'If you mix green and yellow lentils, you\'ll get a visually interesting two-tone tempeh!',
        ],
      },
    ],
  },
}

// ── Seed runner ──────────────────────────────────────────────

async function seedTempehPosts() {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding Tempeh Posts (How-To Articles)...')

  for (const article of TEMPEH_ARTICLES) {
    // Non-destructive check
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: article.slug } },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length > 0 && !isForce) {
      payload.logger.info(
        `  ⏭️  "${article.slug}" already exists — skipping. Use --force to overwrite.`,
      )
      continue
    }

    const enOverride = EN_OVERRIDES[article.slug]

    const deContent = sectionsToLexical(article.sections)
    const enContent = enOverride ? sectionsToLexical(enOverride.sections) : deContent

    if (existing.docs.length > 0 && isForce) {
      // Update existing
      const id = existing.docs[0].id

      await payload.update({
        collection: 'posts',
        id,
        locale: 'de',
        data: {
          slug: article.slug,
          workshopType: article.workshopType,
          title: article.title,
          summary: article.description,
          readTime: article.readTime,
          content: deContent,
        },
        context: ctx,
      })

      await payload.update({
        collection: 'posts',
        id,
        locale: 'en',
        data: {
          workshopType: article.workshopType,
          title: enOverride?.title ?? article.title,
          summary: enOverride?.summary ?? article.description,
          readTime: enOverride?.readTime ?? article.readTime,
          content: enContent,
        },
        context: ctx,
      })

      payload.logger.info(`  ✅ Updated "${article.slug}" (DE + EN)`)
    } else {
      // Create new (slug is not localized, create once)
      const created = await payload.create({
        collection: 'posts',
        locale: 'de',
        data: {
          slug: article.slug,
          workshopType: article.workshopType,
          title: article.title,
          summary: article.description,
          readTime: article.readTime,
          content: deContent,
        },
        context: ctx,
      })

      await payload.update({
        collection: 'posts',
        id: created.id,
        locale: 'en',
        data: {
          workshopType: article.workshopType,
          title: enOverride?.title ?? article.title,
          summary: enOverride?.summary ?? article.description,
          readTime: enOverride?.readTime ?? article.readTime,
          content: enContent,
        },
        context: ctx,
      })

      payload.logger.info(`  ✅ Created "${article.slug}" (DE + EN)`)
    }
  }

  payload.logger.info('✅ All 6 tempeh articles seeded!')
  payload.logger.info('   Edit at: /admin/collections/posts?where=workshopType__equals__tempeh')
  process.exit(0)
}

seedTempehPosts().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
