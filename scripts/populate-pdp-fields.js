// mongosh script — Populate new PDP fields (shortDescription, benefits, badges,
// aboutProduct, howToUse, userInstructions) for all products.
// Run: mongosh "$DATABASE_URL" scripts/populate-pdp-fields.js
//
// Payload 3.x stores localized fields as: { de: "...", en: "..." }
// Non-localized fields are stored as plain values.

// ─── Helper: build richText field ────────────────────────────────────
function rt(text) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: text.split('\n\n').map((para) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        children: [
          { type: 'text', format: 0, text: para, version: 1, detail: 0, mode: 'normal', style: '' },
        ],
      })),
    },
  }
}

function makeId() {
  return new ObjectId().toString()
}

// ─── Product PDP data ────────────────────────────────────────────────
const pdpData = {
  'classic-kimchi': {
    shortDescription: {
      de: 'Traditionell fermentiertes Kimchi mit Chinakohl, Karotten und unserer hauseigenen Gewürzmischung. Lebendig, probiotisch und voller Geschmack.',
      en: 'Traditionally fermented kimchi with napa cabbage, carrots and our house spice blend. Alive, probiotic and bursting with flavour.',
    },
    benefits: (() => {
      const ids = [makeId(), makeId(), makeId(), makeId()]
      return {
        de: [
          { label: 'Reich an Probiotika', id: ids[0] },
          { label: 'Unterstützt die Verdauung', id: ids[1] },
          { label: 'Natürlich fermentiert', id: ids[2] },
          { label: 'Handgemacht in Wien', id: ids[3] },
        ],
        en: [
          { label: 'Rich in Probiotics', id: ids[0] },
          { label: 'Supports Digestion', id: ids[1] },
          { label: 'Naturally Fermented', id: ids[2] },
          { label: 'Handmade in Vienna', id: ids[3] },
        ],
      }
    })(),
    badges: ['vegan', 'handmade', 'fermented', 'probiotic', 'no-additives'],
    aboutProduct: {
      de: rt(
        'Unser Classic Kimchi wird nach traditioneller koreanischer Methode hergestellt — mit viel Geduld und ohne Abkürzungen. Frischer Chinakohl wird von Hand gesalzen, mit unserer Gewürzpaste vermengt und über Wochen bei kontrollierter Temperatur fermentiert.\n\nDas Ergebnis: ein lebendiges, probiotisches Lebensmittel voller Umami-Geschmack, das deine Darmflora unterstützt und jedes Gericht aufwertet.',
      ),
      en: rt(
        'Our Classic Kimchi is made following traditional Korean methods — with patience and no shortcuts. Fresh napa cabbage is hand-salted, mixed with our spice paste and fermented for weeks at controlled temperature.\n\nThe result: a living, probiotic food full of umami flavour that supports your gut health and elevates every dish.',
      ),
    },
    howToUse: {
      de: rt(
        'Perfekt als Beilage zu Reis, Nudeln oder Bowls. Auch als Topping auf Burger, Sandwiches oder in Wraps ein Highlight.\n\nTipp: Nicht erhitzen — die lebenden Kulturen bleiben nur bei Zimmertemperatur oder kalt erhalten.',
      ),
      en: rt(
        "Perfect as a side with rice, noodles or bowls. Also fantastic as a topping on burgers, sandwiches or in wraps.\n\nTip: Don't heat it — the live cultures are preserved only at room temperature or cold.",
      ),
    },
    userInstructions: {
      de: rt(
        'Im Kühlschrank aufbewahren. Beim Öffnen kann es leicht sprudeln — das ist normal und zeigt die aktive Fermentation.\n\nMit sauberem Besteck entnehmen, um die Haltbarkeit zu verlängern.',
      ),
      en: rt(
        'Store in the refrigerator. It may fizz slightly when opened — this is normal and shows active fermentation.\n\nUse clean utensils to extend shelf life.',
      ),
    },
    ingredients: {
      de: 'Chinakohl, Karotten, Frühlingszwiebeln, Knoblauch, Ingwer, Gochugaru (koreanische Chiliflocken), Meersalz, Reismehl',
      en: 'Napa cabbage, carrots, spring onions, garlic, ginger, gochugaru (Korean chili flakes), sea salt, rice flour',
    },
    allergens: { de: 'Keine bekannten Allergene', en: 'No known allergens' },
    storageInstructions: {
      de: 'Im Kühlschrank bei 2–7°C lagern. Nach dem Öffnen innerhalb von 4 Wochen verbrauchen.',
      en: 'Store in refrigerator at 2–7°C. Consume within 4 weeks after opening.',
    },
    shelfLife: { de: '3 Monate (ungeöffnet, gekühlt)', en: '3 months (unopened, refrigerated)' },
  },

  'fermentierte-curryzwiebel': {
    shortDescription: {
      de: 'Zarte Zwiebeln, fermentiert mit aromatischer Currygewürzmischung. Mild-würzig mit einem Hauch von Säure — perfekt als Topping oder Beilage.',
      en: 'Tender onions, fermented with aromatic curry spice blend. Mildly spiced with a hint of tanginess — perfect as a topping or side.',
    },
    benefits: (() => {
      const ids = [makeId(), makeId(), makeId(), makeId()]
      return {
        de: [
          { label: 'Einzigartiger Geschmack', id: ids[0] },
          { label: 'Natürlich haltbar', id: ids[1] },
          { label: 'Ohne Konservierungsstoffe', id: ids[2] },
          { label: 'Handgemacht', id: ids[3] },
        ],
        en: [
          { label: 'Unique Flavour', id: ids[0] },
          { label: 'Naturally Preserved', id: ids[1] },
          { label: 'No Preservatives', id: ids[2] },
          { label: 'Handmade', id: ids[3] },
        ],
      }
    })(),
    badges: ['vegan', 'handmade', 'fermented', 'no-additives', 'probiotic'],
    aboutProduct: {
      de: rt(
        'Unsere fermentierten Curryzwiebeln verbinden die Tradition der Milchsäuregärung mit der Aromatik indischer Gewürze. Rote Zwiebeln werden mit Kurkuma, Koriander, Senfsaat und weiteren Gewürzen vermengt und natürlich fermentiert.\n\nDas Ergebnis ist ein einzigartiges Condiment, das süß, sauer, würzig und umami in einem vereint.',
      ),
      en: rt(
        'Our fermented curry onions combine the tradition of lactic acid fermentation with the aromatics of Indian spices. Red onions are mixed with turmeric, coriander, mustard seed and more spices, then naturally fermented.\n\nThe result is a unique condiment that unites sweet, sour, spicy and umami in one jar.',
      ),
    },
    howToUse: {
      de: rt(
        'Ideal zu gegrilltem Fleisch, auf Fladenbrot, in Curry-Bowls oder als raffinierte Beilage zu Käse.\n\nAuch als Zutat in Dressings oder Marinaden ein Geheimtipp.',
      ),
      en: rt(
        'Ideal with grilled meats, on flatbread, in curry bowls or as a refined side with cheese.\n\nAlso a secret ingredient in dressings and marinades.',
      ),
    },
    userInstructions: {
      de: rt(
        'Vor dem Öffnen leicht schütteln. Im Kühlschrank aufbewahren und mit sauberem Besteck entnehmen.\n\nNach dem Öffnen innerhalb von 4 Wochen aufbrauchen.',
      ),
      en: rt(
        'Shake lightly before opening. Store in the refrigerator and use clean utensils.\n\nConsume within 4 weeks after opening.',
      ),
    },
    ingredients: {
      de: 'Zwiebeln, Currypulver (Kurkuma, Koriander, Senfsaat, Ingwer, Zimt, Kreuzkümmel, Knoblauch), nicht-jodiertes Salz, Limettenblätter. 260g.',
      en: 'Onions, curry powder (turmeric, coriander, mustard seed, ginger, cinnamon, cumin, garlic), non-iodised salt, lime leaves. 260g.',
    },
    allergens: { de: 'Kann Spuren von Senf enthalten', en: 'May contain traces of mustard' },
    storageInstructions: {
      de: 'Im Kühlschrank bei 2–7°C lagern.',
      en: 'Store in refrigerator at 2–7°C.',
    },
    shelfLife: { de: '3 Monate (ungeöffnet, gekühlt)', en: '3 months (unopened, refrigerated)' },
  },

  'fermentierte-rote-rueben': {
    shortDescription: {
      de: 'Erdige Rote Rüben, milchsauer eingelegt mit Meerrettich und Kümmel. Ein österreichischer Klassiker — neu interpretiert durch Fermentation.',
      en: 'Earthy beetroot, lacto-fermented with horseradish and caraway. An Austrian classic — reinterpreted through fermentation.',
    },
    benefits: (() => {
      const ids = [makeId(), makeId(), makeId(), makeId()]
      return {
        de: [
          { label: 'Reich an Antioxidantien', id: ids[0] },
          { label: 'Probiotisch', id: ids[1] },
          { label: 'Traditionelles Rezept', id: ids[2] },
          { label: 'Regionale Zutaten', id: ids[3] },
        ],
        en: [
          { label: 'Rich in Antioxidants', id: ids[0] },
          { label: 'Probiotic', id: ids[1] },
          { label: 'Traditional Recipe', id: ids[2] },
          { label: 'Regional Ingredients', id: ids[3] },
        ],
      }
    })(),
    badges: ['vegan', 'handmade', 'fermented', 'probiotic', 'no-additives', 'gluten-free'],
    aboutProduct: {
      de: rt(
        'Fermentierte Rote Rüben sind ein Klassiker der österreichischen Küche — und bei uns mit einem Twist. Wir verwenden erntefrische Rüben aus der Region, die wir mit Kren und Kümmel milchsauer einlegen.\n\nDurch die langsame Fermentation entwickelt sich ein komplexes Geschmacksprofil: erdig, leicht süß und angenehm säuerlich.',
      ),
      en: rt(
        'Fermented beetroot is a classic of Austrian cuisine — and we give it a twist. Using fresh seasonal beets from the region, we lacto-ferment them with horseradish and caraway.\n\nThe slow fermentation creates a complex flavour profile: earthy, slightly sweet and pleasantly tangy.',
      ),
    },
    howToUse: {
      de: rt(
        'Klassisch als Beilage zu Tafelspitz, auf Brot mit Frischkäse, in Salaten oder als farbenfrohe Bowl-Zutat.\n\nDer Saft eignet sich auch hervorragend als natürlicher Farbstoff für Gerichte.',
      ),
      en: rt(
        'Classic as a side with boiled beef, on bread with cream cheese, in salads or as a colourful bowl topping.\n\nThe juice makes an excellent natural food colouring for dishes.',
      ),
    },
    userInstructions: {
      de: rt(
        'Im Kühlschrank aufbewahren. Kann leichte Verfärbungen an Händen und Kleidung hinterlassen — mit Vorsicht handhaben.\n\nMit sauberem Besteck entnehmen.',
      ),
      en: rt(
        'Store in the refrigerator. May stain hands and clothing — handle with care.\n\nUse clean utensils.',
      ),
    },
    ingredients: {
      de: 'Rote Rüben, Kren (Meerrettich), Kümmel, nicht-jodiertes Salz, Wasser',
      en: 'Beetroot, horseradish, caraway, non-iodised salt, water',
    },
    allergens: { de: 'Keine bekannten Allergene', en: 'No known allergens' },
    storageInstructions: {
      de: 'Im Kühlschrank bei 2–7°C lagern.',
      en: 'Store in refrigerator at 2–7°C.',
    },
    shelfLife: { de: '4 Monate (ungeöffnet, gekühlt)', en: '4 months (unopened, refrigerated)' },
  },

  'kaeferbohnen-tempeh': {
    shortDescription: {
      de: 'Steirische Käferbohnen, fermentiert zu herzhaftem Tempeh. Eine einzigartige österreichische Interpretation des indonesischen Originals.',
      en: 'Styrian runner beans, fermented into savoury tempeh. A unique Austrian take on the Indonesian original.',
    },
    benefits: (() => {
      const ids = [makeId(), makeId(), makeId(), makeId()]
      return {
        de: [
          { label: 'Proteinreich', id: ids[0] },
          { label: 'Regionale Bohnen', id: ids[1] },
          { label: 'Pflanzliches Eiweiß', id: ids[2] },
          { label: 'Frisch hergestellt', id: ids[3] },
        ],
        en: [
          { label: 'High in Protein', id: ids[0] },
          { label: 'Regional Beans', id: ids[1] },
          { label: 'Plant-Based Protein', id: ids[2] },
          { label: 'Freshly Made', id: ids[3] },
        ],
      }
    })(),
    badges: ['vegan', 'handmade', 'fermented', 'gluten-free', 'no-additives'],
    aboutProduct: {
      de: rt(
        'Unser Käferbohnen-Tempeh ist eine österreichische Innovation: Statt Sojabohnen verwenden wir steirische Käferbohnen, die mit Tempeh-Pilzkulturen beimpft und 48 Stunden fermentiert werden.\n\nDas Ergebnis ist ein fester, nussiger Proteinblock mit wunderbarem Eigengeschmack — perfekt als Fleischalternative.',
      ),
      en: rt(
        'Our runner bean tempeh is an Austrian innovation: Instead of soybeans, we use Styrian runner beans, inoculated with tempeh cultures and fermented for 48 hours.\n\nThe result is a firm, nutty protein block with wonderful character — perfect as a meat alternative.',
      ),
    },
    howToUse: {
      de: rt(
        'In Scheiben schneiden und in der Pfanne goldbraun anbraten. Würzen nach Belieben — Sojasauce, Knoblauch und Ingwer passen perfekt.\n\nAuch mariniert und gegrillt ein Genuss. Kann in Curries, Stir-Frys oder als Burger-Patty verwendet werden.',
      ),
      en: rt(
        'Slice and pan-fry until golden brown. Season to taste — soy sauce, garlic and ginger pair perfectly.\n\nAlso delicious marinated and grilled. Can be used in curries, stir-fries or as a burger patty.',
      ),
    },
    userInstructions: {
      de: rt(
        'Frischprodukt — im Kühlschrank aufbewahren und innerhalb von 7 Tagen verbrauchen. Kann eingefroren werden (bis zu 3 Monate).\n\nVor dem Verzehr immer durcherhitzen.',
      ),
      en: rt(
        'Fresh product — store in the refrigerator and consume within 7 days. Can be frozen (up to 3 months).\n\nAlways heat thoroughly before eating.',
      ),
    },
    storageInstructions: {
      de: 'Im Kühlschrank bei 2–5°C lagern. Innerhalb von 7 Tagen verbrauchen.',
      en: 'Store in refrigerator at 2–5°C. Consume within 7 days.',
    },
    shelfLife: {
      de: '7 Tage (frisch) / 3 Monate (tiefgekühlt)',
      en: '7 days (fresh) / 3 months (frozen)',
    },
  },

  'organic-kombucha': {
    shortDescription: {
      de: 'Handgebrauter Bio-Kombucha aus Grüntee mit lebenden Kulturen. Erfrischend, leicht prickelnd und natürlich fermentiert.',
      en: 'Hand-brewed organic kombucha from green tea with live cultures. Refreshing, lightly sparkling and naturally fermented.',
    },
    benefits: (() => {
      const ids = [makeId(), makeId(), makeId(), makeId()]
      return {
        de: [
          { label: 'Lebende Kulturen', id: ids[0] },
          { label: 'Natürlich prickelnd', id: ids[1] },
          { label: 'Bio-Zutaten', id: ids[2] },
          { label: 'Wenig Zucker', id: ids[3] },
        ],
        en: [
          { label: 'Live Cultures', id: ids[0] },
          { label: 'Naturally Sparkling', id: ids[1] },
          { label: 'Organic Ingredients', id: ids[2] },
          { label: 'Low Sugar', id: ids[3] },
        ],
      }
    })(),
    badges: ['vegan', 'handmade', 'fermented', 'probiotic', 'organic', 'no-additives'],
    aboutProduct: {
      de: rt(
        'Unser Kombucha wird aus hochwertigem Bio-Grüntee gebraut und mit einem lebenden SCOBY über 2–3 Wochen fermentiert.\n\nOhne Pasteurisierung, ohne Zusätze — nur Tee, Zucker (der beim Fermentieren großteils verbraucht wird) und lebende Kulturen.',
      ),
      en: rt(
        'Our kombucha is brewed from premium organic green tea and fermented with a living SCOBY over 2–3 weeks.\n\nNo pasteurisation, no additives — just tea, sugar (mostly consumed during fermentation) and live cultures.',
      ),
    },
    howToUse: {
      de: rt(
        'Gut gekühlt genießen. Vor dem Öffnen leicht schwenken, um die Kulturen zu verteilen.\n\nPerfekt als erfrischende Alternative zu Softdrinks oder als Begleiter zu leichten Gerichten.',
      ),
      en: rt(
        'Enjoy well chilled. Gently swirl before opening to distribute the cultures.\n\nPerfect as a refreshing alternative to soft drinks or as a companion to light dishes.',
      ),
    },
    userInstructions: {
      de: rt(
        'Stehend und gekühlt aufbewahren. Vor dem Öffnen nicht schütteln — Kohlensäure!\n\nNach dem Öffnen innerhalb von 3 Tagen verbrauchen. Natürliche Trübung und Kulturfäden sind normal.',
      ),
      en: rt(
        'Store upright and chilled. Do not shake before opening — carbonation!\n\nConsume within 3 days after opening. Natural cloudiness and culture strands are normal.',
      ),
    },
    ingredients: {
      de: 'Wasser, Bio-Grüntee, Bio-Rohrzucker, Kombucha-Kultur (SCOBY)',
      en: 'Water, organic green tea, organic cane sugar, kombucha culture (SCOBY)',
    },
    allergens: { de: 'Keine bekannten Allergene', en: 'No known allergens' },
    storageInstructions: {
      de: 'Stehend im Kühlschrank bei 2–7°C lagern.',
      en: 'Store upright in refrigerator at 2–7°C.',
    },
    shelfLife: { de: '3 Monate (ungeöffnet, gekühlt)', en: '3 months (unopened, refrigerated)' },
  },

  'basic-fermentation-course': {
    shortDescription: {
      de: 'Lerne die Grundlagen der Fermentation bequem von zu Hause. Video-Lektionen, Rezepte und Schritt-für-Schritt-Anleitungen.',
      en: 'Learn the basics of fermentation from the comfort of home. Video lessons, recipes and step-by-step guides.',
    },
    benefits: (() => {
      const ids = [makeId(), makeId(), makeId(), makeId()]
      return {
        de: [
          { label: 'Lebenslanger Zugang', id: ids[0] },
          { label: 'Video-Lektionen', id: ids[1] },
          { label: 'Inkl. Rezepte', id: ids[2] },
          { label: 'Für Anfänger', id: ids[3] },
        ],
        en: [
          { label: 'Lifetime Access', id: ids[0] },
          { label: 'Video Lessons', id: ids[1] },
          { label: 'Recipes Included', id: ids[2] },
          { label: 'Beginner Friendly', id: ids[3] },
        ],
      }
    })(),
    badges: [],
    aboutProduct: {
      de: rt(
        'Der Grundkurs Fermentation ist dein Einstieg in die Welt der Fermentation. In strukturierten Video-Lektionen lernst du alles: von der Theorie der Milchsäuregärung über die richtige Ausrüstung bis zum ersten eigenen Ferment.\n\nInklusive downloadbarer Rezepte, Einkaufslisten und Zugang zu unserer Community.',
      ),
      en: rt(
        "The Basic Fermentation Course is your gateway into the world of fermentation. In structured video lessons you'll learn everything: from the theory of lactic acid fermentation to proper equipment and your first homemade ferment.\n\nIncludes downloadable recipes, shopping lists and access to our community.",
      ),
    },
    howToUse: {
      de: rt(
        'Nach dem Kauf erhältst du sofort Zugang zu allen Kursinhalten. Arbeite in deinem eigenen Tempo — der Zugang ist zeitlich unbegrenzt.\n\nEmpfohlen: Ein Modul pro Woche, um das Gelernte praktisch umzusetzen.',
      ),
      en: rt(
        "After purchase you'll get instant access to all course content. Work at your own pace — access is unlimited.\n\nRecommended: One module per week to put what you learn into practice.",
      ),
    },
  },

  'workshop-kombucha': {
    shortDescription: {
      de: 'Lerne in unserem Hands-on-Workshop alles über Kombucha-Herstellung. Braue dein eigenes Kombucha und nimm deinen SCOBY mit nach Hause.',
      en: 'Learn everything about kombucha brewing in our hands-on workshop. Brew your own kombucha and take your SCOBY home.',
    },
    benefits: (() => {
      const ids = [makeId(), makeId(), makeId(), makeId()]
      return {
        de: [
          { label: 'Hands-on Erlebnis', id: ids[0] },
          { label: 'SCOBY inklusive', id: ids[1] },
          { label: 'Kleine Gruppen', id: ids[2] },
          { label: 'Inkl. Verkostung', id: ids[3] },
        ],
        en: [
          { label: 'Hands-on Experience', id: ids[0] },
          { label: 'SCOBY Included', id: ids[1] },
          { label: 'Small Groups', id: ids[2] },
          { label: 'Tasting Included', id: ids[3] },
        ],
      }
    })(),
    badges: [],
    aboutProduct: {
      de: rt(
        'In unserem Kombucha-Workshop lernst du alles über die Herstellung dieses lebendigen Getränks. Von der Auswahl des Tees über die Pflege des SCOBYs bis zur Zweitfermentation.\n\nDu braust dein eigenes Kombucha vor Ort und nimmst einen SCOBY-Starter mit nach Hause.',
      ),
      en: rt(
        "In our Kombucha Workshop you'll learn everything about making this living drink. From tea selection to SCOBY care to second fermentation.\n\nYou'll brew your own kombucha on-site and take a SCOBY starter home.",
      ),
    },
    howToUse: {
      de: rt(
        'Der Workshop findet in unserer Werkstatt in Wien statt. Dauer: ca. 3 Stunden. Alle Materialien und Zutaten sind inklusive.\n\nBitte bring ein verschließbares Glasgefäß (ca. 1L) mit.',
      ),
      en: rt(
        'The workshop takes place at our studio in Vienna. Duration: approx. 3 hours. All materials and ingredients are included.\n\nPlease bring a sealable glass jar (approx. 1L).',
      ),
    },
  },

  'workshop-lakto': {
    shortDescription: {
      de: 'Der kreative Workshop für alle, die eigenes Gemüse fermentieren möchten. Von Kimchi bis Sauerkraut — alles in einem Kurs.',
      en: 'The creative workshop for anyone who wants to ferment their own vegetables. From kimchi to sauerkraut — all in one course.',
    },
    benefits: (() => {
      const ids = [makeId(), makeId(), makeId(), makeId()]
      return {
        de: [
          { label: 'Hands-on Erlebnis', id: ids[0] },
          { label: 'Ferment zum Mitnehmen', id: ids[1] },
          { label: 'Kleine Gruppen', id: ids[2] },
          { label: 'Inkl. Verkostung', id: ids[3] },
        ],
        en: [
          { label: 'Hands-on Experience', id: ids[0] },
          { label: 'Ferments to Take Home', id: ids[1] },
          { label: 'Small Groups', id: ids[2] },
          { label: 'Tasting Included', id: ids[3] },
        ],
      }
    })(),
    badges: [],
    aboutProduct: {
      de: rt(
        'Im Lakto-Gemüse-Workshop lernst du die Kunst der Milchsäuregärung. Wir zeigen dir, wie du saisonales Gemüse in haltbare, probiotische Köstlichkeiten verwandelst.\n\nVon Sauerkraut über Kimchi bis hin zu kreativen Eigenkreationen — du gehst mit deinen eigenen Fermentgläsern nach Hause.',
      ),
      en: rt(
        "In the Lacto-Vegetable Workshop you'll learn the art of lactic acid fermentation. We show you how to transform seasonal vegetables into preserved, probiotic delicacies.\n\nFrom sauerkraut to kimchi to creative combinations — you'll go home with your own fermented jars.",
      ),
    },
    howToUse: {
      de: rt(
        'Der Workshop findet in unserer Werkstatt in Wien statt. Dauer: ca. 3 Stunden. Alle Materialien, Gemüse und Gewürze sind inklusive.\n\nDu nimmst 2–3 Gläser deiner eigenen Fermente mit nach Hause.',
      ),
      en: rt(
        "The workshop takes place at our studio in Vienna. Duration: approx. 3 hours. All materials, vegetables and spices are included.\n\nYou'll take home 2–3 jars of your own ferments.",
      ),
    },
  },

  'workshop-tempeh': {
    shortDescription: {
      de: 'Entdecke die Welt des Tempeh in unserem praktischen Workshop. Lerne, wie du aus Bohnen und Getreide dein eigenes Tempeh herstellst.',
      en: 'Discover the world of tempeh in our hands-on workshop. Learn how to make your own tempeh from beans and grains.',
    },
    benefits: (() => {
      const ids = [makeId(), makeId(), makeId(), makeId()]
      return {
        de: [
          { label: 'Hands-on Erlebnis', id: ids[0] },
          { label: 'Tempeh-Starter inklusive', id: ids[1] },
          { label: 'Kleine Gruppen', id: ids[2] },
          { label: 'Inkl. Verkostung', id: ids[3] },
        ],
        en: [
          { label: 'Hands-on Experience', id: ids[0] },
          { label: 'Tempeh Starter Included', id: ids[1] },
          { label: 'Small Groups', id: ids[2] },
          { label: 'Tasting Included', id: ids[3] },
        ],
      }
    })(),
    badges: [],
    aboutProduct: {
      de: rt(
        'Der Tempeh-Workshop führt dich in die Welt der Schimmelpilz-Fermentation ein. Du lernst, wie aus einfachen Hülsenfrüchten ein proteinreiches Superfood entsteht.\n\nWir arbeiten mit verschiedenen Bohnen und Getreide und du lernst die komplette Herstellung.',
      ),
      en: rt(
        "The Tempeh Workshop introduces you to the world of mould fermentation. You'll learn how simple legumes become a protein-rich superfood.\n\nWe work with various beans and grains and teach you the complete process.",
      ),
    },
    howToUse: {
      de: rt(
        'Der Workshop findet in unserer Werkstatt in Wien statt. Dauer: ca. 3 Stunden. Alle Materialien und Zutaten sind inklusive.\n\nDu nimmst dein eigenes, frisch beimpftes Tempeh mit nach Hause.',
      ),
      en: rt(
        "The workshop takes place at our studio in Vienna. Duration: approx. 3 hours. All materials and ingredients are included.\n\nYou'll take home your own freshly inoculated tempeh to finish fermenting at home.",
      ),
    },
  },
}

// ─── Apply updates ───────────────────────────────────────────────────
print('\n=== Populating PDP fields for all products ===\n')

let updated = 0
let failed = 0

for (const [slug, data] of Object.entries(pdpData)) {
  const product = db.products.findOne({ slug: slug })
  if (!product) {
    print('  ⚠  Product not found: ' + slug)
    failed++
    continue
  }

  const result = db.products.updateOne({ _id: product._id }, { $set: data })

  if (result.modifiedCount > 0) {
    print('  ✅ ' + slug + ' — updated')
    updated++
  } else {
    print('  ⏭  ' + slug + ' — no changes')
    updated++
  }
}

print('\n=== Done: ' + updated + ' products processed, ' + failed + ' failed ===\n')
