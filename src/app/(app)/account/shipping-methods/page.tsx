import { Info } from 'lucide-react'

const SHIPPING_METHODS = [
  {
    name: 'Standard Shipping',
    description: 'Tracked delivery via DHL',
    duration: '3–5 business days',
    price: '€4.90',
    free: '€50+',
    isDefault: true,
  },
  {
    name: 'Express Shipping',
    description: 'Priority delivery via DHL',
    duration: '1–2 business days',
    price: '€9.90',
    free: null,
    isDefault: false,
  },
]

export default function ShippingMethodsPage() {
  return (
    <div className="max-w-2xl space-y-10">
      {/* Page header */}
      <div className="pb-8 border-b border-[#e8e4d9]">
        <p className="text-eyebrow font-bold text-ff-gold-accent mb-3">Settings</p>
        <h1 className="font-display text-[2rem] font-bold text-[#1a1a1a] tracking-tight leading-tight">
          Shipping Methods
        </h1>
        <p className="mt-2 text-sm text-[#626160]">Available delivery options for your orders.</p>
      </div>

      {/* Info banner */}
      <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Shipping method is selected at checkout based on your location and preferences. Options
          and pricing may vary for workshop materials versus online products.
        </p>
      </div>

      {/* Methods */}
      <section>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#c4bbb3] mb-5">
          Available Options
        </p>
        <div className="space-y-4">
          {SHIPPING_METHODS.map((method) => (
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
                    Free for orders over {method.free}
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
          Notes
        </p>
        <ul className="space-y-2 text-[13px] text-[#626160]">
          <li className="flex gap-2">
            <span className="text-[#c4bbb3] mt-px">·</span>
            Delivery times are estimates and may vary during peak periods.
          </li>
          <li className="flex gap-2">
            <span className="text-[#c4bbb3] mt-px">·</span>
            Workshop tickets are digital — no shipping required.
          </li>
          <li className="flex gap-2">
            <span className="text-[#c4bbb3] mt-px">·</span>
            Physical kits and books ship separately if ordered with tickets.
          </li>
          <li className="flex gap-2">
            <span className="text-[#c4bbb3] mt-px">·</span>
            Tracking information is emailed once your order ships.
          </li>
        </ul>
      </section>
    </div>
  )
}
