/* ═══════════════════════════════════════════════════════════════
 *  FermentFreude Tipps — Article Data
 *
 *  6 educational articles about lacto-fermented vegetables,
 *  written in FermentFreude brand voice (German).
 *  Images are managed via Payload Admin — placeholder shown if missing.
 * ═══════════════════════════════════════════════════════════════ */

export type ArticleSection = {
  heading: string
  body: string[]
}

export type Article = {
  slug: string
  title: string
  description: string
  readTime: string
  imageAlt: string
  sections: ArticleSection[]
}

export const ARTICLES: Article[] = [
  /* ────────────────────────────────────────────────── */
  /*  1. Kompletter Leitfaden                           */
  /* ────────────────────────────────────────────────── */
  {
    slug: 'gemuese-fermentieren-leitfaden',
    title: 'Gemüse fermentieren — der komplette Leitfaden',
    description:
      'Alles, was du wissen musst, auf einer Seite: Zutaten, Salzanteil, Behälter, Temperatur und die häufigsten Fragen. Dein Startpunkt für jede Milchsäuregärung.',
    readTime: '12 Min.',
    imageAlt: 'Frisches Gemüse wird für die Milchsäuregärung vorbereitet',
    sections: [
      {
        heading: 'Was ist Milchsäuregärung?',
        body: [
          'Milchsäuregärung — auch Laktofermentation genannt — ist eine der ältesten Methoden, Lebensmittel haltbar zu machen. Dabei wandeln natürlich vorkommende Milchsäurebakterien (Lactobacillus) den Zucker im Gemüse in Milchsäure um. Das Ergebnis: ein säuerliches, knackiges Ferment voller Geschmack und lebendiger Kulturen.',
          'Du brauchst weder Essig noch Hitze. Nur Gemüse, Salz, ein Glas und etwas Geduld.',
        ],
      },
      {
        heading: 'Was du brauchst',
        body: [
          'Frisches Gemüse: Kohl, Karotten, Gurken, Radieschen, Rote Bete, Blumenkohl — fast alles funktioniert. Wähle saisonales Gemüse vom Markt oder aus dem Garten. Je frischer, desto besser die Textur.',
          'Salz: Verwende unjodiertes Salz ohne Rieselhilfe. Meersalz oder Steinsalz sind perfekt. Als Faustregel: 2 % des Gemüsegewichts.',
          'Gläser: Bügelgläser (Weck, Le Parfait) oder Mason Jars. Wichtig ist, dass du das Gemüse unter die Flüssigkeit drücken kannst — Gewichte aus Glas oder ein Kohlblatt helfen.',
          'Optional: Gewürze wie Knoblauch, Dill, Pfefferkörner, Senfkörner, Kurkuma oder Chili bringen Abwechslung.',
        ],
      },
      {
        heading: 'Schritt für Schritt',
        body: [
          '1. Gemüse waschen und in die gewünschte Form schneiden — Streifen, Scheiben, Stifte oder grobe Stücke.',
          '2. Gemüse abwiegen und 2 % Salz berechnen (z. B. 500 g Gemüse → 10 g Salz).',
          '3. Salz über das Gemüse geben und kräftig kneten (Trockensalzen) oder eine 2–3 % Salzlake ansetzen und übergießen.',
          '4. Gemüse in ein sauberes Glas schichten und fest andrücken. Die Flüssigkeit muss das Gemüse bedecken.',
          '5. Glas verschließen (nicht luftdicht — CO₂ muss entweichen können) und bei Raumtemperatur (18–24 °C) stehen lassen.',
          '6. Täglich entlüften und schauen, ob das Gemüse unter der Flüssigkeit bleibt. Nach 3–7 Tagen probieren.',
          '7. Wenn der Geschmack dir gefällt, Glas in den Kühlschrank stellen. Die Fermentation verlangsamt sich, und das Ferment hält Monate.',
        ],
      },
      {
        heading: 'Wie lange dauert es?',
        body: [
          'Das hängt von der Temperatur und dem Gemüse ab. Grobe Richtwerte: Sauerkraut braucht 1–4 Wochen, Kimchi 3–7 Tage, eingelegte Gurken 3–5 Tage, Karotten-Sticks 5–10 Tage.',
          'Probiere regelmäßig! Wenn es dir schmeckt, ist es fertig. Es gibt kein „zu früh" — nur eine Frage der persönlichen Vorliebe.',
        ],
      },
      {
        heading: 'Sicherheit',
        body: [
          'Milchsäuregärung ist eine der sichersten Konservierungsmethoden. Der niedrige pH-Wert (unter 4,6) hemmt schädliche Bakterien zuverlässig. Solange das Gemüse unter der Lake bleibt und du saubere Gläser verwendest, kann kaum etwas schiefgehen.',
          'Vertraue deiner Nase: Riecht es angenehm säuerlich? Sieht es normal aus? Dann passt alles. Nur wenn etwas faulig riecht oder sichtbarer Schimmel auf dem Gemüse sitzt (nicht nur auf der Oberfläche der Lake), solltest du das Glas entsorgen.',
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────── */
  /*  2. Salz & Lake                                    */
  /* ────────────────────────────────────────────────── */
  {
    slug: 'salz-und-lake',
    title: 'Salz & Lake — das perfekte Verhältnis',
    description:
      '2 % Salz ist der goldene Standard — aber wann trockensalzen, wann eine Lake ansetzen? Tabellen, Tipps und alles zur richtigen Salzauswahl.',
    readTime: '9 Min.',
    imageAlt: 'Salz und Lake in einer Schüssel für die Gemüsefermentation',
    sections: [
      {
        heading: 'Warum Salz?',
        body: [
          'Salz ist der Motor der Milchsäuregärung. Es entzieht dem Gemüse Wasser (Osmose), schafft eine Lake und hemmt gleichzeitig unerwünschte Bakterien. Milchsäurebakterien dagegen sind salzliebend — sie gedeihen bei 2–5 % Salzgehalt bestens.',
          'Ohne Salz würde das Gemüse einfach verfaulen statt zu fermentieren. Zu viel Salz bremst die Fermentation und macht das Ergebnis unangenehm salzig. Die Kunst liegt im richtigen Verhältnis.',
        ],
      },
      {
        heading: 'Trockensalzen vs. Salzlake',
        body: [
          'Trockensalzen: Das Salz wird direkt auf das geschnittene Gemüse gegeben und eingeknetet. Das Gemüse zieht Wasser und erzeugt seine eigene Lake. Ideal für wasserreiches Gemüse wie Kohl (Sauerkraut!), Gurken, Zucchini oder Radieschen.',
          'Salzlake: Du löst Salz in Wasser auf und gießt die Lösung über das Gemüse. Perfekt für feste, wasserarme Gemüse wie Karotten, Blumenkohl, grüne Bohnen oder ganze Knoblauchzehen. Auch bei Mixed Pickles die bessere Wahl.',
        ],
      },
      {
        heading: 'Das 2-%-Prinzip',
        body: [
          'Die Universalformel: 2 % des Gesamtgewichts (Gemüse + eventuell Wasser) als Salz.',
          'Beispiel Trockensalzen: 1 kg Kohl → 20 g Salz. Gut durchkneten, bis Lake austritt.',
          'Beispiel Salzlake: 1 Liter Wasser + 20 g Salz = 2 % Lake. Gemüse ins Glas, Lake darüber bis alles bedeckt ist.',
          'Für kräftigere oder länger gelagerte Fermente (z. B. über 4 Wochen) kannst du auf 3 % erhöhen.',
        ],
      },
      {
        heading: 'Welches Salz?',
        body: [
          'Verwende immer unjodiertes Salz. Jod hemmt Milchsäurebakterien und kann die Fermentation stören.',
          'Meersalz oder Steinsalz sind erste Wahl. Himalayasalz funktioniert auch. Finger weg von Tafelsalz mit Rieselhilfe (Trennmittel wie E 536 können die Lake trüben).',
          'Fleur de Sel ist unnötig teuer — beim Fermentieren kommt es auf die Menge an, nicht auf Finesse.',
        ],
      },
      {
        heading: 'Häufige Fehler beim Salzen',
        body: [
          'Zu wenig Salz (unter 1,5 %): Das Gemüse wird matschig und die Fermentation startet nicht richtig.',
          'Zu viel Salz (über 5 %): Die Milchsäurebakterien werden gehemmt, das Ferment schmeckt zu salzig. Tipp: Zu salzige Fermente vor dem Essen kurz unter Wasser abspülen.',
          'Falsche Waage: Ein Teelöffel Salz ist je nach Sorte 5–8 g. Wiege immer ab — schätzen führt zu inkonsistenten Ergebnissen.',
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────── */
  /*  3. 5 Anfänger-Fehler                              */
  /* ────────────────────────────────────────────────── */
  {
    slug: 'anfaenger-fehler',
    title: '5 Fehler, die Anfänger vermeiden sollten',
    description:
      'Gemüse nicht abgewogen? Glas zu früh geöffnet? Wir zeigen dir die häufigsten Stolperfallen — und wie du sie ganz einfach umgehst.',
    readTime: '3 Min.',
    imageAlt: 'Fermentiertes Gemüse in Gläsern — häufige Anfängerfehler',
    sections: [
      {
        heading: '1. Salz nach Augenmaß',
        body: [
          'Der häufigste Fehler überhaupt: „Ein bisschen Salz drüberstreuen" statt exakt abzuwiegen. 2 % klingt wenig, macht aber einen riesigen Unterschied. Zu wenig Salz → matschiges Gemüse. Zu viel → die Milchsäurebakterien streiken.',
          'Die Lösung: Küchenwaage raus, Gemüse wiegen, 2 % berechnen. Jedes Mal.',
        ],
      },
      {
        heading: '2. Gemüse ragt aus der Lake',
        body: [
          'Alles, was über der Flüssigkeit liegt, hat Kontakt mit Luft — und Luft bedeutet Schimmelgefahr. Das ist der mit Abstand wichtigste Punkt bei der Milchsäuregärung.',
          'Verwende Glasgewichte, ein Kohlblatt oder einen kleinen Teller, um das Gemüse unter die Oberfläche zu drücken. Kontrolliere in den ersten Tagen täglich.',
        ],
      },
      {
        heading: '3. Das Glas zu fest verschließen',
        body: [
          'Bei der Fermentation entsteht CO₂. Wenn das Gas nicht entweichen kann, baut sich Druck auf — im schlimmsten Fall platzt das Glas. Bügelgläser mit Gummidichtung lassen Gas automatisch entweichen. Bei Schraubgläsern: Den Deckel nur locker auflegen oder täglich kurz öffnen (entlüften).',
        ],
      },
      {
        heading: '4. Zu warm oder zu kalt starten',
        body: [
          'Über 28 °C: Die Fermentation rast, das Gemüse wird weich und der Geschmack wird muffig. Unter 15 °C: Fast nichts passiert, und unerwünschte Hefen haben leichtes Spiel.',
          'Der Sweet Spot liegt bei 18–24 °C. Ein normaler Raum im Frühling oder Herbst ist perfekt. Im Hochsommer lieber den kühlsten Platz in der Wohnung suchen.',
        ],
      },
      {
        heading: '5. Zu früh aufgeben',
        body: [
          'Trübe Lake? Normal. Weißer Film auf der Oberfläche? Meist harmlose Kahmhefe — abschöpfen und weitermachen. Eigenartiger Geruch in den ersten Tagen? Die Bakterienkultur stellt sich gerade ein, das legt sich.',
          'Fermentation ist ein lebendiger Prozess, kein steriler Laborvorgang. Vertraue dem Prozess, beobachte, probiere — und wirf nichts weg, bevor du unseren Troubleshooting-Artikel gelesen hast.',
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────── */
  /*  4. Temperatur                                     */
  /* ────────────────────────────────────────────────── */
  {
    slug: 'ideale-temperatur',
    title: 'Die ideale Temperatur für Milchsäuregärung',
    description:
      '18–24 °C zum Starten, anschließend kühl lagern. Erfahre, warum Temperatur den Geschmack, die Textur und die Sicherheit deines Ferments beeinflusst.',
    readTime: '5 Min.',
    imageAlt: 'Fermentationsgläser bei Raumtemperatur auf einem Küchenregal',
    sections: [
      {
        heading: 'Warum Temperatur eine Rolle spielt',
        body: [
          'Milchsäurebakterien sind temperaturempfindlich. Zu kalt — und sie schlafen quasi ein. Zu warm — und die Fermentation wird unkontrolliert schnell, das Gemüse verliert seine Textur und der Geschmack kann unangenehm werden.',
          'Die Temperatur beeinflusst außerdem, welche Bakterienstämme dominieren. Bei niedrigeren Temperaturen (15–18 °C) entwickeln sich langsamere, komplexere Aromen. Bei höheren Temperaturen (22–28 °C) geht es schneller, aber der Geschmack bleibt einfacher.',
        ],
      },
      {
        heading: 'Der ideale Bereich: 18–24 °C',
        body: [
          'Für die meisten Gemüsefermente liegt der Sweet Spot bei 18–24 °C. In diesem Bereich starten die Milchsäurebakterien zuverlässig, das Gemüse bleibt knackig und der Geschmack entwickelt sich ausgewogen.',
          'Ein normaler Wohnraum zwischen Frühjahr und Herbst ist meistens perfekt. Stell dein Glas nicht auf die Fensterbank in der prallen Sonne, sondern an einen schattigen Platz in der Küche oder im Flur.',
        ],
      },
      {
        heading: 'Fermentieren im Sommer',
        body: [
          'Wenn die Raumtemperatur über 28 °C steigt, wird die Fermentation zu schnell. Das Gemüse wird weich und der Geschmack flach oder sogar muffig.',
          'Tipps für heiße Tage: Stell die Gläser in den Keller oder den kühlsten Raum. Erhöhe den Salzgehalt leicht auf 2,5–3 %. Starte die Fermentation abends, wenn es kühler ist. Prüfe und probiere öfter — vielleicht ist dein Ferment schon nach 2–3 Tagen bereit, in den Kühlschrank zu wandern.',
        ],
      },
      {
        heading: 'Fermentieren im Winter',
        body: [
          'Geheizte Räume haben oft 20–22 °C — ideal. Ist deine Küche kühler (unter 18 °C), dauert die Fermentation einfach länger. Das ist kein Problem — im Gegenteil: Langsam fermentiertes Gemüse entwickelt oft tiefere, komplexere Aromen.',
          'Stell das Glas nicht auf den kalten Fensterbrett oder direkt vor die Heizung. Ein Regalplatz in der Küche auf Augenhöhe ist perfekt: Du siehst es, denkst daran, und die Temperatur ist gleichmäßig.',
        ],
      },
      {
        heading: 'Lagerung nach der Fermentation',
        body: [
          'Sobald dein Ferment den gewünschten Geschmack hat, ab in den Kühlschrank (2–6 °C). Die Kälte verlangsamt die Bakterienaktivität fast vollständig — das Ferment bleibt monatelang stabil und wird nur sehr langsam saurer.',
          'Wichtig: Geöffnete Gläser immer im Kühlschrank aufbewahren. Noch verschlossene Gläser können an einem kühlen, dunklen Ort (Keller, Speisekammer um die 10–15 °C) ebenfalls gut gelagert werden.',
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────── */
  /*  5. Troubleshooting                                */
  /* ────────────────────────────────────────────────── */
  {
    slug: 'troubleshooting',
    title: 'Probleme beim Fermentieren? Keine Panik!',
    description:
      'Weißer Film, trübe Lake, Schwefelgeruch — fast alles ist harmlos. Hier findest du Antworten auf die häufigsten Fragen rund ums Troubleshooting.',
    readTime: '8 Min.',
    imageAlt: 'Nahaufnahme eines Fermentationsglases mit trüber Lake',
    sections: [
      {
        heading: 'Trübe Lake',
        body: [
          'Trübe Lake ist völlig normal und sogar ein gutes Zeichen! Sie zeigt, dass die Milchsäurebakterien aktiv arbeiten. Die Trübung kommt von den Bakterienkolonien und ist absolut unbedenklich.',
          'Kristallklare Lake nach einer Woche? Das wäre eher ungewöhnlich. Genieße die Trübung — sie gehört dazu.',
        ],
      },
      {
        heading: 'Weißer Film auf der Oberfläche',
        body: [
          'Ein dünner, weißer Film ist fast immer Kahmhefe (Kahm). Diese Hefe ist harmlos, schmeckt aber leicht hefig. Einfach mit einem Löffel abschöpfen und die Fermentation fortsetzen.',
          'Kahmhefe entsteht häufiger, wenn das Glas oft geöffnet wird oder Gemüse aus der Lake ragt. Tipp: Weniger öffnen, Gemüse konsequent unter Lake halten.',
          'Achtung: Echter Schimmel ist pelzig, farbig (grün, schwarz, rosa) und wächst erhaben. Kahmhefe dagegen ist flach und weiß. Bei pelzigem Schimmel das Glas entsorgen.',
        ],
      },
      {
        heading: 'Blasen und Zischen',
        body: [
          'Wenn du das Glas öffnest und es zischt oder Blasen aufsteigen: Perfekt! Das ist CO₂ — ein natürliches Nebenprodukt der Milchsäuregärung. Je aktiver die Fermentation, desto mehr Gas.',
          'In den ersten 2–4 Tagen ist die Aktivität am stärksten. Entlüfte Schraubgläser täglich. Bügelgläser entlüften sich von selbst.',
        ],
      },
      {
        heading: 'Seltsamer Geruch',
        body: [
          'Leicht schwefeliger Geruch in den ersten Tagen: Normal, besonders bei Kohl und Brokkoli. Das legt sich nach 2–3 Tagen.',
          'Angenehm säuerlich: So soll es riechen! Wie mild-saure Gurken oder junges Sauerkraut.',
          'Faulig, beißend oder schlecht: Vertraue deiner Nase. Was offensichtlich schlecht riecht, ist es wahrscheinlich auch. Im Zweifelsfall: lieber entsorgen und neu starten.',
        ],
      },
      {
        heading: 'Weiches, matschiges Gemüse',
        body: [
          'Die häufigsten Ursachen: zu wenig Salz, zu hohe Temperatur, oder das Gemüse war nicht mehr frisch. Matschiges Ferment ist zwar sicher zu essen, aber texturmäßig nicht mehr angenehm.',
          'Vorbeugen: Exakt 2 % Salz abwiegen. Raumtemperatur unter 24 °C halten. Frisches, knackiges Gemüse verwenden — nie welkes.',
          'Tipp: Manche Gemüse (Tomaten, Zucchini) werden von Natur aus weicher. Für knackige Ergebnisse eignen sich Kohl, Karotten, Radieschen, Rettich und Blumenkohl am besten.',
        ],
      },
      {
        heading: 'Zu wenig Lake',
        body: [
          'Manchmal zieht das Gemüse nicht genug Wasser. Das passiert vor allem bei dichtem Gemüse (Karotten, Rüben) oder wenn du beim Trockensalzen zu wenig geknetet hast.',
          'Lösung: Mische einfach etwas 2 % Salzlake nach (20 g Salz auf 1 Liter Wasser) und gieße sie über das Gemüse, bis alles bedeckt ist.',
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────── */
  /*  6. Ideen zum Essen                                */
  /* ────────────────────────────────────────────────── */
  {
    slug: 'fermentiertes-gemuese-ideen',
    title: 'So isst du fermentiertes Gemüse — kreative Ideen',
    description:
      'Vom Frühstücks-Bagel bis zum Kimchi-Grilled-Cheese — entdecke kreative Wege, dein Ferment in jede Mahlzeit einzubauen.',
    readTime: '10 Min.',
    imageAlt: 'Fermentiertes Gemüse als Topping auf verschiedenen Gerichten',
    sections: [
      {
        heading: 'Zum Frühstück',
        body: [
          'Auf Avocado-Toast: Eine Gabel Sauerkraut oder fermentierte Radieschen auf Avocado-Toast gibt Säure und Crunch. Dazu ein Spiegelei — perfekt.',
          'Im Rührei: Kimchi-Rührei ist ein Gamechanger. Kimchi in der Pfanne kurz anbraten, dann die Eier dazu. Die Säure bricht die Fettigkeit der Eier wunderbar.',
          'Zum Bagel: Fermentierte Karotten-Stifte als Beilage zu Cream Cheese und Lachs. Oder: Sauerkraut direkt auf den Bagel, mit einem Klecks Senf.',
          'In Bowls: Joghurt-Bowl mit fermentiertem Gemüse statt (oder zusätzlich zu) Obst. Klingt ungewöhnlich, harmoniert aber überraschend gut.',
        ],
      },
      {
        heading: 'Als Beilage',
        body: [
          'Die einfachste Art: Ein paar Löffel aus dem Glas, direkt auf den Teller. Zu jeder warmen Mahlzeit passt eine kleine Portion fermentiertes Gemüse als probiotische Beilage.',
          'Zu Reis und Curry: Kimchi oder fermentierter Rettich neben einem warmen Curry ist ein Klassiker der koreanischen Küche.',
          'Zum Grillen: Fermentierte Gurken oder Mixed Pickles sind der perfekte Gegenpart zu fettigem Grillgut.',
          'Zur Brotzeit: Sauerkraut, eingelegte Karotten oder fermentierter Knoblauch auf dem Holzbrett, neben Käse und gutem Brot.',
        ],
      },
      {
        heading: 'In warmen Gerichten',
        body: [
          'Grilled Cheese mit Kimchi: Cheddar + Kimchi zwischen zwei Scheiben Sauerteigbrot, in der Pfanne goldbraun gebraten. DAS Comfort Food.',
          'Sauerkraut-Eintopf: Klassisch deutsch — Sauerkraut mit Kartoffeln, Äpfeln und Lorbeer. Oder als polnischer Bigos mit Pilzen und Räuchertofu.',
          'Fermentierte Gemüse-Pfanne: Wok-Gemüse mit einem Löffel Kimchi oder fermentierten Chilis. Erst am Ende dazugeben — nicht zu lange kochen, damit die Kulturen überleben.',
          'In Suppen: Ein Löffel Sauerkraut oder fermentierte Rote Bete in Suppen und Eintöpfe einrühren — gibt Tiefe und Umami.',
        ],
      },
      {
        heading: 'In Sandwiches & Wraps',
        body: [
          'Reuben-Sandwich: Der Klassiker! Sauerkraut, Cheddar, Senf und Räuchertofu oder Pastrami auf kräftigem Roggen-Brot, warm gepresst.',
          'Falafel-Wrap: Anstelle von (oder zusätzlich zu) Rotkrautsalat: fermentierter Rotkohl. Mehr Geschmack, mehr Probiotika.',
          'Banh Mi: Das vietnamesische Sandwich lebt von eingelegtem Gemüse. Ersetze den Essig-Pickle durch milchsauer Fermentiertes — noch komplexer im Geschmack.',
        ],
      },
      {
        heading: 'In Salaten & Dressings',
        body: [
          'Direkt im Salat: Fermentierte Rote Bete, Karotten oder Radieschen als Topping auf grüne Salate. Die Säure ersetzt teilweise das Dressing.',
          'Ferment-Dressing: Lake aus dem Fermentationsglas + Olivenöl + Senf + Honig → ein unglaublich gutes, probiotisches Salatdressing.',
          'Krautsalat fermentiert: Statt klassischem Coleslaw mit Essig: fein geschnittenes Sauerkraut mit Apfel, Walnüssen und etwas Öl.',
        ],
      },
      {
        heading: 'Snacks & Sonstiges',
        body: [
          'Pur aus dem Glas: ManchmaI ist der beste Snack einfach eine Gabel voll Sauerkraut oder ein paar fermentierte Gurkenscheiben direkt aus dem Kühlschrank.',
          'Auf Pizza: Sauerkraut oder Kimchi nach dem Backen auf die fertige Pizza — der Kontrast zwischen heiß und kalt, weich und sauer ist großartig.',
          'In Cocktails und Drinks: Salzlake als Dirty-Martini-Ersatz (statt Olivenlake). Oder: Fermented Bloody Mary mit Sauerkrautlake.',
          'Als Geschenk: Hübsch etikettiert ist ein Glas selbst gemachtes Ferment ein wunderbar persönliches Mitbringsel.',
        ],
      },
    ],
  },
]

/** Look up a single article by slug, or undefined if not found. */
export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}
