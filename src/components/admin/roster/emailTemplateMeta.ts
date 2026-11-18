/**
 * The Brevo templates the founders can edit (28 from the Nov 2026 cleanup + 104), with "when is it sent".
 * Source: Google Doc "Fermentfreude Brevo Email Templates" (13 Nov 2026),
 * section 2. Keep in sync with BREVO_TEMPLATES in src/lib/brevo.ts.
 *
 * `sent: false` = kept on purpose for later (memory: never delete them).
 */

export type EmailGroup = 'account' | 'workshop' | 'changes' | 'shop' | 'voucher' | 'newsletter' | 'later'

export type EmailTemplateMeta = {
  id: number
  group: EmailGroup
  sent: boolean
  title: { de: string; en: string }
  when: { de: string; en: string }
  /** Open point from the doc, shown as a hint (German only — it's for David). */
  open?: string
}

export const EMAIL_GROUPS: { id: EmailGroup; de: string; en: string }[] = [
  { id: 'workshop', de: 'Workshop-Buchungen', en: 'Workshop bookings' },
  { id: 'changes', de: 'Umbuchen, Absagen, Erstatten', en: 'Rebooking, cancelling, refunds' },
  { id: 'shop', de: 'Shop-Bestellungen', en: 'Shop orders' },
  { id: 'voucher', de: 'Gutscheine und Kurse', en: 'Vouchers and courses' },
  { id: 'account', de: 'Kundenkonto', en: 'Customer account' },
  { id: 'newsletter', de: 'Newsletter', en: 'Newsletter' },
  { id: 'later', de: 'Für später vorbereitet (wird noch nicht verschickt)', en: 'Prepared for later (not sent yet)' },
]

