/**
 * Seed the Help & FAQ page.
 *
 * Creates a "Hilfe & FAQ" / "Help & FAQ" Page (slug: "help") containing a
 * single HelpFaqBlock. Bilingual (DE first → read back IDs → EN with same IDs).
 *
 * Run: pnpm seed help          # skips if page already has content
 *      pnpm seed help --force  # overwrites
 */
import config from '@payload-config'
import { getPayload } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const heroBgPath = path.resolve(__dirname, '../../public/assets/images/help/help-hero-wide.png')

type FaqIcon =
  | 'user'
  | 'calendar'
  | 'gift'
  | 'shopping-bag'
  | 'truck'
  | 'credit-card'
  | 'utensils'
  | 'wrench'
  | 'book-open'
  | 'lock'
  | 'star'
  | 'help-circle'

type SectionDE = {
  key: string
  icon: FaqIcon
  title: string
  intro?: string
  items: Array<{ question: string; answer: string }>
}

const sectionsDE: SectionDE[] = [
  {
    key: 'account',
    icon: 'user',
    title: 'Konto & Anmeldung',
    items: [
      {
        question: 'Brauche ich ein Konto, um etwas zu kaufen?',
        answer:
          'Nein, du kannst Workshops und Produkte auch als Gast bestellen. Mit einem Konto siehst du Bestellungen und Buchungen jederzeit unter „Mein Konto“.',
      },
      {
        question: 'Wie erstelle ich ein Konto?',
        answer:
          'Klicke oben rechts auf das Personensymbol und wähle „Registrieren“. Du brauchst eine E-Mail-Adresse und ein Passwort. Beim Checkout kannst du das Konto auch direkt anlegen.',
      },
      {
        question: 'Ich habe mein Passwort vergessen – was nun?',
        answer:
          'Auf der Login-Seite auf „Passwort vergessen“ klicken. Du erhältst eine E-Mail mit Reset-Link — bitte auch den Spam-Ordner prüfen.',
      },
      {
        question: 'Wie ändere ich E-Mail oder Passwort?',
        answer:
          'Einloggen und unter „Mein Konto“ Kontodaten und Passwort selbst aktualisieren.',
      },
    ],
  },
  {
    key: 'workshops',
    icon: 'calendar',
    title: 'Workshops buchen',
    items: [
      {
        question: 'Wie buche ich einen Workshop?',
        answer:
          'Unter „Workshops“ Termin und Plätze wählen und die zahlungspflichtige Buchung absenden. Der Vertrag kommt erst zustande, wenn Fermentfreude die Buchung ausdrücklich bestätigt — eine bloße Zahlungs- oder Eingangsbestätigung reicht dafür nicht aus.',
      },
      {
        question: 'Wann ist mein Platz verbindlich reserviert?',
        answer:
          'Erst nach Zustandekommen des Vertrags und erfolgreicher Zahlung. Die Zahlungsabwicklung allein garantiert keinen Platz, wenn der Workshop ausgebucht ist, die Kapazität überschritten wurde oder ein technischer Fehler vorliegt. Wird die Buchung nicht angenommen, erstatten wir einen bereits eingezogenen Betrag unverzüglich zurück.',
      },
      {
        question: 'Gibt es ein 14-tägiges Rücktrittsrecht bei Workshops?',
        answer:
          'Nein. Bei Workshops mit festem Termin besteht gemäß § 18 Abs. 1 Z 10 FAGG grundsätzlich kein gesetzliches 14-tägiges Rücktrittsrecht. Für Storno und Umbuchung gelten die vertraglichen Fristen in diesen FAQ bzw. in den AGB.',
      },
      {
        question: 'Kann ich mehrere Plätze auf einmal buchen?',
        answer:
          'Ja. Du kannst mehrere Teilnahmeplätze gemeinsam buchen. Storno, Umbuchung und Ersatzpersonen gelten dann für jeden Platz einzeln.',
      },
      {
        question: 'Wo finden die Workshops statt?',
        answer:
          'In Graz, in der Regel Grabenstraße 15, 8010 Graz. Die genaue Adresse steht in deiner Buchungsbestätigung. Geringfügige Raumwechsel am selben oder nahegelegenen Ort sind nach AGB möglich; wesentliche Ortsänderungen geben dir Wahlrechte (Teilnahme, Umbuchung oder Rückerstattung).',
      },
      {
        question: 'Was muss ich mitbringen — und was ist mit Allergien?',
        answer:
          'Wir stellen Zutaten und Werkzeuge bereit. Bitte informiere uns vorab über Allergien, Unverträglichkeiten oder gesundheitliche Einschränkungen. Eine vollständige Freiheit von Allergenspuren können wir in einer gemeinsamen Küche nicht garantieren, sofern nicht ausdrücklich zugesagt.',
      },
      {
        question: 'Dürfen Minderjährige teilnehmen?',
        answer:
          'Buchungen Minderjähriger brauchen die gesetzlich erforderliche Zustimmung der Erziehungsberechtigten. Die Teilnahme bedarf der vorherigen Abstimmung mit uns, sofern der Workshop nicht ausdrücklich für Minderjährige geeignet ist. Wir können eine volljährige Begleitperson verlangen.',
      },
      {
        question: 'Was passiert bei zu wenigen Anmeldungen?',
        answer:
          'Grundsätzlich sind vier bezahlte Plätze vorgesehen. Wir können auch mit weniger starten. Eine Absage nur wegen Mindestteilnehmerzahl erfolgt spätestens 48 Stunden vor Beginn — dann kannst du umbuchen oder den bezahlten Betrag zurückerhalten.',
      },
    ],
  },
  {
    key: 'cancellation',
    icon: 'book-open',
    title: 'Storno, Umbuchung & Ersatz',
    items: [
      {
        question: 'Wie storniere ich meine Workshop-Buchung?',
        answer:
          'Über die vorgesehene Website-Funktion oder per E-Mail an kontakt@fermentfreude.at. Maßgeblich ist der Zeitpunkt des Eingangs. Fristen zählen rückwärts ab Workshopbeginn (Europe/Vienna): 30 Tage = 720 Stunden, 14 Tage = 336 Stunden.',
      },
      {
        question: 'Welche Storno-Fristen gelten?',
        answer:
          'Mindestens 30 Tage vor Beginn: volle Rückerstattung des tatsächlich bezahlten Betrags oder einmalige Umbuchung auf einen verfügbaren, gleichpreisigen regulären Workshop. Weniger als 30, aber mindestens 14 Tage: keine Geldrückerstattung, aber einmalige Umbuchung möglich. Weniger als 14 Tage: kein Anspruch auf Rückerstattung, Gutschrift oder reguläre Umbuchung — eine kostenlose Übertragung auf eine Ersatzperson bleibt möglich.',
      },
      {
        question: 'Gelten Krankheit oder Terminvergessen als Ausnahme?',
        answer:
          'Persönliche Verhinderung (Krankheit, Beruf, Betreuung, Anreiseprobleme, Vergessen des Termins) ändert die Fristen grundsätzlich nicht. In Einzelfällen können wir freiwillig Kulanz anbieten — daraus entsteht kein Anspruch für andere Fälle.',
      },
      {
        question: 'Wie funktioniert die Umbuchung?',
        answer:
          'Nur einmal, nur innerhalb der Fristen, nur bei verfügbaren Plätzen und grundsätzlich nur auf einen gleichpreisigen regulären Workshop (auch anderer Workshoptyp möglich). Wirksam erst mit Bestätigung. Danach gibt es keine neuen selbstständigen Storno-/Umbuchungsrechte für denselben Platz. Bei teurerem Zielworkshop ist die Differenz zu zahlen; bei günstigerem wird sie erstattet oder gutgeschrieben.',
      },
      {
        question: 'Ich habe kurzfristig falsch gebucht — was nun?',
        answer:
          'Wurde der Workshop weniger als 14 Tage vor Beginn gebucht, kannst du eine offensichtliche Fehlbuchung innerhalb von 24 Stunden nach der Bestätigung einmalig korrigieren — sofern der Workshop noch mindestens 48 Stunden entfernt ist. Dann nur Umbuchung (keine Geldrückerstattung). Technisch verursachte Doppelbuchungen oder Doppelzahlungen korrigieren wir vollständig.',
      },
      {
        question: 'Kann jemand anderes für mich hingehen?',
        answer:
          'Ja. Bis zum Workshopbeginn kannst du den bezahlten Platz kostenlos auf eine Ersatzperson übertragen. Bitte uns möglichst vorher informieren. Die Ersatzperson muss Voraussetzungen erfüllen und Allergien angeben. Die ursprünglich buchende Person bleibt Vertragspartnerin, sofern nichts anderes vereinbart ist.',
      },
      {
        question: 'Was gilt bei Nichterscheinen oder Verspätung?',
        answer:
          'Ohne rechtzeitige Stornierung kein Anspruch auf Rückerstattung, Umbuchung oder Ersatz. Bei erheblicher Verspätung kann die Teilnahme eingeschränkt oder ausgeschlossen werden. Erinnerungs-E-Mails sind freiwillig — fehlende Erinnerung ändert nichts an der verbindlichen Buchung.',
      },
      {
        question: 'Was, wenn Fermentfreude absagt oder den Termin wesentlich ändert?',
        answer:
          'Bei Absage oder wesentlicher Änderung (z. B. anderer Kalendertag, Beginnverschiebung über 60 Minuten, wesentliche Inhalts- oder Ortsänderung) kannst du wählen: Teilnahme am geänderten Termin, Umbuchung auf einen verfügbaren regulären Workshop oder volle Rückerstattung des bezahlten Betrags. Es erfolgt keine automatische Umbuchung.',
      },
    ],
  },
  {
    key: 'vouchers',
    icon: 'gift',
    title: 'Gutscheine',
    items: [
      {
        question: 'Wo löse ich meinen Gutschein ein?',
        answer:
          'Über „Gutschein einlösen“ in der Fußzeile oder /redeem-voucher. Code eingeben, Termin wählen und Buchung abschließen. Entgeltliche Wertgutscheine können — sofern technisch vorgesehen — teilweise eingelöst werden; Restwert bleibt am Code.',
      },
      {
        question: 'Wie lange ist mein Gutschein gültig?',
        answer:
          'Entgeltlich erworbene Gutscheine unterliegen — sofern keine kürzere Frist wirksam vereinbart wurde — der gesetzlichen Verjährungsfrist. Kostenlose Aktions-, Werbe- oder Kulanzgutscheine können eine begrenzte Gültigkeit und weitere Bedingungen haben; die stehen auf dem Gutschein oder bei Ausgabe.',
      },
      {
        question: 'Kann ich einen Gutschein verschenken oder weitergeben?',
        answer:
          'Entgeltlich erworbene Wertgutscheine sind übertragbar und grundsätzlich nicht an ein persönliches Konto gebunden. Wer den gültigen Code vorlegt, kann einlösen — bitte den Code vor unbefugtem Zugriff schützen.',
      },
      {
        question: 'Habe ich ein Rücktrittsrecht beim Online-Kauf eines Gutscheins?',
        answer:
          'Ja, Verbraucherinnen und Verbraucher haben beim Onlinekauf eines entgeltlichen Gutscheins grundsätzlich ein 14-tägiges Rücktrittsrecht nach dem FAGG. Details stehen in der Rücktrittsbelehrung. Nach wirksamem Rücktritt erstatten wir den Kaufpreis und deaktivieren den Gutschein.',
      },
      {
        question: 'Was passiert mit dem Gutschein, wenn ich die Buchung storniere?',
        answer:
          'Bei wirksamer Rückabwicklung einer mit entgeltlichem Gutschein bezahlten Buchung wird der Gutscheinwert grundsätzlich wieder auf dem Gutschein verfügbar. Ein Gutscheinanteil wird nicht bar ausgezahlt. Bei Mischzahlung: Gutscheinanteil zurück auf den Gutschein, Kartenzahlung zurück auf das Zahlungsmittel. Kostenlose Aktions-/Kulanzanteile werden nicht in Geld ausgezahlt.',
      },
      {
        question: 'Mein Code wird nicht akzeptiert oder ich habe ihn verloren – was tun?',
        answer:
          'Code genau wie angegeben eingeben (keine Leerzeichen). Bei Verlust oder unbefugter Nutzung gibt es keinen Ersatzanspruch, sofern der Gutschein nicht eindeutig identifiziert, rechtzeitig gesperrt und als noch nicht eingelöst nachgewiesen werden kann. Schreib uns an kontakt@fermentfreude.at.',
      },
    ],
  },
  {
    key: 'shop',
    icon: 'shopping-bag',
    title: 'Shop & Bestellungen',
    items: [
      {
        question: 'Wann kommt der Kaufvertrag zustande?',
        answer:
          'Die Produktdarstellung ist noch kein verbindliches Angebot. Du gibst mit der Bestellung ein Angebot ab; der Vertrag kommt mit unserer ausdrücklichen Bestellbestätigung zustande. Bestellungen nur im Rahmen verfügbarer Mengen.',
      },
      {
        question: 'Gibt es ein Rücktrittsrecht bei Waren?',
        answer:
          'Verbraucherinnen und Verbraucher haben im Fernabsatz grundsätzlich 14 Tage Rücktrittsrecht, sofern keine Ausnahme greift — z. B. schnell verderbliche Waren oder versiegelte Hygieneartikel nach Entfernen der Versiegelung. Details in der Rücktrittsbelehrung.',
      },
      {
        question: 'Wo sehe ich meine Bestellungen und Rechnung?',
        answer:
          'Im Konto unter „Bestellungen“. Nach Zahlung erhältst du die Bestätigung/Rechnung per E-Mail. Wir speichern Vertragsdaten nach den gesetzlichen Aufbewahrungspflichten.',
      },
      {
        question: 'Was gilt bei Mängeln?',
        answer:
          'Es gelten die gesetzlichen Gewährleistungsrechte. Bitte melde Mängel möglichst zeitnah an kontakt@fermentfreude.at, damit wir rasch prüfen können.',
      },
    ],
  },
  {
    key: 'shipping',
    icon: 'truck',
    title: 'Abholung & Versand',
    items: [
      {
        question: 'Versendet ihr alle Produkte?',
        answer:
          'Nein. Versand nur, wenn er beim Produkt und im Bestellvorgang ausdrücklich angeboten wird. Steht nur Abholung zur Auswahl, wird die Ware nicht versendet und ist am angegebenen Abholort zu übernehmen.',
      },
      {
        question: 'Wie funktioniert die Abholung?',
        answer:
          'Wir informieren dich über Ort und Abholzeiten bzw. vereinbarten Termin. Bitte Bestell- oder Abholbestätigung mitbringen. Verderbliche oder kühlpflichtige Ware muss rechtzeitig abgeholt werden — sonst können wir nach Gesetz neu vereinbaren, vom Vertrag zurücktreten oder entstandenen Schaden geltend machen.',
      },
      {
        question: 'Wer trägt die Verantwortung nach der Übergabe?',
        answer:
          'Nach Übergabe bist du für Kühlung, Lagerung, Transport und Verwendung verantwortlich. Bei Verbraucherinnen und Verbrauchern geht die Gefahr des zufälligen Untergangs grundsätzlich erst mit der tatsächlichen Übergabe über. Bis zur vollständigen Bezahlung bleibt die Ware unser Eigentum.',
      },
    ],
  },
  {
    key: 'payment',
    icon: 'credit-card',
    title: 'Bezahlung & Preise',
    items: [
      {
        question: 'Welche Zahlungsarten akzeptiert ihr?',
        answer:
          'Die im Checkout angebotenen Methoden — die Abwicklung kann über Stripe erfolgen. Zahlung kann schon mit Abgabe der Bestellung autorisiert werden; der Vertrag entsteht dennoch erst mit unserer Annahme.',
      },
      {
        question: 'Warum wird keine Umsatzsteuer ausgewiesen?',
        answer:
          'Fermentfreude OG nimmt derzeit die Kleinunternehmerregelung (§ 6 Abs. 1 Z 27 UStG) in Anspruch. Es wird derzeit keine Umsatzsteuer ausgewiesen. Maßgeblich ist der im Buchungs- oder Bestellvorgang gezeigte Gesamtpreis in Euro.',
      },
      {
        question: 'Werden Rabatte oder Aktionsgutscheine bar ausgezahlt?',
        answer:
          'Nein. Rabatte, Aktionscodes und kostenlos gewährte Gutscheine werden nicht in bar ausbezahlt und begründen keinen Anspruch auf Auszahlung ihres Nennwerts.',
      },
      {
        question: 'Sind meine Zahlungsdaten sicher?',
        answer:
          'Zahlungen laufen verschlüsselt über den Zahlungsdienstleister (z. B. Stripe). Wir speichern keine vollständigen Kreditkartendaten auf unseren Servern.',
      },
    ],
  },
  {
    key: 'gastronomy',
    icon: 'utensils',
    title: 'Gastronomie & B2B',
    items: [
      {
        question: 'Liefert ihr Tempeh und Fermente an die Gastronomie?',
        answer:
          'Ja. Anfragen über die Seite „Gastronomie“ oder an kontakt@fermentfreude.at. Für Unternehmerinnen und Unternehmer gelten die AGB ebenfalls; abweichende Bedingungen brauchen unsere ausdrückliche Zustimmung.',
      },
      {
        question: 'Geht ein Workshop vor Ort in unserer Küche?',
        answer:
          'Ja, private oder On-Site-Formate sind möglich. Für Sonder- und Partnerveranstaltungen können ergänzende Bedingungen gelten — darauf weisen wir vor der Buchung hin.',
      },
      {
        question: 'Ist Tempeh vegan und glutenfrei?',
        answer:
          'Ja. Unser Tempeh ist vegan und glutenfrei — ein eigenständiges Lebensmittel auf Hülsenfruchtbasis.',
      },
    ],
  },
  {
    key: 'support',
    icon: 'wrench',
    title: 'Kontakt & Technik',
    items: [
      {
        question: 'Wie erreiche ich euch?',
        answer:
          'Fermentfreude OG, Grabenstraße 15, 8010 Graz · Telefon +43 (0) 660 49 43 577 · E-Mail kontakt@fermentfreude.at · Website fermentfreude.at. Oder über die Kontaktseite.',
      },
      {
        question: 'Ich habe keine Bestätigungs-E-Mail erhalten.',
        answer:
          'Spam-Ordner prüfen. Fehlende Bestätigungen senden wir auf Anfrage erneut. Das bloße Ausbleiben einer E-Mail begründet keinen Rückerstattungsanspruch, wenn die Buchung ordnungsgemäß zustande gekommen ist.',
      },
      {
        question: 'Wo finde ich die vollständigen AGB?',
        answer:
          'Die verbindlichen Allgemeinen Geschäftsbedingungen (Stand: 14. Juli 2026) findest du auf der Website unter AGB. Diese FAQ fassen die wichtigsten Punkte verständlich zusammen — im Zweifel gilt die AGB-Fassung, die bei deiner Buchung einbezogen wurde.',
      },
      {
        question: 'Wie ändere ich die Sprache der Seite?',
        answer:
          'Oben in der Navigation den DE/EN-Umschalter nutzen. Vertragssprache ist Deutsch.',
      },
    ],
  },
]

