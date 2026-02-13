import type { Metadata } from 'next'

import { CTABanner } from '@/components/ui/CTABanner'
import { ChefHat, HandPlatter, Leaf, Sparkles, Truck, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Gastronomie | Fermentfreude',
  description:
    'Fermentierte Produkte für Restaurants, Hotels und Catering. Heben Sie Ihre Küche mit einzigartigen Aromen und probiotischen Zutaten auf ein neues Level.',
}

const benefits = [
  {
    icon: Sparkles,
    title: 'Einzigartige Aromen',
    description: 'Komplexe Umami-Noten und fermentierte Geschmackstiefe für kreative Gerichte.',
  },
  {
    icon: Leaf,
    title: 'Natürlich & Nachhaltig',
    description: 'Handwerklich hergestellt, ohne Zusatzstoffe — perfekt für bewusste Gastronomie.',
  },
  {
    icon: Truck,
    title: 'Zuverlässige Lieferung',
    description: 'Regelmäßige Belieferung in der Steiermark und österreichweiter Versand.',
  },
  {
    icon: Users,
    title: 'Workshops für Teams',
    description: 'Teambuilding und Weiterbildung rund um Fermentation für Ihre Küchencrew.',
  },
]

const products = [
  {
    title: 'Tempeh',
    description:
      'Protein-reiches Tempeh aus heimischen Sojabohnen — vielseitig einsetzbar als Fleischalternative.',
    image: '/assets/images/fermentation-hero.jpg',
  },
  {
    title: 'Kimchi & Lakto-Gemüse',
    description:
      'Saisonales, milchsauer fermentiertes Gemüse — als Beilage, im Salat oder als Topping.',
    image: '/assets/images/fermentation-hero.jpg',
  },
  {
    title: 'Kombucha',
    description:
      'Erfrischend fermentierter Tee — als alkoholfreie Alternative oder Cocktail-Zutat.',
    image: '/assets/images/fermentation-hero.jpg',
  },
]

/**
 * Gastronomy B2B page — targeted at chefs, restaurants, and hotels.
 */
