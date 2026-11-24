/**
 * Seed recipes + the "Rezepte-Seite" global for /rezepte (DE + EN).
 *
 * - 5 recipes from the workshop scripts (Lakto + Kombucha), as used in the
 *   Kitchen Lab prototype. German wording re-translated from the English
 *   prototype — David/Marcel should check against the original scripts.
 * - 4 placeholder samples so every category has something to show.
 * - Page texts (hero, workshop card), only if the global is still empty.
 * - "Was du bemerkst" (day-by-day notes) for 4 recipes, DE + EN.
 * - Template words (Vorlagen-Texte), the 4 category names and short texts
 *   and the note card's name + role,
 *   DE + EN — every run, but only fills fields that are still empty.
 * - Ingredient amounts in both languages (EN units via amountToEnglish).
 *
 * Non-destructive: skips recipes whose slug already exists.
 * Refuses to run against any DB that isn't the staging DB, unless --allow-prod.
 *
 * Run:  pnpm seed recipes
 *       pnpm seed recipes --page   (also overwrite the Rezepte-Seite texts)
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { CATEGORY_INTRO_DEFAULTS, LANDING_DEFAULTS, NOTE_DEFAULTS, RECIPE_LABELS } from '@/app/(app)/rezepte/labels'
import { RECIPE_CATEGORIES } from '@/collections/Recipes/categories'
import { amountToEnglish } from '@/lib/recipeAmount'
import type { Recipe } from '@/payload-types'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

if (!process.env.DATABASE_URL?.includes('fermentfreude-staging') && !process.argv.includes('--allow-prod')) {
  console.error('✋ seed-recipes: DATABASE_URL is not the staging DB. Refusing to seed sample recipes.')
  process.exit(1)
}

type Lang = { de: string; en: string }
type Sample = {
  slug: string
  category: Recipe['category']
  featured?: boolean
  title: Lang
  summary: Lang
  prepMinutes: number
  fermentationDays?: number
  yield: Lang
  difficulty: NonNullable<Recipe['difficulty']>
  keywords: Lang
  vessel?: Lang
  why?: Lang
  ingredients: Array<{ amount: string; name: Lang; note?: Lang }>
  steps: Array<Lang & { title?: Lang }>
  tips: Lang[]
}

const ferment3: Lang & { title: Lang } = {
  title: { de: 'Fermentieren', en: 'Ferment' },
  de: '3 Tage bei Zimmertemperatur (20 bis 25 °C) fermentieren lassen. Danach 1 Woche im Kühlschrank oder in einem kühlen Raum (15 bis 18 °C) reifen lassen.',
  en: 'Ferment for 3 days at room temperature (20 to 25 °C). Then let it mature for 1 week in the fridge or a cool room (15 to 18 °C).',
}

const t = (de: string, en: string): Lang => ({ de, en })

/** "Was du bemerkst" — what you see, smell or taste on which day (DE + EN). */
const NOTICES: Record<string, Array<{ day: number } & Lang>> = {
  'trauben-kombucha': [
    { day: 1, de: 'Erste kleine Bläschen am Flaschenhals', en: 'First small bubbles at the neck of the bottle' },
    { day: 2, de: 'Die Trauben steigen nach oben', en: 'The grapes rise to the top' },
    { day: 3, de: 'Prickelt und riecht fruchtig. Ab in den Kühlschrank', en: 'Fizzy and fruity. Into the fridge' },
  ],
  'klassisches-sauerkraut': [
    { day: 1, de: 'Lake steht über dem Kraut, erste Bläschen', en: 'Brine covers the cabbage, first bubbles' },
    { day: 3, de: 'Es blubbert kräftig und riecht säuerlich', en: 'Lively bubbling, smells pleasantly sour' },
    { day: 10, de: 'Kraut wird heller und weicher', en: 'The cabbage turns paler and softer' },
    { day: 21, de: 'Knackig, mild-sauer, fertig zum Genießen', en: 'Crunchy and mildly sour, ready to enjoy' },
  ],
  'fermentierte-zucchini-pickles': [
    { day: 2, de: 'Lake wird leicht trüb, das ist gut so', en: 'The brine turns slightly cloudy, that is a good sign' },
    { day: 5, de: 'Riecht frisch-säuerlich nach Dill', en: 'Smells fresh, sour and of dill' },
  ],
  'paprika-kimchi': [
    { day: 1, de: 'Erste Bläschen, Kimchi wird saftiger', en: 'First bubbles, the kimchi gets juicier' },
    { day: 7, de: 'Angenehm scharf und säuerlich', en: 'Pleasantly spicy and sour' },
  ],
}


