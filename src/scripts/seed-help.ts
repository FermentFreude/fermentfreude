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

type SectionDE = {
  key: string
  title: string
  intro?: string
  items: Array<{ question: string; answer: string }>
}

const sectionsDE: SectionDE[] = [
  {
    key: 'account',
    title: 'Konto & Anmeldung',
    items: [
      {
        question: 'Brauche ich ein Konto, um etwas zu kaufen?',
        answer:
          'Nein, du kannst Workshops und Produkte auch als Gast bestellen. Mit einem Konto siehst du jedoch deine Bestellungen, gespeicherten Adressen und Workshop-Buchungen jederzeit unter „Mein Konto".',
      },
      {
        question: 'Wie erstelle ich ein Konto?',
        answer:
          'Klicke oben rechts auf das Personensymbol und wähle „Registrieren". Du brauchst nur eine E-Mail-Adresse und ein Passwort. Beim ersten Checkout kannst du dein Konto auch direkt erstellen.',
      },
      {
        question: 'Ich habe mein Passwort vergessen – was nun?',
        answer:
          'Klicke auf der Login-Seite auf „Passwort vergessen". Du erhältst eine E-Mail mit einem Link zum Zurücksetzen. Schau bitte auch im Spam-Ordner nach.',
      },
      {
        question: 'Wie ändere ich meine E-Mail-Adresse oder mein Passwort?',
        answer:
          'Logge dich ein und gehe zu „Mein Konto". Dort kannst du deine Kontodaten und dein Passwort selbst aktualisieren.',
      },
    ],
  },
  {
    key: 'workshops',
    title: 'Workshops buchen',
    items: [
      {
        question: 'Wie buche ich einen Workshop?',
        answer:
          'Gehe zu „Workshops", wähle einen Workshop und klicke auf „Platz sichern". Wähle Datum und Anzahl der Plätze, lege den Workshop in den Warenkorb und schließe die Bezahlung ab. Sobald die Zahlung erfolgreich ist, erhältst du eine Bestätigung per E-Mail.',
      },
      {
        question: 'Wann erhalte ich meine Buchungsbestätigung?',
        answer:
          'Direkt nach erfolgreicher Zahlung schicken wir dir eine E-Mail mit allen Details: Datum, Uhrzeit, Adresse und allem, was du mitbringen sollst. Falls du innerhalb von 10 Minuten nichts erhalten hast, prüfe bitte deinen Spam-Ordner.',
      },
      {
        question: 'Was passiert, wenn ein Workshop ausgebucht ist?',
        answer:
          'Auf der Workshop-Übersicht siehst du eine „Ausgebucht"-Markierung und „Bald neue Termine verfügbar". Sobald wir neue Termine anlegen, kannst du sie wieder buchen.',
      },
      {
        question: 'Kann ich meine Buchung stornieren oder verschieben?',
        answer:
          'Bis 14 Tage vor dem Termin ist eine kostenfreie Stornierung oder Umbuchung möglich. Schreib uns dafür kurz eine E-Mail an kontakt@fermentfreude.at mit deiner Bestellnummer.',
      },
      {
        question: 'Kann ich mehrere Plätze auf einmal buchen?',
        answer:
          'Ja. Wähle im Buchungsfenster einfach die gewünschte Anzahl an Plätzen aus, solange genug Plätze für diesen Termin verfügbar sind.',
      },
    ],
  },
  {
    key: 'vouchers',
    title: 'Gutscheine einlösen',
    items: [
      {
        question: 'Wo löse ich meinen Workshop-Gutschein ein?',
        answer:
          'Gehe auf „Gutschein einlösen" in der Fußzeile oder direkt auf /redeem-voucher. Gib dort deinen Gutscheincode ein, wähle einen verfügbaren Termin und schließe die Buchung ab. Du musst nichts zusätzlich bezahlen, solange der Gutscheinwert ausreicht.',
      },
      {
        question: 'Wie lange ist mein Gutschein gültig?',
        answer:
          'Workshop-Gutscheine sind ab Ausstellung 3 Jahre gültig. Das genaue Ablaufdatum steht auf deinem Gutschein.',
      },
      {
        question: 'Mein Gutscheincode wird nicht akzeptiert – was tun?',
        answer:
          'Achte darauf, dass du den Code genau so eingibst wie auf dem Gutschein (ohne Leerzeichen, Groß-/Kleinschreibung beachten). Falls es weiterhin nicht klappt, schreib uns mit dem Code per E-Mail an kontakt@fermentfreude.at.',
      },
      {
        question: 'Kann ich einen Gutschein verschenken?',
        answer:
          'Ja. Im Shop findest du Workshop-Gutscheine, die du als digitale PDF erhältst und direkt weitergeben kannst.',
      },
    ],
  },
  {
    key: 'shop',
    title: 'Shop & Bestellungen',
    items: [
      {
        question: 'Wo sehe ich meine Bestellungen?',
        answer:
          'Logge dich ein und öffne im Konto-Menü oben rechts „Bestellungen". Dort findest du alle Bestellungen, Rechnungen und den jeweiligen Status.',
      },
      {
        question: 'Kann ich meine Bestellung nach dem Absenden noch ändern?',
        answer:
          'Sobald die Bestellung verschickt ist, können wir sie nicht mehr ändern. Falls die Bestellung gerade erst eingegangen ist, schreib uns so schnell wie möglich an kontakt@fermentfreude.at – wir versuchen, dir zu helfen.',
      },
      {
        question: 'Wie erhalte ich meine Rechnung?',
        answer:
          'Nach erfolgreicher Zahlung schicken wir dir die Rechnung automatisch per E-Mail. Du findest sie zusätzlich jederzeit unter „Bestellungen" in deinem Konto.',
      },
    ],
  },
  {
    key: 'shipping',
    title: 'Versand & Lieferung',
    items: [
      {
        question: 'Wohin liefert ihr?',
        answer:
          'Wir versenden innerhalb Österreichs und in die EU. Die Versandkosten werden im Checkout angezeigt, bevor du die Bestellung abschließt.',
      },
      {
        question: 'Wie lange dauert die Lieferung?',
        answer:
          'Innerhalb Österreichs in der Regel 2–4 Werktage, in die EU 4–8 Werktage. Bei großem Bestellaufkommen kann es etwas länger dauern.',
      },
      {
        question: 'Bekomme ich eine Sendungsverfolgung?',
        answer:
          'Ja. Sobald deine Bestellung versendet wird, erhältst du eine E-Mail mit Tracking-Link.',
      },
    ],
  },
  {
    key: 'payment',
    title: 'Bezahlung & Sicherheit',
    items: [
      {
        question: 'Welche Zahlungsarten akzeptiert ihr?',
        answer:
          'Wir nutzen Stripe und akzeptieren die gängigen Kreditkarten (Visa, Mastercard, American Express) sowie weitere Methoden, die im Checkout angezeigt werden, z. B. Apple Pay und Google Pay – je nach Gerät.',
      },
      {
        question: 'Sind meine Zahlungsdaten sicher?',
        answer:
          'Ja. Alle Zahlungen laufen verschlüsselt über Stripe. Wir speichern keine vollständigen Kreditkartendaten auf unseren Servern.',
      },
      {
        question: 'Kann ich auf Rechnung zahlen?',
        answer:
          'Aktuell bieten wir Rechnungskauf nur für B2B- und Gastro-Kunden an. Bitte schreib uns für ein individuelles Angebot.',
      },
    ],
  },
  {
    key: 'support',
    title: 'Technische Probleme',
    items: [
      {
        question: 'Die Seite zeigt 404 oder lädt nicht – was kann ich tun?',
        answer:
          'Lade die Seite einmal komplett neu (Cmd/Ctrl + Shift + R). Falls das Problem bleibt, melde es uns bitte mit der genauen URL und einem Screenshot per E-Mail.',
      },
      {
        question: 'Ich habe keine Bestätigungs-E-Mail erhalten.',
        answer:
          'Prüfe bitte zunächst deinen Spam-Ordner. Falls auch dort nichts ist, schreib uns deine Bestellnummer (oder die verwendete E-Mail-Adresse) – wir senden die Bestätigung erneut.',
      },
      {
        question: 'Wie ändere ich die Sprache der Seite?',
        answer:
          'Oben rechts in der Navigation findest du den DE/EN-Umschalter. Deine Auswahl wird gespeichert.',
      },
    ],
  },
]

