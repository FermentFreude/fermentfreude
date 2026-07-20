/* ═══════════════════════════════════════════════════════════════
 *  FermentFreude Tipps — Vom Feld ins Glas Articles
 *
 *  6 guides for the Marktgarten special workshop.
 *  Seeded via src/scripts/seed-feld-ins-glas-posts.ts
 * ═══════════════════════════════════════════════════════════════ */

export type FeldInsGlasArticleSection = {
  heading: string
  body: string[]
}

export type FeldInsGlasArticle = {
  slug: string
  title: string
  description: string
  readTime: string
  imageAlt: string
  /** Maps to seed-assets Feld ins Glas images (hero / hands / jars) */
  heroImageKey: 'hero' | 'hands' | 'jars'
  sections: FeldInsGlasArticleSection[]
}

export const FELD_INS_GLAS_ARTICLES: FeldInsGlasArticle[] = [
  {
    slug: 'frisches-gemuese-am-feld-erkennen',
    title: 'Frisches Gemüse am Feld erkennen',
    description:
      'Worauf du bei der Ernte achten solltest: Farbe, Festigkeit und Saisonalität, damit dein Ferment von Anfang an perfekt startet.',
    readTime: '6 Min.',
    imageAlt: 'Frisches Gemüse wird im Marktgarten geerntet',
    heroImageKey: 'hero',
    sections: [
      {
        heading: 'Warum Frische am Feld zählt',
        body: [
          'Beim Workshop „Vom Feld ins Glas“ beginnt alles direkt am Acker. Je frischer das Gemüse, desto knackiger bleibt die Textur im Glas und desto zuverlässiger startet die Milchsäuregärung.',
          'Im Marktgarten siehst du, wie Gemüse wächst, reift und geerntet wird. Dieses Wissen hilft dir auch zu Hause beim Einkauf: Du erkennst schneller, was wirklich saisonal und erntefrisch ist.',
        ],
      },
      {
        heading: 'Worauf du bei der Ernte achtest',
        body: [
          'Farbe: Saisonales Gemüse hat lebendige, natürliche Farben. Welke, fleckige oder matschige Stellen deuten auf Lagerung oder Alter hin.',
          'Festigkeit: Gurken, Zucchini und Karfiol sollten beim Anfassen fest und saftig wirken, nicht weich oder hohl.',
          'Größe: Für Fermente eignen sich oft mittelgroße Exemplare besser als riesige, wasserreiche Früchte.',
          'Blätter & Stiele: Grünes Blattgemüse sollte knackig sein. Bei Kohl und Karfiol achtest du auf feste, kompakte Köpfe.',
        ],
      },
      {
        heading: 'Saisonalität im Marktgarten',
        body: [
          'Im Sommer findest du typischerweise Zucchini, Gurken, Tomaten, Paprika und frühen Kohl. Im Herbst kommen mehr Wurzelgemüse, Kohl und Kürbis dazu.',
          'Saisonales Gemüse enthält oft mehr Aroma und die richtige Wasser-Salz-Balance für Lakto-Fermente. Deshalb passen unsere Workshop-Rezepte genau zu den Monaten Juni bis September.',
        ],
      },
      {
        heading: 'Nach der Ernte',
        body: [
          'Erntefrisch bedeutet: möglichst bald verarbeiten. Im Workshop bereiten wir das Gemüse direkt nach der Ernte vor, so bleibt die Qualität erhalten.',
          'Zu Hause: Gemüse kühl lagern, aber nicht tagelang warten. Für Pickles und Kimchi ist der Tag der Ernte oder spätestens der nächste Tag ideal.',
        ],
      },
    ],
  },
  {
    slug: 'milchsaure-zucchini-pickels',
    title: 'Milchsaure Zucchini-Pickels',
    description:
      'Knackige Sommer-Zucchini in Salzlake: Rezept, Salzanteil und Tipps für das Ferment aus dem Marktgarten-Workshop.',
    readTime: '8 Min.',
    imageAlt: 'Zucchini-Pickels in einem Einmachglas',
    heroImageKey: 'jars',
    sections: [
      {
        heading: 'Warum Zucchini sich perfekt eignet',
        body: [
          'Zucchini ist im Hochsommer reichlich da und nimmt Gewürze und Lake wunderbar auf. Milchsaure Pickles behalten eine angenehme Bissigkeit, wenn du frische, feste Früchte verwendest.',
          'Im Workshop „Vom Feld ins Glas“ ist dieses Ferment eines von drei Gläsern, die du mit nach Hause nimmst.',
        ],
      },
      {
        heading: 'Zutaten & Vorbereitung',
        body: [
          'Frische Zucchini (mittelgroß), unjodiertes Salz, Knoblauch, Dill oder Senfkörner, optional Chili oder Pfefferkörner.',
          'Zucchini waschen und in Scheiben oder Stifte schneiden. Große Kerne kannst du entfernen, wenn die Frucht schon sehr reif ist.',
          'Als Faustregel: 2 % Salz bezogen auf das Gewicht des Gemüses, oder eine 2–3 % Salzlake zum Auffüllen.',
        ],
      },
      {
        heading: 'Schritt für Schritt',
        body: [
          '1. Zucchini in ein sauberes Glas schichten und Gewürze dazwischenlegen.',
          '2. Salz über das Gemüse geben und kurz einmassieren, bis etwas Flüssigkeit austritt.',
          '3. Gemüse fest andrücken, bis es von Lake bedeckt ist. Bei Bedarf Salzlake nachgießen.',
          '4. Bei Raumtemperatur (18–24 °C) 3–7 Tage fermentieren lassen, täglich entlüften.',
          '5. Wenn der Geschmack passt: ins Kühlschrank stellen. Die Gärung verlangsamt sich.',
        ],
      },
      {
        heading: 'Tipps aus der Praxis',
        body: [
          'Zu weiche Zucchini werden schneller matschig. Erntefrisch und fest ist die beste Wahl.',
          'Im Sommer im Marktgarten: Schattige Lagerung während der kurzen Wartezeit schützt vor Übergärung.',
          'Serviertipp: Zucchini-Pickels passen zu Grillgemüse, Bowls oder als knackige Beilage zur Brotzeit.',
        ],
      },
    ],
  },
  {
    slug: 'fermentiertes-gurken-relish',
    title: 'Fermentiertes Gurken-Relish',
    description:
      'Würzig-säuerliches Gurken-Relish durch Milchsäuregärung: Schneidtechnik, Gewürze und wie du die perfekte Konsistenz erreichst.',
    readTime: '7 Min.',
    imageAlt: 'Fermentiertes Gurken-Relish in einem Glas',
    heroImageKey: 'jars',
    sections: [
      {
        heading: 'Was ist Gurken-Relish?',
        body: [
          'Relish ist fein geschnittenes Gemüse in würziger Lake, säuerlich und aromatisch. Durch Lakto-Fermentation entsteht ein lebendiges Topping für Burger, Bowls, Sandwiches und kalte Platten.',
          'Im Workshop bereiten wir Gurken-Relish als zweites Mitnahme-Glas zu, direkt aus geernteten Marktgarten-Gurken.',
        ],
      },
      {
        heading: 'Vorbereitung',
        body: [
          'Feste Salat- oder Einlegegurken wählen. Weiche, wässrige Gurken werden schnell schlaff.',
          'Gurken fein würfeln oder in kleine Stücke schneiden. Je gleichmäßiger, desto besser verteilen sich Salz und Gewürze.',
          'Klassische Ergänzungen: Zwiebel, Dill, Senfkörner, Pfeffer. Alles nach Geschmack anpassbar.',
        ],
      },
      {
        heading: 'Fermentation',
        body: [
          'Gemüse mit 2 % Salz vermengen und 10–15 Minuten ziehen lassen, bis Lake entsteht.',
          'In saubere Gläser füllen, fest andrücken, Oberfläche mit Lake bedecken.',
          'Bei Raumtemperatur 4–8 Tage fermentieren. Relish darf etwas feiner und weicher werden als ganze Pickles, probiere aber früh.',
        ],
      },
      {
        heading: 'Genuss & Haltbarkeit',
        body: [
          'Im Kühlschrank hält sich Relish mehrere Monate. Immer saubere Besteckteile ins Glas tauchen.',
          'Als Topping auf gegrilltem Gemüse, in Wraps oder neben fermentierter Brettljaus\'n aus dem Workshop: ein Sommer-Klassiker.',
        ],
      },
    ],
  },
  {
    slug: 'karfiol-kimchi-anleitung',
    title: 'Karfiol-Kimchi: Anleitung',
    description:
      'Würziges Karfiol-Kimchi mit Milchsäuregärung: Salzen, Gewürzen und die richtige Gärzeit für dein drittes Workshop-Glas.',
    readTime: '9 Min.',
    imageAlt: 'Karfiol-Kimchi in einem Fermentationsglas',
    heroImageKey: 'hands',
    sections: [
      {
        heading: 'Karfiol als Kimchi-Basis',
        body: [
          'Karfiol (Blumenkohl) eignet sich hervorragend für Kimchi: Er nimmt Paste und Aromen gut auf und bleibt bei richtiger Gärzeit angenehm bissig.',
          'Im Marktgarten-Workshop ist Karfiol-Kimchi das dritte Ferment, das du mit nach Hause nimmst.',
        ],
      },
      {
        heading: 'Zutaten',
        body: [
          'Frischer Karfiol, in gleichmäßige Röschen geteilt. Stiele kannst du klein mitfermentieren oder für Brühe nutzen.',
          'Salz zum Einlegen (ca. 2 % des Gemüsegewichts), Knoblauch, Ingwer, Frühlingszwiebel optional.',
          'Für mehr Schärfe: Chili oder Paprikapulver. Im Workshop zeigen wir eine ausgewogene, alltagstaugliche Variante.',
        ],
      },
      {
        heading: 'Ablauf',
        body: [
          '1. Karfiol mit Salz vermengen und 30–60 Minuten ziehen lassen, bis er etwas weicher wird und Flüssigkeit abgibt.',
          '2. Gewürzpaste oder -mischung unterheben.',
          '3. Fest in Gläser packen, Luftblasen minimieren, Oberfläche bedecken.',
          '4. 2–5 Tage bei Raumtemperatur fermentieren, täglich probieren.',
          '5. Ab gewünschtem Geschmack kühlen.',
        ],
      },
      {
        heading: 'Tipps',
        body: [
          'Frischer, kompakter Karfiol gärt gleichmäßiger als bereits welke Köpfe.',
          'Kimchi darf etwas lebhafter riechen als reine Pickles, sollte aber angenehm säuerlich-würzig bleiben.',
          'Passt zu Reis, Nudeln, Eiern oder als Beilage zur Ferment-Brettljaus\'n.',
        ],
      },
    ],
  },
  {
    slug: 'marktgarten-workshop-vorbereitung',
    title: 'So bereitest du dich auf den Marktgarten-Workshop vor',
    description:
      'Kleidung, Schuhe, Wetter und Mitbringsel: Alles Wichtige für vier Stunden draußen beim „Unser Bauerngarten“.',
    readTime: '5 Min.',
    imageAlt: 'Teilnehmer beim Workshop im Marktgarten',
    heroImageKey: 'hero',
    sections: [
      {
        heading: 'Ort & Rahmen',
        body: [
          'Der Workshop findet nicht in der Grabenstraße statt, sondern draußen beim Marktgarten „Unser Bauerngarten“ am Hochfeldweg in Graz.',
          'Du verbringst etwa vier Stunden im Freien: Ernte, Theorie, Praxis und Verkostung. Gemüse, Gläser, Gewürze und Equipment stellen wir bereit.',
        ],
      },
      {
        heading: 'Kleidung & Schuhe',
        body: [
          'Wetterfeste Kleidung in Schichten: morgens kühl, mittags sonnig. Regenjacke einpacken, wenn die Prognose unsicher ist.',
          'Festes, geschlossenes Schuhwerk. Du stehst auf Erde und Gras, nicht auf Studio-Boden.',
          'Sonnenschutz (Hut, Sonnencreme) an heißen Tagen. Handschuhe sind optional, wir stellen Werkzeug bereit.',
        ],
      },
      {
        heading: 'Was du mitbringen kannst',
        body: [
          'Eine Wasserflasche, Notizblock wenn du magst, und gute Laune.',
          'Du musst kein eigenes Gemüse oder Equipment mitbringen. Drei Fermente und Gärgefäße sind im Preis enthalten.',
        ],
      },
      {
        heading: 'Für wen der Workshop gedacht ist',
        body: [
          'Vom Neuling bis zur Fermentier-Profi: Vorkenntnisse sind nicht nötig. Ideal, wenn du Herkunft, Handwerk und Fermentation verbinden willst.',
          'Maximal 12 Personen, damit genug Zeit für Fragen, Ernte und Hands-on bleibt.',
        ],
      },
    ],
  },
  {
    slug: 'vom-feld-ins-glas-ablauf',
    title: 'Vom Feld ins Glas: So läuft der Workshop ab',
    description:
      'Feld, Küche, Glas: Der rote Faden durch vier Stunden Ernte, Fermentation und Verkostung im Marktgarten.',
    readTime: '6 Min.',
    imageAlt: 'Gemüse von der Ernte bis zum Fermentationsglas',
    heroImageKey: 'hands',
    sections: [
      {
        heading: '01 · Feld',
        body: [
          'Wir starten am Acker. Gemeinsam ernten wir frisches, saisonales Gemüse und lernen, woran man Qualität und Reife erkennt.',
          'Du bekommst Einblick in den Marktgarten-Anbau: Was wächst wann, warum Saisonalität für Fermente wichtig ist.',
        ],
      },
      {
        heading: '02 · Küche',
        body: [
          'Zurück an der Arbeitsstation geht es in Theorie und Praxis: Wie Milchsäuregärung funktioniert, welche Vorteile sie hat, und welche Techniken du brauchst.',
          'Unter Anleitung bereitest du drei Lakto-Fermente zu: Zucchini-Pickels, Gurken-Relish und Karfiol-Kimchi.',
        ],
      },
      {
        heading: '03 · Glas',
        body: [
          'Alle Gläser nimmst du mit nach Hause, inklusive Gärgefäße und Skript mit Rezepten.',
          'Zum Abschluss gibt es eine Ferment-Brettljaus\'n (auf Wunsch vegan): natürlich, überraschend und aromatisch.',
        ],
      },
      {
        heading: 'Was du mitnimmst',
        body: [
          'Drei eigene Fermente, praktische Erfahrung von der Ernte bis zum Glas, und das Gefühl, Fermentation nicht nur als Rezept, sondern als Zusammenspiel aus Feld, Handwerk und Zeit zu verstehen.',
          'Bereit? Termin auswählen und im Marktgarten dabei sein.',
        ],
      },
    ],
  },
]

export function getFeldInsGlasArticleBySlug(slug: string): FeldInsGlasArticle | undefined {
  return FELD_INS_GLAS_ARTICLES.find((a) => a.slug === slug)
}
