import Link from 'next/link'

type Props = {
  giftTitle: string
  giftDescription: string
  giftBuyNowLabel: string
  giftBuyVoucherLabel: string
  giftBuyNowHref: string
  giftBuyVoucherHref: string
  onlineTitle: string
  onlineDescription: string
  onlineBullets: string[]
  onlineButtonLabel: string
  onlineButtonHref: string
}

export function GiftAndOnlineSection({
  giftTitle,
  giftDescription,
  giftBuyNowLabel,
  giftBuyVoucherLabel,
  giftBuyNowHref,
  giftBuyVoucherHref,
  onlineTitle,
  onlineDescription,
  onlineBullets,
  onlineButtonLabel,
  onlineButtonHref,
}: Props) {
  return (
    <section className="section-padding-md container-padding bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
        {/* Gift card */}
        <div className="rounded-2xl bg-[#F6F0E8] p-8">
          <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-[#1a1a1a]">
            <svg
              className="size-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13M8 8v13M8 8h13a2 2 0 00-2-2h-3.382a1 1 0 00-.894.553L11 8M8 8V6a2 2 0 012-2h3.382a1 1 0 01.894.553L15 8M5 8a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2V10a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
          <h3 className="font-display text-2xl font-bold text-[#1a1a1a]">{giftTitle}</h3>
          <p className="mt-3 text-body-lg text-[#333]">{giftDescription}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={giftBuyNowHref}
              className="inline-flex items-center justify-center rounded-2xl bg-[#4B4B4B] px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#333]"
            >
              {giftBuyNowLabel}
              <svg className="ml-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href={giftBuyVoucherHref}
              className="inline-flex items-center justify-center rounded-2xl border-2 border-[#E6BE68] bg-transparent px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-[#4B4B4B] transition-colors hover:bg-[#E6BE68]/10"
            >
              {giftBuyVoucherLabel}
            </Link>
          </div>
        </div>

        {/* Online courses card */}
        <div className="rounded-2xl bg-[#E8E4D9] p-8">
          <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-white">
            <svg
              className="size-6 text-[#1a1a1a]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
          <h3 className="font-display text-2xl font-bold text-[#1a1a1a]">{onlineTitle}</h3>
          <p className="mt-3 text-body-lg text-[#333]">{onlineDescription}</p>
          {onlineBullets.length > 0 && (
            <ul className="mt-4 space-y-2">
              {onlineBullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#1a1a1a]" />
                  <span className="text-[#333]">{bullet}</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={onlineButtonHref}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#4B4B4B] px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#333]"
          >
            {onlineButtonLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
