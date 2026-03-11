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
      'Du möchtest einen Workshop buchen oder hast Fragen? Wir freuen uns auf deine Nachricht — schreib uns einfach.',
    buttonLabel: 'Workshops entdecken',
    buttonHref: '/workshops',
  },
  contact: {
    heading: 'Kontaktdaten',
    description:
      'Wenn Sie Hilfe benötigen und uns direkt erreichen möchten, können Sie uns gerne per Telefon oder E-Mail kontaktieren.',
    phone: '+43 660 4943577',
    email: 'fermentfreude@gmail.com',
    address: 'Grabenstraße 15, 8010 Graz, Austria',
  },
  contactForm: {
    formHeading: 'Fragen Sie uns',
    placeholders: {
      name: 'Ihr Name',
      firstName: 'Vorname',
      lastName: 'Nachname',
      email: 'Ihre E-Mail',
      phone: 'Ihre Telefonnummer',
      message: 'Ihre Nachricht',
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
    buttonLabel: 'Mehr erfahren',
    buttonHref: '/gastronomy',
  },
  mapEmbedUrl: '',
})

export const contactDataEN = (args: ContactSeedArgs = {}) => ({
  contactImage: args.contactImage,
  hero: {
    image: args.heroImage,
    heading: 'Contact',
    subtext:
      'We are happy to assist with workshop bookings or any questions.',
    buttonLabel: 'Explore Workshops',
    buttonHref: '/workshops',
  },
  contact: {
    heading: 'Contact Detail',
    description:
      'If you need any help and prefer to reach out directly, feel free to do it via phone or email.',
    phone: '+43 660 4943577',
    email: 'fermentfreude@gmail.com',
    address: 'Grabenstraße 15, 8010 Graz, Austria',
  },
  contactForm: {
    formHeading: 'Ask About Anything',
    placeholders: {
      name: 'Your Name',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Your Email',
      phone: 'Your Phone',
      message: 'Your Message',
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
    buttonLabel: 'Learn More',
    buttonHref: '/gastronomy',
  },
  mapEmbedUrl: '',
})
