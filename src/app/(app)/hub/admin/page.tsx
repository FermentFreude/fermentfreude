/* eslint-disable react/no-unescaped-entities */
'use client'

import { FieldTable, HubSection, HubShell, InfoCard, StepList, type TocSection } from '../HubShell'

const sections: TocSection[] = [
  { id: 'getting-started', title: 'Erste Schritte' },
  { id: 'pages', title: 'Seiten verwalten' },
  { id: 'products', title: 'Produkte' },
  { id: 'categories', title: 'Kategorien' },
  { id: 'workshops', title: 'Workshops' },
  { id: 'appointments', title: 'Workshop-Termine' },
  { id: 'locations', title: 'Standorte' },
  { id: 'bookings', title: 'Buchungen' },
  { id: 'vouchers', title: 'Gutscheine' },
  { id: 'online-courses', title: 'Online-Kurse' },
  { id: 'media', title: 'Bilder & Medien' },
  { id: 'navigation', title: 'Navigation & Footer' },
  { id: 'testimonials', title: 'Testimonials' },
  { id: 'users', title: 'Benutzer' },
  { id: 'localization', title: 'Sprachen (DE/EN)' },
  { id: 'seo', title: 'SEO-Einstellungen' },
  { id: 'tips', title: 'Tipps & Tricks' },
]

