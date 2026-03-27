import { accountI18n } from '@/app/(app)/account/i18n'
import { getLocale } from '@/utilities/getLocale'
import { Info } from 'lucide-react'

export default async function ShippingMethodsPage() {
  const locale = await getLocale()
  const t = locale === 'de' ? accountI18n.de : accountI18n.en

  const shippingMethods = [
    {
      name: t.standardShipping,
      description: t.standardDesc,
      duration: t.standardDuration,
      price: '€4.90',
      free: '€50+',
      isDefault: true,
    },
    {
      name: t.expressShipping,
      description: t.expressDesc,
      duration: t.expressDuration,
      price: '€9.90',
      free: null,
      isDefault: false,
    },
  ]

  return (
    <div className="max-w-2xl space-y-10">
      {/* Page header */}
      <div className="pb-8 border-b border-[#e8e4d9]">
        <p className="text-eyebrow font-bold text-ff-gold-accent mb-3">{t.settings}</p>
        <h1 className="font-display text-[2rem] font-bold text-[#1a1a1a] tracking-tight leading-tight">
          {t.shippingMethods}
        </h1>
        <p className="mt-2 text-sm text-[#626160]">{t.shippingSubtitle}</p>
      </div>

      {/* Info banner */}
      <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>{t.shippingInfo}</p>
      </div>

      {/* Methods */}
      <section>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#c4bbb3] mb-5">
          {t.availableOptions}
        </p>
        <div className="space-y-4">
          {shippingMethods.map((method) => (
            <div
              key={method.name}
              className="bg-white border border-[#1a1a1a]/20 rounded-xl p-5 flex items-start gap-4"
            >
              <span
                className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                  method.isDefault ? 'border-[#1a1a1a] bg-[#1a1a1a]' : 'border-[#c4bbb3] bg-white'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm font-semibold text-[#1a1a1a]">{method.name}</p>
                  <p className="text-sm font-semibold text-[#1a1a1a] shrink-0">{method.price}</p>
                </div>
                <p className="text-[12px] text-[#626160] mt-0.5">{method.description}</p>
                <p className="text-[11px] text-[#9e9189] mt-1">{method.duration}</p>
                {method.free && (
                  <p className="text-[11px] text-green-600 mt-1.5">
                    {t.freeOver(method.free)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#e8e4d9]" />

      {/* Notes */}
      <section>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#c4bbb3] mb-4">
          {t.notes}
        </p>
        <ul className="space-y-2 text-[13px] text-[#626160]">
          <li className="flex gap-2">
            <span className="text-[#c4bbb3] mt-px">·</span>
            {t.noteDeliveryTimes}
          </li>
          <li className="flex gap-2">
            <span className="text-[#c4bbb3] mt-px">·</span>
            {t.noteDigitalTickets}
          </li>
          <li className="flex gap-2">
            <span className="text-[#c4bbb3] mt-px">·</span>
            {t.notePhysicalKits}
          </li>
          <li className="flex gap-2">
            <span className="text-[#c4bbb3] mt-px">·</span>
            {t.noteTracking}
          </li>
        </ul>
      </section>
    </div>
  )
}
