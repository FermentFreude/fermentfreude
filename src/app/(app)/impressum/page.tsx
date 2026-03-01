import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impressum | FermentFreude',
  description: 'Impressum der Fermentfreude OG – Firmendaten, Kontakt und rechtliche Informationen.',
}

export default function ImpressumPage() {
  return (
    <main className="bg-white text-[#1d1d1d]">
      <div className="mx-auto max-w-3xl px-6 md:px-10 py-20 md:py-28">
        <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight mb-12">
          Impressum
        </h1>

        <div className="space-y-10 font-sans text-base leading-relaxed text-[#1d1d1d]/80">
          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Informationen und Offenlegung gemäß §5(1) ECG, § 25 MedienG, § 63 GewO und § 14 UGB
            </h2>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-[#1d1d1d]">Firmenwortlaut</p>
                <p>Fermentfreude OG</p>
              </div>
              <div>
                <p className="font-semibold text-[#1d1d1d]">Firmenbuchnummer</p>
                <p>FN 659072 z</p>
              </div>
              <div>
                <p className="font-semibold text-[#1d1d1d]">Firmenbuchgericht</p>
                <p>Graz</p>
              </div>
              <div>
                <p className="font-semibold text-[#1d1d1d]">Firmensitz</p>
                <p>Grabenstraße 15, 8010 Graz</p>
              </div>
              <div>
                <p className="font-semibold text-[#1d1d1d]">Gesellschafter</p>
                <p>Marcel Raunnigger, David Haider</p>
              </div>
              <div>
                <p className="font-semibold text-[#1d1d1d]">UID-Nummer</p>
                <p>ATU82444712</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Umsatzsteuer
            </h2>
            <p>
              Kleinunternehmerregelung: Die Umsatzsteuer wird auf Grund der Anwendung der Kleinunternehmerregelung gemäß § 6 Abs. 1 Z. 27 UStG nicht in Rechnung gestellt.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Unternehmensgegenstand
            </h2>
            <p>Fermentier Workshops / E-Commerce</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Kontaktdaten
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold text-[#1d1d1d]">Telefonnummer:</span>{' '}
                <a href="tel:+4306604943577" className="underline hover:text-[#e6be68] transition-colors">
                  +43 660 4943577
                </a>
              </p>
              <p>
                <span className="font-semibold text-[#1d1d1d]">Email:</span>{' '}
                <a href="mailto:fermentfreude@gmail.com" className="underline hover:text-[#e6be68] transition-colors">
                  fermentfreude@gmail.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Anwendbare Rechtsvorschrift
            </h2>
            <p>
              <a
                href="https://www.ris.bka.gv.at"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#e6be68] transition-colors"
              >
                www.ris.bka.gv.at
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Berufsbezeichnung
            </h2>
            <p>Fermentier Workshops / E-Commerce</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Online Streitbeilegung
            </h2>
            <p>
              Verbraucher, welche in Österreich oder in einem sonstigen Vertragsstaat der ODR-VO niedergelassen sind, haben die Möglichkeit Probleme bezüglich dem entgeltlichen Kauf von Waren oder Dienstleistungen im Rahmen einer Online-Streitbeilegung (gem. Art. 14 Abs. 1 ODR-VO) zu lösen. Die Europäische Kommission stellt eine Plattform hierfür bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#e6be68] transition-colors"
              >
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Urheberrecht
            </h2>
            <p>
              Die Inhalte dieser Webseite unterliegen, soweit dies rechtlich möglich ist, diversen Schutzrechten (z.B dem Urheberrecht). Jegliche Verwendung/Verbreitung von bereitgestelltem Material, welche urheberrechtlich untersagt ist, bedarf schriftlicher Zustimmung des Webseitenbetreibers.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Haftungsausschluss
            </h2>
            <p>
              Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich. Sollten Sie dennoch auf ausgehende Links aufmerksam werden, welche auf eine Webseite mit rechtswidriger Tätigkeit/Information verweisen, ersuchen wir um dementsprechenden Hinweis, um diese nach § 17 Abs. 2 ECG umgehend zu entfernen.
            </p>
            <p className="mt-3">
              Die Urheberrechte Dritter werden vom Betreiber dieser Webseite mit größter Sorgfalt beachtet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden derartiger Rechtsverletzungen werden wir den betroffenen Inhalt umgehend entfernen.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
