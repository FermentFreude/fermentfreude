import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Impressum | FermentFreude',
  description: 'Impressum der Fermentfreude OG.',
}

export default function ImpressumPage() {
  return (
    <main className="page-legal text-[#1d1d1d] py-16 md:py-24">
      <div className="container legal-content-block">
        <div className="relative mx-auto max-w-[64rem] rounded-[1.5rem] border border-[#e8dfd3] bg-gradient-to-b from-[#fffdfb] to-[#fffaf4] px-6 py-8 shadow-[0_24px_46px_rgb(0_0_0/7%),0_3px_10px_rgb(0_0_0/4%)] md:px-12 md:py-12">
          <Image
            src="/icon-logo.svg"
            alt=""
            width={53}
            height={51}
            className="pointer-events-none absolute right-6 top-6 hidden opacity-90 md:block"
            aria-hidden
          />
          <h1 className="font-display font-black text-3xl md:text-4xl uppercase tracking-tight mb-10 text-[#121212]">
            Impressum
          </h1>

          <div className="space-y-10 font-sans text-base leading-relaxed text-[#2d2d2d] [&>section]:border-t [&>section]:border-[#e6be68]/45 [&>section]:pt-10 [&>section:first-child]:border-t-0 [&>section:first-child]:pt-0 [&>section>h2]:font-display [&>section>h2]:font-bold [&>section>h2]:text-[1.2rem] [&>section>h2]:tracking-tight [&>section>h2]:text-[#1a1a1a] [&>section>h2]:mb-4 [&_a]:underline [&_a]:transition-colors [&_a]:hover:text-[#e6be68]">
          <section>
            <p className="inline-flex rounded-full border border-[#e6be68]/50 bg-[#faf2e0] px-4 py-1.5 text-sm font-medium text-[#6f5a45]">
              Angaben gemäß § 5 ECG, § 25 MedienG, § 63 GewO und § 14 UGB
            </p>
          </section>

          <section>
            <h2>
              Unternehmen
            </h2>
            <p>
              <span className="font-display text-2xl font-bold tracking-tight text-[#4b4f4a]">
                Fermentfreude OG
              </span>
              <br />
              <a
                href="https://www.google.com/maps/search/?api=1&query=Grabenstra%C3%9Fe+15,+8010+Graz,+%C3%96sterreich"
                target="_blank"
                rel="noopener noreferrer"
              >
                Grabenstraße 15
                <br />
                8010 Graz
                <br />
                Österreich
              </a>
            </p>
            <p className="mt-3">
              <span className="font-semibold text-[#7a6651]">Firmenbuchnummer:</span> FN 659072 z
            </p>
            <p className="mt-3">
              <span className="font-semibold text-[#7a6651]">Firmenbuchgericht:</span> Graz
            </p>
          </section>

          <section>
            <h2>
              Vertretungsberechtigte Gesellschafter
            </h2>
            <p>
              Marcel Raunnigger
              <br />
              David Haider
            </p>
          </section>

          <section>
            <h2>
              Kontakt
            </h2>
            <p>
              <span className="mr-2 text-[#7a6651]">☎</span>
              <span className="font-semibold text-[#7a6651]">Telefon:</span>{' '}
              <a
                href="tel:+436604943577"
              >
                +43 660 4943577
              </a>
            </p>
            <p className="mt-3">
              <span className="mr-2 text-[#7a6651]">✉</span>
              <span className="font-semibold text-[#7a6651]">E-Mail:</span>{' '}
              <a
                href="mailto:kontakt@fermentfreude.at"
              >
                kontakt@fermentfreude.at
              </a>
            </p>
          </section>

          <section>
            <h2>
              Unternehmensgegenstand
            </h2>
            <p>
              Durchführung von Workshops und Veranstaltungen im Bereich Fermentation sowie Handel
              mit Waren (E-Commerce)
            </p>
          </section>

          <section>
            <h2>
              Umsatzsteuer
            </h2>
            <p>
              <span className="font-semibold text-[#7a6651]">UID-Nummer:</span> ATU82444712
            </p>
            <p className="mt-3">Kleinunternehmer im Sinne des § 6 Abs. 1 Z 27 UStG</p>
            <p className="mt-3">Es wird keine Umsatzsteuer ausgewiesen.</p>
          </section>

          <section>
            <h2>
              Medieninhaber und Herausgeber
            </h2>
            <p>
              Fermentfreude OG
              <br />
              Grabenstraße 15
              <br />
              8010 Graz
            </p>
          </section>

          <section>
            <h2>
              Blattlinie
            </h2>
            <p>
              Diese Website dient der Information über die Angebote und Tätigkeiten von
              Fermentfreude OG im Bereich Fermentation, Workshops und Produkte.
            </p>
          </section>

          <section>
            <h2>
              Online-Streitbeilegung
            </h2>
            <p>
              Verbraucher haben die Möglichkeit, Beschwerden an die Online-Streitbeilegungsplattform
              der Europäischen Kommission zu richten:
            </p>
            <p className="mt-3">
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
          </section>

          <section>
            <h2>
              Haftung für Inhalte
            </h2>
            <p>
              Die Inhalte unserer Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
              Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
            </p>
          </section>

          <section>
            <h2>
              Haftung für Links
            </h2>
            <p>
              Unsere Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Für diese Inhalte ist stets der jeweilige Anbieter verantwortlich.
            </p>
          </section>

          <section>
            <h2>
              Urheberrecht
            </h2>
            <p>
              Die Inhalte und Werke auf dieser Website unterliegen dem Urheberrecht. Beiträge Dritter
              sind als solche gekennzeichnet.
            </p>
            <p className="mt-3">
              Die Vervielfältigung, Bearbeitung und Verbreitung außerhalb der Grenzen des
              Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors.
            </p>
          </section>
          </div>
        </div>
      </div>
    </main>
  )
}
