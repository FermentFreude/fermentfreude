import type { Footer } from '@/payload-types'
import type { CSSProperties } from 'react'

import { getCachedGlobal } from '@/utilities/getGlobals'
import { getLocale } from '@/utilities/getLocale'
import Link from 'next/link'
import { FooterBrand } from './FooterBrand'
import NewsletterForm from './NewsletterForm'

const DEFAULTS_DE = {
  newsletterHeading: 'Werde Teil der FermentFreude Bewegung',
  freeRecipesLabel: 'Kostenlose Workshop-Rezepte',
  quickLinksHeading: 'Schnellzugriff',
  workshopsHeading: 'Workshops',
  legalHeading: 'Rechtliches',
  followUsHeading: 'Folge uns',
}

const DEFAULTS_EN = {
  newsletterHeading: 'Join the FermentFreude Movement',
  freeRecipesLabel: 'Free Workshop Recipes',
  quickLinksHeading: 'Quick Links',
  workshopsHeading: 'Workshops',
  legalHeading: 'Legal Info',
  followUsHeading: 'Follow Us',
}

const QUICK_LINKS_DE = [
  { label: 'Startseite', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Für Gastronomen', href: '/gastronomy' },
  { label: 'Über uns', href: '/about' },
  { label: 'Kontakt', href: '/contact' },
]

const QUICK_LINKS_EN = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'For Chefs', href: '/gastronomy' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const LEGAL_LINKS_DE = [
  { label: 'Datenschutz', href: '/datenschutz' },
  { label: 'AGB', href: '/agb' },
  { label: 'Impressum', href: '/impressum' },
]

const LEGAL_LINKS_EN = [
  { label: 'Privacy', href: '/datenschutz' },
  { label: 'Terms', href: '/agb' },
  { label: 'Imprint', href: '/impressum' },
]

const WORKSHOP_LINKS_DE = [
  { label: 'Lakto-Gemüse', href: '/workshops/lakto-gemuese' },
  { label: 'Tempeh', href: '/workshops/tempeh' },
  { label: 'Kombucha', href: '/workshops/kombucha' },
  { label: 'Vom Feld ins Glas', href: '/workshops/vom-feld-ins-glas' },
  { label: 'Gutschein', href: '/workshops/voucher' },
]

const WORKSHOP_LINKS_EN = [
  { label: 'Lacto Vegetables', href: '/workshops/lakto-gemuese' },
  { label: 'Tempeh', href: '/workshops/tempeh' },
  { label: 'Kombucha', href: '/workshops/kombucha' },
  { label: 'From Field to Jar', href: '/workshops/vom-feld-ins-glas' },
  { label: 'Gift Voucher', href: '/workshops/voucher' },
]

export async function Footer() {
  const locale = await getLocale()
  const footer = (await getCachedGlobal<Footer>('footer', 1, locale)()) as Footer

  const isDe = locale === 'de'
  const d = isDe ? DEFAULTS_DE : DEFAULTS_EN
  const newsletterHeading = footer.newsletterHeading ?? d.newsletterHeading
  const freeRecipesLabel = footer.freeRecipesLabel ?? d.freeRecipesLabel
  const quickLinksHeading = footer.quickLinksHeading ?? d.quickLinksHeading
  const workshopsHeading = footer.workshopsHeading ?? d.workshopsHeading
  const legalHeading = footer.legalHeading ?? d.legalHeading
  const followUsHeading = footer.followUsHeading ?? d.followUsHeading
  const copyrightText =
    footer.copyrightText ??
    (isDe ? 'FermentFreude — Alle Rechte vorbehalten' : 'FermentFreude — All Rights Reserved')
  const accentColorValue =
    typeof (footer as { accentColor?: unknown }).accentColor === 'string'
      ? (footer as { accentColor?: string | null }).accentColor
      : undefined
  const accentColor = accentColorValue?.trim() || '#e6be68'
  const footerStyle = { '--footer-accent': accentColor } as CSSProperties
  const social = footer.socialMedia

  // Resolve a CMS link field (reference or custom URL) to an href string
  const resolveHref = (link: {
    type?: string | null
    url?: string | null
    reference?: { relationTo: string; value: string | { slug?: string | null } } | null
  }) => {
    if (link.type === 'reference' && link.reference) {
      const ref = link.reference
      const slug = typeof ref.value === 'object' ? ref.value?.slug : null
      if (!slug) return '/'
      if (ref.relationTo === 'pages') return `/${slug}`
      if (ref.relationTo === 'online-courses') return `/courses/${slug}`
      return `/${ref.relationTo}/${slug}`
    }
    return link.url || '/'
  }

  // Use CMS links when available, otherwise fall back to locale-aware defaults
  const quickLinks =
    footer.navItems && footer.navItems.length > 0
      ? footer.navItems.map((item) => ({ label: item.link.label, href: resolveHref(item.link) }))
      : isDe
        ? QUICK_LINKS_DE
        : QUICK_LINKS_EN

  const workshopLinks =
    footer.workshopLinks && footer.workshopLinks.length > 0
      ? footer.workshopLinks.map((item) => ({
          label: item.link.label,
          href: resolveHref(item.link),
        }))
      : isDe
        ? WORKSHOP_LINKS_DE
        : WORKSHOP_LINKS_EN

  const legalLinks =
    footer.legalLinks && footer.legalLinks.length > 0
      ? footer.legalLinks.map((item) => ({ label: item.link.label, href: resolveHref(item.link) }))
      : isDe
        ? LEGAL_LINKS_DE
        : LEGAL_LINKS_EN

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white text-[#1d1d1d]" style={footerStyle}>
      {/* Thin top border */}
      <div className="w-full h-px bg-[#1d1d1d]/10" />

      {/* ── Upper section ── */}
      <div className="mx-auto max-w-344 px-6 md:px-10 lg:px-16 pt-10 pb-8 md:pt-12 md:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16">
          {/* Left: Newsletter CTA */}
          <div className="max-w-sm">
            <h2 className="font-display font-black text-lg md:text-xl uppercase leading-[1.15] tracking-tight">
              {newsletterHeading}
            </h2>
            <div className="mt-4">
              <NewsletterForm locale={locale} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-(--footer-accent)" />
              <span className="font-sans text-[10px] uppercase tracking-widest font-semibold bg-(--footer-accent) px-1.5 py-0.5">
                {freeRecipesLabel}
              </span>
            </div>
          </div>

          {/* Right: Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-10">
            {/* Quick Links */}
            <div>
              <h3 className="font-display font-bold text-sm uppercase tracking-widest mb-3 text-[#1d1d1d]">
                {quickLinksHeading}
              </h3>
              <nav className="flex flex-col gap-1.5">
                {quickLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="font-sans text-sm hover:text-(--footer-accent) transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Workshops */}
            <div>
              <h3 className="font-display font-bold text-sm uppercase tracking-widest mb-3 text-[#1d1d1d]">
                {workshopsHeading}
              </h3>
              <nav className="flex flex-col gap-1.5">
                {workshopLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="font-sans text-sm hover:text-(--footer-accent) transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-display font-bold text-sm uppercase tracking-widest mb-3 text-[#1d1d1d]">
                {legalHeading}
              </h3>
              <nav className="flex flex-col gap-1.5">
                {legalLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="font-sans text-sm hover:text-(--footer-accent) transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Follow Us */}
            <div>
              <h3 className="font-display font-bold text-sm uppercase tracking-widest mb-3 text-[#1d1d1d]">
                {followUsHeading}
              </h3>
              <nav className="flex flex-col gap-1.5">
                <a
                  href={social?.instagram || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-sm hover:text-(--footer-accent) transition-colors"
                >
                  Instagram
                </a>
                <a
                  href={social?.facebook || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-sm hover:text-(--footer-accent) transition-colors"
                >
                  Facebook
                </a>
                <a
                  href={social?.linkedin || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-sm hover:text-(--footer-accent) transition-colors"
                >
                  LinkedIn
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* ── Big brand name with text-generate effect ── */}
      <div className="mx-auto max-w-344 px-6 md:px-10 lg:px-16">
        <FooterBrand />
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-[#1d1d1d]">
        <div className="mx-auto max-w-344 px-6 md:px-10 lg:px-16 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: social icons */}
          <div className="flex items-center gap-3">
            <a
              href={social?.instagram || '#'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-[#1d1d1d] hover:text-(--footer-accent) transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
            <a
              href={social?.facebook || '#'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-[#1d1d1d] hover:text-(--footer-accent) transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href={social?.linkedin || '#'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-[#1d1d1d] hover:text-(--footer-accent) transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>

          {/* Right: copyright + Stripe */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-1 text-[11px] text-[#1d1d1d]">
            <span>
              &copy; {currentYear} {copyrightText}
            </span>
            <span className="font-medium">Powered by Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
