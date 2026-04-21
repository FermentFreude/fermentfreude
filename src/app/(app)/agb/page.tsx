import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'AGB | FermentFreude',
  description:
    'Allgemeine Geschäftsbedingungen der Fermentfreude OG für Workshops und Online-Shop.',
}

export default function AGBPage() {
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
            Allgemeine Geschäftsbedingungen
          </h1>

          <div className="space-y-10 font-sans text-base leading-relaxed text-[#2d2d2d] [&>section]:border-t [&>section]:border-[#e6be68]/45 [&>section]:pt-10 [&>section:first-child]:border-t-0 [&>section:first-child]:pt-0">
          <section>
            <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight mb-4 text-[#4b4f4a]">
              Fermentfreude OG
            </h2>
            <p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Grabenstra%C3%9Fe+15,+8010+Graz,+%C3%96sterreich"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#e6be68] transition-colors"
              >
                Grabenstraße 15, 8010 Graz, Österreich
              </a>
            </p>
            <p className="mt-3">FN 659072 z</p>
            <p className="mt-3 font-semibold text-[#7a6651]">Inhaber:</p>
            <p>
              Marcel Raunnigger
              <br />
              David Haider
            </p>
            <p className="mt-3">
              <span className="mr-2 text-[#7a6651]">☎</span>
              <span className="font-semibold text-[#7a6651]">Telefon:</span>{' '}
              <a
                href="tel:+436604943577"
                className="underline hover:text-[#e6be68] transition-colors"
              >
                +43 (0) 660 49 43 577
              </a>
            </p>
            <p className="mt-3">
              <span className="mr-2 text-[#7a6651]">✉</span>
              <span className="font-semibold text-[#7a6651]">E-Mail:</span>{' '}
              <a
                href="mailto:fermentfreude@gmail.com"
                className="underline hover:text-[#e6be68] transition-colors"
              >
                fermentfreude@gmail.com
              </a>
            </p>
            <p className="mt-3">
              <span className="mr-2 text-[#7a6651]">⌂</span>
              <span className="font-semibold text-[#7a6651]">Website:</span>{' '}
              <a
                href="https://www.ferment-freude.at"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#e6be68] transition-colors"
              >
                https://www.ferment-freude.at
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              1. Geltungsbereich
            </h2>
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für sämtliche Vertragsabschlüsse
              zwischen der Fermentfreude OG (im Folgenden „Fermentfreude“) und ihren Kundinnen und
              Kunden über:
            </p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>die Teilnahme an Workshops und Veranstaltungen,</li>
              <li>den Erwerb von Gutscheinen,</li>
              <li>sowie den Kauf von Waren über den Online-Shop von Fermentfreude.</li>
            </ul>
            <p className="mt-3">
              Abweichende Bedingungen des Kunden gelten nur, wenn Fermentfreude ihrer Geltung
              ausdrücklich schriftlich zugestimmt hat.
            </p>
            <p className="mt-3">
              Kundinnen und Kunden im Sinne dieser AGB sind sowohl Verbraucher im Sinne des
              Konsumentenschutzgesetzes (KSchG) als auch Unternehmer im Sinne des
              Unternehmensgesetzbuches (UGB).
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              2. Vertragsschluss
            </h2>
            <p>
              Die Präsentation von Workshops oder Waren auf der Website stellt noch kein
              verbindliches Angebot dar.
            </p>
            <p className="mt-3">
              Durch das Absenden einer Buchung oder Bestellung gibt der Kunde ein verbindliches
              Angebot zum Abschluss eines Vertrages ab.
            </p>
            <p className="mt-3">
              Der Vertrag kommt erst zustande, wenn Fermentfreude die Buchung oder Bestellung
              ausdrücklich bestätigt oder die Teilnahme bzw. Bestellung annimmt.
            </p>
            <p className="mt-3">
              Fermentfreude behält sich vor, Buchungen oder Bestellungen ohne Angabe von Gründen
              abzulehnen.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              3. Preise und Zahlungsbedingungen
            </h2>
            <p>
              Alle Preise verstehen sich als Gesamtpreise in Euro.
            </p>
            <p className="mt-3">
              Fermentfreude ist Kleinunternehmer im Sinne des § 6 Abs. 1 Z 27 UStG, daher wird keine
              Umsatzsteuer ausgewiesen.
            </p>
            <p className="mt-3">
              Die Zahlung erfolgt über die auf der Website angebotenen Zahlungsmethoden,
              insbesondere über Online-Zahlungsdienste wie Stripe.
            </p>
            <p className="mt-3">Der Rechnungsbetrag ist mit Vertragsabschluss fällig.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              4. Workshops und Veranstaltungen
            </h2>
            <p>
              <span className="font-semibold text-[#1d1d1d]">4.1 Buchung</span>
            </p>
            <p className="mt-3">
              Workshops können über die Website oder über andere angebotene Buchungskanäle gebucht
              werden.
            </p>
            <p className="mt-3">
              Die Teilnehmerzahl ist begrenzt. Die Teilnahme ist erst nach erfolgreicher Zahlung des
              Teilnahmebeitrags gesichert.
            </p>
            <p className="mt-4">
              <span className="font-semibold text-[#1d1d1d]">4.2 Teilnahmebedingungen</span>
            </p>
            <p className="mt-3">
              Teilnehmer verpflichten sich, während des Workshops den Anweisungen der Veranstalter
              Folge zu leisten.
            </p>
            <p className="mt-3">
              Teilnehmer sind verpflichtet, Allergien, Unverträglichkeiten oder gesundheitliche
              Einschränkungen, die für den Workshop relevant sein könnten, vor Beginn des Workshops
              mitzuteilen.
            </p>
            <p className="mt-3">
              Fermentfreude übernimmt keine Haftung für gesundheitliche Reaktionen, sofern diese auf
              nicht bekannt gegebene Allergien oder Unverträglichkeiten zurückzuführen sind.
            </p>
            <p className="mt-3">
              Teilnehmer, die den Ablauf erheblich stören oder Sicherheits- bzw. Hygieneanweisungen
              nicht einhalten, können vom Workshop ausgeschlossen werden. In diesem Fall besteht kein
              Anspruch auf Rückerstattung.
            </p>
            <p className="mt-4">
              <span className="font-semibold text-[#1d1d1d]">4.3 Stornierung durch Teilnehmer</span>
            </p>
            <p className="mt-3">
              Eine Stornierung muss schriftlich per E-Mail erfolgen. Maßgeblich ist der Zeitpunkt des
              Eingangs der Stornierung bei Fermentfreude.
            </p>
            <p className="mt-3">Es gelten folgende Stornobedingungen:</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>bis 14 Tage vor dem Workshoptermin: kostenfreie Stornierung</li>
              <li>7 bis 14 Tage vor dem Termin: 50 % des Workshoppreises</li>
              <li>weniger als 7 Tage vor dem Termin: keine Rückerstattung</li>
            </ul>
            <p className="mt-3">
              Bei Nichterscheinen ohne vorherige Stornierung besteht kein Anspruch auf
              Rückerstattung.
            </p>
            <p className="mt-4">
              <span className="font-semibold text-[#1d1d1d]">4.4 Ersatzteilnehmer</span>
            </p>
            <p className="mt-3">
              Der Teilnehmer ist berechtigt, jederzeit eine Ersatzperson zu benennen, die an seiner
              Stelle am Workshop teilnimmt. In diesem Fall entstehen keine zusätzlichen Kosten.
            </p>
            <p className="mt-4">
              <span className="font-semibold text-[#1d1d1d]">
                4.5 Absage oder Änderungen durch Fermentfreude
              </span>
            </p>
            <p>
              Fermentfreude behält sich vor, Workshops aus wichtigen Gründen abzusagen oder zu
              verschieben.
            </p>
            <p className="mt-3">
              Dies gilt insbesondere bei:
            </p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Krankheit des Trainers</li>
              <li>zu geringer Teilnehmerzahl</li>
              <li>höherer Gewalt</li>
              <li>organisatorischen Gründen</li>
            </ul>
            <p className="mt-3">
              In diesem Fall werden bereits bezahlte Teilnahmegebühren vollständig rückerstattet oder
              auf Wunsch auf einen Ersatztermin übertragen.
            </p>
            <p className="mt-3">
              Weitergehende Ansprüche, insbesondere Ersatz von Reise- oder Unterkunftskosten, sind
              ausgeschlossen.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              5. Gutscheine
            </h2>
            <p>
              Gutscheine können über die Website oder direkt bei Fermentfreude erworben werden.
            </p>
            <p className="mt-3">
              Gutscheine sind ab Ausstellungsdatum drei Jahre gültig, sofern nicht anders angegeben.
            </p>
            <p className="mt-3">Eine Barablöse von Gutscheinen ist ausgeschlossen.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              6. Online-Shop und Warenverkauf
            </h2>
            <p>Fermentfreude bietet ausgewählte Produkte über den Online-Shop an.</p>
            <p className="mt-3">Bestellungen sind nur in haushaltsüblichen Mengen möglich.</p>
            <p className="mt-3">Der Verkauf erfolgt ausschließlich an volljährige Personen.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              7. Abholung der Ware
            </h2>
            <p>
              Derzeit erfolgt die Lieferung der Waren ausschließlich durch Abholung im Geschäftslokal
              von Fermentfreude.
            </p>
            <p className="mt-3">
              Der Kunde wird informiert, sobald die Ware zur Abholung bereitsteht.
            </p>
            <p className="mt-3">
              Die Abholung erfolgt während der bekanntgegebenen Öffnungs- bzw. Abholzeiten.
            </p>
            <p className="mt-3">
              Bei verderblichen Waren ist eine zeitnahe Abholung erforderlich.
            </p>
            <p className="mt-3">
              Erfolgt die Abholung nicht innerhalb angemessener Frist, behält sich Fermentfreude
              vor, vom Vertrag zurückzutreten.
            </p>
            <p className="mt-3">Mit der Übergabe der Ware geht die Gefahr auf den Kunden über.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              8. Widerrufsrecht für Verbraucher
            </h2>
            <p>
              Verbrauchern steht grundsätzlich ein 14-tägiges Widerrufsrecht bei
              Fernabsatzverträgen zu.
            </p>
            <p className="mt-3">Das Widerrufsrecht besteht jedoch nicht bei Verträgen über:</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>
                Dienstleistungen im Zusammenhang mit Freizeitbetätigungen, wenn für die
                Vertragserfüllung ein bestimmter Termin oder Zeitraum vorgesehen ist (z. B.
                Workshops),
              </li>
              <li>
                Waren, die schnell verderben können oder deren Verfallsdatum schnell überschritten
                würde.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              9. Gewährleistung
            </h2>
            <p>Es gelten die gesetzlichen Gewährleistungsbestimmungen.</p>
            <p className="mt-3">
              Bei berechtigten Mängeln hat der Kunde Anspruch auf Verbesserung oder Austausch, sofern
              dies möglich und wirtschaftlich vertretbar ist.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              10. Haftung
            </h2>
            <p>
              Fermentfreude haftet nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem
              Verhalten beruhen.
            </p>
            <p className="mt-3">Diese Haftungsbeschränkung gilt nicht für:</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Personenschäden</li>
              <li>Schäden nach dem Produkthaftungsgesetz</li>
              <li>Ansprüche, die gesetzlich nicht eingeschränkt werden dürfen.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              11. Bild- und Videoaufnahmen
            </h2>
            <p>Während Workshops können Foto- oder Videoaufnahmen entstehen.</p>
            <p className="mt-3">
              Diese können für Dokumentations- und Marketingzwecke von Fermentfreude verwendet
              werden.
            </p>
            <p className="mt-3">
              Teilnehmer können der Verwendung ihrer Aufnahmen jederzeit widersprechen.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              12. Datenschutz
            </h2>
            <p>
              Informationen zur Verarbeitung personenbezogener Daten sind in der Datenschutzerklärung
              auf der Website von Fermentfreude abrufbar.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              13. Anwendbares Recht und Gerichtsstand
            </h2>
            <p>Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts.</p>
            <p className="mt-3">
              Gerichtsstand ist das sachlich zuständige Gericht am Sitz von Fermentfreude, soweit dem
              keine zwingenden verbraucherrechtlichen Bestimmungen entgegenstehen.
            </p>
          </section>
          </div>
        </div>
      </div>
    </main>
  )
}
