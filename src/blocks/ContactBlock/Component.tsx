import type { ContactBlock as ContactBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLocale } from '@/utilities/getLocale'
import { toKebabCase } from '@/utilities/toKebabCase'

import { ContactCardAnimated } from './ContactCardAnimated'

const DEFAULTS = {
  hero: {
    heading: 'Kontakt',
    subtext:
      'Du möchtest einen Workshop buchen oder hast Fragen? Wir freuen uns auf deine Nachricht.',
    buttonLabel: null,
    buttonHref: null,
  },
  contact: {
    heading: 'Contact Detail',
    description:
      'If you need any help and prefer to reach out directly, feel free to do it via phone or email.',
    phone: null,
    email: null,
    address: null,
  },
  contactForm: {
    formHeading: 'Ask About Anything',
    placeholders: {
      name: 'Your Name',
      firstName: 'Vorname',
      lastName: 'Nachname',
      email: 'Your Email',
      phone: 'Your Phone',
      message: 'Your Message',
    },
    subjectOptions: {
      default: 'Subject',
      options: ['General Inquiry', 'Workshop Information', 'Product Question', 'Partnership'],
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
}

export const ContactBlockComponent: React.FC<
  ContactBlockProps & {
    id?: string | number
    className?: string
  }
> = async (props) => {
  const block = props as ContactBlockProps
  const data = block
  const locale = await getLocale()
  const footer = await getCachedGlobal('footer', 1, locale)()
  const social = footer?.socialMedia

  const heroImage = data?.hero?.image
  const hasHeroImage =
    heroImage && typeof heroImage === 'object' && heroImage !== null && 'url' in heroImage

  const hero = {
    image: heroImage,
    heading: data?.hero?.heading ?? DEFAULTS.hero.heading,
    subtext: data?.hero?.subtext ?? DEFAULTS.hero.subtext,
    buttonLabel: data?.hero?.buttonLabel ?? null,
    buttonHref: data?.hero?.buttonHref ?? null,
  }

  const contact = {
    heading: data?.contact?.heading ?? DEFAULTS.contact.heading,
    description: data?.contact?.description ?? DEFAULTS.contact.description,
    phone: data?.contact?.phone ?? null,
    email: data?.contact?.email ?? null,
    address: data?.contact?.address ?? null,
  }

  const rawOptions = data?.contactForm?.subjectOptions?.options
  const subjectOptionsList =
    rawOptions && Array.isArray(rawOptions) && rawOptions.length > 0
      ? rawOptions.map((o: { label?: string }) => (typeof o === 'string' ? o : (o?.label ?? '')))
      : DEFAULTS.contactForm.subjectOptions.options

  const placeholders = data?.contactForm?.placeholders
  const contactForm = {
    formHeading:
      data?.contactForm?.formHeading ?? DEFAULTS.contactForm.formHeading,
    placeholders: {
      name: placeholders?.name ?? DEFAULTS.contactForm.placeholders.name ?? null,
      firstName:
        placeholders?.firstName ?? DEFAULTS.contactForm.placeholders.firstName,
      lastName:
        placeholders?.lastName ?? DEFAULTS.contactForm.placeholders.lastName,
      email: placeholders?.email ?? DEFAULTS.contactForm.placeholders.email,
      phone: placeholders?.phone ?? DEFAULTS.contactForm.placeholders.phone ?? null,
      message:
        placeholders?.message ?? DEFAULTS.contactForm.placeholders.message,
    },
    subjectOptions: {
      default:
        data?.contactForm?.subjectOptions?.default ?? DEFAULTS.contactForm.subjectOptions.default,
      options: subjectOptionsList,
    },
    submitButton: data?.contactForm?.submitButton ?? DEFAULTS.contactForm.submitButton,
  }

  const ctaBanner = {
    heading: data?.ctaBanner?.heading ?? DEFAULTS.ctaBanner.heading,
    description: data?.ctaBanner?.description ?? DEFAULTS.ctaBanner.description,
    buttonLabel: data?.ctaBanner?.buttonLabel ?? DEFAULTS.ctaBanner.buttonLabel,
    buttonHref: data?.ctaBanner?.buttonHref ?? DEFAULTS.ctaBanner.buttonHref,
  }

  const mapEmbedUrl =
    data?.mapEmbedUrl ||
    'https://maps.google.com/maps?q=Grabenstra%C3%9Fe+15,+8010+Graz,+Austria&t=&z=17&ie=UTF8&iwloc=&output=embed'

  const id = toKebabCase((block as { blockName?: string }).blockName ?? 'contact')
  const hideHeroSection = (block as { hideHeroSection?: boolean }).hideHeroSection === true
  const hideCtaBanner = (block as { hideCtaBanner?: boolean }).hideCtaBanner === true
  const hideMap = (block as { hideMap?: boolean }).hideMap === true

  const inputBase =
    'w-full rounded-lg border border-ff-gold-accent/50 bg-white px-4 py-3 font-sans text-base text-ff-charcoal placeholder:text-ff-gray-text-light transition-all duration-200 focus:border-ff-gold-accent focus:outline-none focus:ring-1 focus:ring-ff-gold-accent'

  const useSingleName = Boolean(contactForm.placeholders.name)
  const hasSocial =
    social?.facebook || social?.instagram || social?.linkedin

  return (
    <div id={id} className="min-h-screen bg-white">
      {/* Hero */}
      {!hideHeroSection && (
        <section
          className={`relative w-full container-padding py-6 md:py-8 ${
            hasHeroImage ? 'min-h-[55vh] md:min-h-[65vh] flex flex-col justify-center' : ''
          }`}
        >
          {hasHeroImage && (
            <>
              <div className="absolute inset-0">
                <Media resource={heroImage} fill imgClassName="object-cover" priority />
              </div>
              <div className="absolute inset-0 bg-black/50" />
            </>
          )}
          <div
            className={`relative z-10 mx-auto max-w-[var(--content-wide)] ${
              hasHeroImage ? 'text-left' : 'text-center'
            }`}
          >
            <h1
              className={`text-hero font-bold ${
                hasHeroImage ? 'text-ff-cream' : 'text-ff-black'
              }`}
            >
              {hero.heading}
            </h1>
            {hero.subtext ? (
              <p
                className={`mt-2 max-w-2xl text-body-lg leading-relaxed ${
                  hasHeroImage ? 'text-white/90' : 'text-ff-gray-text-light'
                }`}
              >
                {hero.subtext}
              </p>
            ) : null}
            {hero.buttonLabel && hero.buttonHref ? (
              <a
                href={hero.buttonHref}
                className="mt-3 inline-flex items-center justify-center rounded-full bg-ff-gold-accent px-6 py-3 font-display text-base font-bold text-white transition-colors hover:bg-ff-gold-accent-dark md:mt-4"
              >
                {hero.buttonLabel}
              </a>
            ) : null}
          </div>
        </section>
      )}

      {/* Main contact card — left: contact details + social, right: form */}
      <section className="w-full container-padding py-6 md:py-8">
        <div className="mx-auto max-w-[var(--content-wide)]">
          <ContactCardAnimated>
            <div className="overflow-hidden rounded-2xl border border-ff-border-light shadow-xl shadow-black/5 transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/10">
              <div className="grid md:grid-cols-2">
                {/* Left: Contact Detail + Social (ivory) */}
                <div className="flex flex-col justify-center gap-4 bg-ff-ivory p-5 md:p-6 lg:p-8">
                  <div>
                    <h2 className="text-section-heading font-bold tracking-tight text-ff-charcoal">
                      {contact.heading}
                    </h2>
                    <p className="mt-1.5 text-body leading-relaxed text-ff-gray-text-light">
                      {contact.description}
                    </p>
                  </div>
                  {(contact.address || contact.phone || contact.email) ? (
                    <div className="flex flex-col gap-3">
                      {contact.address ? (
                        <div className="group flex items-start gap-3 transition-transform duration-300 hover:-translate-y-0.5">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ff-gold-accent/60 bg-white shadow-sm transition-all duration-300 group-hover:scale-105">
                            <svg className="h-5 w-5 text-ff-gold-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-body-sm font-display font-bold text-ff-charcoal">Location</p>
                            <p className="mt-0.5 text-body leading-relaxed text-ff-gray-text-light">{contact.address}</p>
                          </div>
                        </div>
                      ) : null}
                      {contact.phone ? (
                        <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="group flex items-start gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ff-gold-accent/60 bg-white shadow-sm transition-all duration-300 group-hover:border-ff-gold-accent group-hover:scale-105">
                            <svg className="h-5 w-5 text-ff-gold-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-body-sm font-display font-bold text-ff-charcoal">Phone</p>
                            <p className="mt-0.5 text-body leading-relaxed text-ff-gray-text-light">{contact.phone}</p>
                          </div>
                        </a>
                      ) : null}
                      {contact.email ? (
                        <a href={`mailto:${contact.email}`} className="group flex items-start gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ff-gold-accent/60 bg-white shadow-sm transition-all duration-300 group-hover:border-ff-gold-accent group-hover:scale-105">
                            <svg className="h-5 w-5 text-ff-gold-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-body-sm font-display font-bold text-ff-charcoal">Mail</p>
                            <p className="mt-0.5 text-body leading-relaxed text-ff-gray-text-light">{contact.email}</p>
                          </div>
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                  {hasSocial ? (
                    <div>
                      <p className="text-body font-display font-bold text-ff-charcoal">Follow Our Social Media</p>
                      <div className="mt-2 flex gap-3">
                        {social.facebook && (
                          <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-ff-gold-accent/50 bg-white text-ff-charcoal shadow-sm transition-all duration-300 hover:scale-110 hover:border-ff-gold-accent hover:bg-ff-gold-accent hover:text-black hover:shadow-md">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                          </a>
                        )}
                        {social.instagram && (
                          <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-ff-gold-accent/50 bg-white text-ff-charcoal shadow-sm transition-all duration-300 hover:scale-110 hover:border-ff-gold-accent hover:bg-ff-gold-accent hover:text-black hover:shadow-md">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0z" /><path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                          </a>
                        )}
                        {social.linkedin && (
                          <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-full border border-ff-gold-accent/50 bg-white text-ff-charcoal shadow-sm transition-all duration-300 hover:scale-110 hover:border-ff-gold-accent hover:bg-ff-gold-accent hover:text-black hover:shadow-md">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Right: Form (white) */}
                <div className="flex flex-col justify-center gap-3 bg-white p-5 md:p-6 lg:p-8">
                  <h2 className="text-section-heading font-bold tracking-tight text-ff-charcoal">
                    {contactForm.formHeading}
                  </h2>
                  <form className="flex flex-col gap-3">
                    {useSingleName ? (
                      <input
                        type="text"
                        placeholder={contactForm.placeholders.name ?? 'Your Name'}
                        className={inputBase}
                      />
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder={contactForm.placeholders.firstName}
                          className={inputBase}
                        />
                        <input
                          type="text"
                          placeholder={contactForm.placeholders.lastName}
                          className={inputBase}
                        />
                      </div>
                    )}
                    {contactForm.placeholders.phone ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="email"
                          placeholder={contactForm.placeholders.email}
                          className={inputBase}
                        />
                        <input
                          type="tel"
                          placeholder={contactForm.placeholders.phone}
                          className={inputBase}
                        />
                      </div>
                    ) : (
                      <input
                        type="email"
                        placeholder={contactForm.placeholders.email}
                        className={inputBase}
                      />
                    )}
                    <div className="relative">
                      <select
                        className={`${inputBase} appearance-none pr-10 [&::-ms-expand]:hidden`}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          {contactForm.subjectOptions.default}
                        </option>
                        {contactForm.subjectOptions.options.map((opt, idx) => (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ff-gray-text">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
                          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                    <textarea
                      placeholder={contactForm.placeholders.message}
                      rows={5}
                      className={`${inputBase} min-h-[8rem] resize-y`}
                    />
                    <button
                      type="submit"
                      className="mt-2 w-full rounded-lg bg-ff-gold-accent px-6 py-3 font-display text-base font-bold text-black transition-all duration-300 hover:scale-[1.02] hover:bg-ff-gold-accent-dark active:scale-[0.98]"
                    >
                      {contactForm.submitButton}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </ContactCardAnimated>
        </div>
      </section>

      {/* CTA Banner — full width */}
      {!hideCtaBanner && (
        <section className="w-full py-6 md:py-8">
          <div className="w-full bg-ff-charcoal px-5 py-10 text-center md:px-10 md:py-12">
            <h2 className="text-section-heading font-bold text-ff-gold-accent">
              {ctaBanner.heading}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-body-lg leading-relaxed text-white/90">
              {ctaBanner.description}
            </p>
            <a
              href={ctaBanner.buttonHref}
              className="mt-4 inline-flex items-center justify-center rounded-full border-2 border-ff-gold-accent bg-transparent px-6 py-3 font-display text-base font-bold text-ff-gold-accent transition-colors hover:bg-ff-gold-accent hover:text-ff-charcoal"
            >
              {ctaBanner.buttonLabel}
            </a>
          </div>
        </section>
      )}

      {/* Map */}
      {!hideMap && mapEmbedUrl ? (
        <section className="w-full container-padding py-6 md:py-8">
          <div className="mx-auto max-w-[var(--content-wide)] overflow-hidden border border-ff-border-light bg-white">
            <div className="relative aspect-video w-full">
              <iframe
                src={mapEmbedUrl}
                title="Location map"
                className="absolute inset-0 size-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
