/**
 * Seed the Posts (How-To Articles) collection.
 *
 * Creates all 6 educational lacto-fermentation articles in both DE and EN.
 * Non-destructive: skips posts that already exist (by slug).
 * Use --force to overwrite all existing posts.
 *
 * Run:  pnpm seed posts
 *       pnpm seed posts --force
 */
import { ARTICLES } from '@/app/(app)/tipps/article-data'
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

// ── EN translations for article titles/summaries ─────────────

const EN_OVERRIDES: Record<
  string,
  {
    title: string
    summary: string
    readTime: string
    sections: Array<{ heading: string; body: string[] }>
  }
> = {
  'gemuese-fermentieren-leitfaden': {
    title: 'Fermenting Vegetables. The Complete Guide',
    summary:
      'Everything you need to know on one page: ingredients, salt ratio, containers, temperature and the most common questions. Your starting point for any lacto-fermentation.',
    readTime: '12 min.',
    sections: [
      {
        heading: 'What is lactic acid fermentation?',
        body: [
          'Lactic acid fermentation — also known as lacto-fermentation — is one of the oldest methods of preserving food. Naturally occurring lactic acid bacteria (Lactobacillus) convert the sugar in vegetables into lactic acid. The result: a tangy, crunchy ferment full of flavour and living cultures.',
          'You need neither vinegar nor heat. Just vegetables, salt, a jar and a little patience.',
        ],
      },
      {
        heading: 'What you need',
        body: [
          'Fresh vegetables: cabbage, carrots, cucumbers, radishes, beetroot, cauliflower — almost anything works. Choose seasonal produce from the market or your garden. The fresher, the better the texture.',
          'Salt: use non-iodised salt without anti-caking agents. Sea salt or rock salt are perfect. As a rule of thumb: 2% of the vegetable weight.',
          'Jars: clip-top jars (Weck, Le Parfait) or Mason jars. The key point is that you can press the vegetables below the liquid — glass weights or a cabbage leaf help.',
          'Optional: spices such as garlic, dill, peppercorns, mustard seeds, turmeric or chilli add variety.',
        ],
      },
      {
        heading: 'Step by step',
        body: [
          '1. Wash the vegetables and cut into the desired shape — strips, slices, sticks or rough pieces.',
          '2. Weigh the vegetables and calculate 2% salt (e.g. 500 g vegetables → 10 g salt).',
          '3. Add salt to the vegetables and knead vigorously (dry-salting) or prepare a 2–3% brine and pour over.',
          '4. Pack the vegetables tightly into a clean jar, pressing firmly down. The liquid must cover the vegetables.',
          '5. Close the jar (not airtight — CO₂ must be able to escape) and leave at room temperature (18–24 °C).',
          '6. Burp daily and check that the vegetables stay below the liquid. Taste after 3–7 days.',
          '7. When you like the taste, put the jar in the fridge. Fermentation slows down and the ferment keeps for months.',
        ],
      },
      {
        heading: 'How long does it take?',
        body: [
          'That depends on the temperature and the vegetable. Rough guidelines: sauerkraut needs 1–4 weeks, kimchi 3–7 days, pickled cucumbers 3–5 days, carrot sticks 5–10 days.',
          'Taste regularly! When you like it, it\'s done. There is no "too early" — just a matter of personal preference.',
        ],
      },
      {
        heading: 'Safety',
        body: [
          'Lacto-fermentation is one of the safest preservation methods. The low pH (below 4.6) reliably inhibits harmful bacteria. As long as the vegetables stay below the brine and you use clean jars, very little can go wrong.',
          'Trust your nose: does it smell pleasantly sour? Does it look normal? Then everything is fine. Only if something smells rotten or visible mould grows on the vegetables themselves (not just on the surface of the brine) should you discard the jar.',
        ],
      },
    ],
  },
  'salz-und-lake': {
    title: 'Using Salt & Brine Correctly',
    summary:
      '2% salt is the golden standard — but when to dry-salt, when to make a brine? Charts, tips and everything about choosing the right salt.',
    readTime: '9 min.',
    sections: [
      {
        heading: 'Why salt?',
        body: [
          'Salt is the engine of lacto-fermentation. It draws water out of the vegetables (osmosis), creates a brine and at the same time inhibits unwanted bacteria. Lactic acid bacteria, on the other hand, love salt — they thrive at 2–5% salt content.',
          'Without salt the vegetables would simply rot instead of fermenting. Too much salt slows the fermentation and makes the result unpleasantly salty. The art is in the right ratio.',
        ],
      },
      {
        heading: 'Dry-salting vs. brine',
        body: [
          'Dry-salting: salt is added directly to the cut vegetables and kneaded. The vegetables draw water and create their own brine. Ideal for water-rich vegetables like cabbage (sauerkraut!), cucumbers, courgette or radishes.',
          'Brine: you dissolve salt in water and pour the solution over the vegetables. Perfect for firm, low-water vegetables like carrots, cauliflower, green beans or whole garlic cloves. Also the better choice for mixed pickles.',
        ],
      },
      {
        heading: 'The 2% principle',
        body: [
          'The universal formula: 2% of the total weight (vegetables + any water) as salt.',
          'Dry-salting example: 1 kg cabbage → 20 g salt. Knead thoroughly until brine appears.',
          'Brine example: 1 litre water + 20 g salt = 2% brine. Vegetables in jar, brine over until everything is covered.',
          'For stronger or longer-stored ferments (e.g. over 4 weeks) you can increase to 3%.',
        ],
      },
      {
        heading: 'Which salt?',
        body: [
          'Always use non-iodised salt. Iodine inhibits lactic acid bacteria and can disrupt fermentation.',
          'Sea salt or rock salt are the first choice. Himalayan salt also works. Avoid table salt with anti-caking agents.',
        ],
      },
      {
        heading: 'Common salting mistakes',
        body: [
          "Too little salt (below 1.5%): the vegetables become mushy and fermentation doesn't start properly.",
          'Too much salt (above 5%): the lactic acid bacteria are inhibited and the ferment tastes too salty.',
          'Wrong scales: a teaspoon of salt is 5–8 g depending on the type. Always weigh — guessing leads to inconsistent results.',
        ],
      },
    ],
  },
  'anfaenger-fehler': {
    title: '5 Mistakes Beginners Should Avoid',
    summary:
      "Didn't weigh your vegetables? Opened the jar too early? We show you the most common pitfalls — and how to avoid them easily.",
    readTime: '3 min.',
    sections: [
      {
        heading: '1. Estimating salt by eye',
        body: [
          'The most common mistake of all: sprinkling "a bit of salt" instead of weighing precisely. 2% sounds small but makes a huge difference. Too little → mushy vegetables. Too much → the lactic acid bacteria go on strike.',
          'The solution: get out the kitchen scales, weigh the vegetables, calculate 2%. Every time.',
        ],
      },
      {
        heading: '2. Vegetables poking out of the brine',
        body: [
          'Anything above the liquid is in contact with air — and air means mould risk. This is by far the most important point in lacto-fermentation.',
          'Use glass weights, a cabbage leaf or a small plate to push the vegetables below the surface. Check daily in the first few days.',
        ],
      },
      {
        heading: '3. Sealing the jar too tightly',
        body: [
          'Fermentation produces CO₂. If the gas cannot escape, pressure builds up — in the worst case the jar bursts. Clip-top jars with rubber seals let gas escape automatically. With screw-top jars: just rest the lid loosely or open briefly daily (burping).',
        ],
      },
      {
        heading: '4. Starting too warm or too cold',
        body: [
          'Above 28 °C: fermentation races, the vegetables become soft and the flavour turns musty. Below 15 °C: almost nothing happens and unwanted yeasts have an easy time.',
          'The sweet spot is 18–24 °C. A normal living space in spring or autumn is perfect.',
        ],
      },
      {
        heading: '5. Giving up too soon',
        body: [
          'Cloudy brine? Normal. White film on the surface? Usually harmless kahm yeast — skim it off and carry on. Strange smell in the first few days? The bacterial culture is settling in, it will pass.',
          "Fermentation is a living process, not a sterile lab procedure. Trust the process, observe, taste — and don't throw anything away before reading our troubleshooting article.",
        ],
      },
    ],
  },
  'ideale-temperatur': {
    title: 'The Ideal Temperature for Lacto-Fermentation',
    summary:
      '18–24 °C to start, then store cool. Learn why temperature affects the taste, texture and safety of your ferment.',
    readTime: '5 min.',
    sections: [
      {
        heading: 'Why temperature matters',
        body: [
          'Lactic acid bacteria are temperature-sensitive. Too cold — and they essentially go to sleep. Too warm — and fermentation becomes uncontrollably fast, the vegetables lose texture and the flavour can become unpleasant.',
          'Temperature also affects which bacterial strains dominate. At lower temperatures (15–18 °C), slower, more complex flavours develop. At higher temperatures (22–28 °C) it goes faster but the flavour stays simpler.',
        ],
      },
      {
        heading: 'The ideal range: 18–24 °C',
        body: [
          'For most vegetable ferments the sweet spot is 18–24 °C. In this range the lactic acid bacteria start reliably, the vegetables stay crunchy and the flavour develops in a balanced way.',
          "A normal living space between spring and autumn is usually perfect. Don't put your jar on the windowsill in full sun — find a shaded spot in the kitchen or hallway.",
        ],
      },
      {
        heading: 'Fermenting in summer',
        body: [
          'When room temperature rises above 28 °C, fermentation becomes too fast. The vegetables go soft and the flavour becomes flat or even musty.',
          "Tips for hot days: put jars in the cellar or the coolest room. Increase salt content slightly to 2.5–3%. Start fermentation in the evening when it's cooler. Check and taste more often.",
        ],
      },
      {
        heading: 'Fermenting in winter',
        body: [
          'Heated rooms often have 20–22 °C — ideal. If your kitchen is cooler (below 18 °C), fermentation simply takes longer. That is not a problem — on the contrary: slowly fermented vegetables often develop deeper, more complex flavours.',
          "Don't put the jar on a cold windowsill or directly next to the heater. A shelf in the kitchen at eye level is perfect.",
        ],
      },
      {
        heading: 'Storage after fermentation',
        body: [
          'Once your ferment has the desired taste, into the fridge (2–6 °C). The cold almost completely slows the bacterial activity — the ferment remains stable for months and only very slowly gets sourer.',
          'Important: always keep opened jars in the fridge. Still-sealed jars can also be stored well in a cool, dark place (cellar, pantry around 10–15 °C).',
        ],
      },
    ],
  },
  troubleshooting: {
    title: "Problems Fermenting? Don't Panic!",
    summary:
      "White film, cloudy brine, sulphur smell — almost everything is harmless. Here you'll find answers to the most common troubleshooting questions.",
    readTime: '8 min.',
    sections: [
      {
        heading: 'Cloudy brine',
        body: [
          'Cloudy brine is completely normal and even a good sign! It shows that the lactic acid bacteria are actively working. The cloudiness comes from the bacterial colonies and is absolutely harmless.',
          'Crystal-clear brine after a week? That would actually be unusual. Enjoy the cloudiness — it belongs there.',
        ],
      },
      {
        heading: 'White film on the surface',
        body: [
          'A thin white film is almost always kahm yeast. This yeast is harmless but tastes slightly yeasty. Simply skim it off with a spoon and continue fermentation.',
          'Kahm yeast forms more often when the jar is opened frequently or vegetables are sticking out of the brine.',
          'Caution: real mould is fuzzy, coloured (green, black, pink) and grows raised. Kahm yeast is flat and white. With fuzzy mould, discard the jar.',
        ],
      },
      {
        heading: 'Bubbles and hissing',
        body: [
          'If you open the jar and it hisses or bubbles rise: perfect! That is CO₂ — a natural by-product of lacto-fermentation. The more active the fermentation, the more gas.',
          'Activity is strongest in the first 2–4 days. Burp screw-top jars daily. Clip-top jars burp themselves.',
        ],
      },
      {
        heading: 'Strange smell',
        body: [
          'Slightly sulphurous smell in the first few days: normal, especially with cabbage and broccoli. It passes after 2–3 days.',
          "Pleasantly sour: that's how it should smell! Like mild-sour pickles or young sauerkraut.",
          'Rotten, acrid or off: trust your nose. What obviously smells bad probably is. When in doubt: better to discard and start again.',
        ],
      },
      {
        heading: 'Soft, mushy vegetables',
        body: [
          'The most common causes: too little salt, too high temperature, or the vegetables were no longer fresh. Mushy ferment is safe to eat but not pleasant in texture.',
          'Prevention: weigh exactly 2% salt. Keep room temperature below 24 °C. Use fresh, crisp vegetables — never wilted.',
        ],
      },
      {
        heading: 'Too little brine',
        body: [
          "Sometimes the vegetables don't draw enough water. This happens especially with dense vegetables (carrots, turnips) or if you didn't knead enough when dry-salting.",
          'Solution: simply mix a little extra 2% brine (20 g salt to 1 litre water) and pour over the vegetables until everything is covered.',
        ],
      },
    ],
  },
  'fermentiertes-gemuese-ideen': {
    title: 'Creative Ideas for Fermented Vegetables',
    summary:
      'From breakfast bagel to kimchi grilled cheese — discover creative ways to incorporate your ferment into every meal.',
    readTime: '10 min.',
    sections: [
      {
        heading: 'For breakfast',
        body: [
          'On avocado toast: a spoonful of sauerkraut or fermented radishes on avocado toast gives acidity and crunch. Add a fried egg — perfect.',
          'In scrambled eggs: kimchi scrambled eggs are a game-changer. Fry kimchi briefly in the pan, then add the eggs. The acidity cuts through the richness of the eggs beautifully.',
          'With a bagel: fermented carrot sticks as a side to cream cheese and salmon. Or sauerkraut directly on the bagel with a dollop of mustard.',
        ],
      },
      {
        heading: 'As a side dish',
        body: [
          'The simplest way: a few spoonfuls straight from the jar onto the plate. A small portion of fermented vegetables goes with any warm meal as a probiotic side.',
          'With rice and curry: kimchi or fermented daikon next to a warm curry is a classic of Korean cuisine.',
          'At the BBQ: fermented cucumbers or mixed pickles are the perfect counterpart to fatty grilled food.',
        ],
      },
      {
        heading: 'In warm dishes',
        body: [
          'Grilled cheese with kimchi: cheddar + kimchi between two slices of sourdough bread, pan-fried golden brown. THE comfort food.',
          'Sauerkraut stew: classic German — sauerkraut with potatoes, apples and bay leaf. Or as Polish bigos with mushrooms and smoked tofu.',
          "Fermented vegetable stir-fry: stir-fried vegetables with a spoonful of kimchi or fermented chillies. Add only at the end — don't cook too long so the cultures survive.",
        ],
      },
      {
        heading: 'In sandwiches & wraps',
        body: [
          'Reuben sandwich: the classic! Sauerkraut, cheddar, mustard and smoked tofu or pastrami on hearty rye bread, hot-pressed.',
          'Falafel wrap: instead of (or in addition to) red cabbage salad: fermented red cabbage. More flavour, more probiotics.',
        ],
      },
      {
        heading: 'In salads & dressings',
        body: [
          'Directly in the salad: fermented beetroot, carrots or radishes as a topping on green salads. The acidity partially replaces the dressing.',
          'Ferment dressing: brine from the fermentation jar + olive oil + mustard + honey → an incredibly good, probiotic salad dressing.',
        ],
      },
      {
        heading: 'Snacks & other ideas',
        body: [
          'Straight from the jar: sometimes the best snack is simply a forkful of sauerkraut or a few fermented cucumber slices straight from the fridge.',
          'On pizza: sauerkraut or kimchi added after baking on the finished pizza — the contrast between hot and cold, soft and sour is wonderful.',
          'As a gift: nicely labelled, a jar of home-made ferment is a wonderfully personal present.',
        ],
      },
    ],
  },
}

// ── Seed runner ──────────────────────────────────────────────

async function seedPosts() {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding Posts (How-To Articles)...')

  for (const article of ARTICLES) {
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
          workshopType: 'lakto',
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
          workshopType: 'lakto',
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
          workshopType: 'lakto',
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
          workshopType: 'lakto',
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

  payload.logger.info('✅ All 6 posts seeded!')
  payload.logger.info('   Edit at: /admin/collections/posts')
  process.exit(0)
}

seedPosts().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