/* Recipes from the Fermentfreude workshop scripts (via the Kitchen Lab prototype). */
const SCRIPT_RECIPES: Sample[] = [
  {
    slug: 'fermentierte-zucchini-pickles',
    category: 'fermentieren',
    featured: true,
    title: t('Fermentierte Zucchini-Pickles', 'Lacto-fermented zucchini pickles'),
    summary: t('Zucchini- und Karottensticks mit Orangenblüte, Lorbeer und Thymian.', 'Zucchini and carrot sticks with orange blossom, bay and thyme.'),
    prepMinutes: 30,
    fermentationDays: 10,
    yield: t('1 Glas (500 ml)', '1 jar (500 ml)'),
    difficulty: 'mittel',
    keywords: t('Zucchini, Pickles, Lakto, fermentieren', 'zucchini, pickles, lacto, fermenting'),
    vessel: t('500-ml-Rex-, Weck- oder Bügelglas, mit Gewicht', '500 ml Rex, Weck or swing-top jar, with a weight'),
    why: t(
      'Zucchini sind etwas anspruchsvoller, weil sie viel Wasser und wenig Zucker haben. Deshalb vorher entkernen und salzen. Die Kombination mit Karotten oder Kohlrabi hilft, und gerbstoffreiche Blätter wie Wein- oder Kirschblätter halten sie knackig. Sie brauchen weniger Zeit als festeres Gemüse.',
      'Zucchini are a little more demanding to ferment because they hold a lot of water and little sugar. So deseed and salt them first. Combining them with carrots or kohlrabi helps, and tannin-rich leaves such as vine or cherry leaves keep them firm. They need less time than firmer vegetables.',
    ),
    ingredients: [
      { amount: 'ca. 200 g', name: t('Zucchini', 'Zucchini'), note: t('entkernt, in Stücken', 'deseeded, cut into pieces') },
      { amount: 'ca. 100 g', name: t('Karotten', 'Carrots'), note: t('in Sticks', 'cut into sticks') },
      { amount: '1,5–2 gestr. TL', name: t('Salz', 'Salt'), note: t('unjodiert', 'non-iodised') },
      { amount: '1 TL', name: t('Pfefferkörner und Senfsaat', 'Peppercorns and mustard seeds') },
      { amount: 'je 1', name: t('Lorbeerblatt und Weinblatt', 'Bay leaf and vine leaf') },
      { amount: '1 TL', name: t('Orangenblüte oder -schale', 'Orange blossom or zest') },
      { amount: '1 Zweig', name: t('Thymian oder Rosmarin', 'Thyme or rosemary') },
    ],
    steps: [
      { title: t('Gemüse vorbereiten', 'Prepare the vegetables'), ...t('Karotten in Sticks schneiden. Zucchini entkernen, ebenfalls in Sticks schneiden und mit einer Prise Salz ca. 20 Minuten ziehen lassen.', 'Cut the carrots into sticks. Deseed the zucchini, cut them into sticks too and leave them with a pinch of salt for about 20 minutes.') },
      { title: t('Glas vorbereiten', 'Prepare the jar'), ...t('Gewürze, Blätter und Salz auf den Glasboden geben, damit sie nicht aufschwimmen. Karotten und Zucchini einschichten und beschweren.', 'Put the spices, leaves and salt on the bottom of the jar so they do not float to the top. Layer in the carrots and zucchini and weigh them down.') },
      { title: t('Aufgießen', 'Top up with liquid'), ...t('Mit Wasser auffüllen. Wenn vorhanden, 2–3 EL Lake von einem anderen Ferment dazugeben. Glas verschließen.', 'Fill up with water. If you have it, add 2 to 3 tbsp of brine from another ferment. Close the jar.') },
      ferment3,
    ],
    tips: [],
  },
  {
    slug: 'fermentierte-tomatensalsa',
    category: 'fermentieren',
    title: t('Fermentierte Tomatensalsa', 'Fermented tomato salsa'),
    summary: t('Tomaten, frische Feigen und Ingwer, im eigenen Saft fermentiert.', 'Tomatoes, fresh figs and ginger, fermented in their own juice.'),
    prepMinutes: 20,
    fermentationDays: 10,
    yield: t('1 Glas (300 ml)', '1 jar (300 ml)'),
    difficulty: 'leicht',
    keywords: t('Salsa, Tomaten, Feigen, fermentieren', 'salsa, tomatoes, figs, fermenting'),
    vessel: t('300-ml-Rex-, Weck- oder Bügelglas', '300 ml Rex, Weck or swing-top jar'),
    why: t(
      'Hier fermentieren die Tomaten im eigenen Saft: mit Salz vermengt, bis Flüssigkeit austritt. Das ergibt eine aromatische Basis, die du mit Zwiebel, Knoblauch, Chili oder frischen Kräutern in viele Richtungen lenken kannst. Dank der Milchsäuregärung hält die Salsa länger.',
      'Here the tomatoes ferment in their own juice. They are mixed with salt until liquid comes out and ferment in it. That gives an aromatic base you can take in many directions with onion, garlic, chili or fresh herbs. Thanks to the lactic fermentation the salsa keeps longer.',
    ),
    ingredients: [
      { amount: 'ca. 200 g', name: t('Tomaten', 'Tomatoes'), note: t('beliebige Sorte, klein geschnitten', 'any variety, chopped small') },
      { amount: '2', name: t('Frische Feigen', 'Fresh figs') },
      { amount: '½', name: t('Zwiebel', 'Onion') },
      { amount: 'ca. 1 gestr. TL', name: t('Salz', 'Salt'), note: t('unjodiert', 'non-iodised') },
      { amount: '20 g', name: t('Ingwer', 'Ginger'), note: t('geschält, fein gehackt', 'peeled, finely chopped') },
    ],
    steps: [
      { title: t('Vorbereiten', 'Prepare'), ...t('Tomaten, Feigen und Zwiebel klein schneiden. Ingwer schälen und fein hacken.', 'Chop the tomatoes, figs and onion small. Peel and finely chop the ginger.') },
      { title: t('Salzen', 'Salt'), ...t('Alles zusammen in eine Schüssel geben, den Tomatensaft auffangen. Salz dazugeben, umrühren und 10 Minuten ziehen lassen.', 'Put everything in a bowl together and keep the tomato juice. Add the salt, stir and leave for 10 minutes.') },
      { title: t('Abfüllen', 'Fill the jar'), ...t('Die Mischung nach und nach vorsichtig ins Glas drücken. 1–2 cm Rand frei lassen. Glas verschließen.', 'Press the mixture carefully into the jar bit by bit. Leave 1 to 2 cm free at the rim. Close the jar.') },
      ferment3,
    ],
    tips: [],
  },
  {
    slug: 'paprika-kimchi',
    category: 'fermentieren',
    title: t('Paprika-Kimchi', 'Paprika kimchi'),
    summary: t('Eine fruchtige Kimchi-Variante mit Paprika und Weißkraut.', 'A fruity take on kimchi with bell pepper and white cabbage.'),
    prepMinutes: 40,
    fermentationDays: 28,
    yield: t('1 Glas (300 ml)', '1 jar (300 ml)'),
    difficulty: 'mittel',
    keywords: t('Kimchi, Paprika, Weißkraut, fermentieren', 'kimchi, bell pepper, cabbage, fermenting'),
    vessel: t('300-ml-Rex-, Weck- oder Bügelglas', '300 ml Rex, Weck or swing-top jar'),
    why: t(
      'Kimchi ist ein traditionelles koreanisches Ferment auf Basis von Chinakohl. Diese Version mit Paprika und Weißkraut bringt fruchtige Frische. Wie beim klassischen Kimchi sorgt eine aromatische Paste für die typische Schärfe und Tiefe.',
      'Kimchi is a traditional Korean ferment based on Chinese cabbage. This version uses bell pepper and white cabbage, which give it a fruity freshness. As in classic kimchi, an aromatic paste brings the typical heat and depth.',
    ),
    ingredients: [
      { amount: 'ca. 100 g', name: t('Weißkraut', 'White cabbage'), note: t('fein gehobelt oder gewürfelt', 'finely shaved or diced') },
      { amount: 'ca. 100 g', name: t('Paprika', 'Bell pepper'), note: t('entkernt, in Streifen', 'deseeded, in strips') },
      { amount: 'ca. 50 g', name: t('Karotte', 'Carrot'), note: t('grob gerieben', 'coarsely grated') },
      { amount: 'ca. 50 g', name: t('Frühlingszwiebel oder Lauch', 'Spring onions or leek'), note: t('klein geschnitten', 'chopped small') },
      { amount: 'ca. 1 gestr. TL', name: t('Salz', 'Salt'), note: t('unjodiert', 'non-iodised') },
      { amount: '20 g', name: t('Ingwer', 'Ginger'), note: t('geschält, fein gehackt', 'peeled, finely chopped') },
      { amount: '2 Zehen', name: t('Knoblauch', 'Garlic') },
      { amount: '1 EL', name: t('Reisstärke', 'Rice starch') },
      { amount: '1 TL', name: t('Miso, Soja- oder Fischsauce', 'Miso, soy sauce or fish sauce') },
      { amount: '1 TL', name: t('Zucker', 'Sugar') },
      { amount: '1 TL', name: t('Paprika-, Chiliflocken oder Currypulver', 'Paprika flakes, chili flakes or curry powder') },
    ],
    steps: [
      { title: t('Paste kochen', 'Make the paste'), ...t('Reisstärke in ca. 60 ml kaltes Wasser rühren. Aufkochen, bis eine Paste entsteht, dann abkühlen lassen.', 'Stir the rice starch into about 60 ml of cold water. Bring to the boil until it thickens into a paste, then let it cool.') },
      { title: t('Gemüse vorbereiten', 'Prepare the vegetables'), ...t('Kraut, Paprika und Karotte klein schneiden, in einer Schüssel salzen und 20 Minuten ziehen lassen. Ingwer und Knoblauch fein hacken.', 'Cut the cabbage, pepper and carrot small. Salt them together in a bowl and leave for 20 minutes. Finely chop the ginger and garlic.') },
      { title: t('Vermengen', 'Mix'), ...t('Gewürze inkl. Miso, Soja- oder Fischsauce in die Paste rühren, dann mit dem Gemüse vermengen. Nach und nach ins Glas drücken, 1–2 cm Rand frei lassen und verschließen.', 'Stir the spices, including the miso, soy or fish sauce, into the paste. Then mix the paste with the vegetables. Press the kimchi carefully into the jar bit by bit and leave 1 to 2 cm free at the rim. Close the jar.') },
      { title: t('Fermentieren', 'Ferment'), ...t('7 Tage bei Zimmertemperatur (20 bis 25 °C) fermentieren. Danach 2–3 Wochen im Kühlschrank oder in einem kühlen Raum (15 bis 18 °C) reifen lassen.', 'Ferment for 7 days at room temperature (20 to 25 °C). Then let it mature for 2 to 3 weeks in the fridge or a cool room (15 to 18 °C).') },
    ],
    tips: [],
  },
  {
    slug: 'trauben-kombucha',
    category: 'kombucha',
    title: t('Trauben-Kombucha', 'Grape kombucha'),
    summary: t('Zwei Zutaten, eine Flasche, drei Tage.', 'Two ingredients, one bottle, three days.'),
    prepMinutes: 5,
    fermentationDays: 3,
    yield: t('1 Bügelflasche', '1 swing-top bottle'),
    difficulty: 'leicht',
    keywords: t('Kombucha, Trauben, zweite Fermentation', 'kombucha, grapes, second fermentation'),
    vessel: t('Bügelflasche', 'Swing-top bottle'),
    ingredients: [
      { amount: 'ca. 60 g', name: t('Trauben', 'Grapes'), note: t('eine Handvoll', 'a handful') },
      { amount: 'ca. 650 ml', name: t('Frischer Kombucha', 'Fresh kombucha'), note: t('3–5 Tage alt', '3 to 5 days old') },
    ],
    steps: [
      { title: t('Abfüllen', 'Fill'), ...t('Trauben und Kombucha in die Bügelflasche geben.', 'Put the grapes and the kombucha into the swing-top bottle.') },
      { title: t('Fermentieren', 'Ferment'), ...t('2–3 Tage bei 22 bis 28 °C fermentieren lassen.', 'Ferment for 2 to 3 days at 22 to 28 °C.') },
      { title: t('Kühlen', 'Chill'), ...t('Danach kalt bei 4 bis 6 °C lagern.', 'Then store cold at 4 to 6 °C.') },
    ],
    tips: [],
  },
  {
    slug: 'apfel-karotten-kombucha',
    category: 'kombucha',
    title: t('Apfel-Karotten-Kombucha', 'Apple and carrot kombucha'),
    summary: t('In zwei Stufen: erst Apfel, dann Karottensaft und Ingwer.', 'Two stages: apple first, then carrot juice and ginger.'),
    prepMinutes: 15,
    fermentationDays: 6,
    yield: t('ca. 700 ml', 'approx. 700 ml'),
    difficulty: 'mittel',
    keywords: t('Kombucha, Apfel, Karotte, Ingwer', 'kombucha, apple, carrot, ginger'),
    vessel: t('Offenes Gärgefäß, danach Bügelflasche', 'Open fermentation vessel, then a swing-top bottle'),
    ingredients: [
      { amount: 'nach Geschmack', name: t('Apfelscheiben', 'Apple slices') },
      { amount: 'nach Bedarf', name: t('Frischer Kombucha', 'Fresh kombucha'), note: t('3–5 Tage alt', '3 to 5 days old') },
      { amount: 'ca. 350 ml (3 Teile)', name: t('Abgeseihter Apfel-Kombucha', 'Strained apple kombucha'), note: t('aus Stufe 1', 'from stage one') },
      { amount: 'ca. 100 ml (1 Teil)', name: t('Ingwersud', 'Ginger brew'), note: t('abgekühlt', 'cooled') },
      { amount: 'ca. 250 ml (2 Teile)', name: t('Karottensaft', 'Carrot juice') },
    ],
    steps: [
      { title: t('Stufe 1', 'Stage one'), ...t('Apfelscheiben und frischen Kombucha in ein offenes Gefäß geben. 2–3 Tage bei 22 bis 28 °C fermentieren.', 'Put the apple slices and the fresh kombucha into an open vessel. Ferment for 2 to 3 days at 22 to 28 °C.') },
      { title: t('Mischen', 'Blend'), ...t('Apfel-Kombucha abseihen. 3 Teile davon mit 1 Teil abgekühltem Ingwersud und 2 Teilen Karottensaft mischen.', 'Strain the apple kombucha. Mix 3 parts of it with 1 part cooled ginger brew and 2 parts carrot juice.') },
      { title: t('Stufe 2', 'Stage two'), ...t('In eine Bügelflasche füllen und 2–3 Tage bei 22 bis 28 °C fermentieren.', 'Fill into a swing-top bottle and ferment for 2 to 3 days at 22 to 28 °C.') },
      { title: t('Kühlen', 'Chill'), ...t('Danach kalt bei 4 bis 6 °C lagern.', 'Then store cold at 4 to 6 °C.') },
    ],
    tips: [],
  },
]

