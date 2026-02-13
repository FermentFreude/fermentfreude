import Image from 'next/image'
import React from 'react'

/**
 * Hero section: "Innovation meets Tradition"
 * Full-viewport hero with large heading, German subtext, and hero image.
 */
export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-ff-ivory px-6 pb-16 pt-8 md:px-12 lg:px-20">
      {/* "WHY FERMENTATION?" label */}
      <p className="mb-6 text-base font-black uppercase tracking-wider text-ff-charcoal md:text-lg">
        WHY fermentation?
      </p>

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-0">
        {/* Left content */}
        <div className="max-w-3xl lg:max-w-[55%]">
          <h1 className="text-5xl font-bold leading-[1.3] tracking-tight text-ff-black md:text-6xl lg:text-7xl xl:text-[86px]">
            Innovation meets Tradition
          </h1>
          <div className="mt-6 max-w-xl space-y-1 text-lg text-ff-black md:text-xl lg:ml-8">
            <p>Fermentation ist mehr als Sauerkraut oder Joghurt.</p>
            <p>Ist eine Welt voller Geschmack, Kreativität und überraschender Aromen</p>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative aspect-16/10 w-full overflow-hidden lg:absolute lg:right-0 lg:top-0 lg:w-[55%]">
          <Image
            alt="Fermented foods and preparation"
            className="rounded-bl-[86px] object-cover"
            fill
            priority
            src="/assets/images/fermentation-hero.jpg"
          />
        </div>
      </div>
    </section>
  )
}
