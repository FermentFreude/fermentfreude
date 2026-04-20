import { accountI18n } from '@/app/(app)/account/i18n'
import { stripe } from '@/lib/stripe'
import type { User } from '@/payload-types'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export async function generateMetadata() {
  const locale = await getLocale()
  const t = locale === 'de' ? accountI18n.de : accountI18n.en
  return { title: t.paymentMethods }
}

function cardBrandLabel(brand: string | undefined): string {
  if (!brand) return 'Karte'
  return brand.charAt(0).toUpperCase() + brand.slice(1)
}

export default async function PaymentMethodsPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const locale = await getLocale()
  const t = locale === 'de' ? accountI18n.de : accountI18n.en

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent(t.loginRequiredPaymentMethods)}`)
  }

  const typedUser = user as User
  const customerId = typedUser.stripeCustomerId

  type StripeCard = {
    id: string
    brand?: string
    last4?: string
    exp_month?: number
    exp_year?: number
  }

  let cards: StripeCard[] = []

  if (customerId) {
    const pmResult = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })
    cards = pmResult.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      exp_month: pm.card?.exp_month,
      exp_year: pm.card?.exp_year,
    }))
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f3f0]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight mb-2">
              {t.paymentMethods}
            </h1>
            <p className="text-[14px] text-[#626160]">{t.paymentMethodsSubtitle}</p>
          </div>
          <div className="bg-white border border-[#1a1a1a]/20 rounded-xl p-16 text-center">
            <p className="text-[13px] text-[#626160] mb-6">{t.noPaymentMethods}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f3f0]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight mb-2">
            {t.paymentMethods}
          </h1>
          <p className="text-[14px] text-[#626160]">{t.paymentMethodsSubtitle}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white border border-[#e8e4d9] rounded-2xl p-6 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#1a1a1a]">
                  {cardBrandLabel(card.brand)}
                </span>
                <span className="text-[11px] text-[#9e9189] font-mono uppercase tracking-wider">
                  {card.brand?.toUpperCase() ?? ''}
                </span>
              </div>
              <p className="text-[18px] font-mono text-[#1a1a1a] tracking-[0.2em]">
                •••• •••• •••• {card.last4 ?? '****'}
              </p>
              <p className="text-[12px] text-[#9e9189]">
                {card.exp_month ?? '--'}/{card.exp_year ?? '--'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
