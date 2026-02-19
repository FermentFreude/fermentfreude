import Link from 'next/link'
import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

interface StarterSetSectionProps {
  heading: string
  description: string
  buttonText: string
  image?: MediaType | string | null
}

export function StarterSetSection({
  heading,
  description,
  buttonText,
  image,
}: StarterSetSectionProps) {
  return (
    <section className="w-full py-12 md:py-24 bg-white">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <div className="order-2 lg:order-1">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-[#FAF2E0]">
              {image ? (
                <Media
                  resource={image}
                  fill
                  imgClassName="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-[#4B4F4A] font-sans text-sm">Image placeholder</p>
                </div>
              )}
            </div>
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2 flex flex-col gap-6 md:gap-8">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-[#1D1D1D] leading-tight">
              {heading}
            </h2>
            <p className="font-sans text-base md:text-lg lg:text-xl text-[#4B4F4A] leading-relaxed">
              {description}
            </p>
            <Link
              href="/shop?category=starter-sets"
              className="inline-block rounded-full bg-[#6B6B6B] px-6 md:px-8 py-3 md:py-4 font-display text-base md:text-lg font-semibold text-white transition-colors hover:bg-[#595959] w-fit shadow-md hover:shadow-lg"
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