const sectionsEN: SectionDE[] = [
  {
    key: 'account',
    title: 'Account & sign-in',
    items: [
      {
        question: 'Do I need an account to buy something?',
        answer:
          'No, you can book workshops and order products as a guest. With an account you can see your orders, saved addresses and workshop bookings any time under "Your account".',
      },
      {
        question: 'How do I create an account?',
        answer:
          'Click the user icon in the top right and select "Register". You only need an email address and a password. You can also create your account during checkout.',
      },
      {
        question: 'I forgot my password — what now?',
        answer:
          'On the login page, click "Forgot password". You will receive an email with a reset link. Please also check your spam folder.',
      },
      {
        question: 'How do I update my email address or password?',
        answer:
          'Sign in and go to "Your account". From there you can update your account details and password yourself.',
      },
    ],
  },
  {
    key: 'workshops',
    title: 'Booking workshops',
    items: [
      {
        question: 'How do I book a workshop?',
        answer:
          'Go to "Workshops", choose a workshop and click "Reserve a spot". Pick a date and the number of seats, add the workshop to your cart and complete the payment. Once the payment goes through, you will receive a confirmation by email.',
      },
      {
        question: 'When do I get my booking confirmation?',
        answer:
          'Right after a successful payment, we send you an email with all the details: date, time, address and what to bring. If you don\u2019t see anything within 10 minutes, please check your spam folder.',
      },
      {
        question: 'What happens when a workshop is sold out?',
        answer:
          'On the workshop overview you will see a "Sold out" badge and "New dates coming soon". As soon as we add new dates, the workshop becomes bookable again.',
      },
      {
        question: 'Can I cancel or reschedule my booking?',
        answer:
          'Free cancellation or rescheduling is possible up to 14 days before the workshop. Just send us a quick email at kontakt@fermentfreude.at with your order number.',
      },
      {
        question: 'Can I book multiple seats at once?',
        answer:
          'Yes. In the booking dialog simply select the number of seats you need, as long as enough seats are available for that date.',
      },
    ],
  },
  {
    key: 'vouchers',
    title: 'Redeeming vouchers',
    items: [
      {
        question: 'Where do I redeem my workshop voucher?',
        answer:
          'Open "Redeem voucher" in the footer or go directly to /redeem-voucher. Enter your voucher code, choose an available date and complete the booking. You don\u2019t pay anything extra as long as the voucher value covers the workshop.',
      },
      {
        question: 'How long is my voucher valid?',
        answer:
          'Workshop vouchers are valid for 3 years from the date of issue. The exact expiry date is printed on your voucher.',
      },
      {
        question: 'My voucher code is not accepted — what should I do?',
        answer:
          'Make sure you enter the code exactly as printed (no spaces, watch upper- and lowercase letters). If it still doesn\u2019t work, email us the code at kontakt@fermentfreude.at.',
      },
      {
        question: 'Can I gift a voucher?',
        answer:
          'Yes. You can buy workshop vouchers in our shop and receive them as a digital PDF — perfect to forward as a gift.',
      },
    ],
  },
  {
    key: 'shop',
    title: 'Shop & orders',
    items: [
      {
        question: 'Where do I see my orders?',
        answer:
          'Sign in and open "Orders" from the account menu in the top right. You will find all orders, invoices and their status there.',
      },
      {
        question: 'Can I change my order after placing it?',
        answer:
          'Once an order has been shipped we can no longer change it. If the order has just been placed, please email us at kontakt@fermentfreude.at as soon as possible — we will do our best to help.',
      },
      {
        question: 'How do I get my invoice?',
        answer:
          'After a successful payment we send the invoice automatically by email. You can also access it any time under "Orders" in your account.',
      },
    ],
  },
  {
    key: 'shipping',
    title: 'Shipping & delivery',
    items: [
      {
        question: 'Where do you ship to?',
        answer:
          'We ship within Austria and across the EU. Shipping costs are shown in the checkout before you complete your order.',
      },
      {
        question: 'How long does delivery take?',
        answer:
          'Within Austria typically 2–4 business days, across the EU 4–8 business days. During busy periods this can take a little longer.',
      },
      {
        question: 'Will I get tracking information?',
        answer: 'Yes. As soon as your order ships, you will receive an email with a tracking link.',
      },
    ],
  },
  {
    key: 'payment',
    title: 'Payment & security',
    items: [
      {
        question: 'Which payment methods do you accept?',
        answer:
          'We use Stripe and accept the major credit cards (Visa, Mastercard, American Express) plus additional methods shown in checkout, such as Apple Pay and Google Pay depending on your device.',
      },
      {
        question: 'Are my payment details safe?',
        answer:
          'Yes. All payments are encrypted and processed by Stripe. We do not store full credit card details on our servers.',
      },
      {
        question: 'Can I pay by invoice?',
        answer:
          'Right now we offer invoice payment only for B2B and gastronomy customers. Please contact us for an individual offer.',
      },
    ],
  },
  {
    key: 'support',
    title: 'Technical issues',
    items: [
      {
        question: 'The page shows 404 or doesn\u2019t load — what can I do?',
        answer:
          'Try a hard reload (Cmd/Ctrl + Shift + R). If the issue persists, please email us the exact URL and a screenshot.',
      },
      {
        question: 'I didn\u2019t receive a confirmation email.',
        answer:
          'Please check your spam folder first. If nothing is there either, send us your order number (or the email address you used) and we will resend the confirmation.',
      },
      {
        question: 'How do I change the language of the site?',
        answer: 'Use the DE/EN toggle in the top navigation. Your choice is remembered.',
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

  // ── 1. Create DE first ──
  const deBlock = {
    blockType: 'helpFaq' as const,
    visible: true,
    header: {
      eyebrow: 'HILFE & SUPPORT',
      title: 'Hilfe & FAQ',
      intro:
        'Hier findest du Antworten auf die häufigsten Fragen rund um dein Konto, Buchungen, Gutscheine, Bestellungen und Zahlungen. Falls deine Frage nicht dabei ist, schreib uns gerne direkt.',
      tocLabel: 'Themen auf dieser Seite',
    },
    sections: sectionsDE,
    contact: {
      title: 'Frage nicht beantwortet?',
      body: 'Schreib uns eine E-Mail – wir melden uns in der Regel innerhalb eines Werktages zurück.',
      ctaLabel: 'Kontakt aufnehmen',
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

  // ── 3. Build EN with same IDs ──
  const enSections = sectionsEN.map((s, i) => {
    const fs = freshSections[i]
    return {
      id: fs?.id,
      key: s.key,
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
          header: {
            eyebrow: 'HELP & SUPPORT',
            title: 'Help & FAQ',
            intro:
              'Find answers to the most common questions about your account, bookings, vouchers, orders and payments. If your question is not listed, just reach out to us directly.',
            tocLabel: 'Topics on this page',
          },
          sections: enSections,
          contact: {
            title: 'Question not answered?',
            body: 'Send us an email — we usually reply within one business day.',
            ctaLabel: 'Get in touch',
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