const OWN_SAMPLES: Sample[] = [
  {
    slug: 'klassisches-sauerkraut',
    category: 'fermentieren',
    title: { de: 'Klassisches Sauerkraut', en: 'Classic Sauerkraut' },
    summary: {
      de: 'Nur Kraut und Salz. Nach ein paar Wochen hast du ein knackiges, probiotisches Sauerkraut aus dem eigenen Glas.',
      en: 'Just cabbage and salt. A few weeks later you have crunchy probiotic sauerkraut from your own jar.',
    },
    prepMinutes: 30,
    fermentationDays: 21,
    yield: { de: '1 Glas (1 l)', en: '1 jar (1 l)' },
    difficulty: 'leicht',
    keywords: { de: 'Sauerkraut, Weißkraut, fermentieren, probiotisch', en: 'sauerkraut, cabbage, fermenting, probiotic' },
    ingredients: [
      { amount: '1 kg', name: { de: 'Weißkraut', en: 'White cabbage' }, note: { de: 'fein gehobelt', en: 'finely shredded' } },
      { amount: '20 g', name: { de: 'Salz', en: 'Salt' }, note: { de: 'unjodiert, 2 %', en: 'non-iodised, 2 %' } },
      { amount: '1 TL', name: { de: 'Kümmel', en: 'Caraway seeds' }, note: { de: 'optional', en: 'optional' } },
    ],
    steps: [
      { de: 'Äußere Blätter abnehmen und beiseitelegen. Kraut vierteln, Strunk entfernen und fein hobeln.', en: 'Remove the outer leaves and set aside. Quarter the cabbage, cut out the core and shred finely.' },
      { de: 'Kraut wiegen, 2 % Salz dazugeben und 5–10 Minuten kräftig kneten, bis reichlich Saft austritt.', en: 'Weigh the cabbage, add 2 % salt and knead firmly for 5–10 minutes until plenty of juice comes out.' },
      { de: 'Schichtweise fest ins Glas drücken, bis das Kraut vollständig mit Saft bedeckt ist. Mit einem Krautblatt und Gewicht abdecken.', en: 'Press firmly into the jar in layers until the cabbage is fully covered by its juice. Top with a cabbage leaf and a weight.' },
      { de: 'Locker verschließen und 3–5 Tage bei Zimmertemperatur, danach 2–3 Wochen kühler fermentieren lassen.', en: 'Close loosely and ferment for 3–5 days at room temperature, then 2–3 weeks somewhere cooler.' },
    ],
    tips: [
      { de: 'Alles muss unter der Lake bleiben. Das ist der wichtigste Schutz vor Schimmel.', en: 'Everything must stay below the brine. That is the most important protection against mould.' },
    ],
  },
  {
    slug: 'schnell-eingelegte-rote-zwiebeln',
    category: 'einlegen',
    title: { de: 'Schnell eingelegte rote Zwiebeln', en: 'Quick Pickled Red Onions' },
    summary: {
      de: 'In 10 Minuten gemacht, nach einer Stunde fertig: das perfekte Topping für Bowls, Tacos und Brote.',
      en: 'Ready in 10 minutes, done after an hour: the perfect topping for bowls, tacos and sandwiches.',
    },
    prepMinutes: 10,
    yield: { de: '1 Glas (500 ml)', en: '1 jar (500 ml)' },
    difficulty: 'leicht',
    keywords: { de: 'Zwiebeln einlegen, Pickles, Topping', en: 'pickled onions, pickles, topping' },
    ingredients: [
      { amount: '2', name: { de: 'Rote Zwiebeln', en: 'Red onions' }, note: { de: 'in Ringe', en: 'sliced into rings' } },
      { amount: '150 ml', name: { de: 'Apfelessig', en: 'Apple cider vinegar' } },
      { amount: '150 ml', name: { de: 'Wasser', en: 'Water' } },
      { amount: '1 EL', name: { de: 'Zucker', en: 'Sugar' } },
      { amount: '1 TL', name: { de: 'Salz', en: 'Salt' } },
    ],
    steps: [
      { de: 'Zwiebelringe in ein sauberes Glas schichten.', en: 'Layer the onion rings in a clean jar.' },
      { de: 'Essig, Wasser, Zucker und Salz aufkochen, bis sich alles gelöst hat.', en: 'Bring vinegar, water, sugar and salt to the boil until dissolved.' },
      { de: 'Heißen Sud über die Zwiebeln gießen, abkühlen lassen und verschließen. Nach 1 Stunde genießbar, im Kühlschrank 2 Wochen haltbar.', en: 'Pour the hot brine over the onions, let cool and close. Ready after 1 hour, keeps 2 weeks in the fridge.' },
    ],
    tips: [{ de: 'Ein paar Pfefferkörner oder eine Chili geben extra Würze.', en: 'A few peppercorns or a chilli add extra kick.' }],
  },
  {
    slug: 'knuspriges-tempeh-mit-sojamarinade',
    category: 'tempeh',
    title: { de: 'Knuspriges Tempeh mit Sojamarinade', en: 'Crispy Tempeh with Soy Marinade' },
    summary: {
      de: 'Mariniert, in der Pfanne knusprig gebraten. So wird Tempeh zum Lieblingsprotein in jeder Bowl.',
      en: 'Marinated and pan-fried until crispy. This is how tempeh becomes the favourite protein in any bowl.',
    },
    prepMinutes: 25,
    yield: { de: '2 Portionen', en: '2 servings' },
    difficulty: 'leicht',
    keywords: { de: 'Tempeh, vegan, Protein, Marinade', en: 'tempeh, vegan, protein, marinade' },
    ingredients: [
      { amount: '200 g', name: { de: 'Tempeh', en: 'Tempeh' }, note: { de: 'in Scheiben', en: 'sliced' } },
      { amount: '3 EL', name: { de: 'Sojasauce', en: 'Soy sauce' } },
      { amount: '1 EL', name: { de: 'Ahornsirup', en: 'Maple syrup' } },
      { amount: '1', name: { de: 'Knoblauchzehe', en: 'Garlic clove' }, note: { de: 'gerieben', en: 'grated' } },
      { amount: '2 EL', name: { de: 'Öl', en: 'Oil' } },
    ],
    steps: [
      { de: 'Sojasauce, Ahornsirup und Knoblauch verrühren und die Tempehscheiben darin 15 Minuten marinieren.', en: 'Mix soy sauce, maple syrup and garlic and marinate the tempeh slices for 15 minutes.' },
      { de: 'Öl in einer Pfanne erhitzen und das Tempeh von jeder Seite 3–4 Minuten goldbraun braten.', en: 'Heat the oil in a pan and fry the tempeh for 3–4 minutes per side until golden.' },
      { de: 'Mit der restlichen Marinade ablöschen und kurz glasieren.', en: 'Deglaze with the remaining marinade and glaze briefly.' },
    ],
    tips: [{ de: 'Selbstgemachtes Tempeh vorher 10 Minuten dämpfen, dann wird es besonders saftig.', en: 'Steam homemade tempeh for 10 minutes first, so it turns out extra juicy.' }],
  },
  {
    slug: 'kombucha-erste-fermentation',
    category: 'kombucha',
    title: { de: 'Kombucha: die erste Fermentation', en: 'Kombucha: The First Fermentation' },
    summary: {
      de: 'Grundrezept für deinen ersten Kombucha: Tee, Zucker, SCOBY und etwas Geduld.',
      en: 'Basic recipe for your first kombucha: tea, sugar, SCOBY and a little patience.',
    },
    prepMinutes: 20,
    fermentationDays: 10,
    yield: { de: '2 Liter', en: '2 litres' },
    difficulty: 'mittel',
    keywords: { de: 'Kombucha, SCOBY, Tee fermentieren', en: 'kombucha, SCOBY, fermented tea' },
    ingredients: [
      { amount: '2 l', name: { de: 'Wasser', en: 'Water' } },
      { amount: '8 g', name: { de: 'Schwarzer oder grüner Tee', en: 'Black or green tea' } },
      { amount: '160 g', name: { de: 'Zucker', en: 'Sugar' } },
      { amount: '200 ml', name: { de: 'Starterflüssigkeit', en: 'Starter liquid' }, note: { de: 'von einem fertigen Kombucha', en: 'from a finished kombucha' } },
      { amount: '1', name: { de: 'SCOBY', en: 'SCOBY' } },
    ],
    steps: [
      { de: 'Tee mit 1 l heißem Wasser 10 Minuten ziehen lassen, abseihen und den Zucker darin auflösen.', en: 'Steep the tea in 1 l hot water for 10 minutes, strain and dissolve the sugar.' },
      { de: 'Mit 1 l kaltem Wasser auffüllen und auf Zimmertemperatur abkühlen lassen.', en: 'Top up with 1 l cold water and let it cool to room temperature.' },
      { de: 'Starterflüssigkeit und SCOBY ins Glas geben, mit einem Tuch abdecken.', en: 'Add the starter liquid and SCOBY to the jar and cover with a cloth.' },
      { de: '7–12 Tage bei 22–26 °C fermentieren lassen. Ab Tag 7 probieren. Fertig ist er, wenn er dir angenehm säuerlich schmeckt.', en: 'Ferment for 7–12 days at 22–26 °C. Taste from day 7. It is ready when it tastes pleasantly tart to you.' },
    ],
    tips: [{ de: 'Kein Metall verwenden und das Glas nicht in die direkte Sonne stellen.', en: 'Avoid metal and keep the jar out of direct sunlight.' }],
  },
]

