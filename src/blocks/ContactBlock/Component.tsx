import type { ContactBlock as ContactBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import { toKebabCase } from '@/utilities/toKebabCase'

const DEFAULTS = {
  hero: {
    heading: 'Kontakt',
    subtext:
      'Du möchtest einen Workshop buchen oder hast Fragen? Wir freuen uns auf deine Nachricht.',
    buttonLabel: null,
    buttonHref: null,
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
      options: ['General Inquiry', 'Workshop Information', 'Product Question', 'Partnership'],
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
}

export const ContactBlockComponent: React.FC<
  ContactBlockProps & {
    id?: string | number
    className?: string
  }
> = (props) => {
  const block = props as ContactBlockProps
  const data = block

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
  }

  const rawOptions = data?.contactForm?.subjectOptions?.options
  const subjectOptionsList =
    rawOptions && Array.isArray(rawOptions) && rawOptions.length > 0
      ? rawOptions.map((o: { label?: string }) => (typeof o === 'string' ? o : (o?.label ?? '')))
      : DEFAULTS.contactForm.subjectOptions.options

  const contactForm = {
    placeholders: {
      firstName:
        data?.contactForm?.placeholders?.firstName ?? DEFAULTS.contactForm.placeholders.firstName,
      lastName:
        data?.contactForm?.placeholders?.lastName ?? DEFAULTS.contactForm.placeholders.lastName,
      email: data?.contactForm?.placeholders?.email ?? DEFAULTS.contactForm.placeholders.email,
      message:
        data?.contactForm?.placeholders?.message ?? DEFAULTS.contactForm.placeholders.message,
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

  // Map embed: set in CMS (Pages → Contact → Map Embed URL) or uses Ginery, Grabenstraße 15, 8010 Graz (red pin)
  const mapEmbedUrl =
    data?.mapEmbedUrl ||
    'https://maps.google.com/maps?q=Grabenstra%C3%9Fe+15,+8010+Graz,+Austria&t=&z=17&ie=UTF8&iwloc=&output=embed'
  const contactImage = data?.contactImage
  const hasContactImage =
    contactImage &&
    typeof contactImage === 'object' &&
    contactImage !== null &&
    'url' in contactImage

  const id = toKebabCase((block as { blockName?: string }).blockName ?? 'contact')
  const hideHeroSection = (block as { hideHeroSection?: boolean }).hideHeroSection === true
  const hideCtaBanner = (block as { hideCtaBanner?: boolean }).hideCtaBanner === true
  const hideMap = (block as { hideMap?: boolean }).hideMap === true

  return (
    <div id={id} className="min-h-screen bg-[#F9F0DC]">
      {/* Hero — heading + subtext, with optional background image (hidden when page uses page-level hero) */}
      {!hideHeroSection && (
        <section
          className={`relative w-full px-6 pt-16 pb-12 md:pt-24 md:pb-16 ${
            hasHeroImage ? 'min-h-[55vh] md:min-h-[65vh]' : ''
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
            className={`relative z-10 mx-auto max-w-300 ${
              hasHeroImage ? 'text-left' : 'text-center'
            }`}
          >
            <h1
              className={`font-display text-4xl font-bold md:text-5xl lg:text-6xl ${
                hasHeroImage ? 'text-[#F6EFDD]' : 'text-[#1D1D1D]'
              }`}
            >
              {hero.heading}
            </h1>
            {hero.subtext ? (
              <p
                className={`mt-4 max-w-2xl font-sans text-lg leading-relaxed md:text-xl ${
                  hasHeroImage ? 'text-[#D8D8D8]' : 'text-[#6B6B6B]'
                }`}
              >
                {hero.subtext}
              </p>
            ) : null}
            {hero.buttonLabel && hero.buttonHref ? (
              <a
                href={hero.buttonHref}
                className="mt-6 inline-flex rounded-xl bg-[#E5B765] px-6 py-2.5 font-display text-base font-bold text-white transition-colors hover:bg-[#d4a654] md:mt-8"
              >
                {hero.buttonLabel}
              </a>
            ) : null}
          </div>
        </section>
      )}

      {/* Main contact card — image left, form right */}
      <section className="w-full px-6 py-12 md:py-24">
        <div className="mx-auto max-w-300">
          <div className="overflow-hidden rounded-3xl bg-white shadow-lg md:rounded-[3rem]">
            <div className="grid md:grid-cols-2">
              {/* Left: Image */}
              <div className="relative aspect-4/3 md:aspect-auto md:min-h-100">
                {hasContactImage ? (
                  <Media resource={contactImage} fill imgClassName="object-cover" priority />
                ) : (
                  <div className="flex size-full items-center justify-center bg-[#ECE5DE]">
                    <span className="font-sans text-sm text-[#6B6B6B]">Add image in CMS</span>
                  </div>
                )}
              </div>

              {/* Right: Form */}
              <div className="flex flex-col gap-6 p-6 md:p-12 lg:p-16">
                <h2 className="font-display text-2xl font-bold text-[#E5B765] md:text-3xl">
                  {contact.heading}
                </h2>
                <p className="font-sans text-base leading-relaxed text-[#6B6B6B]">
                  {contact.description}
                </p>
                <form className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder={contactForm.placeholders.firstName}
                      className="rounded-xl border border-[rgba(128,128,128,0.4)] px-4 py-2.5 font-sans text-base text-[#1D1D1D] placeholder:text-[#9B9B9B] focus:border-[#4B4B4B] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder={contactForm.placeholders.lastName}
                      className="rounded-xl border border-[rgba(128,128,128,0.4)] px-4 py-2.5 font-sans text-base text-[#1D1D1D] placeholder:text-[#9B9B9B] focus:border-[#4B4B4B] focus:outline-none"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder={contactForm.placeholders.email}
                    className="rounded-xl border border-[rgba(128,128,128,0.4)] px-4 py-2.5 font-sans text-base text-[#1D1D1D] placeholder:text-[#9B9B9B] focus:border-[#4B4B4B] focus:outline-none"
                  />
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-xl border border-[rgba(128,128,128,0.4)] px-4 py-2.5 font-sans text-base text-[#1D1D1D] focus:border-[#4B4B4B] focus:outline-none scheme-light"
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
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                      <svg width="12" height="8" viewBox="0 0 14 8" fill="none">
                        <path
                          d="M12.15 2.54L1.74 2.54C1.63 2.54 1.53 2.57 1.44 2.61C1.35 2.66 1.27 2.73 1.22 2.81C1.17 2.89 1.15 2.99 1.16 3.08C1.16 3.17 1.2 3.26 1.26 3.34L6.47 9.94C6.68 10.21 7.2 10.21 7.42 9.94L12.63 3.34C12.69 3.26 12.72 3.17 12.73 3.08C12.74 2.99 12.72 2.89 12.67 2.81C12.62 2.73 12.54 2.66 12.45 2.61C12.36 2.57 12.26 2.54 12.15 2.54Z"
                          fill="#595959"
                        />
                      </svg>
                    </div>
                  </div>
                  <textarea
                    placeholder={contactForm.placeholders.message}
                    rows={5}
                    className="resize-none rounded-xl border border-[rgba(128,128,128,0.4)] px-4 py-2.5 font-sans text-base text-[#1D1D1D] placeholder:text-[#9B9B9B] focus:border-[#4B4B4B] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="mt-2 rounded-xl bg-[#4B4B4B] px-6 py-2.5 font-display text-base font-bold text-white transition-colors hover:bg-[#333]"
                  >
                    {contactForm.submitButton}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner — dark gray, gold heading */}
      {!hideCtaBanner && (
      <section className="w-full px-6 pb-12 md:pb-24">
        <div className="mx-auto max-w-300">
          <div className="overflow-hidden rounded-3xl bg-[#333] px-8 py-16 text-center md:px-16 md:py-20">
            <h2 className="font-display text-2xl font-bold text-[#E5B765] md:text-3xl lg:text-4xl">
              {ctaBanner.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-sans text-base leading-relaxed text-white md:text-lg">
              {ctaBanner.description}
            </p>
            <a
              href={ctaBanner.buttonHref}
              className="mt-8 inline-flex rounded-xl border-2 border-[#E5B765] bg-transparent px-8 py-2.5 font-display text-base font-bold text-[#E5B765] transition-colors hover:bg-[#E5B765] hover:text-[#333]"
            >
              {ctaBanner.buttonLabel}
            </a>
          </div>
        </div>
      </section>
      )}

      {/* Map */}
      {!hideMap && mapEmbedUrl ? (
        <section className="w-full px-6 pb-12 md:pb-24">
          <div className="mx-auto max-w-300 overflow-hidden rounded-2xl bg-white shadow">
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
