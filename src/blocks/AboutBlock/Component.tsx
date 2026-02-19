import type { AboutBlock as AboutBlockProps } from '@/payload-types'
import Link from 'next/link'

import { Media } from '@/components/Media'
import { ContactSection } from '@/components/sections/ContactSection'
import { SponsorsSection } from '@/components/sections/SponsorsSection'
import { toKebabCase } from '@/utilities/toKebabCase'

const DEFAULTS = {
  ourStory: {
    label: 'Our Story',
    heading: 'Bringing Joy to Fermentation',
    subheading:
      'Making fermentation joyful & accessible while empowering gut health through taste, education, and quality handmade foods',
    description: [
      'FermentFreude is a modern Austrian food-tech startup helping people discover fermentation through fun workshops and premium fermented products. We combine health, enjoyment, and knowledge to make fermentation part of everyday life.',
      'By merging traditional fermentation methods with modern science and regional sourcing, we empower home cooks and professionals to approach food with confidence, curiosity, and pleasure.',
    ],
  },
  team: {
    label: 'Our Team',
    heading: 'Meet the Experts Behind FermentFreude',
    members: [
      {
        name: 'Marcel Rauminger',
        role: 'Fermentation Specialist & Chef',
        description:
          'With over 17 years as a passionate chef and certificate in vegan cooking enriched by months in a Thai monastery, Marcel discovered the keys to fermentation and has become a specialist in creative fermented cuisine. His desire to expertise through workshops, sharing new discoveries and passion for fine flavor.',
      },
      {
        name: 'David Heider',
        role: 'Nutrition Specialist & Food Developer',
        description:
          'With a background in food science and economics, David is passionate about making complex scientific concepts digestible for everyone. He develops open-sourced fermentation techniques based fermented foods that taste amazing and support wellbeing, creating the perfect bridge between science and art of FermentFreude.',
      },
    ],
  },
  sponsors: {
    heading: 'This project is supported by:',
  },
  contact: {
    heading: 'Contact Detail',
    description:
      'If you need any help and prefer to reach out directly, feel free to do it via phone or email.',
    labels: {
      location: 'Location',
      phone: 'Phone',
      email: 'Mail',
    },
    location: 'Grabenstraße 15\n8010 Graz',
    phone: '+436604943577',
    email: 'fermentfreude@gmail.com',
    socialMedia: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      pinterest: 'https://pinterest.com',
      youtube: 'https://youtube.com',
    },
    socialMediaLabel: 'Follow Our Social Media',
  },
  contactForm: {
    heading: 'Ask About Anything',
    placeholders: {
      name: 'Your Name',
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
  cta: {
    heading: 'Ready to learn?',
    description:
      'Join our workshops and online courses to learn hands-on fermentation techniques, ask questions, and connect with a community of learners.',
    workshopsButton: {
      label: 'View workshops',
      href: '/workshops',
    },
    coursesButton: {
      label: 'Browse online courses',
      href: '/courses',
    },
  },
}

function getImageUrl(image: unknown): string {
  if (!image) return ''
  if (typeof image === 'string') return image
  if (typeof image === 'object' && image !== null && 'url' in image) {
    const url = (image as { url?: string }).url
    if (!url) return ''
    return url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_SERVER_URL || ''}${url}`
  }
  return ''
}

function getImageAlt(image: unknown): string {
  if (!image) return ''
  if (typeof image === 'object' && image !== null && 'alt' in image) {
    const alt = (image as { alt?: string | { de?: string; en?: string } }).alt
    if (typeof alt === 'string') return alt
    if (typeof alt === 'object' && alt !== null) {
      return alt.de || alt.en || ''
    }
  }
  return ''
}

export const AboutBlockComponent: React.FC<
  AboutBlockProps & {
    id?: string | number
    className?: string
  }
> = (props) => {
  const block = props as AboutBlockProps
  const aboutData = block

  const ourStory = {
    label: aboutData?.ourStory?.label ?? DEFAULTS.ourStory.label,
    heading: aboutData?.ourStory?.heading ?? DEFAULTS.ourStory.heading,
    subheading: aboutData?.ourStory?.subheading ?? DEFAULTS.ourStory.subheading,
    description:
      aboutData?.ourStory?.description && aboutData.ourStory.description.length > 0
        ? aboutData.ourStory.description.map((p) => (p as { paragraph?: string }).paragraph || '')
        : DEFAULTS.ourStory.description,
  }

  const team = {
    label: aboutData?.team?.label ?? DEFAULTS.team.label,
    heading: aboutData?.team?.heading ?? DEFAULTS.team.heading,
    members:
      aboutData?.team?.members && aboutData.team.members.length > 0
        ? aboutData.team.members
        : DEFAULTS.team.members.map((m) => ({
            name: m.name,
            role: m.role,
            description: m.description,
            image: null,
          })),
  }

  const sponsors = {
    heading: aboutData?.sponsors?.heading ?? DEFAULTS.sponsors.heading,
    logos:
      aboutData?.sponsors?.logos && aboutData.sponsors.logos.length > 0
        ? aboutData.sponsors.logos
        : [],
  }

  const contact = {
    heading: aboutData?.contact?.heading ?? DEFAULTS.contact.heading,
    description: aboutData?.contact?.description ?? DEFAULTS.contact.description,
    labels: {
      location: aboutData?.contact?.labels?.location ?? DEFAULTS.contact.labels.location,
      phone: aboutData?.contact?.labels?.phone ?? DEFAULTS.contact.labels.phone,
      email: aboutData?.contact?.labels?.email ?? DEFAULTS.contact.labels.email,
    },
    location: aboutData?.contact?.location ?? DEFAULTS.contact.location,
    phone: aboutData?.contact?.phone ?? DEFAULTS.contact.phone,
    email: aboutData?.contact?.email ?? DEFAULTS.contact.email,
    socialMedia: {
      facebook: aboutData?.contact?.socialMedia?.facebook ?? DEFAULTS.contact.socialMedia.facebook,
      twitter: aboutData?.contact?.socialMedia?.twitter ?? DEFAULTS.contact.socialMedia.twitter,
      pinterest:
        aboutData?.contact?.socialMedia?.pinterest ?? DEFAULTS.contact.socialMedia.pinterest,
      youtube: aboutData?.contact?.socialMedia?.youtube ?? DEFAULTS.contact.socialMedia.youtube,
    },
    socialMediaLabel: DEFAULTS.contact.socialMediaLabel,
  }

  const contactForm = {
    heading: aboutData?.contactForm?.heading ?? DEFAULTS.contactForm.heading,
    placeholders: {
      name: aboutData?.contactForm?.placeholders?.name ?? DEFAULTS.contactForm.placeholders.name,
      email: aboutData?.contactForm?.placeholders?.email ?? DEFAULTS.contactForm.placeholders.email,
      phone: aboutData?.contactForm?.placeholders?.phone ?? DEFAULTS.contactForm.placeholders.phone,
      message:
        aboutData?.contactForm?.placeholders?.message ?? DEFAULTS.contactForm.placeholders.message,
    },
    subjectOptions: {
      default:
        aboutData?.contactForm?.subjectOptions?.default ??
        DEFAULTS.contactForm.subjectOptions.default,
      options:
        aboutData?.contactForm?.subjectOptions?.options &&
        aboutData.contactForm.subjectOptions.options.length > 0
          ? aboutData.contactForm.subjectOptions.options.map(
              (opt: { label?: string }) => opt.label || '',
            )
          : DEFAULTS.contactForm.subjectOptions.options,
    },
    submitButton: aboutData?.contactForm?.submitButton ?? DEFAULTS.contactForm.submitButton,
  }

  const cta = {
    heading: aboutData?.cta?.heading ?? DEFAULTS.cta.heading,
    description: aboutData?.cta?.description ?? DEFAULTS.cta.description,
    workshopsButton: {
      label: aboutData?.cta?.workshopsButton?.label ?? DEFAULTS.cta.workshopsButton.label,
      href: aboutData?.cta?.workshopsButton?.href ?? DEFAULTS.cta.workshopsButton.href,
    },
    coursesButton: {
      label: aboutData?.cta?.coursesButton?.label ?? DEFAULTS.cta.coursesButton.label,
      href: aboutData?.cta?.coursesButton?.href ?? DEFAULTS.cta.coursesButton.href,
    },
  }

  const heroImageUrl = getImageUrl(aboutData?.heroImage) || '/assets/images/banner.png'
  const id = toKebabCase((block as { blockName?: string }).blockName ?? 'about')

  return (
    <div id={id} className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div
        className="relative h-[600px] w-full overflow-hidden bg-cover bg-bottom"
        style={{
          backgroundImage: `url(${heroImageUrl})`,
        }}
      />

      {/* Our Story Section */}
      <section className="w-full pt-4 pb-8 md:py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="flex flex-col items-center gap-12">
            <h2 className="font-display text-3xl font-bold text-[#E5B765]">{ourStory.label}</h2>
            <h1 className="font-display text-center text-5xl font-bold leading-tight text-[#1D1D1D]">
              {ourStory.heading}
            </h1>
            <p className="max-w-4xl text-center font-display text-3xl font-bold leading-relaxed text-[#4B4F4A]">
              {ourStory.subheading}
            </p>
            <div className="flex w-full text-center flex-col gap-1 bg-white py-4 -mt-12">
              {ourStory.description.map((paragraph: string, idx: number) => (
                <p
                  key={idx}
                  className="font-display text-2xl font-normal leading-relaxed text-[#1D1D1D]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="w-full pt-4 pb-24 md:py-24">
        <div className="mx-auto max-w-[1400px] px-3 md:px-6">
          <div className="flex flex-col items-center gap-12 md:gap-16">
            <h2 className="font-display text-3xl font-bold text-[#E5B765] animate-fade-in">
              {team.label}
            </h2>
            <h3 className="font-display text-center text-5xl font-bold text-[#1D1D1D] animate-fade-in-up animate-delay-200">
              {team.heading}
            </h3>
            <div className="grid w-full gap-12 md:grid-cols-2">
              {team.members.map((member: (typeof team.members)[0] & { image?: unknown }, idx: number) => {
                const memberImageUrl = getImageUrl(member.image)
                const memberImageAlt = getImageAlt(member.image) || member.name

                return (
                  <div
                    key={idx}
                    className="flex aspect-[1/2] flex-col overflow-hidden rounded-3xl bg-white shadow-lg animate-fade-in-up hover:scale-[1.02] transition-transform duration-300"
                    style={{
                      animationDelay: `${(idx + 1) * 200}ms`,
                    }}
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      {memberImageUrl ? (
                        <Media
                          resource={member.image ?? undefined}
                          fill
                          imgClassName="object-cover"
                        />
                      ) : (
                        <img
                          src={
                            idx === 0
                              ? '/assets/images/marcel-rauminger.jpg'
                              : '/assets/images/david-heider.jpg'
                          }
                          alt={memberImageAlt}
                          className="absolute inset-0 size-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-4 px-8 pb-8 pt-6 text-center">
                      <h3 className="font-display text-3xl font-bold text-[#1D1D1D]">
                        {member.name}
                      </h3>
                      <p className="font-sans text-base font-normal text-[#E5B765]">
                        {member.role}
                      </p>
                      <p className="font-sans text-base leading-relaxed text-[#1D1D1D]">
                        {member.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <SponsorsSection heading={sponsors.heading} logos={sponsors.logos} />

      {/* Contact Section */}
      <ContactSection contact={contact} contactForm={contactForm} />

      {/* Ready to Learn CTA */}
      <section className="w-full py-12 md:py-24 bg-[#F9F0DC]">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="rounded-[2.75rem] bg-[#F9F0DC] px-6 py-12 md:px-24 md:py-20">
            <div className="flex flex-col items-center gap-8 md:gap-12">
              <h2 className="font-display text-center text-2xl md:text-3xl font-bold text-[#1D1D1D]">
                {cta.heading}
              </h2>
              <p className="max-w-4xl text-center font-display text-xl md:text-3xl font-semibold text-[#4B4B4B]">
                {cta.description}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
                <Link
                  href={cta.workshopsButton.href}
                  className="rounded-full bg-[#6B6B6B] px-6 py-2.5 md:px-16 md:py-3 font-display text-lg md:text-xl font-semibold text-[#F9F0DC] transition-colors hover:bg-[#595959]"
                >
                  {cta.workshopsButton.label}
                </Link>
                <Link
                  href={cta.coursesButton.href}
                  className="rounded-full bg-white px-6 py-2.5 md:px-14 md:py-3 font-display text-lg md:text-xl font-semibold text-[#4B4B4B] transition-all hover:bg-[#F9F0DC] hover:border-4 hover:border-[#4B4B4B]"
                >
                  {cta.coursesButton.label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
