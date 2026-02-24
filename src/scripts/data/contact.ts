import type { Media } from '@/payload-types'

type ContactSeedArgs = {
  contactImage?: Media
  heroImage?: Media
}

export const contactDataDE = (args: ContactSeedArgs = {}) => ({
  contactImage: args.contactImage,
  hero: {
    image: args.heroImage,
    heading: 'Kontakt',
    subtext:
      'Du möchtest einen Workshop buchen oder hast Fragen? Wir freuen uns auf deine Nachricht.',
    buttonLabel: 'Kontakt',
    buttonHref: '/contact',
  },
  contact: {
    heading: 'Kontakt',
    description:
      'Du möchtest einen Workshop buchen oder hast Fragen zu Fermentation, Produkten oder B2B-Angeboten? Melde dich gerne bei uns.',
  },
  contactForm: {
    placeholders: {
      firstName: 'Vorname',
      lastName: 'Nachname',
      email: 'E-Mail',
      message: 'Nachricht',
    },
    subjectOptions: {
      default: 'Betreff',
      options: [
        { label: 'Allgemeine Anfrage' },
        { label: 'Workshop-Informationen' },
        { label: 'Produktfrage' },
        { label: 'Partnerschaft' },
      ],
    },
    submitButton: 'Jetzt absenden',
  },
  ctaBanner: {
    heading: 'Für Köche und Lebensmittelprofis',
    description:
      'Suchen Sie fermentierte, pflanzliche Optionen für professionelle Küchen? Wir liefern Produkte und Wissen für moderne Menüs.',
    buttonLabel: 'Hier mehr erfahren',
    buttonHref: '/gastronomy',
  },
  mapEmbedUrl: '', // Add Google Maps embed URL in CMS (Share → Embed a map)
})

export const contactDataEN = (args: ContactSeedArgs = {}) => ({
  contactImage: args.contactImage,
  hero: {
    image: args.heroImage,
    heading: 'Contact',
    subtext:
      'Would you like to book a workshop or have questions? We look forward to hearing from you.',
    buttonLabel: 'Contact',
    buttonHref: '/contact',
  },
  contact: {
    heading: 'Contact',
    description:
      'Would you like to book a workshop or have questions about fermentation, products or B2B offers? Feel free to contact us.',
  },
  contactForm: {
    placeholders: {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      message: 'Message',
    },
    subjectOptions: {
      default: 'Subject',
      options: [
        { label: 'General Inquiry' },
        { label: 'Workshop Information' },
        { label: 'Product Question' },
        { label: 'Partnership' },
      ],
    },
    submitButton: 'Submit Now',
  },
  ctaBanner: {
    heading: 'For Chefs and Food Professionals',
    description:
      'Looking for fermented, plant-based options that work in professional kitchens? We supply products and knowledge for modern menus.',
    buttonLabel: 'Get to know more here',
    buttonHref: '/gastronomy',
  },
  mapEmbedUrl: '', // Add Google Maps embed URL in CMS (Share → Embed a map)
})