export const EMAIL_TEMPLATES: EmailTemplateMeta[] = [
  { id: 65, group: 'workshop', sent: true, title: { de: 'Buchungsbestätigung (mit Konto)', en: 'Booking confirmation (account)' }, when: { de: 'Ein Workshop wurde von jemandem mit Kundenkonto bezahlt.', en: 'A workshop booking was paid by a customer with an account.' } },
  { id: 102, group: 'workshop', sent: true, title: { de: 'Buchungsbestätigung (Gast)', en: 'Booking confirmation (guest)' }, when: { de: 'Ein Workshop wurde ohne Konto bezahlt. Enthält den Link zum Verwalten der Buchung.', en: 'A workshop booking was paid by a guest. Includes the link to manage the booking.' } },
  { id: 103, group: 'workshop', sent: true, title: { de: 'Erinnerung 2 Tage vorher', en: 'Reminder 2 days before' }, when: { de: 'Jeden Tag um 6:00 Uhr für Workshops in zwei Tagen. Geht an Käufer:in und jeden Gast mit E-Mail-Adresse.', en: 'Every day at 06:00 for workshops two days away. Goes to the buyer and each guest with an email address.' } },
  { id: 100, group: 'workshop', sent: true, title: { de: 'Anderer Termin angeboten', en: 'Alternate date offer' }, when: { de: 'Ihr nutzt „Anderen Termin mailen“ im Dashboard.', en: 'You use "email another date" in the dashboard.' }, open: 'Der Text sagt, der Termin sei „überbucht“. Das passt nicht, wenn ihr die Mail aus einem anderen Grund schickt.' },
  { id: 104, group: 'workshop', sent: true, title: { de: 'Neuen Termin selbst wählen', en: 'Choose a new date' }, when: { de: 'Ihr nutzt „Anderen Termin mailen“ → „Alle wählen selbst“. Enthält den persönlichen Link zur Terminwahl.', en: 'You use "email another date" → "everyone chooses". Contains the personal link to pick a date.' } },
  { id: 95, group: 'changes', sent: true, title: { de: 'Umbuchung bestätigt', en: 'Rebooking confirmed' }, when: { de: 'Jemand bucht selbst um, oder ihr verschiebt einen Platz im Dashboard.', en: 'A customer rebooks, or you move a seat in the dashboard.' } },
  { id: 96, group: 'changes', sent: true, title: { de: 'Code für später', en: 'Code for later' }, when: { de: 'Jemand wählt „später umbuchen“ und bekommt einen Code.', en: 'A customer chooses "rebook later" and receives a code.' } },
  { id: 97, group: 'changes', sent: true, title: { de: 'Storniert ohne Erstattung', en: 'Cancelled, no refund' }, when: { de: 'Jemand storniert weniger als 14 Tage vor dem Workshop.', en: 'A customer cancels less than 14 days before the workshop.' }, open: 'Die Stornoregel steht anderswo anders (14 Tage hier, 48 Stunden in einer FAQ).' },
  { id: 98, group: 'changes', sent: true, title: { de: 'Rückerstattung angefragt', en: 'Refund requested' }, when: { de: 'Jemand fragt eine Rückerstattung an.', en: 'A customer requests a refund.' } },
  { id: 99, group: 'changes', sent: true, title: { de: 'Workshop von uns abgesagt', en: 'Workshop cancelled by us' }, when: { de: 'Ihr sagt einen Workshop-Termin ab.', en: 'You cancel a workshop date.' } },
  { id: 72, group: 'shop', sent: true, title: { de: 'Bestellbestätigung (mit Konto)', en: 'Order confirmation (account)' }, when: { de: 'Eine Shop-Bestellung wurde mit Kundenkonto bezahlt.', en: 'A shop order was paid by a customer with an account.' }, open: 'Noch ohne Link zur Rechnung.' },
  { id: 101, group: 'shop', sent: true, title: { de: 'Bestellbestätigung (Gast)', en: 'Order confirmation (guest)' }, when: { de: 'Eine Shop-Bestellung wurde ohne Konto bezahlt.', en: 'A shop order was paid by a guest.' }, open: 'Noch ohne Link zur Rechnung.' },
  { id: 37, group: 'shop', sent: true, title: { de: 'Versand / abholbereit', en: 'Shipped / ready for pickup' }, when: { de: 'Eine Bestellung wird als versendet markiert. Auch für Abholbestellungen (dann mit Abholtext).', en: 'An order is marked as shipped. Also used for pickup orders (with pickup wording).' }, open: 'Der Link zur Laden-Seite führt noch ins Leere.' },
  { id: 73, group: 'voucher', sent: true, title: { de: 'Gutschein gekauft', en: 'Voucher purchased' }, when: { de: 'Ein Gutschein wird gekauft. Geht an Käufer:in und an Beschenkte, falls angegeben.', en: 'A voucher is bought. Goes to the buyer and to the recipient if one is given.' } },
  { id: 41, group: 'voucher', sent: true, title: { de: 'Kursanmeldung', en: 'Course enrolment' }, when: { de: 'Jemand meldet sich für einen Online-Kurs an (bisher noch niemand).', en: 'Someone enrols in an online course (none yet).' } },
  { id: 66, group: 'account', sent: true, title: { de: 'Willkommen (Konto erstellt)', en: 'Welcome (account created)' }, when: { de: 'Jemand erstellt ein Kundenkonto.', en: 'Someone creates an account.' } },
  { id: 69, group: 'account', sent: true, title: { de: 'E-Mail-Adresse bestätigen', en: 'Verify email address' }, when: { de: 'Ein neues Konto muss seine E-Mail-Adresse bestätigen.', en: 'A new account has to confirm its email address.' } },
  { id: 70, group: 'account', sent: true, title: { de: 'Passwort zurücksetzen', en: 'Password reset' }, when: { de: 'Jemand nutzt „Passwort vergessen“.', en: 'Someone uses "forgot password".' } },
  { id: 71, group: 'account', sent: true, title: { de: 'Neue Anmeldung', en: 'New login' }, when: { de: 'Nach jeder Anmeldung im Kundenkonto.', en: 'After every customer login.' }, open: 'Geht derzeit nach jeder Anmeldung raus, nicht nur bei neuen Geräten.' },
  { id: 68, group: 'newsletter', sent: true, title: { de: 'Newsletter-Willkommen', en: 'Newsletter welcome' }, when: { de: 'Jemand meldet sich zum Newsletter an.', en: 'Someone signs up for the newsletter.' } },
  { id: 32, group: 'later', sent: false, title: { de: 'Erinnerung 7 Tage vorher', en: 'Reminder 7 days before' }, when: { de: 'Erinnerung eine Woche vor dem Workshop.', en: 'Reminder one week before a workshop.' } },
  { id: 33, group: 'later', sent: false, title: { de: 'Erinnerung 1 Tag vorher', en: 'Reminder 1 day before' }, when: { de: 'Erinnerung am Tag vor dem Workshop.', en: 'Reminder the day before a workshop.' } },
  { id: 34, group: 'later', sent: false, title: { de: 'Danke nach dem Workshop', en: 'Thank you after the workshop' }, when: { de: 'Dankeschön nach dem Workshop.', en: 'Thank you after a workshop.' } },
  { id: 35, group: 'later', sent: false, title: { de: 'Feedback-Anfrage', en: 'Feedback request' }, when: { de: 'Fragt, wie der Workshop war.', en: 'Asks how the workshop was.' } },
  { id: 38, group: 'later', sent: false, title: { de: 'Produktbewertung', en: 'Product review' }, when: { de: 'Bittet um eine Produktbewertung.', en: 'Asks for a product review.' } },
  { id: 39, group: 'later', sent: false, title: { de: 'Warenkorb vergessen', en: 'Abandoned cart' }, when: { de: 'Erinnert an Artikel im Warenkorb.', en: 'Reminds a customer of items left in the cart.' } },
  { id: 42, group: 'later', sent: false, title: { de: 'Firmenanfrage', en: 'Business inquiry' }, when: { de: 'Antwort auf eine Firmenanfrage.', en: 'Reply to a business inquiry.' } },
  { id: 43, group: 'later', sent: false, title: { de: 'Wir vermissen dich', en: 'We miss you' }, when: { de: 'Nachricht an Kundschaft, die länger nicht da war.', en: 'Message to customers who have not been back.' } },
  { id: 44, group: 'later', sent: false, title: { de: 'Freunde empfehlen', en: 'Refer a friend' }, when: { de: 'Lädt ein, Freunde zu empfehlen.', en: 'Invites customers to recommend friends.' } },
]

export const EMAIL_TEMPLATE_IDS = new Set(EMAIL_TEMPLATES.map((t) => t.id))

/** Prefix of Brevo test copies that may be edited from localhost/staging. */
export const TEST_COPY_PREFIX = 'TEST – '