const sectionsEN: SectionDE[] = [
  {
    key: 'account',
    icon: 'user',
    title: 'Account & sign-in',
    items: [
      {
        question: 'Do I need an account to buy something?',
        answer:
          'No — you can book workshops and order as a guest. With an account you can view orders and bookings any time under “Your account”.',
      },
      {
        question: 'How do I create an account?',
        answer:
          'Click the person icon top right and choose “Register”. You need an email and password. You can also create an account during checkout.',
      },
      {
        question: 'I forgot my password — what now?',
        answer:
          'On the login page, click “Forgot password”. You will get a reset link by email — please also check spam.',
      },
      {
        question: 'How do I change my email or password?',
        answer: 'Sign in and update your details under “Your account”.',
      },
    ],
  },
  {
    key: 'workshops',
    icon: 'calendar',
    title: 'Booking workshops',
    items: [
      {
        question: 'How do I book a workshop?',
        answer:
          'Under “Workshops”, choose a date and seats and submit the paid booking. The contract is only formed when Fermentfreude expressly confirms the booking — a payment or receipt acknowledgement alone is not enough.',
      },
      {
        question: 'When is my seat firmly reserved?',
        answer:
          'Only after the contract is formed and payment succeeds. Payment alone does not guarantee a seat if the workshop is sold out, capacity was exceeded, or a technical error occurred. If we cannot accept the booking, any amount already charged is refunded promptly.',
      },
      {
        question: 'Is there a 14-day withdrawal right for workshops?',
        answer:
          'No. For workshops with a fixed date there is generally no statutory 14-day withdrawal right under § 18 Abs. 1 Z 10 FAGG. Cancellation and rescheduling follow the contractual deadlines in these FAQs / the Terms.',
      },
      {
        question: 'Can I book multiple seats at once?',
        answer:
          'Yes. You can book several seats together. Cancellation, rescheduling and substitute-person rules then apply per seat.',
      },
      {
        question: 'Where do the workshops take place?',
        answer:
          'In Graz, usually Grabenstraße 15, 8010 Graz. The exact address is in your booking confirmation. Minor venue changes nearby are allowed under the Terms; material location changes give you a choice (attend, reschedule, or full refund).',
      },
      {
        question: 'What should I bring — and what about allergies?',
        answer:
          'We provide ingredients and tools. Please tell us in advance about allergies, intolerances or health restrictions. We cannot guarantee a completely allergen-free shared kitchen unless expressly promised.',
      },
      {
        question: 'Can minors take part?',
        answer:
          'Bookings by minors need the legally required parental consent. Participation needs prior agreement with us unless the workshop is expressly offered for minors. We may require an adult companion.',
      },
      {
        question: 'What if too few people sign up?',
        answer:
          'We generally need four paid seats. We may still run with fewer. A cancellation only for not meeting the minimum happens at the latest 48 hours before start — then you can reschedule or get a full refund of the amount paid.',
      },
    ],
  },
  {
    key: 'cancellation',
    icon: 'book-open',
    title: 'Cancel, reschedule & substitutes',
    items: [
      {
        question: 'How do I cancel my workshop booking?',
        answer:
          'Via the website function provided or by email to kontakt@fermentfreude.at. The time of receipt counts. Deadlines run backwards from workshop start (Europe/Vienna): 30 days = 720 hours, 14 days = 336 hours.',
      },
      {
        question: 'What cancellation deadlines apply?',
        answer:
          'At least 30 days before start: full refund of the amount actually paid for that seat, or a one-time reschedule to an available equal-price regular workshop. Less than 30 but at least 14 days: no cash refund, but one-time reschedule. Less than 14 days: no refund, credit or regular reschedule — a free transfer to a substitute person remains possible.',
      },
      {
        question: 'Do illness or forgetting the date count as exceptions?',
        answer:
          'Personal reasons (illness, work, care duties, travel issues, forgetting the date) generally do not change the deadlines. We may offer goodwill in individual cases — that creates no right for other cases.',
      },
      {
        question: 'How does rescheduling work?',
        answer:
          'Only once, only within the deadlines, only if seats are available, and generally only onto an equal-price regular workshop (another regular workshop type is fine). It is effective only once confirmed. After that there are no new independent cancel/reschedule rights for that seat. For a higher-priced target workshop you pay the difference; for a lower one we refund or credit the difference.',
      },
      {
        question: 'I booked the wrong date at short notice — what now?',
        answer:
          'If you booked less than 14 days before start, an obvious misbooking can be corrected once within 24 hours of the confirmation — provided the workshop is still at least 48 hours away. Then only rescheduling (no cash refund). Technical double bookings or double payments are fully corrected.',
      },
      {
        question: 'Can someone else attend in my place?',
        answer:
          'Yes. Until the workshop starts you can transfer the paid seat to another person free of charge. Please tell us beforehand if possible. The substitute must meet the requirements and disclose allergies. The original booker remains the contract partner unless otherwise agreed.',
      },
      {
        question: 'What if I no-show or arrive late?',
        answer:
          'Without timely cancellation there is no right to refund, reschedule or replacement. Significant lateness may limit or exclude participation. Reminder emails are voluntary — a missing reminder does not change a confirmed booking.',
      },
      {
        question: 'What if Fermentfreude cancels or materially changes the date?',
        answer:
          'On cancellation or a material change (e.g. another calendar day, start shifted by more than 60 minutes, material content or venue change) you may choose: attend the changed workshop, reschedule to any available regular workshop, or a full refund of the amount paid. There is no automatic reschedule.',
      },
    ],
  },
  {
    key: 'vouchers',
    icon: 'gift',
    title: 'Vouchers',
    items: [
      {
        question: 'Where do I redeem my voucher?',
        answer:
          'Via “Redeem voucher” in the footer or /redeem-voucher. Enter the code, pick a date and complete booking. Paid value vouchers can be partially redeemed if the system allows; remaining value stays on the code.',
      },
      {
        question: 'How long is my voucher valid?',
        answer:
          'Paid vouchers are subject to the statutory limitation period unless a shorter period was validly agreed. Free promo, marketing or goodwill vouchers may have a limited validity and other conditions — shown on the voucher or at issue.',
      },
      {
        question: 'Can I gift or transfer a voucher?',
        answer:
          'Paid value vouchers are transferable and generally not tied to a personal account. Whoever presents a valid code can redeem it — please keep the code safe from unauthorised use.',
      },
      {
        question: 'Do I have a withdrawal right when buying a voucher online?',
        answer:
          'Yes — consumers generally have a 14-day withdrawal right under the FAGG when buying a paid voucher online. Details are in the withdrawal notice. After a valid withdrawal we refund the purchase price and deactivate the voucher.',
      },
      {
        question: 'What happens to the voucher if I cancel the booking?',
        answer:
          'If a booking paid with a paid voucher is validly unwound, the voucher value is generally restored to that voucher. Voucher amounts are not paid out in cash. Mixed payment: voucher share back to the voucher, card share back to the payment method. Free promo/goodwill portions are not paid out in cash.',
      },
      {
        question: 'My code is rejected or I lost it — what can I do?',
        answer:
          'Enter the code exactly as shown (no spaces). If lost or used without authorisation there is no replacement claim unless the voucher can be clearly identified, blocked in time and shown as unused. Email kontakt@fermentfreude.at.',
      },
    ],
  },
  {
    key: 'shop',
    icon: 'shopping-bag',
    title: 'Shop & orders',
    items: [
      {
        question: 'When is the purchase contract formed?',
        answer:
          'Product listings are not a binding offer. You make an offer by ordering; the contract is formed with our express order confirmation. Orders are only accepted within available stock.',
      },
      {
        question: 'Is there a withdrawal right for goods?',
        answer:
          'Consumers generally have 14 days’ withdrawal for distance sales unless an exception applies — e.g. quickly perishable goods or sealed hygiene products after the seal is removed. Details are in the withdrawal notice.',
      },
      {
        question: 'Where do I see my orders and invoice?',
        answer:
          'Under “Orders” in your account. After payment you get confirmation/invoice by email. We store contract data as required by law.',
      },
      {
        question: 'What about defects?',
        answer:
          'Statutory warranty rights apply. Please report defects promptly to kontakt@fermentfreude.at so we can check quickly.',
      },
    ],
  },
  {
    key: 'shipping',
    icon: 'truck',
    title: 'Pickup & shipping',
    items: [
      {
        question: 'Do you ship every product?',
        answer:
          'No. Shipping only if it is expressly offered for that product in checkout. If only pickup is available, goods are not shipped and must be collected at the stated location.',
      },
      {
        question: 'How does pickup work?',
        answer:
          'We tell you the place and pickup times or agreed slot. Please bring your order or pickup confirmation. Perishable or chilled goods must be collected on time — otherwise we may, under the law, agree a new slot, withdraw from the contract, or claim actual damage.',
      },
      {
        question: 'Who is responsible after handover?',
        answer:
          'After handover you are responsible for cooling, storage, transport and use. For consumers, risk of accidental loss generally passes only on actual handover. Goods remain our property until fully paid.',
      },
    ],
  },
  {
    key: 'payment',
    icon: 'credit-card',
    title: 'Payment & prices',
    items: [
      {
        question: 'Which payment methods do you accept?',
        answer:
          'Those shown in checkout — processing may run via Stripe. Payment can be authorised when you place the order; the contract still only forms when we accept it.',
      },
      {
        question: 'Why is no VAT shown?',
        answer:
          'Fermentfreude OG currently uses the small-business VAT exemption (§ 6 Abs. 1 Z 27 UStG). No VAT is shown at present. The total price in euro shown in booking/checkout is decisive.',
      },
      {
        question: 'Are discounts or promo vouchers paid out in cash?',
        answer:
          'No. Discounts, promo codes and free vouchers are not paid out in cash and create no claim to cash for their face value.',
      },
      {
        question: 'Are my payment details safe?',
        answer:
          'Payments are encrypted via the payment provider (e.g. Stripe). We do not store full card numbers on our servers.',
      },
    ],
  },
  {
    key: 'gastronomy',
    icon: 'utensils',
    title: 'Gastronomy & B2B',
    items: [
      {
        question: 'Do you supply tempeh and ferments to restaurants?',
        answer:
          'Yes. Enquire via the Gastronomy page or kontakt@fermentfreude.at. The Terms also apply to businesses; different conditions need our express agreement.',
      },
      {
        question: 'Can you run a workshop in our kitchen?',
        answer:
          'Yes — private or on-site formats are possible. Special or partner events may have extra conditions; we point those out before booking.',
      },
      {
        question: 'Is tempeh vegan and gluten-free?',
        answer:
          'Yes. Our tempeh is vegan and gluten-free — a standalone legume-based food.',
      },
    ],
  },
  {
    key: 'support',
    icon: 'wrench',
    title: 'Contact & technical',
    items: [
      {
        question: 'How can I reach you?',
        answer:
          'Fermentfreude OG, Grabenstraße 15, 8010 Graz · Phone +43 (0) 660 49 43 577 · Email kontakt@fermentfreude.at · Website fermentfreude.at. Or use the contact page.',
      },
      {
        question: 'I did not receive a confirmation email.',
        answer:
          'Check spam. We will resend missing confirmations on request. A missing email alone does not create a refund claim if the booking was properly formed.',
      },
      {
        question: 'Where are the full Terms (AGB)?',
        answer:
          'The binding Terms (as of 14 July 2026) are on the website under AGB. These FAQs summarise the main points in plain language — if in doubt, the Terms version included at the time of your booking apply.',
      },
      {
        question: 'How do I change the site language?',
        answer:
          'Use the DE/EN toggle in the navigation. Contract language is German.',
      },
    ],
  },
]