export default function AdminHubPage() {
  return (
    <HubShell
      title="Admin Hub"
      subtitle="Anleitungen für Redakteure"
      accentColor="#555954"
      sections={sections}
    >
      {/* ── GETTING STARTED ── */}
      <HubSection id="getting-started" title="Erste Schritte">
        <p className="text-base leading-relaxed">
          Willkommen im Admin Hub! Hier findest du alle Anleitungen, um die FermentFreude-Website über
          das Admin-Dashboard zu verwalten. Du brauchst keine technischen Kenntnisse — alles wird
          Schritt für Schritt erklärt.
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Einloggen
        </h3>
        <StepList
          steps={[
            {
              title: 'Admin-Dashboard öffnen',
              desc: 'Gehe zu deiner Website-URL und hänge /admin an (z.B. fermentfreude.vercel.app/admin).',
            },
            {
              title: 'Anmelden',
              desc: 'Gib deine E-Mail-Adresse und dein Passwort ein und klicke auf „Anmelden".',
            },
            {
              title: 'Dashboard erkunden',
              desc: 'Du siehst nun die Übersicht mit allen Sammlungen (Collections) auf der linken Seite.',
            },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Aufbau des Dashboards
        </h3>
        <p>
          Das Admin-Dashboard ist in <strong>Sammlungen</strong> (Collections) und <strong>Globals</strong> aufgeteilt:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-sm" style={{ color: '#626160' }}>
          <li><strong>Sammlungen</strong> — Seiten, Produkte, Workshops, Medien, Benutzer, etc. Jede davon enthält eine Liste von Einträgen.</li>
          <li><strong>Globals</strong> — Einstellungen, die auf der ganzen Website gelten: Header, Footer, Testimonials, etc.</li>
        </ul>

        <InfoCard variant="tip" title="Schneller Zugriff">
          <p>Wenn du auf der Live-Website eingeloggt bist, siehst du oben eine Admin-Leiste mit einem „Bearbeiten"-Button. Damit springst du direkt zum jeweiligen Eintrag im Dashboard.</p>
        </InfoCard>
      </HubSection>

      {/* ── PAGES ── */}
      <HubSection id="pages" title="Seiten verwalten">
        <p>
          Unter <strong>Inhalt → Seiten</strong> findest du alle Seiten der Website. Jede Seite besteht aus einem <strong>Hero-Bereich</strong> (großes Bild/Slider oben) und <strong>Inhaltsblöcken</strong> (einzelne Abschnitte, die du frei zusammenstellen kannst).
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Bestehende Seite bearbeiten
        </h3>
        <StepList
          steps={[
            { title: 'Seite finden', desc: 'Klicke links auf „Seiten" und suche die gewünschte Seite in der Liste.' },
            { title: 'Seite öffnen', desc: 'Klicke auf den Titel der Seite, um sie zu bearbeiten.' },
            { title: 'Inhalte ändern', desc: 'Ändere Texte, Bilder oder Blöcke nach Bedarf. Alle Textfelder haben ein DE- und EN-Feld.' },
            { title: 'Speichern', desc: 'Klicke oben rechts auf „Speichern" (oder „Entwurf speichern" für Entwürfe).' },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Blöcke hinzufügen & anordnen
        </h3>
        <p>
          Jede Seite hat einen Bereich <strong>„Layout"</strong> (im Tab „Inhalt"). Dort siehst du alle aktuellen Blöcke.
          Du kannst:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-sm" style={{ color: '#626160' }}>
          <li><strong>Block hinzufügen</strong> — Klicke auf „Block hinzufügen" am Ende der Liste und wähle einen Block-Typ.</li>
          <li><strong>Block verschieben</strong> — Nutze die Drag-Handles (⋮⋮) links neben jedem Block.</li>
          <li><strong>Block löschen</strong> — Klicke das ✕ oben rechts am Block.</li>
        </ul>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Verfügbare Block-Typen
        </h3>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Block</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Was er tut</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                ['Banner', 'Info-, Warn- oder Erfolgsmeldung (farbig hervorgehoben)'],
                ['Content', 'Text-Spalten mit optionalen Links (1–3 Spalten)'],
                ['Call to Action', 'Großer Aufruf mit Überschrift und Buttons'],
                ['Media Block', 'Einzelnes Bild oder Video mit Beschriftung'],
                ['Carousel', 'Bilder-Karussell mit mehreren Slides'],
                ['Feature Cards', 'Karten mit Icons, Titel und Beschreibung'],
                ['Product Slider', 'Produktkarussell (zeigt ausgewählte Produkte)'],
                ['Workshop Slider', 'Workshop-Karussell mit nächsten Terminen'],
                ['Online Course Slider', 'Karussell mit Online-Kursen'],
                ['Testimonials', 'Kundenbewertungen als Slider'],
                ['Team Cards', 'Teammitglieder mit Foto, Name und Rolle'],
                ['Our Story', 'Markengeschichte mit Timeline und Bildern'],
                ['Contact Block', 'Kontaktformular mit Kontaktinfos'],
                ['Shop Hero', 'Hero-Bereich für die Shop-Seite'],
                ['Shop Product Grid', 'Produktraster mit Filter & Sortierung'],
                ['Featured Product Cards', 'Hervorgehobene Produkte als Karten'],
                ['Voucher CTA', 'Gutschein-Aufruf mit Bild und Button'],
                ['Sponsors Bar', 'Sponsor-Logos in einer Leiste'],
                ['Ready to Learn CTA', '„Bereit zu lernen?" Aufruf-Bereich'],
              ].map(([name, desc], i) => (
                <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: '#555954' }}>{name}</td>
                  <td className="px-4 py-2.5">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Hero-Bereich (Startbild)
        </h3>
        <p>
          Jede Seite hat einen <strong>Hero-Tab</strong>. Dort wählst du den Typ des Hero-Bereichs aus:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-sm" style={{ color: '#626160' }}>
          <li><strong>Hero Slider</strong> — Vollbild-Karussell mit 4 Slides (für die Startseite)</li>
          <li><strong>Hero Carousel</strong> — Mehrere Slides mit Bildern</li>
          <li><strong>Hero Split</strong> — Bild links, Text rechts (oder umgekehrt)</li>
          <li><strong>High Impact</strong> — Großes Statement mit Überschrift</li>
          <li><strong>Food Presentation Slider</strong> — Produktpräsentation für Lebensmittel</li>
        </ul>

        <InfoCard variant="tip" title="Startseite (Home)">
          <p>Die Startseite hat einen festen Hero Slider mit 4 Slides (Basics, Lakto, Kombucha, Tempeh). Du kannst die Texte und Bilder jedes Slides bearbeiten, aber die Anzahl und Reihenfolge ist fest.</p>
        </InfoCard>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Wichtige Seiten
        </h3>
        <ul className="ml-4 list-disc space-y-1 text-sm" style={{ color: '#626160' }}>
          <li><strong>home</strong> — Startseite der Website</li>
          <li><strong>shop</strong> — Online-Shop Seite</li>
          <li><strong>gastronomy</strong> — B2B-Angebot für Gastronomie</li>
          <li><strong>fermentation</strong> — Wissensseite über Fermentation</li>
          <li><strong>about</strong> — Über uns</li>
          <li><strong>contact</strong> — Kontakt</li>
        </ul>
      </HubSection>

      {/* ── PRODUCTS ── */}
      <HubSection id="products" title="Produkte">
        <p>
          Unter <strong>Shop → Produkte</strong> findest du alle Produkte. Jedes Produkt hat einen Typ, der bestimmt, welche Felder angezeigt werden.
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Neues Produkt anlegen
        </h3>
        <StepList
          steps={[
            { title: 'Neues Produkt erstellen', desc: 'Klicke links auf „Produkte" und dann oben rechts auf „Neues Produkt erstellen".' },
            { title: 'Produkttyp wählen', desc: 'Wähle den Typ: Im Glas (jarred), Frisch (fresh), Getränk (bottled), Workshop oder Online-Kurs (digital-course).' },
            { title: 'Grunddaten ausfüllen', desc: 'Titel (DE + EN), Kurzbeschreibung, Marke, Geschmacksrichtung eingeben.' },
            { title: 'Bilder hochladen', desc: 'Im Bereich „Galerie" Bilder hinzufügen. Für jedes Bild ein Medien-Objekt auswählen oder neu hochladen.' },
            { title: 'Preis eingeben', desc: 'Im Bereich „Preis" den Preis in CENT eingeben (z.B. 990 für 9,90 €, 9900 für 99,00 €).' },
            { title: 'Kategorie zuweisen', desc: 'Im Bereich „Kategorien" die passende Kategorie auswählen.' },
            { title: 'Speichern', desc: 'Klicke auf „Speichern". Das Produkt erscheint nun im Shop.' },
          ]}
        />

        <InfoCard variant="important" title="Preise immer in Cent!">
          <p>
            Preise werden in <strong>Cent</strong> eingegeben, nicht in Euro. Beispiele:
          </p>
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li>9,90 € → <strong>990</strong> eingeben</li>
            <li>25,00 € → <strong>2500</strong> eingeben</li>
            <li>99,00 € → <strong>9900</strong> eingeben</li>
            <li>149,50 € → <strong>14950</strong> eingeben</li>
          </ul>
          <p className="mt-2">Die Website rechnet automatisch in Euro um und zeigt z.B. „€9,90" an.</p>
        </InfoCard>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Produkttypen
        </h3>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Typ</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Beschreibung</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Spezielle Felder</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                ['Im Glas (jarred)', 'Fermentierte Produkte im Glas', 'Zutaten, Allergene, Lagerung, Haltbarkeit, Einheitsgröße'],
                ['Frisch (fresh)', 'Frische Fermentationsprodukte', 'Zutaten, Allergene, Lagerung, Einheitsgröße'],
                ['Getränk (bottled)', 'Fermentierte Getränke', 'Zutaten, Allergene, Lagerung, Einheitsgröße'],
                ['Workshop', 'Buchbare Workshops', 'Verknüpfung mit Workshop-System'],
                ['Online-Kurs (digital-course)', 'Digitale Lerninhalte', 'Kurs-Slug, Verknüpfung mit Kurs-System'],
              ].map(([type, desc, fields], i) => (
                <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: '#555954' }}>{type}</td>
                  <td className="px-4 py-2.5">{desc}</td>
                  <td className="px-4 py-2.5">{fields}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Produkt-Felder im Detail
        </h3>
        <FieldTable
          fields={[
            { name: 'Titel', description: 'Produktname (lokalisiert: DE + EN)', required: true },
            { name: 'Slug', description: 'URL-Pfad (automatisch generiert aus Titel)', required: true },
            { name: 'Kurzbeschreibung', description: 'Kurzer Teaser, erscheint unter dem Titel auf der Produktseite' },
            { name: 'Marke', description: 'Markenname (z.B. FermentFreude)' },
            { name: 'Geschmacksrichtung', description: 'Z.B. „Ingwer & Zitrone" — erscheint in der Spec-Tabelle' },
            { name: 'Beschreibung', description: 'Ausführliche Beschreibung (Rich-Text mit Formatierung)' },
            { name: 'Galerie', description: 'Produktbilder. Mehrere Bilder möglich (werden als Slider angezeigt)' },
            { name: 'Vorteile (Benefits)', description: 'Feature-Badges, z.B. „Probiotisch", „Bio", „Handgemacht"' },
            { name: 'Abzeichen (Badges)', description: 'Zertifizierungs-Icons: vegan, bio, glutenfrei, etc.' },
            { name: 'Über das Produkt', description: 'Aufklappbarer Bereich mit ausführlicher Produktinfo' },
            { name: 'Wie verwenden?', description: 'Aufklappbarer Bereich mit Anwendungstipps' },
            { name: 'Hinweise', description: 'Aufklappbarer Bereich mit Nutzungshinweisen' },
            { name: 'Preis (in Cent)', description: 'Preis in EUR-Cent. 990 = 9,90 €', required: true },
            { name: 'Lagerbestand', description: 'Verfügbare Menge. 0 = ausverkauft' },
            { name: 'Verwandte Produkte', description: 'Cross-Sell: Wähle Produkte, die als Empfehlung angezeigt werden' },
            { name: 'Kategorien', description: 'Produktkategorien zuweisen' },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Lebensmittel-spezifische Felder
        </h3>
        <p className="text-sm" style={{ color: '#626160' }}>
          Diese Felder erscheinen nur bei Produkttypen „Im Glas", „Frisch" und „Getränk":
        </p>
        <FieldTable
          fields={[
            { name: 'Einheitsgröße', description: 'Z.B. „350g", „200ml", „1 Stück"' },
            { name: 'Zutaten', description: 'Vollständige Zutatenliste' },
            { name: 'Allergene', description: 'Allergenhinweise' },
            { name: 'Lagerhinweise', description: 'Z.B. „Kühl aufbewahren"' },
            { name: 'Haltbarkeit', description: 'Z.B. „6 Monate ungeöffnet"' },
            { name: 'Bio-Zertifizierung', description: 'Häkchen: Ist das Produkt bio-zertifiziert?' },
            { name: 'Vegan', description: 'Häkchen: Ist das Produkt vegan?' },
            { name: 'Glutenfrei', description: 'Häkchen: Ist das Produkt glutenfrei?' },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Varianten
        </h3>
        <p className="text-sm" style={{ color: '#626160' }}>
          Wenn ein Produkt in verschiedenen Größen oder Optionen verfügbar ist, aktiviere
          „Varianten aktivieren" (enableVariants). Dann kannst du Variantentypen (z.B. Größe)
          und einzelne Optionen (z.B. Klein, Groß) zuweisen.
        </p>
      </HubSection>

      {/* ── CATEGORIES ── */}
      <HubSection id="categories" title="Kategorien">
        <p>
          Kategorien helfen, Produkte im Shop zu organisieren. Du findest sie unter <strong>Shop → Kategorien</strong>.
        </p>
        <StepList
          steps={[
            { title: 'Neue Kategorie erstellen', desc: 'Klicke auf „Neue Kategorie erstellen".' },
            { title: 'Name eingeben', desc: 'Gib den Kategorienamen auf Deutsch und Englisch ein (z.B. „Fermentierte Getränke" / „Fermented Beverages").' },
            { title: 'Speichern', desc: 'Der Slug wird automatisch generiert. Klicke auf „Speichern".' },
            { title: 'Produkte zuweisen', desc: 'Gehe zu jedem Produkt und wähle die Kategorie im Feld „Kategorien" aus.' },
          ]}
        />
        <FieldTable
          fields={[
            { name: 'Titel', description: 'Kategoriename (lokalisiert: DE + EN)', required: true },
            { name: 'Slug', description: 'URL-Kennung (automatisch generiert)', required: true },
          ]}
        />
      </HubSection>

      {/* ── WORKSHOPS ── */}
      <HubSection id="workshops" title="Workshops">
        <p>
          Workshops werden unter <strong>Workshops → Workshops</strong> verwaltet. Ein Workshop beschreibt die
          allgemeinen Informationen (Titel, Beschreibung, Preis). Die konkreten Termine kommen separat
          (siehe „Workshop-Termine").
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Bestehende Workshops
        </h3>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Workshop</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Slug</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Max. Teilnehmer</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                ['Fermentation Basics', 'basics', '12'],
                ['Lakto-Fermentation', 'lakto', '12'],
                ['Kombucha', 'kombucha', '12'],
                ['Tempeh', 'tempeh', '12'],
              ].map(([name, slug, max], i) => (
                <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: '#555954' }}>{name}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{slug}</td>
                  <td className="px-4 py-2.5">{max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Workshop bearbeiten
        </h3>
        <FieldTable
          fields={[
            { name: 'Slug', description: 'URL-Kennung (z.B. „kombucha"). NICHT ändern nach Erstellung!', required: true },
            { name: 'Titel', description: 'Workshop-Name (DE + EN)', required: true },
            { name: 'Beschreibung', description: 'Ausführliche Beschreibung (Rich-Text, DE + EN)' },
            { name: 'Grundpreis', description: 'Preis pro Person in Euro (z.B. 99)', required: true },
            { name: 'Max. Teilnehmer', description: 'Maximal 12 pro Termin (fest eingestellt)' },
            { name: 'Bild', description: 'Hero-Bild für die Workshop-Seite' },
            { name: 'Aktiv', description: 'Häkchen: Ist der Workshop auf der Website sichtbar?' },
          ]}
        />

        <InfoCard variant="warning" title="Slug nicht ändern">
          <p>Der Slug eines Workshops (z.B. „kombucha") wird überall referenziert — in URLs, Buchungen und Produkten. Ändere ihn niemals nach der Erstellung!</p>
        </InfoCard>
      </HubSection>

      {/* ── APPOINTMENTS ── */}
      <HubSection id="appointments" title="Workshop-Termine">
        <p>
          Unter <strong>Workshops → Termine</strong> legst du konkrete Workshop-Daten und -Uhrzeiten an.
          Jeder Termin gehört zu einem Workshop und einem Standort.
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Neuen Termin anlegen
        </h3>
        <StepList
          steps={[
            { title: 'Termin erstellen', desc: 'Klicke auf „Neuen Termin erstellen".' },
            { title: 'Workshop auswählen', desc: 'Wähle den zugehörigen Workshop (z.B. „Kombucha").' },
            { title: 'Standort auswählen', desc: 'Wähle den Veranstaltungsort (z.B. „Ginery, Graz").' },
            { title: 'Datum & Uhrzeit setzen', desc: 'Wähle Datum und Uhrzeit. Muss in der Zukunft liegen!' },
            { title: 'Verfügbare Plätze', desc: 'Standard: 12. Verringere bei Bedarf (z.B. wenn Plätze schon offline reserviert sind).' },
            { title: 'Veröffentlichen', desc: 'Aktiviere „Veröffentlicht" und klicke „Speichern".' },
          ]}
        />

        <FieldTable
          fields={[
            { name: 'Workshop', description: 'Welcher Workshop (z.B. Kombucha, Tempeh)', required: true },
            { name: 'Standort', description: 'Veranstaltungsort', required: true },
            { name: 'Datum & Uhrzeit', description: 'Startzeit des Workshops (muss in der Zukunft liegen)', required: true },
            { name: 'Verfügbare Plätze', description: 'Zwischen 0 und 12. 0 = ausverkauft, 12 = voll verfügbar' },
            { name: 'Veröffentlicht', description: 'Nur veröffentlichte Termine sind auf der Website sichtbar' },
            { name: 'Notizen', description: 'Interne Notizen (nicht für Kunden sichtbar)' },
          ]}
        />

        <InfoCard variant="tip" title="Ausgebuchte Termine">
          <p>Wenn alle Plätze gebucht sind, sinkt „Verfügbare Plätze" auf 0 und der Termin wird als „Ausgebucht" angezeigt. Du musst nichts manuell tun.</p>
        </InfoCard>
      </HubSection>

      {/* ── LOCATIONS ── */}
      <HubSection id="locations" title="Standorte">
        <p>
          Unter <strong>Workshops → Standorte</strong> verwaltest du die Veranstaltungsorte.
        </p>
        <FieldTable
          fields={[
            { name: 'Name', description: 'Standort-Name (z.B. „Ginery")', required: true },
            { name: 'Adresse', description: 'Vollständige Adresse (Straße, PLZ, Stadt, Land)', required: true },
            { name: 'Zeitzone', description: 'Z.B. „Europe/Vienna" (optional)' },
            { name: 'Aktiv', description: 'Nur aktive Standorte können für Termine ausgewählt werden' },
          ]}
        />
        <InfoCard variant="default" title="Aktueller Standort">
          <p>Derzeit gibt es einen Standort: <strong>Ginery</strong>, Grabenstraße 15, 8010 Graz, Österreich.</p>
        </InfoCard>
      </HubSection>

      {/* ── BOOKINGS ── */}
      <HubSection id="bookings" title="Buchungen">
        <p>
          <strong>Workshops → Buchungen</strong> zeigt alle Workshop-Reservierungen. Buchungen werden
          automatisch erstellt, wenn Kunden einen Workshop über die Website buchen.
        </p>
        <FieldTable
          fields={[
            { name: 'Workshop-Slug', description: 'Welcher Workshop gebucht wurde' },
            { name: 'Termin-ID', description: 'Referenz zum konkreten Termin' },
            { name: 'Workshop-Titel', description: 'Name des Workshops' },
            { name: 'Datum / Uhrzeit', description: 'Wann der Workshop stattfindet' },
            { name: 'Gästeanzahl', description: 'Wie viele Personen (1–12)' },
            { name: 'Preis pro Person', description: 'Einzelpreis in Euro' },
            { name: 'Gesamtpreis', description: 'Gesamtbetrag in Euro' },
            { name: 'E-Mail', description: 'Kontakt-E-Mail des Kunden' },
            { name: 'Vor- / Nachname', description: 'Name des Kunden' },
          ]}
        />
        <InfoCard variant="tip" title="Buchungsbestätigung">
          <p>Nach jeder Buchung wird automatisch eine Bestätigungs-E-Mail über Brevo (E-Mail-Service) an den Kunden gesendet.</p>
        </InfoCard>
      </HubSection>

      {/* ── VOUCHERS ── */}
      <HubSection id="vouchers" title="Gutscheine">
        <p>
          Unter <strong>Workshops → Gutscheine</strong> kannst du Geschenkgutscheine für Workshops erstellen und verwalten.
        </p>
        <StepList
          steps={[
            { title: 'Gutschein erstellen', desc: 'Klicke auf „Neuen Gutschein erstellen".' },
            { title: 'Workshop wählen', desc: 'Wähle, für welchen Workshop der Gutschein gilt.' },
            { title: 'Wert festlegen', desc: 'Standard: 99 € (Preis eines Workshops). Kann angepasst werden.' },
            { title: 'Speichern', desc: 'Ein einzigartiger Code wird automatisch generiert (z.B. „KOMBUCHA-GIFT-ABC123").' },
          ]}
        />
        <FieldTable
          fields={[
            { name: 'Code', description: 'Automatisch generiert (z.B. „TEMPEH-GIFT-XY789"). Nur lesen.' },
            { name: 'Workshop', description: 'Für welchen Workshop der Gutschein gilt', required: true },
            { name: 'Wert', description: 'Gutscheinwert in Euro (Standard: 99)' },
            { name: 'Eingelöst', description: 'Ob der Gutschein bereits verwendet wurde (automatisch)' },
            { name: 'Eingelöst am', description: 'Datum der Einlösung (automatisch)' },
            { name: 'Eingelöst von', description: 'Welcher Benutzer eingelöst hat (automatisch)' },
            { name: 'Notizen', description: 'Interne Notizen' },
          ]}
        />
      </HubSection>

      {/* ── ONLINE COURSES ── */}
      <HubSection id="online-courses" title="Online-Kurse">
        <p>
          Unter <strong>Online Kurse → Online Kurse</strong> verwaltest du digitale Lerninhalte.
          Jeder Kurs hat Karten-Informationen (für die Übersichtsseite), einen Hero-Bereich und Module mit Lektionen.
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Kurs anlegen
        </h3>
        <StepList
          steps={[
            { title: 'Kurs erstellen', desc: 'Klicke auf „Neuen Online-Kurs erstellen".' },
            { title: 'Grunddaten eingeben', desc: 'Titel, Slug, Beschreibung, Karten-Bild, Dozent*in, Dauer, Level.' },
            { title: 'Module & Lektionen', desc: 'Im Tab „Module" Module anlegen. Jedes Modul enthält Lektionen mit Video-URL, Beschreibung und Dauer.' },
            { title: 'Produkt verknüpfen', desc: 'Falls der Kurs kaufbar ist: Wähle im Feld „Produkt" das zugehörige Produkt (vom Typ „digital-course").' },
            { title: 'Sortierung', desc: 'Über „Sortierreihenfolge" bestimmst du die Position in der Kurs-Übersicht (niedrigere Zahl = weiter vorne).' },
            { title: 'Veröffentlichen', desc: 'Aktiviere „Aktiv" und speichere.' },
          ]}
        />

        <FieldTable
          fields={[
            { name: 'Titel', description: 'Kursname (DE + EN)', required: true },
            { name: 'Slug', description: 'URL-Kennung (z.B. „basic-fermentation-course")', required: true },
            { name: 'Beschreibung', description: 'Kurzbeschreibung für die Karten-Ansicht' },
            { name: 'Karten-Bild', description: 'Vorschaubild für die Kurs-Übersicht' },
            { name: 'Produkt', description: 'Verknüpftes Produkt für Kauf/Checkout (leer = Coming Soon)' },
            { name: 'Aktiv', description: 'Kurs auf /courses anzeigen?' },
            { name: 'Coming Soon', description: 'Zeigt „Benachrichtige mich" statt „Kaufen"' },
            { name: 'Coming-Soon-Badge', description: 'Z.B. „Sommer 2026" (nur wenn Coming Soon aktiv)' },
            { name: 'Dozent*in', description: 'Z.B. „David Heider & Marcel Rauminger"' },
            { name: 'Dauer', description: 'Z.B. „10 Stunden Inhalt"' },
            { name: 'Level', description: 'Z.B. „Anfänger" / „Beginner Level"' },
            { name: 'Sortierreihenfolge', description: 'Reihenfolge in der Übersicht (0 = zuerst)' },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Module & Lektionen
        </h3>
        <p className="text-sm" style={{ color: '#626160' }}>
          Jeder Kurs hat <strong>Module</strong>, und jedes Modul hat <strong>Lektionen</strong>.
          Lektionen enthalten ein Video (URL), eine Beschreibung und eine Dauerangabe.
          Die Lektion wird als abgeschlossen markiert, wenn Teilnehmer sie im Kurs-Viewer anklicken.
        </p>

        <InfoCard variant="tip" title="Einschreibungen">
          <p>Wenn ein Kunde einen Kurs kauft (Stripe-Zahlung erfolgreich), wird automatisch eine Einschreibung erstellt. Der Kurs erscheint dann unter „Mein Lernen" im Kundenkonto. Du musst nichts manuell tun.</p>
        </InfoCard>
      </HubSection>

      {/* ── MEDIA ── */}
      <HubSection id="media" title="Bilder & Medien">
        <p>
          Alle Bilder und Videos werden zentral unter <strong>Medien</strong> verwaltet.
          Hochgeladene Dateien werden automatisch optimiert und in der Cloud (Cloudflare R2) gespeichert.
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Bild hochladen
        </h3>
        <StepList
          steps={[
            { title: 'Medien öffnen', desc: 'Klicke links auf „Medien".' },
            { title: 'Neues Medium erstellen', desc: 'Klicke auf „Neues Medium erstellen".' },
            { title: 'Datei wählen', desc: 'Ziehe eine Datei in den Upload-Bereich oder klicke zum Auswählen.' },
            { title: 'Alt-Text eingeben', desc: 'WICHTIG: Gib einen beschreibenden Alt-Text ein (DE + EN). Das ist Pflicht für Barrierefreiheit!' },
            { title: 'Optional: Beschriftung', desc: 'Füge bei Bedarf eine Bildunterschrift hinzu (DE + EN).' },
            { title: 'Fokuspunkt setzen', desc: 'Klicke auf das Bild, um den Fokuspunkt zu setzen. Das bestimmt, wie das Bild zugeschnitten wird.' },
            { title: 'Speichern', desc: 'Das Bild wird automatisch in WebP konvertiert und in 3 Größen gespeichert.' },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Automatische Optimierung
        </h3>
        <p className="text-sm" style={{ color: '#626160' }}>
          Beim Upload passiert Folgendes automatisch:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-sm" style={{ color: '#626160' }}>
          <li><strong>Format:</strong> Konvertierung zu WebP (82% Qualität) für schnelleres Laden</li>
          <li><strong>Größenbeschränkung:</strong> Maximum 2560px Breite</li>
          <li><strong>Responsive Versionen:</strong> Thumbnail (400px), Card (800px), Hero (1920px)</li>
          <li><strong>CDN:</strong> Globale Auslieferung über Cloudflare für schnelle Ladezeiten</li>
        </ul>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Unterstützte Formate
        </h3>
        <ul className="ml-4 list-disc space-y-1 text-sm" style={{ color: '#626160' }}>
          <li><strong>Bilder:</strong> PNG, JPEG, WebP, AVIF, SVG, GIF</li>
          <li><strong>Videos:</strong> MP4, WebM, OGG, MOV</li>
        </ul>

        <InfoCard variant="warning" title="Alt-Text ist Pflicht!">
          <p>Jedes Bild MUSS einen Alt-Text haben (auf Deutsch und Englisch). Das ist gesetzlich vorgeschrieben (Barrierefreiheit) und wichtig für Google (SEO). Beschreibe kurz, was auf dem Bild zu sehen ist.</p>
        </InfoCard>

        <InfoCard variant="tip" title="Bildgröße vor Upload">
          <p>Für die beste Qualität sollten Bilder mindestens 1920px breit sein (für Hero-Bereiche). Für Karten/Thumbnails reichen 1200px. Das System optimiert automatisch, aber zu kleine Bilder werden nicht hochskaliert.</p>
        </InfoCard>
      </HubSection>

      {/* ── NAVIGATION ── */}
      <HubSection id="navigation" title="Navigation & Footer">
        <p>
          Die Navigation (Header) und den Footer findest du unter <strong>Globals</strong> in der linken Seitenleiste.
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Header (Navigation oben)
        </h3>
        <FieldTable
          fields={[
            { name: 'Announcement Bar', description: 'Farbige Leiste ganz oben mit einer Nachricht und optionalem Link. Kann ein-/ausgeschaltet werden.' },
            { name: 'Navigations-Elemente', description: 'Links in der Hauptnavigation. Jeder Link hat ein Label (DE + EN), einen Typ (Seite oder eigene URL) und optionale Dropdown-Unter-Elemente.' },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Navigationslink hinzufügen
        </h3>
        <StepList
          steps={[
            { title: 'Header öffnen', desc: 'Klicke links auf „Globals" → „Header".' },
            { title: 'Neuen Link hinzufügen', desc: 'Klicke bei „Navigations-Elemente" auf „Hinzufügen".' },
            { title: 'Label eingeben', desc: 'Gib den Anzeigetext ein (DE + EN).' },
            {
              title: 'Ziel wählen',
              desc: 'Wähle „Referenz" für eine CMS-Seite oder „Eigene URL" für einen manuellen Link (z.B. /shop).',
            },
            { title: 'Optional: Dropdown', desc: 'Füge Dropdown-Elemente hinzu für ein Untermenü.' },
            { title: 'Speichern', desc: 'Klicke auf „Speichern".' },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Footer
        </h3>
        <FieldTable
          fields={[
            { name: 'Schnelllinks', description: 'Bis zu 8 Links (wie Navigationslinks)' },
            { name: 'Workshop-Links', description: 'Bis zu 6 Links zu Workshop-Seiten' },
            { name: 'Standort', description: 'Adresse (DE + EN), wird im Footer angezeigt' },
            { name: 'Telefon', description: 'Kontakt-Telefonnummer' },
            { name: 'Newsletter-Überschrift', description: 'Titel des Newsletter-Bereichs (DE + EN)' },
            { name: 'Newsletter-Beschreibung', description: 'Kurzer Text zum Newsletter (DE + EN)' },
            { name: 'Social Media', description: 'URLs zu Facebook, Instagram, LinkedIn' },
          ]}
        />
      </HubSection>

      {/* ── TESTIMONIALS ── */}
      <HubSection id="testimonials" title="Testimonials">
        <p>
          Kundenbewertungen werden zentral als <strong>Global</strong> verwaltet und auf mehreren Seiten angezeigt
          (Startseite, Workshops, Kurse).
        </p>
        <StepList
          steps={[
            { title: 'Testimonials öffnen', desc: 'Klicke links auf „Globals" → „Testimonials".' },
            { title: 'Überschrift anpassen', desc: 'Ändere die Eyebrow-Zeile und Überschrift (DE + EN).' },
            { title: 'Testimonial hinzufügen', desc: 'Klicke auf „Hinzufügen" (max. 10 Testimonials).' },
            { title: 'Daten eingeben', desc: 'Zitat (DE + EN), Name, Rolle/Beruf und Bewertung (1–5 Sterne).' },
            { title: 'Speichern', desc: 'Klicke auf „Speichern". Die neuen Testimonials erscheinen überall automatisch.' },
          ]}
        />
      </HubSection>

      {/* ── USERS ── */}
      <HubSection id="users" title="Benutzer">
        <p>
          Unter <strong>Benutzer</strong> findest du alle registrierten Konten. Kunden werden automatisch
          angelegt, wenn sie sich auf der Website registrieren.
        </p>
        <FieldTable
          fields={[
            { name: 'Name', description: 'Vollständiger Name' },
            { name: 'E-Mail', description: 'Login-E-Mail-Adresse' },
            { name: 'Rollen', description: 'admin (Vollzugriff) oder customer (nur eigenes Konto)' },
            { name: 'Bestellungen', description: 'Verknüpfte Bestellungen (automatisch)' },
            { name: 'Warenkorb', description: 'Aktueller Warenkorb (automatisch)' },
            { name: 'Adressen', description: 'Gespeicherte Lieferadressen' },
          ]}
        />

        <InfoCard variant="warning" title="Admin-Rolle">
          <p>Nur Admins können Rollen ändern, Inhalte bearbeiten und das Dashboard nutzen. Gib die Admin-Rolle nur vertrauenswürdigen Personen!</p>
        </InfoCard>
      </HubSection>

      {/* ── LOCALIZATION ── */}
      <HubSection id="localization" title="Sprachen (DE / EN)">
        <p>
          Alle Texte auf der Website sind zweisprachig: <strong>Deutsch</strong> (Standard) und <strong>Englisch</strong>.
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Wie funktioniert die Übersetzung?
        </h3>
        <ul className="ml-4 list-disc space-y-2 text-sm" style={{ color: '#626160' }}>
          <li>
            <strong>Automatische Übersetzung (DeepL):</strong> Wenn du einen deutschen Text speicherst,
            wird die englische Version automatisch über DeepL erzeugt. Das passiert nur in der Produktion.
          </li>
          <li>
            <strong>Manuelle Übersetzung:</strong> Du kannst die englische Version jederzeit manuell
            überschreiben. Manuelle Änderungen werden nie von DeepL überschrieben.
          </li>
          <li>
            <strong>Locale-Umschalter:</strong> Im Admin-Dashboard siehst du oben einen
            Sprachumschalter (DE/EN). Damit wechselst du zwischen den Sprachversionen eines Eintrags.
          </li>
        </ul>

        <InfoCard variant="tip" title="Workflow empfohlen">
          <ol className="mt-1 ml-4 list-decimal space-y-1">
            <li>Immer erst den <strong>deutschen</strong> Text eingeben und speichern.</li>
            <li>Die <strong>englische</strong> Version wird automatisch erstellt (DeepL).</li>
            <li>Bei Bedarf die englische Version <strong>manuell korrigieren</strong>.</li>
          </ol>
        </InfoCard>
      </HubSection>

      {/* ── SEO ── */}
      <HubSection id="seo" title="SEO-Einstellungen">
        <p>
          Jede Seite und jedes Produkt hat einen <strong>SEO-Tab</strong> mit Feldern für die Suchmaschinenoptimierung.
        </p>
        <FieldTable
          fields={[
            { name: 'Meta-Titel', description: 'Seitentitel in Google-Suchergebnissen (50–60 Zeichen optimal)' },
            { name: 'Meta-Beschreibung', description: 'Seitenbeschreibung in Google (150–160 Zeichen optimal)' },
            { name: 'Meta-Bild', description: 'Vorschaubild für Social Media (Facebook, Twitter). Ideal: 1200×630px' },
          ]}
        />
        <InfoCard variant="tip" title="SEO-Tipp">
          <p>Fülle diese Felder immer aus! Ohne Meta-Titel und -Beschreibung zeigt Google einen automatisch generierten Text an, der oft nicht optimal ist.</p>
        </InfoCard>
      </HubSection>

      {/* ── TIPS ── */}
      <HubSection id="tips" title="Tipps & Tricks">
        <div className="space-y-4">
          <InfoCard variant="tip" title="Entwürfe nutzen">
            <p>Du kannst Änderungen als Entwurf speichern, bevor sie live gehen. So kannst du in Ruhe arbeiten, ohne dass Besucher unfertige Inhalte sehen.</p>
          </InfoCard>

          <InfoCard variant="tip" title="Live-Vorschau">
            <p>Klicke auf „Live-Vorschau" im Admin, um zu sehen, wie deine Änderungen auf der echten Website aussehen — ohne sie zu veröffentlichen.</p>
          </InfoCard>

          <InfoCard variant="tip" title="Bilder optimieren">
            <p>Verwende wenn möglich WebP- oder JPEG-Bilder statt PNG. Das System konvertiert zwar automatisch, aber die Upload-Geschwindigkeit ist mit kleineren Dateien besser. Ideale Breite: 1920px für Hero-Bilder, 1200px für Produktbilder.</p>
          </InfoCard>

          <InfoCard variant="tip" title="Reihenfolge von Blöcken">
            <p>Blöcke auf Seiten können per Drag & Drop umsortiert werden. Die Reihenfolge im Admin ist die Reihenfolge auf der Website.</p>
          </InfoCard>

          <InfoCard variant="warning" title="Nicht löschen ohne nachzudenken">
            <p>Das Löschen von Seiten, Produkten oder Workshops ist sofort wirksam und kann nicht rückgängig gemacht werden! Wenn du unsicher bist, deaktiviere den Eintrag lieber (z.B. „Veröffentlicht: Nein").</p>
          </InfoCard>

          <InfoCard variant="important" title="Hilfe">
            <p>Bei Fragen oder Problemen wende dich an das Entwicklungsteam. Lieber einmal zu viel fragen als etwas versehentlich löschen!</p>
          </InfoCard>
        </div>
      </HubSection>
    </HubShell>
  )
}
