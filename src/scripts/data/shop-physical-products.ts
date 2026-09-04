/**
 * Canonical copy for the three shop physical products (David, Sep 2026).
 * German is source of truth; English is a developer fallback — David should review EN in admin.
 */

export function buildProductDescription(text: string) {
  return {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'paragraph' as const,
          children: [
            {
              type: 'text' as const,
              detail: 0,
              format: 0,
              mode: 'normal' as const,
              style: '',
              text,
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

export type ShopPhysicalProductCopy = {
  slug: string
  productType: 'fresh' | 'jarred'
  /** Cents — 590 = €5.90 (Payload ecommerce plugin) */
  priceInEUR: number
  de: Record<string, unknown>
  en: Record<string, unknown>
}

const TEMPEH_ALLERGENS_DE =
  'Keine der 14 kennzeichnungspflichtigen Hauptallergene als Zutaten'
const TEMPEH_ALLERGENS_EN =
  'None of the 14 major allergens requiring labelling are present as ingredients.'

const OPEN_WITHIN_3_DAYS_DE =
  'Nach dem Öffnen innerhalb von 3 Tagen verbrauchen.'
const OPEN_WITHIN_3_DAYS_EN = 'Consume within 3 days after opening.'

const TEMPEH_STORAGE_DE = 'Gekühlt lagern bei +2 °C bis +6 °C.'
const TEMPEH_STORAGE_EN = 'Store refrigerated at +2 °C to +6 °C.'

const KIMCHI_INGREDIENTS_PLACEHOLDER_DE =
  'Unsere Kimchis sind saisonal. Je nach verfügbarer Gemüseauswahl variiert die Rezeptur und damit auch die Zutatenliste. Die Zutaten der aktuell angebotenen Variante werden vor Verkaufsstart hier ergänzt.'
const KIMCHI_INGREDIENTS_PLACEHOLDER_EN =
  'Our kimchis are seasonal. Depending on available vegetables, the recipe and ingredient list vary. Ingredients for the variant currently on offer are added here before each batch goes on sale.'

const KIMCHI_ALLERGENS_PLACEHOLDER_DE =
  'Variieren je nach saisonaler Rezeptur und werden gemeinsam mit der Zutatenliste der aktuell angebotenen Variante ergänzt.'
const KIMCHI_ALLERGENS_PLACEHOLDER_EN =
  'Vary with the seasonal recipe and are updated together with the ingredient list for the variant currently on offer.'

const KIMCHI_STORAGE_DE = 'Gekühlt lagern bei max. +7 °C.'
const KIMCHI_STORAGE_EN = 'Store refrigerated at max. +7 °C.'

const TEMPEH_USAGE_STEPS_DE = [
  { title: 'SCHNEIDEN', description: 'In Scheiben oder Würfel' },
  { title: 'ANBRATEN', description: 'Goldbraun & knusprig' },
  { title: 'GENIESSEN', description: 'Mit deiner Lieblingsmarinade' },
]
const TEMPEH_USAGE_STEPS_EN = [
  { title: 'SLICE', description: 'Into slices or cubes' },
  { title: 'PAN-FRY', description: 'Golden & crispy' },
  { title: 'ENJOY', description: 'With your favourite marinade' },
]

const KIMCHI_USAGE_STEPS_DE = [
  { title: 'ÖFFNEN', description: 'Frisch aus dem Kühlschrank' },
  { title: 'SERVIEREN', description: 'Als Beilage oder Topping' },
  { title: 'GENIESSEN', description: 'Pur oder in deinen Lieblingsgerichten' },
]
const KIMCHI_USAGE_STEPS_EN = [
  { title: 'OPEN', description: 'Fresh from the fridge' },
  { title: 'SERVE', description: 'As a side or topping' },
  { title: 'ENJOY', description: 'Straight up or in your favourite dishes' },
]

export const SHOP_PHYSICAL_PRODUCTS: ShopPhysicalProductCopy[] = [
  {
    slug: 'kaeferbohnen-tempeh',
    productType: 'fresh',
    priceInEUR: 590,
    de: {
      title: 'Käferbohnen-Tempeh',
      pdpTagline: 'Nussig-aromatisch. Herzhaft. Voller Umami.',
      shortDescription:
        'Nussig-aromatisch, herzhaft und voller Umami, unser Tempeh aus steirischen Käferbohnen wird beim Anbraten außen goldbraun und bleibt innen schön saftig.',
      pdpTasteHeadline: 'Nussig · Herzhaft · Umami',
      pdpStoryIntro:
        'Aus steirischen Käferbohnen fermentieren wir in Graz einen Tempeh mit nussig-aromatischem Geschmack, ausgeprägten Umami-Noten und saftigem Biss.',
      pdpStoryDetail:
        'Kräftig angebraten entwickelt er eine goldbraune Kruste und intensive Röstaromen. Er nimmt Marinaden hervorragend auf und lässt sich vielseitig kombinieren.',
      pdpFlavorNotes: [
        { label: 'NUSSIG' },
        { label: 'HERZHAFT' },
        { label: 'UMAMI' },
        { label: 'GOLDBRAUNE KRUSTE' },
      ],
      pdpTrustPoints: [
        { text: 'Käferbohnen aus Österreich' },
        { text: 'Fermentiert in Graz' },
        { text: 'Nussig & voller Umami' },
        { text: '185 g · 1 Packung' },
      ],
      pdpUsageSteps: TEMPEH_USAGE_STEPS_DE,
      pdpUsageSectionTitle: 'So wird dein Tempeh richtig gut',
      productOrigin: 'Österreich',
      madeIn: 'Graz',
      description: buildProductDescription(
        'Aus steirischen Käferbohnen fermentieren wir in Graz einen Tempeh mit nussig-aromatischem Geschmack, ausgeprägten Umami-Noten und saftigem Biss. Kräftig angebraten entwickelt er eine goldbraune Kruste und intensive Röstaromen. Er nimmt Marinaden hervorragend auf und lässt sich vielseitig kombinieren.',
      ),
      unitSize: '1 Packung',
      weightGrams: 185,
      ingredients:
        'Käferbohnen aus Österreich gekocht (97 %), Apfelessig, Starterkultur (Rhizopus oligosporus)',
      allergens: TEMPEH_ALLERGENS_DE,
      storageInstructions: TEMPEH_STORAGE_DE,
      shelfLife: '6 Wochen',
      bestBefore: '6 Wochen',
      userInstructions: buildProductDescription(OPEN_WITHIN_3_DAYS_DE),
      isOrganic: false,
      isVegan: true,
      isGlutenFree: true,
      isSeasonal: false,
    },
    en: {
      title: 'Runner Bean Tempeh',
      pdpTagline: 'Nutty-aromatic. Hearty. Full of umami.',
      shortDescription:
        'Nutty-aromatic, hearty and full of umami, our tempeh made from Styrian runner beans turns golden brown on the outside when pan-fried while staying beautifully juicy inside.',
      pdpTasteHeadline: 'Nutty · Hearty · Umami',
      pdpStoryIntro:
        'We ferment Styrian runner beans in Graz into a tempeh with a nutty-aromatic taste, pronounced umami notes and a juicy bite.',
      pdpStoryDetail:
        'Pan-fried until golden, it develops a crisp crust and deep roasted aromas. It takes on marinades beautifully and works in countless dishes.',
      pdpFlavorNotes: [
        { label: 'NUTTY' },
        { label: 'HEARTY' },
        { label: 'UMAMI' },
        { label: 'GOLDEN CRUST' },
      ],
      pdpTrustPoints: [
        { text: 'Runner beans from Austria' },
        { text: 'Fermented in Graz' },
        { text: 'Nutty & full of umami' },
        { text: '185 g · 1 pack' },
      ],
      pdpUsageSteps: TEMPEH_USAGE_STEPS_EN,
      pdpUsageSectionTitle: 'How to make your tempeh shine',
      productOrigin: 'Austria',
      madeIn: 'Graz',
      description: buildProductDescription(
        'We ferment Styrian runner beans in Graz into a tempeh with a nutty-aromatic taste, pronounced umami notes and a juicy bite. Pan-fried until golden, it develops a crisp crust and deep roasted aromas. It takes on marinades beautifully and works in countless dishes.',
      ),
      unitSize: '1 pack',
      ingredients:
        'Cooked Austrian runner beans (97%), apple cider vinegar, starter culture (Rhizopus oligosporus)',
      allergens: TEMPEH_ALLERGENS_EN,
      storageInstructions: TEMPEH_STORAGE_EN,
      shelfLife: '6 weeks',
      bestBefore: '6 weeks',
      userInstructions: buildProductDescription(OPEN_WITHIN_3_DAYS_EN),
    },
  },
  {
    slug: 'berglinsen-tempeh',
    productType: 'fresh',
    priceInEUR: 590,
    de: {
      title: 'Berglinsen-Tempeh',
      pdpTagline: 'Nussig-aromatisch. Herzhaft. Umamireich.',
      shortDescription:
        'Nussig-aromatisch, herzhaft und umamireich, unser Tempeh aus österreichischen Berglinsen wird beim Anbraten wunderbar knusprig und bleibt innen saftig.',
      pdpTasteHeadline: 'Nussig · Herzhaft · Umami',
      pdpStoryIntro:
        'Österreichische Berglinsen werden durch Fermentation zu einem herzhaften Tempeh mit nussig-aromatischem Geschmack und viel Umami.',
      pdpStoryDetail:
        'In der Pfanne wird er außen schön knusprig, bleibt innen saftig und entwickelt kräftige Röstaromen. Pur angebraten, mariniert oder als Bestandteil verschiedenster Gerichte ist er unkompliziert und vielseitig einsetzbar.',
      pdpFlavorNotes: [
        { label: 'NUSSIG' },
        { label: 'HERZHAFT' },
        { label: 'UMAMI' },
        { label: 'KNUSPRIG' },
      ],
      pdpTrustPoints: [
        { text: 'Berglinsen aus Österreich' },
        { text: 'Fermentiert in Graz' },
        { text: 'Umamireich & herzhaft' },
        { text: '185 g · 1 Packung' },
      ],
      pdpUsageSteps: TEMPEH_USAGE_STEPS_DE,
      pdpUsageSectionTitle: 'So wird dein Tempeh richtig gut',
      productOrigin: 'Österreich',
      madeIn: 'Graz',
      description: buildProductDescription(
        'Österreichische Berglinsen werden durch Fermentation zu einem herzhaften Tempeh mit nussig-aromatischem Geschmack und viel Umami. In der Pfanne wird er außen schön knusprig, bleibt innen saftig und entwickelt kräftige Röstaromen. Pur angebraten, mariniert oder als Bestandteil verschiedenster Gerichte ist er unkompliziert und vielseitig einsetzbar.',
      ),
      unitSize: '1 Packung',
      weightGrams: 185,
      ingredients:
        'Berglinsen aus Österreich gekocht (97 %), Apfelessig, Starterkultur (Rhizopus oligosporus)',
      allergens: TEMPEH_ALLERGENS_DE,
      storageInstructions: TEMPEH_STORAGE_DE,
      shelfLife: '6 Wochen',
      bestBefore: '6 Wochen',
      userInstructions: buildProductDescription(OPEN_WITHIN_3_DAYS_DE),
      isOrganic: false,
      isVegan: true,
      isGlutenFree: true,
      isSeasonal: false,
    },
    en: {
      title: 'Mountain Lentil Tempeh',
      pdpTagline: 'Nutty-aromatic. Hearty. Rich in umami.',
      shortDescription:
        'Nutty-aromatic, hearty and rich in umami, our tempeh made from Austrian mountain lentils becomes wonderfully crispy when pan-fried while staying juicy inside.',
      pdpTasteHeadline: 'Nutty · Hearty · Umami',
      pdpStoryIntro:
        'We ferment Austrian mountain lentils into a hearty tempeh with a nutty-aromatic taste and plenty of umami.',
      pdpStoryDetail:
        'In the pan it turns crispy on the outside, stays juicy inside and develops bold roasted aromas. Enjoy it plain, marinated or in all kinds of dishes: simple and versatile.',
      pdpFlavorNotes: [
        { label: 'NUTTY' },
        { label: 'HEARTY' },
        { label: 'UMAMI' },
        { label: 'CRISPY' },
      ],
      pdpTrustPoints: [
        { text: 'Mountain lentils from Austria' },
        { text: 'Fermented in Graz' },
        { text: 'Rich in umami & hearty' },
        { text: '185 g · 1 pack' },
      ],
      pdpUsageSteps: TEMPEH_USAGE_STEPS_EN,
      pdpUsageSectionTitle: 'How to make your tempeh shine',
      productOrigin: 'Austria',
      madeIn: 'Graz',
      description: buildProductDescription(
        'We ferment Austrian mountain lentils into a hearty tempeh with a nutty-aromatic taste and plenty of umami. In the pan it turns crispy on the outside, stays juicy inside and develops bold roasted aromas. Enjoy it plain, marinated or in all kinds of dishes: simple and versatile.',
      ),
      unitSize: '1 pack',
      ingredients:
        'Cooked Austrian mountain lentils (97%), apple cider vinegar, starter culture (Rhizopus oligosporus)',
      allergens: TEMPEH_ALLERGENS_EN,
      storageInstructions: TEMPEH_STORAGE_EN,
      shelfLife: '6 weeks',
      bestBefore: '6 weeks',
      userInstructions: buildProductDescription(OPEN_WITHIN_3_DAYS_EN),
    },
  },
  {
    slug: 'classic-kimchi',
    productType: 'jarred',
    priceInEUR: 720,
    de: {
      title: 'Kimchi',
      pdpTagline: 'Saisonal. Würzig. Angenehm säuerlich.',
      shortDescription:
        'Unser Kimchi wird aus saisonal wechselndem Gemüse milchsauer fermentiert. Je nach Jahreszeit entstehen unterschiedliche Varianten mit ganz eigenem Charakter.',
      pdpTasteHeadline: 'Würzig · Säuerlich · Vielseitig',
      pdpStoryIntro:
        'Wir fermentieren das, was die Saison hergibt. Deshalb wechseln Gemüse und Würzung im Laufe des Jahres und jedes Kimchi schmeckt ein wenig anders.',
      pdpStoryDetail:
        'Würzig, angenehm säuerlich und vielseitig: als Beilage, Topping oder einfach direkt aus dem Glas.',
      pdpFlavorNotes: [
        { label: 'WÜRZIG' },
        { label: 'SÄUERLICH' },
        { label: 'FERMENTIERT' },
        { label: 'SAISONAL' },
      ],
      pdpTrustPoints: [
        { text: 'Gemüse aus der Region' },
        { text: 'Fermentiert in Graz' },
        { text: 'Saisonale Rezeptur' },
        { text: '260 g · 1 Glas' },
      ],
      pdpUsageSteps: KIMCHI_USAGE_STEPS_DE,
      pdpUsageSectionTitle: 'So genießt du dein Kimchi am besten',
      productOrigin: 'Österreich',
      madeIn: 'Graz',
      description: buildProductDescription(
        'Wir fermentieren das, was die Saison hergibt. Deshalb wechseln Gemüse und Würzung im Laufe des Jahres und jedes Kimchi schmeckt ein wenig anders. Würzig, angenehm säuerlich und vielseitig: als Beilage, Topping oder einfach direkt aus dem Glas.',
      ),
      unitSize: '1 Glas',
      weightGrams: 260,
      ingredients: KIMCHI_INGREDIENTS_PLACEHOLDER_DE,
      allergens: KIMCHI_ALLERGENS_PLACEHOLDER_DE,
      storageInstructions: KIMCHI_STORAGE_DE,
      shelfLife: '3 Monate',
      bestBefore: '3 Monate',
      // David did not provide after-opening copy for Kimchi — leave empty until manufactory confirms
      userInstructions: null,
      isOrganic: false,
      isVegan: true,
      isGlutenFree: false,
      isSeasonal: true,
    },
    en: {
      title: 'Kimchi',
      pdpTagline: 'Seasonal. Spicy. Pleasantly sour.',
      shortDescription:
        'Our kimchi is lactic-acid fermented from seasonally changing vegetables. Depending on the season, different variants with their own character emerge.',
      pdpTasteHeadline: 'Spicy · Sour · Versatile',
      pdpStoryIntro:
        'We ferment whatever the season provides. That is why vegetables and seasoning change throughout the year and every kimchi tastes a little different.',
      pdpStoryDetail:
        'Spicy, pleasantly sour and versatile: as a side dish, topping or straight from the jar.',
      pdpFlavorNotes: [
        { label: 'SPICY' },
        { label: 'SOUR' },
        { label: 'FERMENTED' },
        { label: 'SEASONAL' },
      ],
      pdpTrustPoints: [
        { text: 'Regional vegetables' },
        { text: 'Fermented in Graz' },
        { text: 'Seasonal recipe' },
        { text: '260 g · 1 jar' },
      ],
      pdpUsageSteps: KIMCHI_USAGE_STEPS_EN,
      pdpUsageSectionTitle: 'How to enjoy your kimchi best',
      productOrigin: 'Austria',
      madeIn: 'Graz',
      description: buildProductDescription(
        'We ferment whatever the season provides. That is why vegetables and seasoning change throughout the year and every kimchi tastes a little different. Spicy, pleasantly sour and versatile: as a side dish, topping or straight from the jar.',
      ),
      unitSize: '1 jar',
      weightGrams: 260,
      ingredients: KIMCHI_INGREDIENTS_PLACEHOLDER_EN,
      allergens: KIMCHI_ALLERGENS_PLACEHOLDER_EN,
      storageInstructions: KIMCHI_STORAGE_EN,
      shelfLife: '3 months',
      bestBefore: '3 months',
      userInstructions: null,
      isOrganic: false,
      isVegan: true,
      isGlutenFree: false,
      isSeasonal: true,
    },
  },
]

export const TEMPEH_CATEGORY = {
  slug: 'tempeh',
  titleDe: 'Tempeh',
  titleEn: 'Tempeh',
}

export const KIMCHI_CATEGORY = {
  slug: 'kimchi-fermentiertes-gemuese',
  titleDe: 'Kimchi / Fermentiertes Gemüse',
  titleEn: 'Kimchi / Fermented Vegetables',
}