export default function GastronomyPage() {
  return (
    <article>
      {/* Hero */}
      <section className="relative min-h-[70vh] overflow-hidden bg-ff-ivory px-6 pb-16 pt-8 md:px-12 lg:px-20">
        <p className="mb-6 text-base font-black uppercase tracking-wider text-ff-charcoal md:text-lg">
          Für die Gastronomie
        </p>

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-0">
          <div className="max-w-3xl lg:max-w-[55%]">
            <h1 className="text-5xl font-bold leading-[1.3] tracking-tight text-ff-black md:text-6xl lg:text-7xl xl:text-[86px]">
              Fermentation für Profis
            </h1>
            <div className="mt-6 max-w-xl space-y-1 text-lg text-ff-black md:text-xl lg:ml-8">
              <p>Heben Sie Ihre Küche auf ein neues Level.</p>
              <p>
                Einzigartige Aromen, probiotische Zutaten und kreative Möglichkeiten für Ihr
                Restaurant, Hotel oder Catering.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-4 lg:ml-8">
              <Link
                href="#kontakt"
                className="inline-flex items-center justify-center rounded-2xl bg-ff-charcoal px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-ff-near-black"
              >
                Anfrage senden
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-2xl border-[3px] border-ff-charcoal bg-white px-8 py-4 text-lg font-medium text-ff-charcoal transition-colors hover:bg-ff-cream"
              >
                Produkte entdecken
              </Link>
            </div>
          </div>

          <div className="relative aspect-16/10 w-full overflow-hidden lg:absolute lg:right-0 lg:top-0 lg:w-[55%]">
            <Image
              alt="Fermentierte Produkte für die Gastronomie"
              className="rounded-bl-[86px] object-cover"
              fill
              priority
              src="/assets/images/fermentation-hero.jpg"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-ff-black md:text-4xl lg:text-5xl">
            Warum Fermentfreude?
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-lg text-ff-gray-text">
            Wir beliefern Gastronomiebetriebe mit handwerklich fermentierten Produkten aus Graz.
          </p>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex flex-col items-center rounded-3xl border border-ff-white-95 bg-ff-ivory/50 p-8 text-center transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ff-charcoal text-white">
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-ff-black">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-ff-gray-text">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products for Gastronomy */}
      <section className="bg-ff-ivory px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-ff-black md:text-4xl lg:text-5xl">
            Unsere Produkte für Ihre Küche
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-lg text-ff-gray-text">
            Alle Produkte werden in kleinen Chargen handwerklich hergestellt — frisch, natürlich und
            ohne Kompromisse.
          </p>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.title}
                className="group overflow-hidden rounded-3xl border border-ff-white-95 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    alt={product.title}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    fill
                    src={product.image}
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold text-ff-black">{product.title}</h3>
                  <p className="text-sm leading-relaxed text-ff-gray-text">{product.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-16 text-center text-3xl font-bold text-ff-black md:text-4xl lg:text-5xl">
            So funktioniert&apos;s
          </h2>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Anfrage senden',
                description:
                  'Kontaktieren Sie uns mit Ihren Wünschen — wir beraten Sie zu den passenden Produkten.',
              },
              {
                step: '02',
                title: 'Verkostung',
                description:
                  'Sie erhalten ein kostenloses Probierset, um unsere fermentierten Produkte kennenzulernen.',
              },
              {
                step: '03',
                title: 'Regelmäßige Belieferung',
                description: 'Wir liefern zuverlässig nach Ihrem Bedarf — flexibel und frisch.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="mb-4 inline-block text-4xl font-black text-ff-charcoal/20">
                  {item.step}
                </span>
                <h3 className="mb-2 text-lg font-bold text-ff-black">{item.title}</h3>
                <p className="text-sm leading-relaxed text-ff-gray-text">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chef Workshops */}
      <section className="bg-ff-ivory px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-ff-charcoal" />
              <span className="text-sm font-bold uppercase tracking-wider text-ff-charcoal">
                Für Küchen-Teams
              </span>
            </div>
            <h2 className="mb-6 text-3xl font-bold text-ff-black md:text-4xl">
              Workshops & Teambuilding
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-ff-gray-text">
              Bieten Sie Ihrem Team ein außergewöhnliches Erlebnis: In unseren Gastronomie-Workshops
              lernen Köch:innen die Grundlagen der Fermentation und entwickeln kreative Rezepte für
              Ihre Speisekarte.
            </p>
            <ul className="mb-8 space-y-3 text-ff-gray-text">
              {[
                'Individuelle Workshops für Ihr Küchenteam',
                'Neue Techniken und Geschmacksprofile',
                'Rezeptentwicklung mit fermentierten Zutaten',
                'Vor Ort in Graz oder in Ihrem Betrieb',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <HandPlatter className="mt-0.5 h-5 w-5 shrink-0 text-ff-charcoal" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/workshops"
              className="inline-flex items-center justify-center rounded-2xl bg-ff-charcoal px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-ff-near-black"
            >
              Workshops ansehen
            </Link>
          </div>
          <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-3xl lg:flex-1">
            <Image
              alt="Fermentations-Workshop für Köche"
              className="object-cover"
              fill
              src="/assets/images/fermentation-hero.jpg"
            />
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <div id="kontakt" className="px-6 py-8 md:px-12 lg:px-20">
        <CTABanner
          backgroundImage="/assets/images/fermentation-cta.jpg"
          buttons={[
            { label: 'Anfrage senden', href: 'mailto:hello@fermentfreude.at', variant: 'primary' },
            { label: 'Produkte ansehen', href: '/shop', variant: 'outline' },
          ]}
          description="Wir freuen uns auf Ihre Anfrage — egal ob Restaurant, Hotel, Catering oder Eventlocation. Lassen Sie uns gemeinsam einzigartige Geschmackserlebnisse schaffen."
          title="Bereit für neue Geschmackswelten?"
        />
      </div>
    </article>
  )
}
