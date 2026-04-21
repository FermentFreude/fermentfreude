import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Datenschutz | FermentFreude',
  description: 'Datenschutzerklärung der Fermentfreude OG.',
}

export default function DatenschutzPage() {
  return (
    <main className="page-legal text-[#1d1d1d] py-16 md:py-24">
      <div className="container legal-content-block">
        <div className="relative mx-auto max-w-[64rem] rounded-[1.5rem] border border-[#e8dfd3] bg-[#fffdfb] px-6 py-8 shadow-[0_24px_46px_rgb(0_0_0/7%),0_3px_10px_rgb(0_0_0/4%)] md:px-12 md:py-12">
          <Image
            src="/icon-logo.svg"
            alt=""
            width={53}
            height={51}
            className="pointer-events-none absolute right-6 top-6 hidden opacity-90 md:block"
            aria-hidden
          />
          <h1 className="font-display font-black text-3xl md:text-4xl uppercase tracking-tight mb-10 text-[#121212]">
            Datenschutzerklärung
          </h1>

          <div className="space-y-10 font-sans text-base leading-relaxed text-[#2d2d2d] [&>section]:border-t [&>section]:border-[#e6be68]/45 [&>section]:pt-10 [&>section:first-child]:border-t-0 [&>section:first-child]:pt-0">
          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              1. Verantwortlicher
            </h2>
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
            </p>
            <p className="mt-3">
              Fermentfreude OG
              <br />
              <a
                href="https://www.google.com/maps/search/?api=1&query=Grabenstra%C3%9Fe+15,+8010+Graz,+%C3%96sterreich"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#e6be68] transition-colors"
              >
                Grabenstraße 15
                <br />
                8010 Graz
                <br />
                Österreich
              </a>
            </p>
            <p className="mt-3">
              E-Mail:{' '}
              <a
                href="mailto:kontakt@fermentfreude.at"
                className="underline hover:text-[#e6be68] transition-colors"
              >
                kontakt@fermentfreude.at
              </a>
            </p>
            <p className="mt-3">
              Telefon:{' '}
              <a
                href="tel:+436604943577"
                className="underline hover:text-[#e6be68] transition-colors"
              >
                +43 (0) 660 49 43 577
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              2. Allgemeines zur Datenverarbeitung
            </h2>
            <p>
              Wir verarbeiten personenbezogene Daten ausschließlich im Einklang mit den geltenden
              Datenschutzbestimmungen, insbesondere der Datenschutz-Grundverordnung.
              Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden
              können (z. B. Name, E-Mail-Adresse, Telefonnummer).
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              3. Zugriffsdaten (Server-Logfiles)
            </h2>
            <p>Beim Besuch dieser Website werden automatisch folgende Daten erfasst:</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>IP-Adresse</li>
              <li>Datum und Uhrzeit der Anfrage</li>
              <li>Browsertyp und Version</li>
              <li>Betriebssystem</li>
              <li>Referrer URL</li>
            </ul>
            <p className="mt-3">
              Diese Daten dienen der technischen Bereitstellung und Sicherheit der Website.
              Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherem Betrieb
              der Website)
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              4. Hosting & Infrastruktur
            </h2>
            <p>Unsere Website wird betrieben über:</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Vercel (Hosting)</li>
              <li>Cloudflare (Content Delivery & Performance)</li>
            </ul>
            <p className="mt-3">
              Diese Anbieter verarbeiten technische Daten (z. B. IP-Adresse), um eine stabile und
              sichere Bereitstellung der Website zu gewährleisten.
            </p>
            <p className="mt-3">
              Eine Verarbeitung kann auch außerhalb der EU erfolgen. In diesen Fällen erfolgt die
              Datenübermittlung auf Grundlage geeigneter Garantien (z. B.
              Standardvertragsklauseln).
            </p>
            <p className="mt-3">Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              5. Kontaktformular
            </h2>
            <p>
              Wenn Sie uns über das Kontaktformular kontaktieren, werden folgende Daten verarbeitet:
            </p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Name</li>
              <li>E-Mail-Adresse</li>
              <li>Telefonnummer (optional)</li>
            </ul>
            <p className="mt-3">
              Die Daten werden zur Bearbeitung Ihrer Anfrage verwendet und in unserem CRM-System
              gespeichert.
            </p>
            <p className="mt-3">Rechtsgrundlage:</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen)</li>
              <li>
                Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Bearbeitung von Anfragen)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              6. Buchungen & Bestellungen
            </h2>
            <p>
              Wenn Sie über unsere Website Workshops, Online-Kurse oder zukünftig Produkte buchen
              bzw. kaufen, verarbeiten wir:
            </p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Name</li>
              <li>E-Mail-Adresse</li>
              <li>Telefonnummer</li>
            </ul>
            <p className="mt-3">
              Diese Daten sind erforderlich zur Durchführung und Abwicklung des Vertrags.
            </p>
            <p className="mt-3">
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              7. Zahlungsabwicklung
            </h2>
            <p>Die Zahlungsabwicklung erfolgt über:</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Stripe</li>
            </ul>
            <p className="mt-3">
              Bei der Zahlung werden Ihre Zahlungsdaten direkt an Stripe übermittelt. Wir speichern
              keine vollständigen Zahlungsinformationen.
            </p>
            <p className="mt-3">
              Stripe kann Daten in Drittländer (z. B. USA) übertragen. Die Übermittlung erfolgt auf
              Basis geeigneter Garantien (z. B. Standardvertragsklauseln).
            </p>
            <p className="mt-3">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              8. Newsletter & E-Mail-Kommunikation
            </h2>
            <p>Für den Versand von Newslettern und automatisierten E-Mails nutzen wir:</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Brevo</li>
            </ul>
            <p className="mt-3">Dabei werden folgende Daten verarbeitet:</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>E-Mail-Adresse</li>
              <li>ggf. Name</li>
            </ul>
            <p className="mt-3">
              Die Anmeldung erfolgt über ein Double-Opt-in-Verfahren. Das bedeutet, dass Sie Ihre
              Anmeldung über eine Bestätigungs-E-Mail verifizieren müssen.
            </p>
            <p className="mt-3">
              Sie können den Newsletter jederzeit über den Abmeldelink kündigen.
            </p>
            <p className="mt-3">
              Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              9. Tracking & Analyse
            </h2>
            <p>Wir nutzen folgende Tools:</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Google Analytics</li>
              <li>Meta Pixel</li>
            </ul>
            <p className="mt-3">
              Diese Tools helfen uns, das Nutzerverhalten auf unserer Website zu analysieren und unser
              Angebot zu verbessern.
            </p>
            <p className="mt-3">
              Die Nutzung dieser Tools erfolgt ausschließlich nach Ihrer Einwilligung über das
              Cookie-Banner.
            </p>
            <p className="mt-3">
              Eine Verarbeitung kann auch in Drittländern (z. B. USA) stattfinden. In diesen Fällen
              erfolgt die Datenübertragung auf Grundlage geeigneter Garantien.
            </p>
            <p className="mt-3">Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              10. Cookies
            </h2>
            <p>Unsere Website verwendet Cookies.</p>
            <p className="mt-3">
              Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden.
            </p>
            <p className="mt-3">Wir unterscheiden zwischen:</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>technisch notwendigen Cookies</li>
              <li>Analyse- und Marketing-Cookies</li>
            </ul>
            <p className="mt-3">
              Analyse- und Marketing-Cookies werden nur nach Ihrer ausdrücklichen Einwilligung
              gesetzt.
            </p>
            <p className="mt-3">
              Sie können Ihre Cookie-Einstellungen jederzeit über das Cookie-Banner anpassen.
            </p>
            <p className="mt-3">Rechtsgrundlage:</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Art. 6 Abs. 1 lit. f DSGVO (notwendige Cookies)</li>
              <li>Art. 6 Abs. 1 lit. a DSGVO (alle anderen Cookies)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              11. Externe Inhalte & Links
            </h2>
            <p>Auf unserer Website befinden sich Links zu:</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Instagram</li>
              <li>Facebook</li>
              <li>LinkedIn</li>
            </ul>
            <p className="mt-3">
              Beim Anklicken dieser Links verlassen Sie unsere Website. Für die Datenverarbeitung
              durch diese Plattformen sind die jeweiligen Anbieter verantwortlich.
            </p>
            <p className="mt-3">Google Maps</p>
            <p className="mt-3">Zur Darstellung von Standorten nutzen wir:</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Google Maps</li>
            </ul>
            <p className="mt-3">
              Dabei kann es zur Übertragung von Daten an Google kommen (z. B. IP-Adresse).
            </p>
            <p className="mt-3">Die Nutzung erfolgt nur nach Ihrer Einwilligung.</p>
            <p className="mt-3">Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              12. Speicherdauer
            </h2>
            <p>
              Personenbezogene Daten werden nur so lange gespeichert, wie dies für den jeweiligen
              Zweck erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              13. Ihre Rechte
            </h2>
            <p>Sie haben jederzeit das Recht auf:</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Auskunft über Ihre gespeicherten Daten</li>
              <li>Berichtigung unrichtiger Daten</li>
              <li>Löschung Ihrer Daten</li>
              <li>Einschränkung der Verarbeitung</li>
              <li>Datenübertragbarkeit</li>
            </ul>
            <p className="mt-3">
              Außerdem haben Sie das Recht, eine erteilte Einwilligung jederzeit zu widerrufen.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              14. Beschwerderecht
            </h2>
            <p>
              Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten gegen geltendes Recht
              verstößt, können Sie sich bei der zuständigen Datenschutzbehörde beschweren.
            </p>
          </section>
          </div>
        </div>
      </div>
    </main>
  )
}