const SAMPLES: Sample[] = [...SCRIPT_RECIPES, ...OWN_SAMPLES]

async function run() {
  const payload = await getPayload({ config })

  for (const s of SAMPLES) {
    const existing = await payload.find({
      collection: 'recipes',
      where: { slug: { equals: s.slug } },
      limit: 1,
      depth: 0,
      draft: true,
    })
    if (existing.docs.length) {
      // existing recipe: only fill the newer "Was du bemerkst" list when it is still empty
      const doc = existing.docs[0]
      const notes = NOTICES[s.slug] ?? []
      if (notes.length && !(doc.fermentLog ?? []).length) {
        await payload.update({
          collection: 'recipes',
          id: doc.id,
          locale: 'de',
          context: ctx,
          data: { fermentLog: notes.map((n) => ({ day: n.day, text: n.de })) },
        })
        const back = await payload.findByID({ collection: 'recipes', id: doc.id, locale: 'de', depth: 0 })
        await payload.update({
          collection: 'recipes',
          id: doc.id,
          locale: 'en',
          context: ctx,
          data: { fermentLog: (back.fermentLog ?? []).map((n, idx) => ({ id: n.id, day: n.day, text: notes[idx]?.en ?? n.text })) },
        })
        console.log(`✓ ${s.slug}: added "Was du bemerkst" (DE + EN)`)
      } else console.log(`↷ skip ${s.slug} (exists)`)
      continue
    }

    // 1. DE first
    const created = await payload.create({
      collection: 'recipes',
      locale: 'de',
      context: ctx,
      data: {
        _status: 'published',
        slug: s.slug,
        category: s.category,
        featured: Boolean(s.featured),
        title: s.title.de,
        summary: s.summary.de,
        prepMinutes: s.prepMinutes,
        fermentationDays: s.fermentationDays,
        yield: s.yield.de,
        difficulty: s.difficulty,
        keywords: s.keywords.de,
        vessel: s.vessel?.de,
        whyItWorks: s.why?.de,
        ingredientGroups: [
          { items: s.ingredients.map((i) => ({ amount: i.amount, name: i.name.de, note: i.note?.de })) },
        ],
        steps: s.steps.map((st) => ({ title: st.title?.de, text: st.de })),
        tips: s.tips.map((tip) => ({ text: tip.de })),
        fermentLog: (NOTICES[s.slug] ?? []).map((n) => ({ day: n.day, text: n.de })),
      },
    })

    // 2. Read back generated array IDs, 3. save EN with the same IDs
    const de = await payload.findByID({ collection: 'recipes', id: created.id, locale: 'de', depth: 0 })
    await payload.update({
      collection: 'recipes',
      id: created.id,
      locale: 'en',
      context: ctx,
      data: {
        _status: 'published',
        title: s.title.en,
        summary: s.summary.en,
        yield: s.yield.en,
        keywords: s.keywords.en,
        vessel: s.vessel?.en,
        whyItWorks: s.why?.en,
        ingredientGroups: (de.ingredientGroups ?? []).map((g) => ({
          id: g.id,
          items: (g.items ?? []).map((it, idx) => ({
            id: it.id,
            amount: amountToEnglish(s.ingredients[idx].amount),
            name: s.ingredients[idx].name.en,
            note: s.ingredients[idx].note?.en,
          })),
        })),
        steps: (de.steps ?? []).map((st, idx) => ({ id: st.id, title: s.steps[idx].title?.en, text: s.steps[idx].en })),
        tips: (de.tips ?? []).map((tip, idx) => ({ id: tip.id, text: s.tips[idx].en })),
        fermentLog: (de.fermentLog ?? []).map((n, idx) => ({ id: n.id, day: n.day, text: NOTICES[s.slug]?.[idx]?.en ?? n.text })),
      },
    })
    console.log(`✓ ${s.slug}`)
  }

  await seedPageGlobal(payload)
  await seedTemplateTexts(payload)
  process.exit(0)
}

