import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutz | FermentFreude',
  description: 'Datenschutzerklärung von FermentFreude – Informationen zum Schutz Ihrer persönlichen Daten.',
}

export default function DatenschutzPage() {
  return (
    <main className="bg-white text-[#1d1d1d]">
      <div className="mx-auto max-w-3xl px-6 md:px-10 py-20 md:py-28">
        <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight mb-12">
          Datenschutz
        </h1>

        <div className="space-y-10 font-sans text-base leading-relaxed text-[#1d1d1d]/80">
          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Erklärung zur Informationspflicht
            </h2>
            <p>
              In folgender Datenschutzerklärung informieren wir Sie über die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer Webseite. Wir erheben und verarbeiten personenbezogene Daten nur auf Grundlage der gesetzlichen Bestimmungen (Datenschutzgrundverordnung, Telekommunikationsgesetz 2003).
            </p>
            <p className="mt-3">
              Sobald Sie als Benutzer auf unsere Webseite zugreifen oder diese besuchen wird Ihre IP-Adresse, Beginn sowie Beginn und Ende der Sitzung erfasst. Dies ist technisch bedingt und stellt somit ein berechtigtes Interesse iSv Art 6 Abs 1 lit f DSGVO.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Kontakt mit uns
            </h2>
            <p>
              Wenn Sie uns, entweder über unser Kontaktformular auf unserer Webseite, oder per Email kontaktieren, dann werden die von Ihnen an uns übermittelten Daten zwecks Bearbeitung Ihrer Anfrage oder für den Fall von weiteren Anschlussfragen für sechs Monate bei uns gespeichert. Es erfolgt, ohne Ihre Einwilligung, keine Weitergabe Ihrer übermittelten Daten.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Datenspeicherung
            </h2>
            <p>
              Im Rahmen der Erleichterung des Einkaufsvorganges und zur späteren Vertragsabwicklung werden vom Webshop-Betreiber im Rahmen von Cookies die IP-Adresse des Anschlussinhabers gespeichert, ebenso wie Name, Telefonnummer, E-Mail Adresse, Zahlungsinformation, Kreditkarten Information.
            </p>
            <p className="mt-3">
              Für die Vertragsabwicklung werden auch folgende Daten bei uns gespeichert: Name, Telefonnummer, E-Mail Adresse, Zahlungsinformation, Kreditkarten Information.
            </p>
            <p className="mt-3">
              Die von Ihnen bereitgestellten Daten sind für die Vertragserfüllung und zur Durchführung vorvertraglicher Maßnahmen erforderlich. Ein Vertragsabschluss ohne dieser Daten ist nicht möglich. Eine Übermittlung der erhobenen Daten an Dritte erfolgt nicht, mit Ausnahme der Übermittlung von Zahlungsdaten (Kreditkartendaten) an die abwickelnden Bankinstitute/Zahlungsdienstleister zum Zwecke der Abbuchung des Einkaufspreises, an das von uns Beauftragte Versandunternehmen (Transportunternehmen), welches mit der Zustellung der Ware beauftragt ist und unseren Steuerberater zur Erfüllung unserer steuerrechtlichen Verpflichtungen.
            </p>
            <p className="mt-3">
              Sollten Sie den Einkaufsvorgang abbrechen, werden diese bei uns gespeicherten Daten gelöscht. Solle ein Vertragsabschluss zustande kommen, werden sämtliche Daten, resultierend aus dem Vertragsverhältnis, bis zum Ablauf der steuerrechtlichen Aufbewahrungsfrist (7 Jahre) gespeichert. Der übermittelte Name, die Anschrift, gekaufte Waren und Kaufdatum werden darüber hinaus bis zum Ablauf der Produkthaftung (10 Jahre) gespeichert. Die Datenverarbeitung erfolgt auf Basis der gesetzlichen Bestimmungen des § 96 Abs 3 TKG sowie des Art 6 Abs 1 lit a (Einwilligung) und/oder lit b (notwendig zur Vertragserfüllung) der DSGVO.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Cookies
            </h2>
            <p>
              Unsere Website verwendet so genannte Cookies. Dabei handelt es sich um kleine Textdateien, die mit Hilfe des Browsers auf Ihrem Endgerät abgelegt werden. Sie richten keinen Schaden an. Wir nutzen Cookies dazu, unser Angebot nutzerfreundlich zu gestalten. Einige Cookies bleiben auf Ihrem Endgerät gespeichert, bis Sie diese löschen. Sie ermöglichen es uns, Ihren Browser beim nächsten Besuch wiederzuerkennen. Wenn Sie dies nicht wünschen, so können Sie Ihren Browser so einrichten, dass er Sie über das Setzen von Cookies informiert und Sie dies nur im Einzelfall erlauben. Bei der Deaktivierung von Cookies kann die Funktionalität unserer Website eingeschränkt sein.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Server-Log Files
            </h2>
            <p>
              Diese Webseite und der damit verbundene Provider erhebt im Zuge der Webseitennutzung automatisch Informationen im Rahmen sogenannter „Server-Log Files“. Dies betrifft insbesondere:
            </p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>IP-Adresse oder Hostname</li>
              <li>den verwendeten Browser</li>
              <li>Aufenthaltsdauer auf der Webseite sowie Datum und Uhrzeit</li>
              <li>aufgerufene Seiten der Webseite</li>
              <li>Spracheinstellungen und Betriebssystem</li>
              <li>„Leaving-Page“ (auf welcher URL hat der Benutzer die Webseite verlassen)</li>
              <li>ISP (Internet Service Provider)</li>
            </ul>
            <p className="mt-3">
              Diese erhobenen Informationen werden nicht personenbezogen verarbeitet oder mit personenbezogenen Daten in Verbindung gebracht. Der Webseitenbetreiber behält es sich vor, im Falle von Bekanntwerden rechtswidriger Tätigkeiten, diese Daten auszuwerten oder zu überprüfen.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Newsletter
            </h2>
            <p>
              Sie haben die Möglichkeit, über unsere Website unseren Newsletter zu abonnieren. Hierfür benötigen wir Ihre E-Mail-Adresse und ihre Erklärung, dass Sie mit dem Bezug des Newsletters einverstanden sind.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Ihre Rechte als Betroffener
            </h2>
            <p>
              Sie als Betroffener haben bezüglich Ihrer Daten, welche bei uns gespeichert sind grundsätzlich ein Recht auf:
            </p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Auskunft</li>
              <li>Löschung der Daten</li>
              <li>Berichtigung der Daten</li>
              <li>Übertragbarkeit der Daten</li>
              <li>Wiederruf und Widerspruch zur Datenverarbeitung</li>
              <li>Einschränkung</li>
            </ul>
            <p className="mt-3">
              Wenn sie vermuten, dass im Zuge der Verarbeitung Ihrer Daten Verstöße gegen das Datenschutzrecht passiert sind, so haben Sie die Möglichkeit sich bei uns (
              <a href="mailto:fermentfreude@gmail.com" className="underline hover:text-[#e6be68] transition-colors">
                fermentfreude@gmail.com
              </a>
              ) oder der Datenschutzbehörde zu beschweren.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide mb-4 text-[#1d1d1d]">
              Kontaktdaten
            </h2>
            <p>
              Webseitenbetreiber: Fermentfreude OG
              <br />
              Telefonnummer:{' '}
              <a href="tel:+4306604943577" className="underline hover:text-[#e6be68] transition-colors">
                +43 660 4943577
              </a>
              <br />
              Email:{' '}
              <a href="mailto:fermentfreude@gmail.com" className="underline hover:text-[#e6be68] transition-colors">
                fermentfreude@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
