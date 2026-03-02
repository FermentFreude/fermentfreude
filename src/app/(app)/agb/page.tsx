import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AGB | FermentFreude',
  description:
    'Allgemeine Geschäftsbedingungen der Fermentfreude OG für Workshops und Online-Shop.',
}

export default function AGBPage() {
  return (
    <main className="bg-white text-[#1d1d1d]">
      <div className="mx-auto max-w-3xl px-6 md:px-10 py-20 md:py-28">
        <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight mb-12">
          Allgemeine Geschäftsbedingungen
        </h1>

        <div className="space-y-10 font-sans text-base leading-relaxed text-[#1d1d1d]/80">
          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              1. Geltungsbereich
            </h2>
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle über die Webseite{' '}
              <span className="font-semibold text-[#1d1d1d]">fermentfreude.com</span> geschlossenen
              Verträge zwischen der Fermentfreude OG (im Folgenden „Anbieter“) und dem Kunden.
            </p>
            <p className="mt-3">
              <span className="font-semibold text-[#1d1d1d]">Fermentfreude OG</span>
              <br />
              Grabenstraße 15, 8010 Graz
              <br />
              FN 659072 z, Firmenbuchgericht Graz
              <br />
              UID: ATU82444712
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              2. Vertragsschluss
            </h2>
            <p>
              Die Darstellung der Produkte und Workshops im Online-Shop stellt kein rechtlich
              bindendes Angebot, sondern einen unverbindlichen Online-Katalog dar. Durch Anklicken
              des Buttons „Jetzt kaufen“ bzw. „Jetzt buchen“ geben Sie eine verbindliche Bestellung
              ab. Der Kaufvertrag kommt zustande, wenn wir Ihre Bestellung per E-Mail bestätigen.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              3. Preise und Zahlung
            </h2>
            <p>
              Alle angegebenen Preise verstehen sich in Euro und inklusive der gesetzlichen
              Umsatzsteuer, sofern anwendbar. Die Kleinunternehmerregelung gemäß § 6 Abs. 1 Z. 27
              UStG wird angewandt — die Umsatzsteuer wird daher derzeit nicht gesondert ausgewiesen.
            </p>
            <p className="mt-3">
              Die Zahlung erfolgt über die auf der Webseite angebotenen Zahlungsmethoden
              (z.&thinsp;B. Kreditkarte via Stripe). Der Rechnungsbetrag ist sofort nach Bestellung
              fällig.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              4. Workshop-Buchungen
            </h2>
            <p>
              Workshop-Plätze sind begrenzt und werden in der Reihenfolge des Eingangs vergeben.
              Nach erfolgreicher Buchung erhalten Sie eine Bestätigung per E-Mail mit allen
              relevanten Details (Datum, Uhrzeit, Ort).
            </p>
            <p className="mt-3">
              <span className="font-semibold text-[#1d1d1d]">Stornierung:</span> Eine kostenlose
              Stornierung ist bis 7 Tage vor dem Workshop-Termin möglich. Bei späterer Absage oder
              Nichterscheinen wird der volle Betrag einbehalten. Im Einzelfall können Umbuchungen
              auf einen späteren Termin vereinbart werden.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              5. Gutscheine
            </h2>
            <p>
              Gutscheine sind ab Kaufdatum 3 Jahre gültig, sofern nicht anders ausgewiesen. Sie sind
              nicht bar auszahlbar und können nicht mit anderen Aktionen kombiniert werden, sofern
              nicht anders angegeben.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              6. Widerrufsrecht
            </h2>
            <p>
              Verbraucher haben das Recht, einen Vertrag über den Online-Kauf von Waren innerhalb
              von 14 Tagen ohne Angabe von Gründen zu widerrufen. Die Widerrufsfrist beginnt mit dem
              Tag, an dem der Verbraucher die Ware in Besitz genommen hat. Um Ihr Widerrufsrecht
              auszuüben, informieren Sie uns bitte per E-Mail an{' '}
              <a
                href="mailto:fermentfreude@gmail.com"
                className="underline hover:text-[#e6be68] transition-colors"
              >
                fermentfreude@gmail.com
              </a>
              .
            </p>
            <p className="mt-3">
              Das Widerrufsrecht gilt nicht für Workshop-Buchungen, die einen festen Termin haben
              (Dienstleistungen zu einem bestimmten Zeitpunkt gemäß § 18 Abs. 1 Z 12 FAGG).
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              7. Haftung
            </h2>
            <p>
              Der Anbieter haftet nur für Schäden, die auf vorsätzlicher oder grob fahrlässiger
              Pflichtverletzung beruhen. Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen,
              soweit gesetzlich zulässig. Die Teilnahme an Workshops erfolgt auf eigenes Risiko.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              8. Datenschutz
            </h2>
            <p>
              Informationen zur Verarbeitung Ihrer personenbezogenen Daten entnehmen Sie bitte
              unserer{' '}
              <Link
                href="/datenschutz"
                className="underline hover:text-[#e6be68] transition-colors"
              >
                Datenschutzerklärung
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              9. Anwendbares Recht und Gerichtsstand
            </h2>
            <p>
              Es gilt ausschließlich österreichisches Recht unter Ausschluss des UN-Kaufrechts.
              Gerichtsstand ist Graz. Für Verbraucher gelten die zwingenden Bestimmungen des
              Konsumentenschutzgesetzes.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              10. Streitbeilegung
            </h2>
            <p>
              Die Europäische Kommission stellt eine Plattform für die Online-Streitbeilegung (OS)
              bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#e6be68] transition-colors"
              >
                https://ec.europa.eu/consumers/odr
              </a>
              . Wir sind jedoch nicht verpflichtet und nicht bereit, an einem
              Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section className="pt-6 border-t border-[#1d1d1d]/10">
            <p className="text-sm text-[#1d1d1d]/50">Stand: Juni 2025</p>
          </section>
        </div>
      </div>
    </main>
  )
}