async function seedPageGlobal(payload: Awaited<ReturnType<typeof getPayload>>) {
  const current = await payload.findGlobal({ slug: 'recipes-page', locale: 'de', depth: 0 })
  if (current.hero?.title && !process.argv.includes('--page')) {
    console.log('↷ skip Rezepte-Seite (has content)')
    return
  }
  const build = (lang: 'de' | 'en') => {
    const d = LANDING_DEFAULTS[lang]
    return {
      hero: { eyebrow: d.hero.eyebrow, title: d.hero.title, highlight: d.hero.highlight, lead: d.hero.lead },
      featured: { ...d.featured, bandLink: '/workshops' },
    }
  }
  await payload.updateGlobal({
    slug: 'recipes-page',
    locale: 'de',
    context: ctx,
    data: build('de'),
  })
  await payload.updateGlobal({ slug: 'recipes-page', locale: 'en', context: ctx, data: build('en') })
  console.log('✓ Rezepte-Seite texts (DE + EN)')
}

/**
 * Template words (Vorlagen-Texte) + category names and short texts, DE and EN.
 * Non-destructive: only fills fields that are still empty, keeps photos and
 * anything an editor already wrote. Runs every time (no --page needed).
 */
/** Template words whose default changed: [old DE, old EN]. Replaced only while still unchanged. */
const OLD_DEFAULTS: Record<string, { de: string; en: string }> = {
  pinShort: { de: 'Merken', en: 'Save' }, // now "Pinnen" / "Pin it" — "Speichern" is the heart
  savedHint: { de: 'Deine gespeicherten Rezepte bleiben auf diesem Gerät.', en: 'Your saved recipes stay on this device.' },
}