async function seedHelp() {
  const payload = await getPayload({ config })
  const force = process.argv.includes('--force')
  const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

  console.log('🆘 Seeding Help & FAQ page…')

  // Non-destructive check
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'help' } },
    limit: 5,
    depth: 0,
  })

  if (existing.docs.length > 0 && !force) {
    const doc = existing.docs[0]
    const layout = Array.isArray(doc.layout) ? doc.layout : []
    if (layout.length > 0) {
      console.log(
        `⏭️  Help page already has content (${layout.length} blocks). Skipping. Use --force to overwrite.`,
      )
      process.exit(0)
    }
  }

  if (force) {
    console.log('🔄 --force: overwriting existing help page')
    for (const doc of existing.docs) {
      await payload.delete({ collection: 'pages', id: doc.id, context: ctx })
    }
  }

  // ── Upload hero background (reuse clean asset if present) ──
  let heroBackgroundId: string | null = null
  const heroFilename = 'help-hero-wide.webp'
  const existingHero = await payload.find({
    collection: 'media',
    where: { filename: { equals: heroFilename } },
    limit: 1,
    depth: 0,
  })
  if (existingHero.docs[0]) {
    heroBackgroundId = existingHero.docs[0].id
    console.log(`  · reuse help hero bg ${heroBackgroundId}`)
  } else {
    const uploaded = await payload.create({
      collection: 'media',
      data: {
        alt: 'Help center hero — FermentFreude workshop and support illustration',
      },
      file: await optimizedFile(heroBgPath, IMAGE_PRESETS.hero),
      context: ctx,
    })
    heroBackgroundId = uploaded.id
    console.log(`  📸 Help hero bg: ${heroBackgroundId}`)
  }

  // ── 1. Create DE first ──
  const deBlock = {
    blockType: 'helpFaq' as const,
    visible: true,
    heroBackground: heroBackgroundId,
    header: {
      eyebrow: '',
      title: 'Hallo, wie können wir helfen?',
      intro: '',
      searchPlaceholder: 'Probier „Workshop buchen“ oder „Gutschein“',
      commonSearchesLabel: 'Beliebte Themen:',
      commonSearches: [
        { label: 'Workshop buchen' },
        { label: 'Gutschein einlösen' },
        { label: 'Versand' },
        { label: 'Stornieren' },
        { label: 'Gastronomie' },
      ],
      backLabel: 'Alle Themen',
      resultsLabel: 'Suchergebnisse',
      emptyResultsLabel:
        'Keine passenden Fragen. Versuche einen anderen Begriff oder wähle ein Thema.',
      questionCountSingular: 'Frage',
      questionCountPlural: 'Fragen',
      tocLabel: 'Themen auf dieser Seite',
    },
    sections: sectionsDE,
    contact: {
      title: 'Noch nicht gefunden, was du brauchst?',
      body: 'Schreib uns – wir helfen gerne.',
      ctaLabel: 'Kontakt',
      link: '/contact',
      email: 'kontakt@fermentfreude.at',
    },
  }

  const created = await payload.create({
    collection: 'pages',
    locale: 'de',
    context: ctx,
    data: {
      title: 'Hilfe & FAQ',
      slug: 'help',
      _status: 'published',
      hero: { type: 'none' },
      layout: [deBlock],
    },
  })
  console.log(`  ✅ Created Help page ${created.id} (DE)`)

  // ── 2. Read back to capture array IDs ──
  const fresh = await payload.findByID({
    collection: 'pages',
    id: created.id,
    locale: 'de',
    depth: 0,
  })
  const block = (fresh.layout ?? [])[0] as unknown as Record<string, unknown> | undefined
  if (!block) {
    console.error('❌ No layout block after create')
    process.exit(1)
  }
  const blockId = block.id as string
  const freshSections = (block.sections ?? []) as Array<{
    id?: string
    items?: Array<{ id?: string }>
  }>
  const freshHeader = block.header as { commonSearches?: Array<{ id?: string }> } | undefined
  const freshChips = freshHeader?.commonSearches ?? []
  const commonSearchesEN = [
    'Book a workshop',
    'Redeem voucher',
    'Shipping',
    'Cancellation',
    'Gastronomy',
  ].map((label, i) => ({ id: freshChips[i]?.id, label }))

  // ── 3. Build EN with same IDs ──
  const enSections = sectionsEN.map((s, i) => {
    const fs = freshSections[i]
    return {
      id: fs?.id,
      key: s.key,
      icon: s.icon,
      title: s.title,
      intro: s.intro,
      items: s.items.map((it, j) => ({
        id: fs?.items?.[j]?.id,
        question: it.question,
        answer: it.answer,
      })),
    }
  })

  await payload.update({
    collection: 'pages',
    id: created.id,
    locale: 'en',
    context: ctx,
    data: {
      title: 'Help & FAQ',
      _status: 'published',
      hero: { type: 'none' },
      layout: [
        {
          id: blockId,
          blockType: 'helpFaq' as const,
          visible: true,
          heroBackground: heroBackgroundId,
          header: {
            eyebrow: '',
            title: 'Hello, how can we help?',
            intro: '',
            searchPlaceholder: 'Try "book workshop" or "voucher"',
            commonSearchesLabel: 'Popular topics:',
            commonSearches: commonSearchesEN,
            backLabel: 'All topics',
            resultsLabel: 'Search results',
            emptyResultsLabel:
              'No matching questions. Try another search, or browse the topics above.',
            questionCountSingular: 'question',
            questionCountPlural: 'questions',
            tocLabel: 'Topics on this page',
          },
          sections: enSections,
          contact: {
            title: "Haven't found what you need?",
            body: 'Get in touch — we are happy to help.',
            ctaLabel: 'Contact',
            link: '/contact',
            email: 'kontakt@fermentfreude.at',
          },
        },
      ],
    },
  })
  console.log(`  ✅ Updated Help page ${created.id} (EN)`)
  console.log('🎉 Help page seeded successfully!')

  process.exit(0)
}

seedHelp().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
