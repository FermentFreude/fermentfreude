import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLocale } from '@/utilities/getLocale'
import Image from 'next/image'
import Link from 'next/link'
import { NewsletterForm } from './NewsletterForm'

const DEFAULTS = {
  location: 'Grabenstraße 15,\n8010 Graz, Austria',
  phone: '+43 660 4943577',
  newsletterHeading: 'Subscribe Newsletter',
  newsletterDescription:
    'Explore our news and blog content today about Fermentation and everything related.',
}

export async function Footer() {
  const locale = await getLocale()
  const footer: Footer = await getCachedGlobal('footer', 1, locale)()

  const quickLinks = footer.navItems || []
  const workshopLinks = footer.workshopLinks || []
  const location = footer.location || DEFAULTS.location
  const phone = footer.phone || DEFAULTS.phone
  const newsletterHeading = footer.newsletterHeading || DEFAULTS.newsletterHeading
  const newsletterDescription = footer.newsletterDescription || DEFAULTS.newsletterDescription
  const social = footer.socialMedia

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#faf2e0] text-[#1d1d1d]">
      <div className="container mx-auto px-6 pt-16 pb-8 md:pt-20 md:pb-10 lg:pt-20 lg:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Logo + Address */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="inline-block">
              <Image
                src="/primary-logo.svg"
                alt="Fermentfreude"
                width={90}
                height={78}
                className="h-auto w-17.5 md:w-22.5"
                style={{ height: 'auto' }}
              />
            </Link>
            <div className="flex flex-col gap-3 text-sm md:text-base">
              <div>
                <p className="font-display font-bold text-lg md:text-xl leading-[1.3]">Location:</p>
                <p className="font-display font-bold text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {location}
                </p>
              </div>
              <div>
                <p className="font-display font-bold text-lg md:text-xl leading-[1.3]">Phone:</p>
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="font-display font-bold text-sm md:text-base hover:underline"
                >
                  {phone}
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-black text-2xl md:text-[28px] leading-[1.3]">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-2">
              {quickLinks.map((item) => (
                <CMSLink
                  key={item.id}
                  appearance="link"
                  {...item.link}
                  className="font-display font-bold text-base md:text-lg hover:text-[#e5b765] transition-colors w-fit"
                />
              ))}
            </nav>
          </div>

          {/* Column 3: Our Workshops */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-black text-2xl md:text-[28px] leading-[1.3]">
              Our Workshops
            </h3>
            <nav className="flex flex-col gap-2">
              {workshopLinks.map((item) => (
                <CMSLink
                  key={item.id}
                  appearance="link"
                  {...item.link}
                  className="font-display font-bold text-base md:text-lg hover:text-[#e5b765] transition-colors w-fit"
                />
              ))}
            </nav>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-black text-2xl md:text-[28px] leading-[1.3]">
              {newsletterHeading}
            </h3>
            <p className="font-display font-bold text-sm md:text-base leading-relaxed">
              {newsletterDescription}
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#1d1d1d]/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display font-bold text-sm md:text-base">
            Copyright {currentYear} &copy; All Right Reserved Fermentfreude
          </p>
          <div className="flex items-center gap-4">
            {social?.youtube && (
              <a
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-[#1d1d1d] hover:text-[#e5b765] transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            )}
            {social?.pinterest && (
              <a
                href={social.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="text-[#1d1d1d] hover:text-[#e5b765] transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
                </svg>
              </a>
            )}
            {social?.twitter && (
              <a
                href={social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-[#1d1d1d] hover:text-[#e5b765] transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {social?.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-[#1d1d1d] hover:text-[#e5b765] transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