async function seedTemplateTexts(payload: Awaited<ReturnType<typeof getPayload>>) {
  // fallbackLocale: false → an empty English field reads as empty (not as the German text)
  const deDoc = await payload.findGlobal({ slug: 'recipes-page', locale: 'de', depth: 0, fallbackLocale: false })
  const enDoc = await payload.findGlobal({ slug: 'recipes-page', locale: 'en', depth: 0, fallbackLocale: false })
  const fill = (cms: unknown, lang: 'de' | 'en') => {
    const current = (cms ?? {}) as Record<string, unknown>
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(RECIPE_LABELS[lang])) {
      const has = typeof current[k] === 'string' && (current[k] as string).trim()
      // an old default nobody changed gets the new default (e.g. Pinterest "Merken" → "Pinnen")
      const outdated = has && OLD_DEFAULTS[k]?.[lang] === (current[k] as string).trim()
      out[k] = has && !outdated ? (current[k] as string) : v
    }
    return out
  }

  // 1. DE: labels + one card per category (keeps existing ids, photos, texts)
  const items = RECIPE_CATEGORIES.map((c) => {
    const existing = deDoc.categories?.items?.find((i) => i.category === c.value)
    return {
      ...(existing ?? {}),
      category: c.value,
      name: existing?.name?.trim() ? existing.name : c.label.de,
      intro: existing?.intro?.trim() ? existing.intro : CATEGORY_INTRO_DEFAULTS[c.value]?.de,
    }
  })
  await payload.updateGlobal({
    slug: 'recipes-page',
    locale: 'de',
    context: ctx,
    data: {
      labels: fill(deDoc.labels, 'de'),
      categories: { ...deDoc.categories, items },
      note: {
        ...deDoc.note,
        name: deDoc.note?.name?.trim() ? deDoc.note.name : NOTE_DEFAULTS.de.name,
        role: deDoc.note?.role?.trim() ? deDoc.note.role : NOTE_DEFAULTS.de.role,
      },
    } as never,
  })

  // 2. read back ids, 3. EN with the same ids
  const back = await payload.findGlobal({ slug: 'recipes-page', locale: 'de', depth: 0 })
  const enItems = (back.categories?.items ?? []).map((i) => {
    const c = RECIPE_CATEGORIES.find((x) => x.value === i.category)
    const en = enDoc.categories?.items?.find((x) => x.id === i.id)
    return {
      ...i,
      name: en?.name?.trim() ? en.name : c?.label.en,
      intro: en?.intro?.trim() ? en.intro : CATEGORY_INTRO_DEFAULTS[i.category]?.en,
    }
  })
  await payload.updateGlobal({
    slug: 'recipes-page',
    locale: 'en',
    context: ctx,
    data: {
      labels: fill(enDoc.labels, 'en'),
      categories: { ...enDoc.categories, items: enItems },
      note: {
        ...enDoc.note,
        name: enDoc.note?.name?.trim() ? enDoc.note.name : NOTE_DEFAULTS.en.name,
        role: enDoc.note?.role?.trim() ? enDoc.note.role : NOTE_DEFAULTS.en.role,
      },
    } as never,
  })
  console.log('✓ Vorlagen-Texte + Kategorien + Notiz-Karte (DE + EN, only empty fields filled)')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
