/* ═══════════════════════════════════════════════════════════════
 *  FermentFreude Tipps — Tempeh Articles
 *
 *  6 educational articles about tempeh fermentation,
 *  covering fundamentals, recipes, and tips.
 *  Written in FermentFreude brand voice (German).
 *  Images are managed via Payload Admin — placeholder shown if missing.
 * ═══════════════════════════════════════════════════════════════ */

import type { Article } from './article-data'

export const TEMPEH_ARTICLES: Article[] = [
  /* ────────────────────────────────────────────────── */
  /*  1. Tempeh selbst machen - Kompletter Leitfaden  */
  /* ────────────────────────────────────────────────── */
  {
    slug: 'tempeh-selbst-machen-leitfaden',
    title: 'Tempeh selbst machen. Der komplette Leitfaden',
    description:
      'Alles, was du wissen musst: Zutaten, Ausrüstung, Hülsenfrüchte, Schritt-für-Schritt Anleitung und häufige Fragen. Dein Startpunkt für die Tempeh-Fermentation.',
    readTime: '15 Min.',
    imageAlt: 'Selbstgemachter Tempeh mit weißer Mycelium-Oberfläche',
    workshopType: 'tempeh',
    sections: [
      {
        heading: 'Was ist Tempeh?',
        body: [
          'Tempeh ist ein traditionelles indonesisches Gericht aus fermentierten Sojabohnen. Man könnte es sich als einen festen, würzigen Käse vorstellen – nur aus Sojabohnen statt aus Milch.',
          'Tempeh ist hochwertig, reich an Protein, leicht verdaulich und köstlich. Es kann genauso verwendet werden wie Tofu oder Fleisch: mariniert, in verschiedenen Arten gekocht und in vielen Gerichten verarbeitet.',
          'Tempeh wird aus Hülsenfrüchten (meist Sojabohnen), Wasser und Tempeh-Starterkultur (Rhizopus oligosporus oder Rhizopus oryzae) hergestellt. Nachdem die Hülsenfrüchte gekocht sind, wird die Starterkultur hinzugefügt und die Bohnen werden bebrütet. Während der Fermentation entwickelt die Kultur weiße Filamente (eine Art Mycelium), die die Hülsenfrüchte zusammenbinden.',
        ],
      },
      {
        heading: 'Welche Hülsenfrüchte eignen sich?',
        body: [
          'Traditioneller Tempeh wird aus Sojabohnen hergestellt. Du kannst aber auch jede andere Hülsenfrucht verwenden: weiße Bohnen, schwarze Bohnen, Kichererbsen, Linsen, Lupinen – fast alles funktioniert!',
          'Wichtig: Die Hülsenfrüchte müssen geschält sein oder zumindest aufgebrochen, damit die Starterkultur eindringen kann. Am einfachsten sind geschälte (gespaltene) Sojabohnen, gelbe oder grüne Linsen oder Kichererbsen (auch „Chana Dal" genannt).',
          'Kichererbsen haben eine dicke Schale, müssen daher entweder vor dem Kochen kurz in der Küchenmaschine zerkleinert oder von Hand geschält werden. Mit Linsen und gespaltenen Sojabohnen geht es viel einfacher.',
        ],
      },
      {
        heading: 'Welche Ausrüstung brauchst du?',
        body: [
          'Großer Topf, große Schüssel, große Speiseöl-Löffel, sauberes Tuch, Plastiktüten mit Verschluss (Ziploc), Kochthermometer.',
          'Das Wichtigste: eine Möglichkeit, den Tempeh bei der richtigen Temperatur zu bebrüten. Die ideale Temperatur für die Tempeh-Bebrütung liegt bei etwa 30°C. Wenn die Temperatur zu niedrig ist, dauert die Entwicklung länger. Wenn sie zu hoch ist, können die Sporen absterben.',
          'Es gibt mehrere Möglichkeiten: im Backofen mit eingeschaltetem Licht, im Dörrautomat, mit einem Thermozirkulationsstab in einem Wasserbad, mit einer Heizmatte oder in einer Isolierbox mit heißem Wasser. Die erste 12 Stunde ist die Temperaturkontrolle besonders wichtig. Nach 12 Stunden Heizung ausschalten, da der Tempeh beginnt, seine eigene Wärme zu produzieren und überhitzen könnte.',
        ],
      },
      {
        heading: 'Schritt-für-Schritt Anleitung',
        body: [
          '1. Hülsenfrüchte vorbereiten: Eine Nacht einweichen, dann kurz in der Küchenmaschine zerkleinern (wenn nötig) und abziehen.',
          '2. Kochen: Die Hülsenfrüchte kochen, aber sie sollten noch knackig sein (al dente), nicht zu weich. Das Kochen wird während der Gärung fortgesetzt.',
          '3. Impfen: Nach dem Kochen die Hülsenfrüchte abtropfen lassen und so viel wie möglich abtrocknen. Sie sollten nicht nass sein, aber auch nicht völlig trocken. Dann Essig hinzufügen, gefolgt von der Tempeh-Starterkultur.',
          '4. Verpacken: Die einfachste Technik ist die Verwendung von frostsicheren Plastiktüten mit selbstgemachten Löchern. Diese Technik ermöglicht es, etwas Feuchtigkeit zu speichern (aber nicht zu viel!), und Luft kann passieren, damit die Sporen sich entwickeln können. Nicht zu fest zusammendrücken und nicht zu voll füllen (max. 1 cm / 3 cm Dicke).',
          '5. Bebrütung: Die Tüten werden bei etwa 30°C bebrütet. Nach 12 Stunden die Temperatur überwachen und die Tüten umdrehen, um der Kultur zum Atmen zu ermöglichen. Die Bebrütung kann 24 bis 72 Stunden dauern. Der Tempeh ist bereit, wenn die Hülsenfrüchte vollständig mit einem dichten weißen Film bedeckt sind.',
        ],
      },
      {
        heading: 'Wie lange hält Tempeh?',
        body: [
          'Tempeh kann sofort nach der Herstellung gekocht verzehrt werden. Wenn du es lagern möchtest, sollte es sofort in den Kühlschrank, in seinem Fermentationsbehälter oder in einer anderen Verpackung, die seine Feuchtigkeitszustand erhält, für maximal eine Woche. Für längere Lagerung: Gefrierfach, wo es mehrere Monate haltbar ist.',
        ],
      },
      {
        heading: 'Sicherheit und häufige Probleme',
        body: [
          'Tempeh ist viel sicherer als viele Lebensmittel, wenn einfache Regeln beachtet werden: Ausrüstung gründlich reinigen und wenn möglich desinfizieren. Nur Starterkultur aus zuverlässiger Quelle verwenden. Temperatur in der ersten 12 Stunde genau überwachen. Essig hinzufügen (schützt vor Bacillus cereus).',
          'Wenn der Tempeh nicht nach 48 Stunden fermentiert: Hülsenfrüchte waren nicht genug geschält, Temperatur zu niedrig/hoch, nicht genug Luftzirkulation oder schwache Sporen. Nicht entmutigend! Mit kleinen Anpassungen funktioniert es beim nächsten Versuch.',
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────── */
  /*  2. 6 Tipps für erfolgreiche Tempeh-Herstellung  */
  /* ────────────────────────────────────────────────── */
  {
    slug: 'tempeh-herstellung-tipps',
    title: '6 Tipps für erfolgreiche Tempeh-Herstellung',
    description:
      'Tempeh selbst machen muss nicht kompliziert sein. Mit diesen 6 praktischen Tipps optimierst du deine Fermentation.',
    readTime: '5 Min.',
    imageAlt: 'Weißer, fertig fermentierter Tempeh-Block',
    workshopType: 'tempeh',
    sections: [
      {
        heading: 'Tipp 1: Hülsenfrüchte richtig vorbereiten',
        body: [
          'Die Schale muss weg! Das ist die Grundvoraussetzung. Wähle möglichst geschälte oder gespaltene Sojabohnen oder Linsen – das spart Zeit. Wenn du andere Hülsenfrüchte verwendest (Kichererbsen, schwarze Bohnen), musst du diese entweder kurz in der Küchenmaschine zerkleinern oder von Hand abziehen.',
          'Die Kultur kann nur eindringen, wenn die Hülsenfrucht zugänglich ist.',
        ],
      },
      {
        heading: 'Tipp 2: Nicht zu lange kochen',
        body: [
          'Überraschung: Der Tempeh wird noch etwas weicher während der Gärung. Koche die Hülsenfrüchte nur bis al dente – sie sollten noch knackig sein. Zu weiche Hülsenfrüchte ergeben matschigen Tempeh, der auch schlechter belüftet wird.',
          'Schmecken während des Kochens und kritisch prüfen!',
        ],
      },
      {
        heading: 'Tipp 3: Gründlich trocknen nach dem Kochen',
        body: [
          'Zu viel Wasser fördert Bakterienwachstum und verlangsamt die Kolonisierung durch die Tempeh-Kultur. Abtropfen lassen, auf ein sauberes Tuch ausbreiten, vorsichtig abreiben. Ein Ventilator hilft. Aber nicht zu lange warten – die Hülsenfrüchte sollen noch Restwärme haben.',
        ],
      },
      {
        heading: 'Tipp 4: Ausreichend Löcher in den Plastiktüten',
        body: [
          'Die Tempeh-Kultur braucht Sauerstoff. Zu wenig Belüftung = Kultur erstickend! Mit einer Gabel die Tüten auf beiden Seiten großzügig durchlöchern. Lieber mehr als weniger Löcher.',
        ],
      },
      {
        heading: 'Tipp 5: Temperature überwachen im Detail',
        body: [
          'Die Temperatur während der Bebrütung ist entscheidend – sollte zwischen 28–32°C liegen. Besonders in den ersten 12 Stunden ist Temperaturkontrolle überlebenswichtig! Nach 12 Stunden schaltest du die Heizung aus, da der Tempeh selbst Wärme produziert.',
          'Verwende ein Kochthermometer und miss die innere (nicht äußere) Temperatur der Tüte.',
        ],
      },
      {
        heading: 'Tipp 6: In kleineren Portionen lagern',
        body: [
          'Tempeh kühlt schneller und effizienter, wenn du es in kleineren Portionen aufteilst. Das erhält die Qualität und Frische besser.',
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────── */
  /*  3. Marinierter Tempeh Burger                    */
  /* ────────────────────────────────────────────────── */
  {
    slug: 'tempeh-burger-rezept',
    title: 'Marinierter Tempeh Burger',
    description:
      'Ein köstlicher veganer Burger mit fermentiertem Tempeh, mariniert und gebraten oder paniert. Voller Umami und knackig.',
    readTime: '20 Min.',
    imageAlt: 'Perfekt gebratener Tempeh Burger mit frischen Gemüsen',
    workshopType: 'tempeh',
    sections: [
      {
        heading: 'Warum Tempeh im Burger?',
        body: [
          'Tempeh ist viel mehr als nur ein Fleischersatz. Es bietet eine feste, raffinierte Textur, die zusammenhält und sich perfekt marinieren lässt. Dazu kommt ein natürlicher Umami-Geschmack.',
          'Hochwertiges, leicht verdauliches pflanzliches Protein dank Fermentation – und du kannst dein eigenes Tempeh aus verschiedenen Hülsenfrüchten machen.',
        ],
      },
      {
        heading: 'Zutaten für die Marinade',
        body: [
          '• 1 Block Tempeh',
          '• 2 geriebene Knoblauchzehen',
          '• 1 ½ Esslöffel geriebener Ingwer',
          '• 3 Esslöffel Pflanzenöl',
          '• 3 Esslöffel Sojasauce',
          '• 3 Esslöffel Zitronensaft',
          '• 1 ½ Esslöffel Ahornsirup',
          '• 1 Teelöffel Gewürze nach Wahl (Paprika, Thymian, Oregano, Curry…)',
        ],
      },
      {
        heading: 'Zutaten für die Panierung (optional)',
        body: [
          '• Mehl',
          '• 1 Ei',
          '• Semmelbrösel',
          '• Salz und Pfeffer',
        ],
      },
      {
        heading: 'Für den fertigen Burger',
        body: [
          '• Marinierter Tempeh-Block (paniert oder nicht)',
          '• 2 Burger-Brötchen',
          '• Pflanzenöl zum Braten',
          '• Beläge nach Wahl: fermentierte Salzgurken, Sauerkraut, frische Blätter',
          '• Käsescheibe (optional)',
          '• Sauce nach Wahl: Miso-Mayonnaise, hausgemachter Senf, Ketchup…',
        ],
      },
      {
        heading: 'Zubereitung',
        body: [
          '1. Den Tempeh-Block halbieren, damit er auf die Brötchen passt.',
          '2. Tempeh in eine luftdichte Box geben.',
          '3. Alle Marinadeingredienzen in einer Schüssel vermischen.',
          '4. Über den Tempeh gießen und die Box verschließen.',
          '5. Über Nacht (oder mindestens 4 Stunden) im Kühlschrank marinieren.',
          '6. Tempeh aus der Marinade nehmen und braten: Bei mittlerer Hitze 7–8 Minuten pro Seite braten. Am Ende der Garung eine Käsescheibe auflegen und unter einem Deckel schmelzen lassen.',
          '7. (Optional für paniertes Tempeh:) Mariniertes Tempeh trocken tupfen, in Mehl wälzen, in verquirltem Ei tauchen, in Semmelbrösel wälzen. 20 Min. kaltstellen. Dann in der Pfanne in etwas Öl braun braten oder im Backofen bei 180°C etwa 20–25 Minuten backen.',
          '8. Brötchen aufschneiden und toasten.',
          '9. Mit Sauce, Belägen und Tempeh zusammensetzen. Genießen!',
        ],
      },
      {
        heading: 'Geheimtipps',
        body: [
          'Für weicheres Tempeh: Vor dem Marinieren kurz dämpfen.',
          'Für extra Knuspriges: Panierung doppeln (Ei → Semmelbrösel → nochmal Ei → nochmal Semmelbrösel).',
          'Abwechslungsreiche Marinaden: Probiere verschiedene Varianten – mit fermentierten Elementen, Garum, hausgemachter Pflaumensauce oder fermentierter Brine.',
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────── */
  /*  4. Kichererbsen-Tempeh Rezept                   */
  /* ────────────────────────────────────────────────── */
  {
    slug: 'kichererbsen-tempeh-rezept',
    title: 'Kichererbsen-Tempeh Rezept',
    description:
      'Tempeh aus Kichererbsen: nussig, würzig und ganz ohne Soja. Perfekt für vielfältige vegane Rezepte.',
    readTime: '8 Min.',
    imageAlt: 'Selbstgemachter Kichererbsen-Tempeh mit goldener Farbe',
    workshopType: 'tempeh',
    sections: [
      {
        heading: 'Warum Kichererbsen-Tempeh?',
        body: [
          'Kichererbsen geben Tempeh einen kräftigeren, leicht nussigen Geschmack. Die Textur ist fest und bissfest. Eine großartige Alternative, wenn du sojafrei fermentieren möchtest.',
          'Hinweis: Kichererbsen haben eine dicke Schale, die die Kultur am Eindringen hindert. Deshalb musst du sie vor dem Kochen in der Küchenmaschine grob zerkleinern oder danach von Hand abziehen. Mit geschälten Kichererbsen (auch „Chana Dal" genannt) geht es viel schneller.',
        ],
      },
      {
        heading: 'Was du brauchst',
        body: [
          '• 2,5 Tassen getrocknete Kichererbsen',
          '• 2 Esslöffel weißer Essig',
          '• 1 Teelöffel Tempeh-Starterkultur',
          '• Wasser zum Kochen',
          '• Großer Topf, Sieb, sauberes Tuch, Rührspatel, Kochthermometer, 3 Plastiktüten',
        ],
      },
      {
        heading: 'Schritt für Schritt',
        body: [
          '1. Kichererbsen über Nacht (oder mindestens 6 Stunden) in doppelter Wassermenge einweichen.',
          '2. In der Küchenmaschine in mehreren Chargen grob zermahlen. Nicht zu fein! Die Hälfte grob zerkleinert, die Hälfte ganz grobmahlig ist ideal.',
          '3. In kochendem, ungesalzenem Wasser 20 Minuten mit Deckel kochen, bis die Kichererbsen noch knackig sind (al dente). Schaum abschöpfen.',
          '4. Sehr gründlich abtropfen lassen, auf einem sauberen Tuch ausbreiten und leicht abreiben, um die Feuchtigkeit zu reduzieren.',
          '5. Wenn nicht mehr nass, aber noch warm: Essig hinzufügen, gut vermischen. Dann die Starterkultur hinzufügen und nochmal gründlich vermischen.',
          '6. In Plastiktüten füllen (nicht zu voll, max. 3 cm Dicke), verschließen, dann mit einer Gabel auf beiden Seiten durchlöchern.',
          '7. Bei ca. 30°C bebrüten. Nach 1 Stunde die Temperatur überprüfen und eventuell anpassen. Nach 12 Stunden die Tüten umdrehen. Nach 24–36 Stunden zeigen sich die ersten weißen Flöckchen. Nach 36–48 Stunden ist der Tempeh fertig, wenn alle Kichererbsen von einem weißen Film bedeckt sind und zusammenhängen.',
          '8. Sofort kühlen oder (gekühlt) lagern.',
        ],
      },
      {
        heading: 'Bonus: Kichererbsen-Quinoa-Tempeh',
        body: [
          'Für noch mehr Geschmack und Textur: Weiße oder rote Quinoa (oder Mischung) verwenden. Da Quinoa schneller gart als Kichererbsen: Die Quinoa erst 10 Minuten vor Ende der Kichererbsen hinzufügen. Der Rest der Anleitung bleibt identisch.',
          'Das ergibt einen visuell interessanten zweifarbigen Tempeh und noch intensivere Aromen.',
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────── */
  /*  5. Schwarzbohnen-Tempeh Rezept                  */
  /* ────────────────────────────────────────────────── */
  {
    slug: 'schwarzbohnen-tempeh-rezept',
    title: 'Schwarzbohnen-Tempeh Rezept',
    description:
      'Tempeh aus schwarzen Bohnen: kräftig, rustikal und perfekt für mexikanisch inspirierte Gerichte.',
    readTime: '9 Min.',
    imageAlt: 'Dunkler Schwarzbohnen-Tempeh mit weißer Mycelium-Oberfläche',
    workshopType: 'tempeh',
    sections: [
      {
        heading: 'Schwarzbohnen-Tempeh: Das beste für Einsteiger',
        body: [
          'Schwarze Bohnen sind eine ausgezeichnete Wahl für Tempeh, vor allem für Anfänger:',
          '• Preiswert: getrocknete schwarze Bohnen sind in jedem Supermarkt zu finden.',
          '• Einfach: schwarze Bohnen haben eine sehr dünne Schale und müssen nicht geschält werden.',
          '• Lecker: Schwarzbohnen-Tempeh ist robust und herrlich mit Barbecue-Sauce oder mexikanischen Gewürzen.',
          '• Vielseitig: Perfekt gegrillt oder gebraten, im Sandwich, in Poke Bowls oder in Tex-Mex Salaten.',
        ],
      },
      {
        heading: 'Was du brauchst',
        body: [
          '• 500 g getrocknete schwarze Bohnen',
          '• 2 Esslöffel weißer Essig (oder Apfelessig)',
          '• 1 Teelöffel Tempeh-Starterkultur',
          '• Wasser zum Kochen',
          '• Großer Topf, Sieb, sauberes Tuch, Speiseöl-Löffel, Kochthermometer, 3 Plastiktüten mit Ziploc',
        ],
      },
      {
        heading: 'Zubereitung Schritt für Schritt',
        body: [
          '1. Schwarze Bohnen in den großen Topf geben, doppelte Wassermenge bedeckt sie. Über Nacht (oder mindestens 6 Stunden) einweichen lassen.',
          '2. Bohnen abtropfen lassen und grob abspülen.',
          '3. Einen neuen Topf mit Wasser füllen, aufkochen. Die schwarzen Bohnen hinzufügen und 20 Minuten köcheln lassen, bis sie noch knackig sind (al dente). Keine Salzung! Schaum abschöpfen, wenn nötig.',
          '4. Sehr gründlich abtropfen lassen. Auf ein sauberes Tuch ausbreiten und leicht abreiben, um so viel Feuchtigkeit wie möglich zu entfernen. Mit dem Tuch leicht abtupfen oder mit Ventilator auspusten.',
          '5. Wenn nicht mehr nass: Essig hinzufügen und gründlich vermischen. Dann Tempeh-Starterkultur hinzufügen und nochmals gründlich vermischen.',
          '6. In Plastiktüten füllen (nicht zu voll: max. 3 cm Schichtstärke), Tüten verschließen. Mit einer Gabel auf beiden Seiten großzügig durchlöchern.',
          '7. In ein ausgeschaltetes Backrohr stellen (Licht an, Tür leicht offen), oder auf eine Wärmematte, oder in eine Isolierbox mit heißem Wasser. Ziel: 30°C erreichen und halten.',
          '8. Nach 1 Stunde Temperatur überprüfen und wenn nötig anpassen. Nach 12 Stunden die Tüten umdrehen. Nach 24–36 Stunden zeigen sich weiße Flöckchen. Nach 36–48 Stunden sollte der Schwarzbohnen-Tempeh komplett mit weißem Film bedeckt sein und zusammenhängen.',
          '9. Sofort kühlen oder lagern (Kühlschrank max. 1 Woche, Gefrierschrank mehrere Monate).',
        ],
      },
      {
        heading: 'Wie man Schwarzbohnen-Tempeh kocht',
        body: [
          'Einfach in Öl anbraten oder grillen. Das kräftige Aroma passt perfekt zu:',
          '• Barbecue-Sauce',
          '• Mexicanische Gewürze (Kreuzkümmel, Chipotle, Lime)',
          '• In Tacos oder Burritos',
          '• In einer Grillplatte mit geröstetem Gemüse',
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────── */
  /*  6. Sojafrei: Linsen-Tempeh Rezept               */
  /* ────────────────────────────────────────────────── */
  {
    slug: 'linsen-tempeh-sojafrei',
    title: 'Sojafrei: Linsen-Tempeh Rezept',
    description:
      'Tempeh ohne Soja, aus gespaltenen Linsen: schnell, einfach und absolut lecker. Das perfekte Einstiegsprojekt.',
    readTime: '6 Min.',
    imageAlt: 'Helles Linsen-Tempeh mit charakteristischer Mycelium-Struktur',
    workshopType: 'tempeh',
    sections: [
      {
        heading: 'Warum Linsen-Tempeh?',
        body: [
          'Linsen-Tempeh ist dein Einstiegsprojekt! Warum?',
          '• Kein Einweichen nötig – keine Schälfasel.',
          '• Extrem schnelle Garzeit: nur 15 Minuten.',
          '• Lokales Lebensmittel: Linsen werden weltweit angebaut und sind erschwinglich.',
          '• Weiches, cremiges Aroma – perfekt auch für Anfänger.',
          '• Gelbe oder grüne Linsen funktionieren, oder Mischung aus beiden für optischen Kontrast.',
        ],
      },
      {
        heading: 'Was du brauchst',
        body: [
          '• 2 Tassen gelbe oder grüne gespaltene Linsen',
          '• 2 Esslöffel Essig',
          '• 1 Teelöffel Tempeh-Starterkultur',
          '• Wasser zum Kochen',
          '• Großer Topf, Sieb, sauberes Tuch, Speiseöl-Löffel, Kochthermometer, 3 Plastiktüten',
        ],
      },
      {
        heading: 'Schritt für Schritt Anleitung',
        body: [
          '1. Einen Topf mit Wasser füllen und zur Wallung bringen.',
          '2. Linsen hinzufügen.',
          '3. 15 Minuten köcheln lassen, ohne Deckel, bis die Linsen al dente sind und noch eine gewisse Festigkeit haben. Ziel: nicht zu weich, nicht mehlig.',
          '4. Schaum abspülen, sehr gründlich abtropfen lassen.',
          '5. Auf einem sauberen Tuch ausbreiten und leicht abtrocken (Tuch aufrollen und leicht andrücken, oder Ventilator benutzen).',
          '6. Wenn die Linsen nicht mehr nass sind: Essig hinzufügen, gut vermischen. Dann Tempeh-Starterkultur hinzufügen und nochmals gründlich vermischen.',
          '7. In Plastiktüten füllen (max. 3 cm Dicke), verschließen, dann mit Gabel auf beiden Seiten durchlöchern.',
          '8. Bei ca. 30°C bebrüten. Nach 1 Stunde Temperatur überprüfen. Nach 12 Stunden Tüten umdrehen. Nach 24–36 Stunden zeigen sich erste weiße Flöckchen. Nach 36–48 Stunden sollte der Tempeh komplett mit weißem Film bedeckt sein.',
          '9. Sofort kühlen. Im Kühlschrank ca. 1 Woche haltbar, im Gefrierschrank mehrere Monate.',
        ],
      },
      {
        heading: 'Wie man Linsen-Tempeh kocht',
        body: [
          'Linsen-Tempeh hat ein mildes, cremiges Aroma und funktioniert überall dort, wo auch Soja-Tempeh verwendet wird:',
          '• Einfach in Öl anbraten oder grillen.',
          '• In Burgern, Bowls oder Curries.',
          '• In Stir-Fries (kurz zugeben, damit die Kulturen überleben).',
          '• Marinieren und dann braten oder backen.',
        ],
      },
      {
        heading: 'Bonus: Lagerung und Info',
        body: [
          'Tempeh wird im Kühlschrank für etwa eine Woche haltbar und im Gefrierfach für mindestens 6 Monate. Vor Gebrauch immer kochen – rohes selbstgemachtes Tempeh sollte nicht gegessen werden.',
          'Wenn du grüne und gelbe Linsen mischst, erhältst du einen visuell interessanten zweifarbigen Tempeh!',
        ],
      },
    ],
  },
]
