/* eslint-disable react/no-unescaped-entities */
'use client'

import { FieldTable, HubSection, HubShell, InfoCard, StepList, type TocSection, useT } from '../HubShell'

export default function AdminHubPage() {
  const t = useT()

  const sections: TocSection[] = [
    { id: 'getting-started', title: t('Erste Schritte', 'Getting Started') },
    { id: 'pages', title: t('Seiten verwalten', 'Managing Pages') },
    { id: 'products', title: t('Produkte', 'Products') },
    { id: 'categories', title: t('Kategorien', 'Categories') },
    { id: 'workshops', title: 'Workshops' },
    { id: 'appointments', title: t('Workshop-Termine', 'Workshop Dates') },
    { id: 'locations', title: t('Standorte', 'Locations') },
    { id: 'bookings', title: t('Buchungen', 'Bookings') },
    { id: 'vouchers', title: t('Gutscheine', 'Vouchers') },
    { id: 'online-courses', title: t('Online-Kurse', 'Online Courses') },
    { id: 'media', title: t('Bilder & Medien', 'Images & Media') },
    { id: 'navigation', title: 'Navigation & Footer' },
    { id: 'testimonials', title: 'Testimonials' },
    { id: 'users', title: t('Benutzer', 'Users') },
    { id: 'localization', title: t('Sprachen (DE/EN)', 'Languages (DE/EN)') },
    { id: 'seo', title: t('SEO-Einstellungen', 'SEO Settings') },
    { id: 'tips', title: t('Tipps & Tricks', 'Tips & Tricks') },
  ]

  return (
    <HubShell
      title="Admin Hub"
      subtitle={t('Anleitungen für Redakteure', 'Guides for Editors')}
      accentColor="#555954"
      sections={sections}
    >
      {/* ── GETTING STARTED ── */}
      <HubSection id="getting-started" title={t('Erste Schritte', 'Getting Started')}>
        <p className="text-base leading-relaxed">
          {t(
            'Willkommen im Admin Hub! Hier findest du alle Anleitungen, um die FermentFreude-Website über das Admin-Dashboard zu verwalten. Du brauchst keine technischen Kenntnisse — alles wird Schritt für Schritt erklärt.',
            'Welcome to the Admin Hub! Here you\'ll find all the guides for managing the FermentFreude website via the admin dashboard. No technical skills needed — everything is explained step by step.',
          )}
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Einloggen', 'Logging In')}
        </h3>
        <StepList
          steps={[
            {
              title: t('Admin-Dashboard öffnen', 'Open Admin Dashboard'),
              desc: t('Gehe zu deiner Website-URL und hänge /admin an (z.B. fermentfreude.vercel.app/admin).', 'Go to your website URL and append /admin (e.g. fermentfreude.vercel.app/admin).'),
            },
            {
              title: t('Anmelden', 'Sign In'),
              desc: t('Gib deine E-Mail-Adresse und dein Passwort ein und klicke auf „Anmelden".', 'Enter your email and password and click "Sign In".'),
            },
            {
              title: t('Dashboard erkunden', 'Explore the Dashboard'),
              desc: t('Du siehst nun die Übersicht mit allen Bereichen in der linken Seitenleiste.', 'You will see the overview with all sections in the left sidebar.'),
            },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Aufbau des Dashboards', 'Dashboard Structure')}
        </h3>
        <p>
          {t(
            'Das Dashboard ist in übersichtliche Bereiche aufgeteilt:',
            'The dashboard is organized into clear sections:',
          )}
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Bereich', 'Section')}</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Enthält', 'Contains')}</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                [t('Nutzer', 'Users'), 'Users'],
                [t('Inhalt', 'Content'), 'Pages, Categories, Media, Posts, Forms, Form Submissions'],
                ['Online Kurse', 'Course Progresses, Enrollments, Online Courses'],
                ['Workshops', 'Workshops, Workshop Locations, Workshop Appointments, Workshop Bookings'],
                ['Shop', 'Vouchers, Products, Orders'],
                ['Ecommerce', 'Carts, Transactions'],
                ['Website', t('Header, Footer, Testimonials, Sponsors Bar, Gutschein CTA, Workshop Slider, Produkt Slider, Workshop Cards', 'Header, Footer, Testimonials, Sponsors Bar, Voucher CTA, Workshop Slider, Product Slider, Workshop Cards')],
              ].map(([section, contains], i) => (
                <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: '#555954' }}>{section}</td>
                  <td className="px-4 py-2.5">{contains}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm" style={{ color: '#626160' }}>
          {t(
            'Der Bereich „Website" in der Seitenleiste enthält globale Einstellungen, die auf der gesamten Seite gelten (z. B. Navigation, Footer-Inhalte, Testimonials).',
            'The "Website" section in the sidebar contains global settings that apply across the entire site (e.g. navigation, footer content, testimonials).',
          )}
        </p>
      </HubSection>

      {/* ── PAGES ── */}
      <HubSection id="pages" title={t('Seiten verwalten', 'Managing Pages')}>
        <p>
          {t(
            'Unter Inhalt → Seiten findest du alle Seiten der Website. Jede Seite besteht aus einem Hero-Bereich (großes Bild/Slider oben) und Inhaltsblöcken (einzelne Abschnitte, die du frei zusammenstellen kannst).',
            'Under Content → Pages you\'ll find all website pages. Each page consists of a Hero section (large image/slider at the top) and content blocks (individual sections you can freely compose).',
          )}
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Bestehende Seite bearbeiten', 'Editing an Existing Page')}
        </h3>
        <StepList
          steps={[
            { title: t('Seite finden', 'Find Page'), desc: t('Klicke links auf „Seiten" und suche die gewünschte Seite in der Liste.', 'Click "Pages" on the left and find the desired page in the list.') },
            { title: t('Seite öffnen', 'Open Page'), desc: t('Klicke auf den Titel der Seite, um sie zu bearbeiten.', 'Click the page title to edit it.') },
            { title: t('Inhalte ändern', 'Edit Content'), desc: t('Ändere Texte, Bilder oder Blöcke nach Bedarf. Alle Textfelder haben ein DE- und EN-Feld.', 'Change text, images, or blocks as needed. All text fields have a DE and EN field.') },
            { title: t('Speichern', 'Save'), desc: t('Klicke oben rechts auf „Speichern" (oder „Entwurf speichern" für Entwürfe).', 'Click "Save" in the top right (or "Save Draft" for drafts).') },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Blöcke hinzufügen & anordnen', 'Adding & Arranging Blocks')}
        </h3>
        <p>
          {t(
            'Jede Seite hat einen Bereich „Layout" (im Tab „Inhalt"). Dort siehst du alle aktuellen Blöcke. Du kannst:',
            'Each page has a "Layout" section (in the "Content" tab). There you\'ll see all current blocks. You can:',
          )}
        </p>
        <ul className="ml-4 list-disc space-y-1 text-sm" style={{ color: '#626160' }}>
          <li><strong>{t('Block hinzufügen', 'Add Block')}</strong> — {t('Klicke auf „Block hinzufügen" am Ende der Liste und wähle einen Block-Typ.', 'Click "Add Block" at the end of the list and choose a block type.')}</li>
          <li><strong>{t('Block verschieben', 'Move Block')}</strong> — {t('Nutze die Drag-Handles (⋮⋮) links neben jedem Block.', 'Use the drag handles (⋮⋮) to the left of each block.')}</li>
          <li><strong>{t('Block löschen', 'Delete Block')}</strong> — {t('Klicke das ✕ oben rechts am Block.', 'Click the ✕ at the top right of the block.')}</li>
        </ul>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Verfügbare Block-Typen', 'Available Block Types')}
        </h3>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Block</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Was er tut', 'What it does')}</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                ['Banner', t('Info-, Warn- oder Erfolgsmeldung (farbig hervorgehoben)', 'Info, warning, or success alert (color-highlighted)')],
                ['Content', t('Text-Spalten mit optionalen Links (1–3 Spalten)', 'Text columns with optional links (1–3 columns)')],
                ['Call to Action', t('Großer Aufruf mit Überschrift und Buttons', 'Large call-to-action with heading and buttons')],
                ['Media Block', t('Einzelnes Bild oder Video mit Beschriftung', 'Single image or video with caption')],
                ['Carousel', t('Bilder-Karussell mit mehreren Slides', 'Image carousel with multiple slides')],
                ['Feature Cards', t('Karten mit Icons, Titel und Beschreibung', 'Cards with icons, title, and description')],
                ['Product Slider', t('Produktkarussell (zeigt ausgewählte Produkte)', 'Product carousel (shows selected products)')],
                ['Workshop Slider', t('Workshop-Karussell mit nächsten Terminen', 'Workshop carousel with upcoming dates')],
                ['Online Course Slider', t('Karussell mit Online-Kursen', 'Online course carousel')],
                ['Testimonials', t('Kundenbewertungen als Slider', 'Customer testimonials as slider')],
                ['Team Cards', t('Teammitglieder mit Foto, Name und Rolle', 'Team members with photo, name, and role')],
                ['Our Story', t('Markengeschichte mit Timeline und Bildern', 'Brand story with timeline and images')],
                ['Contact Block', t('Kontaktformular mit Kontaktinfos', 'Contact form with contact info')],
                ['Shop Hero', t('Hero-Bereich für die Shop-Seite', 'Hero section for the shop page')],
                ['Shop Product Grid', t('Produktraster mit Filter & Sortierung', 'Product grid with filter & sorting')],
                ['Featured Product Cards', t('Hervorgehobene Produkte als Karten', 'Featured products as cards')],
                ['Voucher CTA', t('Gutschein-Aufruf mit Bild und Button', 'Voucher CTA with image and button')],
                ['Sponsors Bar', t('Sponsor-Logos in einer Leiste', 'Sponsor logos in a bar')],
                ['Ready to Learn CTA', t('„Bereit zu lernen?" Aufruf-Bereich', '"Ready to Learn?" CTA section')],
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
          {t('Hero-Bereich (Startbild)', 'Hero Section (Header Image)')}
        </h3>
        <p>
          {t(
            'Jede Seite hat einen Hero-Tab. Dort wählst du den Typ des Hero-Bereichs aus:',
            'Each page has a Hero tab. There you select the hero section type:',
          )}
        </p>
        <ul className="ml-4 list-disc space-y-1 text-sm" style={{ color: '#626160' }}>
          <li><strong>Hero Slider</strong> — {t('Vollbild-Karussell mit 4 Slides (für die Startseite)', 'Full-screen carousel with 4 slides (for the home page)')}</li>
          <li><strong>Hero Carousel</strong> — {t('Mehrere Slides mit Bildern', 'Multiple slides with images')}</li>
          <li><strong>Hero Split</strong> — {t('Bild links, Text rechts (oder umgekehrt)', 'Image left, text right (or vice versa)')}</li>
          <li><strong>High Impact</strong> — {t('Großes Statement mit Überschrift', 'Large statement with heading')}</li>
          <li><strong>Food Presentation Slider</strong> — {t('Produktpräsentation für Lebensmittel', 'Food product presentation')}</li>
        </ul>

        <InfoCard variant="tip" title={t('Startseite (Home)', 'Home Page')}>
          <p>{t('Die Startseite hat einen festen Hero Slider mit 4 Slides (Basics, Lakto, Kombucha, Tempeh). Du kannst die Texte und Bilder jedes Slides bearbeiten, aber die Anzahl und Reihenfolge ist fest.', 'The home page has a fixed Hero Slider with 4 slides (Basics, Lakto, Kombucha, Tempeh). You can edit the text and images of each slide, but the number and order are fixed.')}</p>
        </InfoCard>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Wichtige Seiten', 'Important Pages')}
        </h3>
        <ul className="ml-4 list-disc space-y-1 text-sm" style={{ color: '#626160' }}>
          <li><strong>home</strong> — {t('Startseite der Website', 'Website home page')}</li>
          <li><strong>shop</strong> — {t('Online-Shop Seite', 'Online shop page')}</li>
          <li><strong>gastronomy</strong> — {t('B2B-Angebot für Gastronomie', 'B2B offering for gastronomy')}</li>
          <li><strong>fermentation</strong> — {t('Wissensseite über Fermentation', 'Knowledge page about fermentation')}</li>
          <li><strong>about</strong> — {t('Über uns', 'About us')}</li>
          <li><strong>contact</strong> — {t('Kontakt', 'Contact')}</li>
        </ul>
      </HubSection>

      {/* ── PRODUCTS ── */}
      <HubSection id="products" title={t('Produkte', 'Products')}>
        <p>
          {t(
            'Unter Shop → Produkte findest du alle Produkte. Jedes Produkt hat einen Typ, der bestimmt, welche Felder angezeigt werden.',
            'Under Shop → Products you\'ll find all products. Each product has a type that determines which fields are displayed.',
          )}
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Neues Produkt anlegen', 'Creating a New Product')}
        </h3>
        <StepList
          steps={[
            { title: t('Neues Produkt erstellen', 'Create New Product'), desc: t('Klicke links auf „Produkte" und dann oben rechts auf „Neues Produkt erstellen".', 'Click "Products" on the left, then "Create New Product" in the top right.') },
            { title: t('Produkttyp wählen', 'Choose Product Type'), desc: t('Wähle den Typ: Im Glas (jarred), Frisch (fresh), Getränk (bottled), Workshop oder Online-Kurs (digital-course).', 'Select the type: Jarred, Fresh, Bottled, Workshop, or Digital Course.') },
            { title: t('Grunddaten ausfüllen', 'Fill in Basic Data'), desc: t('Titel (DE + EN), Kurzbeschreibung, Marke, Geschmacksrichtung eingeben.', 'Enter title (DE + EN), short description, brand, flavor.') },
            { title: t('Bilder hochladen', 'Upload Images'), desc: t('Im Bereich „Galerie" Bilder hinzufügen. Für jedes Bild ein Medien-Objekt auswählen oder neu hochladen.', 'Add images in the "Gallery" section. Select existing media or upload new ones.') },
            { title: t('Preis eingeben', 'Enter Price'), desc: t('Im Bereich „Preis" den Preis in CENT eingeben (z.B. 990 für 9,90 €, 9900 für 99,00 €).', 'Enter the price in CENTS in the "Price" section (e.g. 990 for €9.90, 9900 for €99.00).') },
            { title: t('Kategorie zuweisen', 'Assign Category'), desc: t('Im Bereich „Kategorien" die passende Kategorie auswählen.', 'Select the appropriate category in the "Categories" section.') },
            { title: t('Speichern', 'Save'), desc: t('Klicke auf „Speichern". Das Produkt erscheint nun im Shop.', 'Click "Save". The product will now appear in the shop.') },
          ]}
        />

        <InfoCard variant="important" title={t('Preise immer in Cent!', 'Prices Always in Cents!')}>
          <p>
            {t('Preise werden in Cent eingegeben, nicht in Euro. Beispiele:', 'Prices are entered in cents, not euros. Examples:')}
          </p>
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li>{t('9,90 €', '€9.90')} → <strong>990</strong> {t('eingeben', 'enter')}</li>
            <li>{t('25,00 €', '€25.00')} → <strong>2500</strong> {t('eingeben', 'enter')}</li>
            <li>{t('99,00 €', '€99.00')} → <strong>9900</strong> {t('eingeben', 'enter')}</li>
            <li>{t('149,50 €', '€149.50')} → <strong>14950</strong> {t('eingeben', 'enter')}</li>
          </ul>
          <p className="mt-2">{t('Die Website rechnet automatisch in Euro um und zeigt z.B. „€9,90" an.', 'The website automatically converts to euros and displays e.g. "€9.90".')}</p>
        </InfoCard>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Produkttypen', 'Product Types')}
        </h3>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Typ', 'Type')}</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Beschreibung', 'Description')}</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Spezielle Felder', 'Special Fields')}</th>
              </tr>
            </thead>
            <tbody style={{ color: '#626160' }}>
              {[
                [t('Im Glas (jarred)', 'Jarred'), t('Fermentierte Produkte im Glas', 'Fermented products in jars'), t('Zutaten, Allergene, Lagerung, Haltbarkeit, Einheitsgröße', 'Ingredients, allergens, storage, shelf life, unit size')],
                [t('Frisch (fresh)', 'Fresh'), t('Frische Fermentationsprodukte', 'Fresh fermentation products'), t('Zutaten, Allergene, Lagerung, Einheitsgröße', 'Ingredients, allergens, storage, unit size')],
                [t('Getränk (bottled)', 'Bottled'), t('Fermentierte Getränke', 'Fermented beverages'), t('Zutaten, Allergene, Lagerung, Einheitsgröße', 'Ingredients, allergens, storage, unit size')],
                ['Workshop', t('Buchbare Workshops', 'Bookable workshops'), t('Verknüpfung mit Workshop-System', 'Linked to workshop system')],
                [t('Online-Kurs (digital-course)', 'Digital Course'), t('Digitale Lerninhalte', 'Digital learning content'), t('Kurs-Slug, Verknüpfung mit Kurs-System', 'Course slug, linked to course system')],
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
          {t('Produkt-Felder im Detail', 'Product Fields in Detail')}
        </h3>
        <FieldTable
          fields={[
            { name: t('Titel', 'Title'), description: t('Produktname (lokalisiert: DE + EN)', 'Product name (localized: DE + EN)'), required: true },
            { name: 'Slug', description: t('URL-Pfad (automatisch generiert aus Titel)', 'URL path (auto-generated from title)'), required: true },
            { name: t('Kurzbeschreibung', 'Short Description'), description: t('Kurzer Teaser, erscheint unter dem Titel auf der Produktseite', 'Brief teaser, shown below the title on the product page') },
            { name: t('Marke', 'Brand'), description: t('Markenname (z.B. FermentFreude)', 'Brand name (e.g. FermentFreude)') },
            { name: t('Geschmacksrichtung', 'Flavor'), description: t('Z.B. „Ingwer & Zitrone" — erscheint in der Spec-Tabelle', 'E.g. "Ginger & Lemon" — shown in the spec table') },
            { name: t('Beschreibung', 'Description'), description: t('Ausführliche Beschreibung (Rich-Text mit Formatierung)', 'Detailed description (rich text with formatting)') },
            { name: t('Galerie', 'Gallery'), description: t('Produktbilder. Mehrere Bilder möglich (werden als Slider angezeigt)', 'Product images. Multiple images supported (displayed as slider)') },
            { name: t('Vorteile (Benefits)', 'Benefits'), description: t('Feature-Badges, z.B. „Probiotisch", „Bio", „Handgemacht"', 'Feature badges, e.g. "Probiotic", "Organic", "Handmade"') },
            { name: t('Abzeichen (Badges)', 'Badges'), description: t('Zertifizierungs-Icons: vegan, bio, glutenfrei, etc.', 'Certification icons: vegan, organic, gluten-free, etc.') },
            { name: t('Über das Produkt', 'About the Product'), description: t('Aufklappbarer Bereich mit ausführlicher Produktinfo', 'Expandable section with detailed product info') },
            { name: t('Wie verwenden?', 'How to Use?'), description: t('Aufklappbarer Bereich mit Anwendungstipps', 'Expandable section with usage tips') },
            { name: t('Hinweise', 'Notes'), description: t('Aufklappbarer Bereich mit Nutzungshinweisen', 'Expandable section with usage notes') },
            { name: t('Preis (in Cent)', 'Price (in Cents)'), description: t('Preis in EUR-Cent. 990 = 9,90 €', 'Price in EUR cents. 990 = €9.90'), required: true },
            { name: t('Lagerbestand', 'Inventory'), description: t('Verfügbare Menge. 0 = ausverkauft', 'Available quantity. 0 = sold out') },
            { name: t('Verwandte Produkte', 'Related Products'), description: t('Cross-Sell: Wähle Produkte, die als Empfehlung angezeigt werden', 'Cross-sell: select products shown as recommendations') },
            { name: t('Kategorien', 'Categories'), description: t('Produktkategorien zuweisen', 'Assign product categories') },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Lebensmittel-spezifische Felder', 'Food-Specific Fields')}
        </h3>
        <p className="text-sm" style={{ color: '#626160' }}>
          {t(
            'Diese Felder erscheinen nur bei Produkttypen „Im Glas", „Frisch" und „Getränk":',
            'These fields only appear for product types "Jarred", "Fresh", and "Bottled":',
          )}
        </p>
        <FieldTable
          fields={[
            { name: t('Einheitsgröße', 'Unit Size'), description: t('Z.B. „350g", „200ml", „1 Stück"', 'E.g. "350g", "200ml", "1 piece"') },
            { name: t('Zutaten', 'Ingredients'), description: t('Vollständige Zutatenliste', 'Complete ingredients list') },
            { name: t('Allergene', 'Allergens'), description: t('Allergenhinweise', 'Allergen information') },
            { name: t('Lagerhinweise', 'Storage Instructions'), description: t('Z.B. „Kühl aufbewahren"', 'E.g. "Keep refrigerated"') },
            { name: t('Haltbarkeit', 'Shelf Life'), description: t('Z.B. „6 Monate ungeöffnet"', 'E.g. "6 months unopened"') },
            { name: t('Bio-Zertifizierung', 'Organic Certification'), description: t('Häkchen: Ist das Produkt bio-zertifiziert?', 'Checkbox: Is the product organically certified?') },
            { name: 'Vegan', description: t('Häkchen: Ist das Produkt vegan?', 'Checkbox: Is the product vegan?') },
            { name: t('Glutenfrei', 'Gluten-Free'), description: t('Häkchen: Ist das Produkt glutenfrei?', 'Checkbox: Is the product gluten-free?') },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Varianten', 'Variants')}
        </h3>
        <p className="text-sm" style={{ color: '#626160' }}>
          {t(
            'Wenn ein Produkt in verschiedenen Größen oder Optionen verfügbar ist, aktiviere „Varianten aktivieren" (enableVariants). Dann kannst du Variantentypen (z.B. Größe) und einzelne Optionen (z.B. Klein, Groß) zuweisen.',
            'If a product is available in different sizes or options, enable "Enable Variants" (enableVariants). Then you can assign variant types (e.g. Size) and individual options (e.g. Small, Large).',
          )}
        </p>
      </HubSection>

      {/* ── CATEGORIES ── */}
      <HubSection id="categories" title={t('Kategorien', 'Categories')}>
        <p>
          {t(
            'Kategorien helfen, Produkte im Shop zu organisieren. Du findest sie unter Shop → Kategorien.',
            'Categories help organize products in the shop. You can find them under Shop → Categories.',
          )}
        </p>
        <StepList
          steps={[
            { title: t('Neue Kategorie erstellen', 'Create New Category'), desc: t('Klicke auf „Neue Kategorie erstellen".', 'Click "Create New Category".') },
            { title: t('Name eingeben', 'Enter Name'), desc: t('Gib den Kategorienamen auf Deutsch und Englisch ein (z.B. „Fermentierte Getränke" / „Fermented Beverages").', 'Enter the category name in German and English (e.g. "Fermentierte Getränke" / "Fermented Beverages").') },
            { title: t('Speichern', 'Save'), desc: t('Der Slug wird automatisch generiert. Klicke auf „Speichern".', 'The slug is auto-generated. Click "Save".') },
            { title: t('Produkte zuweisen', 'Assign Products'), desc: t('Gehe zu jedem Produkt und wähle die Kategorie im Feld „Kategorien" aus.', 'Go to each product and select the category in the "Categories" field.') },
          ]}
        />
        <FieldTable
          fields={[
            { name: t('Titel', 'Title'), description: t('Kategoriename (lokalisiert: DE + EN)', 'Category name (localized: DE + EN)'), required: true },
            { name: 'Slug', description: t('URL-Kennung (automatisch generiert)', 'URL identifier (auto-generated)'), required: true },
          ]}
        />
      </HubSection>

      {/* ── WORKSHOPS ── */}
      <HubSection id="workshops" title="Workshops">
        <p>
          {t(
            'Workshops werden unter Workshops → Workshops verwaltet. Ein Workshop beschreibt die allgemeinen Informationen (Titel, Beschreibung, Preis). Die konkreten Termine kommen separat (siehe „Workshop-Termine").',
            'Workshops are managed under Workshops → Workshops. A workshop describes the general information (title, description, price). Specific dates are managed separately (see "Workshop Dates").',
          )}
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Bestehende Workshops', 'Existing Workshops')}
        </h3>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3EF' }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Workshop</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Slug</th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Max. Teilnehmer', 'Max. Participants')}</th>
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
          {t('Workshop bearbeiten', 'Editing a Workshop')}
        </h3>
        <FieldTable
          fields={[
            { name: 'Slug', description: t('URL-Kennung (z.B. „kombucha"). NICHT ändern nach Erstellung!', 'URL identifier (e.g. "kombucha"). DO NOT change after creation!'), required: true },
            { name: t('Titel', 'Title'), description: t('Workshop-Name (DE + EN)', 'Workshop name (DE + EN)'), required: true },
            { name: t('Beschreibung', 'Description'), description: t('Ausführliche Beschreibung (Rich-Text, DE + EN)', 'Detailed description (rich text, DE + EN)') },
            { name: t('Grundpreis', 'Base Price'), description: t('Preis pro Person in Euro (z.B. 99)', 'Price per person in euros (e.g. 99)'), required: true },
            { name: t('Max. Teilnehmer', 'Max. Participants'), description: t('Maximal 12 pro Termin (fest eingestellt)', 'Maximum 12 per session (fixed)') },
            { name: t('Bild', 'Image'), description: t('Hero-Bild für die Workshop-Seite', 'Hero image for the workshop page') },
            { name: t('Aktiv', 'Active'), description: t('Häkchen: Ist der Workshop auf der Website sichtbar?', 'Checkbox: Is the workshop visible on the website?') },
          ]}
        />

        <InfoCard variant="warning" title={t('Slug nicht ändern', 'Do Not Change Slug')}>
          <p>{t('Der Slug eines Workshops (z.B. „kombucha") wird überall referenziert — in URLs, Buchungen und Produkten. Ändere ihn niemals nach der Erstellung!', 'The slug of a workshop (e.g. "kombucha") is referenced everywhere — in URLs, bookings, and products. Never change it after creation!')}</p>
        </InfoCard>
      </HubSection>

      {/* ── APPOINTMENTS ── */}
      <HubSection id="appointments" title={t('Workshop-Termine', 'Workshop Dates')}>
        <p>
          {t(
            'Unter Workshops → Termine legst du konkrete Workshop-Daten und -Uhrzeiten an. Jeder Termin gehört zu einem Workshop und einem Standort.',
            'Under Workshops → Dates you create specific workshop dates and times. Each date belongs to a workshop and a location.',
          )}
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Neuen Termin anlegen', 'Creating a New Date')}
        </h3>
        <StepList
          steps={[
            { title: t('Termin erstellen', 'Create Date'), desc: t('Klicke auf „Neuen Termin erstellen".', 'Click "Create New Date".') },
            { title: t('Workshop auswählen', 'Select Workshop'), desc: t('Wähle den zugehörigen Workshop (z.B. „Kombucha").', 'Select the associated workshop (e.g. "Kombucha").') },
            { title: t('Standort auswählen', 'Select Location'), desc: t('Wähle den Veranstaltungsort (z.B. „Ginery, Graz").', 'Select the venue (e.g. "Ginery, Graz").') },
            { title: t('Datum & Uhrzeit setzen', 'Set Date & Time'), desc: t('Wähle Datum und Uhrzeit. Muss in der Zukunft liegen!', 'Select date and time. Must be in the future!') },
            { title: t('Verfügbare Plätze', 'Available Spots'), desc: t('Standard: 12. Verringere bei Bedarf (z.B. wenn Plätze schon offline reserviert sind).', 'Default: 12. Reduce if needed (e.g. if spots are already reserved offline).') },
            { title: t('Veröffentlichen', 'Publish'), desc: t('Aktiviere „Veröffentlicht" und klicke „Speichern".', 'Enable "Published" and click "Save".') },
          ]}
        />

        <FieldTable
          fields={[
            { name: 'Workshop', description: t('Welcher Workshop (z.B. Kombucha, Tempeh)', 'Which workshop (e.g. Kombucha, Tempeh)'), required: true },
            { name: t('Standort', 'Location'), description: t('Veranstaltungsort', 'Venue'), required: true },
            { name: t('Datum & Uhrzeit', 'Date & Time'), description: t('Startzeit des Workshops (muss in der Zukunft liegen)', 'Workshop start time (must be in the future)'), required: true },
            { name: t('Verfügbare Plätze', 'Available Spots'), description: t('Zwischen 0 und 12. 0 = ausverkauft, 12 = voll verfügbar', 'Between 0 and 12. 0 = sold out, 12 = fully available') },
            { name: t('Veröffentlicht', 'Published'), description: t('Nur veröffentlichte Termine sind auf der Website sichtbar', 'Only published dates are visible on the website') },
            { name: t('Notizen', 'Notes'), description: t('Interne Notizen (nicht für Kunden sichtbar)', 'Internal notes (not visible to customers)') },
          ]}
        />

        <InfoCard variant="tip" title={t('Ausgebuchte Termine', 'Fully Booked Dates')}>
          <p>{t('Wenn alle Plätze gebucht sind, sinkt „Verfügbare Plätze" auf 0 und der Termin wird als „Ausgebucht" angezeigt. Du musst nichts manuell tun.', 'When all spots are booked, "Available Spots" drops to 0 and the date is shown as "Sold Out". You don\'t need to do anything manually.')}</p>
        </InfoCard>
      </HubSection>

      {/* ── LOCATIONS ── */}
      <HubSection id="locations" title={t('Standorte', 'Locations')}>
        <p>
          {t(
            'Unter Workshops → Standorte verwaltest du die Veranstaltungsorte.',
            'Under Workshops → Locations you manage the venues.',
          )}
        </p>
        <FieldTable
          fields={[
            { name: 'Name', description: t('Standort-Name (z.B. „Ginery")', 'Location name (e.g. "Ginery")'), required: true },
            { name: t('Adresse', 'Address'), description: t('Vollständige Adresse (Straße, PLZ, Stadt, Land)', 'Full address (street, ZIP, city, country)'), required: true },
            { name: t('Zeitzone', 'Timezone'), description: t('Z.B. „Europe/Vienna" (optional)', 'E.g. "Europe/Vienna" (optional)') },
            { name: t('Aktiv', 'Active'), description: t('Nur aktive Standorte können für Termine ausgewählt werden', 'Only active locations can be selected for dates') },
          ]}
        />
        <InfoCard variant="default" title={t('Aktueller Standort', 'Current Location')}>
          <p>{t('Derzeit gibt es einen Standort: Ginery, Grabenstraße 15, 8010 Graz, Österreich.', 'Currently there is one location: Ginery, Grabenstraße 15, 8010 Graz, Austria.')}</p>
        </InfoCard>
      </HubSection>

      {/* ── BOOKINGS ── */}
      <HubSection id="bookings" title={t('Buchungen', 'Bookings')}>
        <p>
          {t(
            'Workshops → Buchungen zeigt alle Workshop-Reservierungen. Buchungen werden automatisch erstellt, wenn Kunden einen Workshop über die Website buchen.',
            'Workshops → Bookings shows all workshop reservations. Bookings are automatically created when customers book a workshop via the website.',
          )}
        </p>
        <FieldTable
          fields={[
            { name: 'Workshop-Slug', description: t('Welcher Workshop gebucht wurde', 'Which workshop was booked') },
            { name: t('Termin-ID', 'Date ID'), description: t('Referenz zum konkreten Termin', 'Reference to the specific date') },
            { name: 'Workshop-Titel', description: t('Name des Workshops', 'Workshop name') },
            { name: t('Datum / Uhrzeit', 'Date / Time'), description: t('Wann der Workshop stattfindet', 'When the workshop takes place') },
            { name: t('Gästeanzahl', 'Number of Guests'), description: t('Wie viele Personen (1–12)', 'How many people (1–12)') },
            { name: t('Preis pro Person', 'Price per Person'), description: t('Einzelpreis in Euro', 'Individual price in euros') },
            { name: t('Gesamtpreis', 'Total Price'), description: t('Gesamtbetrag in Euro', 'Total amount in euros') },
            { name: 'E-Mail', description: t('Kontakt-E-Mail des Kunden', 'Customer contact email') },
            { name: t('Vor- / Nachname', 'First / Last Name'), description: t('Name des Kunden', 'Customer name') },
          ]}
        />
        <InfoCard variant="tip" title={t('Buchungsbestätigung', 'Booking Confirmation')}>
          <p>{t('Nach jeder Buchung wird automatisch eine Bestätigungs-E-Mail über Brevo (E-Mail-Service) an den Kunden gesendet.', 'After each booking, a confirmation email is automatically sent to the customer via Brevo (email service).')}</p>
        </InfoCard>
      </HubSection>

      {/* ── VOUCHERS ── */}
      <HubSection id="vouchers" title={t('Gutscheine', 'Vouchers')}>
        <p>
          {t(
            'Unter Workshops → Gutscheine kannst du Geschenkgutscheine für Workshops erstellen und verwalten.',
            'Under Workshops → Vouchers you can create and manage gift vouchers for workshops.',
          )}
        </p>
        <StepList
          steps={[
            { title: t('Gutschein erstellen', 'Create Voucher'), desc: t('Klicke auf „Neuen Gutschein erstellen".', 'Click "Create New Voucher".') },
            { title: t('Workshop wählen', 'Select Workshop'), desc: t('Wähle, für welchen Workshop der Gutschein gilt.', 'Select which workshop the voucher applies to.') },
            { title: t('Wert festlegen', 'Set Value'), desc: t('Standard: 99 € (Preis eines Workshops). Kann angepasst werden.', 'Default: €99 (price of a workshop). Can be adjusted.') },
            { title: t('Speichern', 'Save'), desc: t('Ein einzigartiger Code wird automatisch generiert (z.B. „KOMBUCHA-GIFT-ABC123").', 'A unique code is automatically generated (e.g. "KOMBUCHA-GIFT-ABC123").') },
          ]}
        />
        <FieldTable
          fields={[
            { name: 'Code', description: t('Automatisch generiert (z.B. „TEMPEH-GIFT-XY789"). Nur lesen.', 'Auto-generated (e.g. "TEMPEH-GIFT-XY789"). Read-only.') },
            { name: 'Workshop', description: t('Für welchen Workshop der Gutschein gilt', 'Which workshop the voucher applies to'), required: true },
            { name: t('Wert', 'Value'), description: t('Gutscheinwert in Euro (Standard: 99)', 'Voucher value in euros (default: 99)') },
            { name: t('Eingelöst', 'Redeemed'), description: t('Ob der Gutschein bereits verwendet wurde (automatisch)', 'Whether the voucher has been used (automatic)') },
            { name: t('Eingelöst am', 'Redeemed On'), description: t('Datum der Einlösung (automatisch)', 'Redemption date (automatic)') },
            { name: t('Eingelöst von', 'Redeemed By'), description: t('Welcher Benutzer eingelöst hat (automatisch)', 'Which user redeemed (automatic)') },
            { name: t('Notizen', 'Notes'), description: t('Interne Notizen', 'Internal notes') },
          ]}
        />
      </HubSection>

      {/* ── ONLINE COURSES ── */}
      <HubSection id="online-courses" title={t('Online-Kurse', 'Online Courses')}>
        <p>
          {t(
            'Unter Online Kurse → Online Kurse verwaltest du digitale Lerninhalte. Jeder Kurs hat Karten-Informationen (für die Übersichtsseite), einen Hero-Bereich und Module mit Lektionen.',
            'Under Online Courses → Online Courses you manage digital learning content. Each course has card info (for the overview page), a hero section, and modules with lessons.',
          )}
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Kurs anlegen', 'Creating a Course')}
        </h3>
        <StepList
          steps={[
            { title: t('Kurs erstellen', 'Create Course'), desc: t('Klicke auf „Neuen Online-Kurs erstellen".', 'Click "Create New Online Course".') },
            { title: t('Grunddaten eingeben', 'Enter Basic Data'), desc: t('Titel, Slug, Beschreibung, Karten-Bild, Dozent*in, Dauer, Level.', 'Title, slug, description, card image, instructor, duration, level.') },
            { title: t('Module & Lektionen', 'Modules & Lessons'), desc: t('Im Tab „Module" Module anlegen. Jedes Modul enthält Lektionen mit Video-URL, Beschreibung und Dauer.', 'Create modules in the "Modules" tab. Each module contains lessons with video URL, description, and duration.') },
            { title: t('Produkt verknüpfen', 'Link Product'), desc: t('Falls der Kurs kaufbar ist: Wähle im Feld „Produkt" das zugehörige Produkt (vom Typ „digital-course").', 'If the course is purchasable: select the associated product (type "digital-course") in the "Product" field.') },
            { title: t('Sortierung', 'Sort Order'), desc: t('Über „Sortierreihenfolge" bestimmst du die Position in der Kurs-Übersicht (niedrigere Zahl = weiter vorne).', 'The "Sort Order" determines position in the course overview (lower number = further forward).') },
            { title: t('Veröffentlichen', 'Publish'), desc: t('Aktiviere „Aktiv" und speichere.', 'Enable "Active" and save.') },
          ]}
        />

        <FieldTable
          fields={[
            { name: t('Titel', 'Title'), description: t('Kursname (DE + EN)', 'Course name (DE + EN)'), required: true },
            { name: 'Slug', description: t('URL-Kennung (z.B. „basic-fermentation-course")', 'URL identifier (e.g. "basic-fermentation-course")'), required: true },
            { name: t('Beschreibung', 'Description'), description: t('Kurzbeschreibung für die Karten-Ansicht', 'Short description for the card view') },
            { name: t('Karten-Bild', 'Card Image'), description: t('Vorschaubild für die Kurs-Übersicht', 'Preview image for the course overview') },
            { name: t('Produkt', 'Product'), description: t('Verknüpftes Produkt für Kauf/Checkout (leer = Coming Soon)', 'Linked product for purchase/checkout (empty = Coming Soon)') },
            { name: t('Aktiv', 'Active'), description: t('Kurs auf /courses anzeigen?', 'Show course on /courses?') },
            { name: 'Coming Soon', description: t('Zeigt „Benachrichtige mich" statt „Kaufen"', 'Shows "Notify Me" instead of "Buy"') },
            { name: 'Coming-Soon-Badge', description: t('Z.B. „Sommer 2026" (nur wenn Coming Soon aktiv)', 'E.g. "Summer 2026" (only when Coming Soon is active)') },
            { name: t('Dozent*in', 'Instructor'), description: t('Z.B. „David Heider & Marcel Rauminger"', 'E.g. "David Heider & Marcel Rauminger"') },
            { name: t('Dauer', 'Duration'), description: t('Z.B. „10 Stunden Inhalt"', 'E.g. "10 hours of content"') },
            { name: 'Level', description: t('Z.B. „Anfänger" / „Beginner Level"', 'E.g. "Beginner" / "Beginner Level"') },
            { name: t('Sortierreihenfolge', 'Sort Order'), description: t('Reihenfolge in der Übersicht (0 = zuerst)', 'Position in overview (0 = first)') },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Module & Lektionen', 'Modules & Lessons')}
        </h3>
        <p className="text-sm" style={{ color: '#626160' }}>
          {t(
            'Jeder Kurs hat Module, und jedes Modul hat Lektionen. Lektionen enthalten ein Video (URL), eine Beschreibung und eine Dauerangabe. Die Lektion wird als abgeschlossen markiert, wenn Teilnehmer sie im Kurs-Viewer anklicken.',
            'Each course has modules, and each module has lessons. Lessons contain a video (URL), a description, and a duration. A lesson is marked as completed when participants click it in the course viewer.',
          )}
        </p>

        <InfoCard variant="tip" title={t('Einschreibungen', 'Enrollments')}>
          <p>{t('Wenn ein Kunde einen Kurs kauft (Stripe-Zahlung erfolgreich), wird automatisch eine Einschreibung erstellt. Der Kurs erscheint dann unter „Mein Lernen" im Kundenkonto. Du musst nichts manuell tun.', 'When a customer purchases a course (Stripe payment successful), an enrollment is automatically created. The course then appears under "My Learning" in the customer account. You don\'t need to do anything manually.')}</p>
        </InfoCard>
      </HubSection>

      {/* ── MEDIA ── */}
      <HubSection id="media" title={t('Bilder & Medien', 'Images & Media')}>
        <p>
          {t(
            'Alle Bilder und Videos werden zentral unter Medien verwaltet. Hochgeladene Dateien werden automatisch optimiert und in der Cloud (Cloudflare R2) gespeichert.',
            'All images and videos are managed centrally under Media. Uploaded files are automatically optimized and stored in the cloud (Cloudflare R2).',
          )}
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Bild hochladen', 'Uploading an Image')}
        </h3>
        <StepList
          steps={[
            { title: t('Medien öffnen', 'Open Media'), desc: t('Klicke links auf „Medien".', 'Click "Media" on the left.') },
            { title: t('Neues Medium erstellen', 'Create New Media'), desc: t('Klicke auf „Neues Medium erstellen".', 'Click "Create New Media".') },
            { title: t('Datei wählen', 'Choose File'), desc: t('Ziehe eine Datei in den Upload-Bereich oder klicke zum Auswählen.', 'Drag a file into the upload area or click to browse.') },
            { title: t('Alt-Text eingeben', 'Enter Alt Text'), desc: t('WICHTIG: Gib einen beschreibenden Alt-Text ein (DE + EN). Das ist Pflicht für Barrierefreiheit!', 'IMPORTANT: Enter a descriptive alt text (DE + EN). This is required for accessibility!') },
            { title: t('Optional: Beschriftung', 'Optional: Caption'), desc: t('Füge bei Bedarf eine Bildunterschrift hinzu (DE + EN).', 'Add a caption if needed (DE + EN).') },
            { title: t('Fokuspunkt setzen', 'Set Focal Point'), desc: t('Klicke auf das Bild, um den Fokuspunkt zu setzen. Das bestimmt, wie das Bild zugeschnitten wird.', 'Click on the image to set the focal point. This determines how the image is cropped.') },
            { title: t('Speichern', 'Save'), desc: t('Das Bild wird automatisch in WebP konvertiert und in 3 Größen gespeichert.', 'The image is automatically converted to WebP and saved in 3 sizes.') },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Automatische Optimierung', 'Automatic Optimization')}
        </h3>
        <p className="text-sm" style={{ color: '#626160' }}>
          {t('Beim Upload passiert Folgendes automatisch:', 'The following happens automatically on upload:')}
        </p>
        <ul className="ml-4 list-disc space-y-1 text-sm" style={{ color: '#626160' }}>
          <li><strong>{t('Format:', 'Format:')}</strong> {t('Konvertierung zu WebP (82% Qualität) für schnelleres Laden', 'Conversion to WebP (82% quality) for faster loading')}</li>
          <li><strong>{t('Größenbeschränkung:', 'Size Limit:')}</strong> {t('Maximum 2560px Breite', 'Maximum 2560px width')}</li>
          <li><strong>{t('Responsive Versionen:', 'Responsive Versions:')}</strong> Thumbnail (400px), Card (800px), Hero (1920px)</li>
          <li><strong>CDN:</strong> {t('Globale Auslieferung über Cloudflare für schnelle Ladezeiten', 'Global delivery via Cloudflare for fast load times')}</li>
        </ul>

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Unterstützte Formate', 'Supported Formats')}
        </h3>
        <ul className="ml-4 list-disc space-y-1 text-sm" style={{ color: '#626160' }}>
          <li><strong>{t('Bilder:', 'Images:')}</strong> PNG, JPEG, WebP, AVIF, SVG, GIF</li>
          <li><strong>Videos:</strong> MP4, WebM, OGG, MOV</li>
        </ul>

        <InfoCard variant="warning" title={t('Alt-Text ist Pflicht!', 'Alt Text is Required!')}>
          <p>{t('Jedes Bild MUSS einen Alt-Text haben (auf Deutsch und Englisch). Das ist gesetzlich vorgeschrieben (Barrierefreiheit) und wichtig für Google (SEO). Beschreibe kurz, was auf dem Bild zu sehen ist.', 'Every image MUST have alt text (in German and English). This is legally required (accessibility) and important for Google (SEO). Briefly describe what is shown in the image.')}</p>
        </InfoCard>

        <InfoCard variant="tip" title={t('Bildgröße vor Upload', 'Image Size Before Upload')}>
          <p>{t('Für die beste Qualität sollten Bilder mindestens 1920px breit sein (für Hero-Bereiche). Für Karten/Thumbnails reichen 1200px. Das System optimiert automatisch, aber zu kleine Bilder werden nicht hochskaliert.', 'For best quality, images should be at least 1920px wide (for hero sections). For cards/thumbnails, 1200px is sufficient. The system optimizes automatically, but images that are too small won\'t be upscaled.')}</p>
        </InfoCard>
      </HubSection>

      {/* ── NAVIGATION ── */}
      <HubSection id="navigation" title="Navigation & Footer">
        <p>
          {t(
            'Die Navigation (Header) und den Footer findest du unter Globals in der linken Seitenleiste.',
            'You can find the navigation (Header) and Footer under Globals in the left sidebar.',
          )}
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Header ({t('Navigation oben', 'Top Navigation')})
        </h3>
        <FieldTable
          fields={[
            { name: 'Announcement Bar', description: t('Farbige Leiste ganz oben mit einer Nachricht und optionalem Link. Kann ein-/ausgeschaltet werden.', 'Colored bar at the very top with a message and optional link. Can be toggled on/off.') },
            { name: t('Navigations-Elemente', 'Navigation Items'), description: t('Links in der Hauptnavigation. Jeder Link hat ein Label (DE + EN), einen Typ (Seite oder eigene URL) und optionale Dropdown-Unter-Elemente.', 'Links in the main navigation. Each link has a label (DE + EN), a type (page or custom URL), and optional dropdown sub-items.') },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Navigationslink hinzufügen', 'Adding a Navigation Link')}
        </h3>
        <StepList
          steps={[
            { title: t('Header öffnen', 'Open Header'), desc: t('Klicke links auf „Globals" → „Header".', 'Click "Globals" → "Header" on the left.') },
            { title: t('Neuen Link hinzufügen', 'Add New Link'), desc: t('Klicke bei „Navigations-Elemente" auf „Hinzufügen".', 'Click "Add" in "Navigation Items".') },
            { title: t('Label eingeben', 'Enter Label'), desc: t('Gib den Anzeigetext ein (DE + EN).', 'Enter the display text (DE + EN).') },
            { title: t('Ziel wählen', 'Choose Target'), desc: t('Wähle „Referenz" für eine CMS-Seite oder „Eigene URL" für einen manuellen Link (z.B. /shop).', 'Select "Reference" for a CMS page or "Custom URL" for a manual link (e.g. /shop).') },
            { title: t('Optional: Dropdown', 'Optional: Dropdown'), desc: t('Füge Dropdown-Elemente hinzu für ein Untermenü.', 'Add dropdown items for a submenu.') },
            { title: t('Speichern', 'Save'), desc: t('Klicke auf „Speichern".', 'Click "Save".') },
          ]}
        />

        <h3 className="font-display mt-6 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          Footer
        </h3>
        <FieldTable
          fields={[
            { name: t('Schnelllinks', 'Quick Links'), description: t('Bis zu 8 Links (wie Navigationslinks)', 'Up to 8 links (like navigation links)') },
            { name: 'Workshop-Links', description: t('Bis zu 6 Links zu Workshop-Seiten', 'Up to 6 links to workshop pages') },
            { name: t('Standort', 'Location'), description: t('Adresse (DE + EN), wird im Footer angezeigt', 'Address (DE + EN), displayed in the footer') },
            { name: t('Telefon', 'Phone'), description: t('Kontakt-Telefonnummer', 'Contact phone number') },
            { name: t('Newsletter-Überschrift', 'Newsletter Heading'), description: t('Titel des Newsletter-Bereichs (DE + EN)', 'Title of the newsletter section (DE + EN)') },
            { name: t('Newsletter-Beschreibung', 'Newsletter Description'), description: t('Kurzer Text zum Newsletter (DE + EN)', 'Short text about the newsletter (DE + EN)') },
            { name: 'Social Media', description: t('URLs zu Facebook, Instagram, LinkedIn', 'URLs for Facebook, Instagram, LinkedIn') },
          ]}
        />
      </HubSection>

      {/* ── TESTIMONIALS ── */}
      <HubSection id="testimonials" title="Testimonials">
        <p>
          {t(
            'Kundenbewertungen werden zentral als Global verwaltet und auf mehreren Seiten angezeigt (Startseite, Workshops, Kurse).',
            'Customer testimonials are managed centrally as a Global and displayed on multiple pages (home, workshops, courses).',
          )}
        </p>
        <StepList
          steps={[
            { title: t('Testimonials öffnen', 'Open Testimonials'), desc: t('Klicke links auf „Globals" → „Testimonials".', 'Click "Globals" → "Testimonials" on the left.') },
            { title: t('Überschrift anpassen', 'Edit Heading'), desc: t('Ändere die Eyebrow-Zeile und Überschrift (DE + EN).', 'Edit the eyebrow line and heading (DE + EN).') },
            { title: t('Testimonial hinzufügen', 'Add Testimonial'), desc: t('Klicke auf „Hinzufügen" (max. 10 Testimonials).', 'Click "Add" (max. 10 testimonials).') },
            { title: t('Daten eingeben', 'Enter Data'), desc: t('Zitat (DE + EN), Name, Rolle/Beruf und Bewertung (1–5 Sterne).', 'Quote (DE + EN), name, role/profession, and rating (1–5 stars).') },
            { title: t('Speichern', 'Save'), desc: t('Klicke auf „Speichern". Die neuen Testimonials erscheinen überall automatisch.', 'Click "Save". New testimonials appear automatically everywhere.') },
          ]}
        />
      </HubSection>

      {/* ── USERS ── */}
      <HubSection id="users" title={t('Benutzer', 'Users')}>
        <p>
          {t(
            'Unter Benutzer findest du alle registrierten Konten. Kunden werden automatisch angelegt, wenn sie sich auf der Website registrieren.',
            'Under Users you\'ll find all registered accounts. Customers are automatically created when they register on the website.',
          )}
        </p>
        <FieldTable
          fields={[
            { name: 'Name', description: t('Vollständiger Name', 'Full name') },
            { name: 'E-Mail', description: t('Login-E-Mail-Adresse', 'Login email address') },
            { name: t('Rollen', 'Roles'), description: t('admin (Vollzugriff) oder customer (nur eigenes Konto)', 'admin (full access) or customer (own account only)') },
            { name: t('Bestellungen', 'Orders'), description: t('Verknüpfte Bestellungen (automatisch)', 'Linked orders (automatic)') },
            { name: t('Warenkorb', 'Cart'), description: t('Aktueller Warenkorb (automatisch)', 'Current cart (automatic)') },
            { name: t('Adressen', 'Addresses'), description: t('Gespeicherte Lieferadressen', 'Saved delivery addresses') },
          ]}
        />

        <InfoCard variant="warning" title={t('Admin-Rolle', 'Admin Role')}>
          <p>{t('Nur Admins können Rollen ändern, Inhalte bearbeiten und das Dashboard nutzen. Gib die Admin-Rolle nur vertrauenswürdigen Personen!', 'Only admins can change roles, edit content, and use the dashboard. Only give the admin role to trusted people!')}</p>
        </InfoCard>
      </HubSection>

      {/* ── LOCALIZATION ── */}
      <HubSection id="localization" title={t('Sprachen (DE / EN)', 'Languages (DE / EN)')}>
        <p>
          {t(
            'Alle Texte auf der Website sind zweisprachig: Deutsch (Standard) und Englisch.',
            'All text on the website is bilingual: German (default) and English.',
          )}
        </p>

        <h3 className="font-display mt-4 text-lg font-semibold" style={{ color: '#1a1a1a' }}>
          {t('Wie funktioniert die Übersetzung?', 'How Does Translation Work?')}
        </h3>
        <ul className="ml-4 list-disc space-y-2 text-sm" style={{ color: '#626160' }}>
          <li>
            <strong>{t('Automatische Übersetzung (DeepL):', 'Automatic Translation (DeepL):')}</strong> {t('Wenn du einen deutschen Text speicherst, wird die englische Version automatisch über DeepL erzeugt. Das passiert nur in der Produktion.', 'When you save a German text, the English version is automatically generated via DeepL. This only happens in production.')}
          </li>
          <li>
            <strong>{t('Manuelle Übersetzung:', 'Manual Translation:')}</strong> {t('Du kannst die englische Version jederzeit manuell überschreiben. Manuelle Änderungen werden nie von DeepL überschrieben.', 'You can manually override the English version at any time. Manual changes are never overwritten by DeepL.')}
          </li>
          <li>
            <strong>{t('Locale-Umschalter:', 'Locale Switch:')}</strong> {t('Im Admin-Dashboard siehst du oben einen Sprachumschalter (DE/EN). Damit wechselst du zwischen den Sprachversionen eines Eintrags.', 'In the admin dashboard you\'ll see a language switcher (DE/EN) at the top. Use it to switch between language versions of an entry.')}
          </li>
        </ul>

        <InfoCard variant="tip" title={t('Workflow empfohlen', 'Recommended Workflow')}>
          <ol className="mt-1 ml-4 list-decimal space-y-1">
            <li>{t('Immer erst den deutschen Text eingeben und speichern.', 'Always enter and save the German text first.')}</li>
            <li>{t('Die englische Version wird automatisch erstellt (DeepL).', 'The English version is automatically created (DeepL).')}</li>
            <li>{t('Bei Bedarf die englische Version manuell korrigieren.', 'Manually correct the English version if needed.')}</li>
          </ol>
        </InfoCard>
      </HubSection>

      {/* ── SEO ── */}
      <HubSection id="seo" title={t('SEO-Einstellungen', 'SEO Settings')}>
        <p>
          {t(
            'Jede Seite und jedes Produkt hat einen SEO-Tab mit Feldern für die Suchmaschinenoptimierung.',
            'Every page and product has an SEO tab with fields for search engine optimization.',
          )}
        </p>
        <FieldTable
          fields={[
            { name: 'Meta-Titel', description: t('Seitentitel in Google-Suchergebnissen (50–60 Zeichen optimal)', 'Page title in Google search results (50–60 characters optimal)') },
            { name: 'Meta-Beschreibung', description: t('Seitenbeschreibung in Google (150–160 Zeichen optimal)', 'Page description in Google (150–160 characters optimal)') },
            { name: 'Meta-Bild', description: t('Vorschaubild für Social Media (Facebook, Twitter). Ideal: 1200×630px', 'Preview image for social media (Facebook, Twitter). Ideal: 1200×630px') },
          ]}
        />
        <InfoCard variant="tip" title={t('SEO-Tipp', 'SEO Tip')}>
          <p>{t('Fülle diese Felder immer aus! Ohne Meta-Titel und -Beschreibung zeigt Google einen automatisch generierten Text an, der oft nicht optimal ist.', 'Always fill in these fields! Without meta title and description, Google shows auto-generated text that is often not optimal.')}</p>
        </InfoCard>
      </HubSection>

      {/* ── TIPS ── */}
      <HubSection id="tips" title={t('Tipps & Tricks', 'Tips & Tricks')}>
        <div className="space-y-4">
          <InfoCard variant="tip" title={t('Entwürfe nutzen', 'Using Drafts')}>
            <p>{t('Du kannst Änderungen als Entwurf speichern, bevor sie live gehen. So kannst du in Ruhe arbeiten, ohne dass Besucher unfertige Inhalte sehen.', 'You can save changes as a draft before they go live. This way you can work at your own pace without visitors seeing unfinished content.')}</p>
          </InfoCard>

          <InfoCard variant="tip" title={t('Live-Vorschau', 'Live Preview')}>
            <p>{t('Klicke auf „Live-Vorschau" im Admin, um zu sehen, wie deine Änderungen auf der echten Website aussehen — ohne sie zu veröffentlichen.', 'Click "Live Preview" in the admin to see how your changes look on the real website — without publishing them.')}</p>
          </InfoCard>

          <InfoCard variant="tip" title={t('Bilder optimieren', 'Optimizing Images')}>
            <p>{t('Verwende wenn möglich WebP- oder JPEG-Bilder statt PNG. Das System konvertiert zwar automatisch, aber die Upload-Geschwindigkeit ist mit kleineren Dateien besser. Ideale Breite: 1920px für Hero-Bilder, 1200px für Produktbilder.', 'Use WebP or JPEG images instead of PNG when possible. The system converts automatically, but upload speed is better with smaller files. Ideal width: 1920px for hero images, 1200px for product images.')}</p>
          </InfoCard>

          <InfoCard variant="tip" title={t('Reihenfolge von Blöcken', 'Block Order')}>
            <p>{t('Blöcke auf Seiten können per Drag & Drop umsortiert werden. Die Reihenfolge im Admin ist die Reihenfolge auf der Website.', 'Blocks on pages can be reordered via drag & drop. The order in the admin is the order on the website.')}</p>
          </InfoCard>

          <InfoCard variant="warning" title={t('Nicht löschen ohne nachzudenken', 'Don\'t Delete Without Thinking')}>
            <p>{t('Das Löschen von Seiten, Produkten oder Workshops ist sofort wirksam und kann nicht rückgängig gemacht werden! Wenn du unsicher bist, deaktiviere den Eintrag lieber (z.B. „Veröffentlicht: Nein").', 'Deleting pages, products, or workshops takes effect immediately and cannot be undone! If you\'re unsure, deactivate the entry instead (e.g. "Published: No").')}</p>
          </InfoCard>

          <InfoCard variant="important" title={t('Hilfe', 'Help')}>
            <p>{t('Bei Fragen oder Problemen wende dich an das Entwicklungsteam. Lieber einmal zu viel fragen als etwas versehentlich löschen!', 'For questions or problems, contact the development team. Better to ask once too many than to accidentally delete something!')}</p>
          </InfoCard>
        </div>
      </HubSection>
    </HubShell>
  )
}
