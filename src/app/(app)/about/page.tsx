import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us | FermentFreude',
  description:
    'Making fermentation joyful & accessible while empowering gut health through taste, education, and quality handmade foods',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="relative h-[600px] w-full overflow-hidden bg-cover bg-center bg-[url('/assets/images/banner.png')]"></div>

      {/* Our Story Section */}
      <section className="w-full py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="flex flex-col items-center gap-12">
            {/* Section Label */}
            <h2 className="font-display text-3xl font-bold text-[#E5B765]">Our Story</h2>

            {/* Main Heading */}
            <h1 className="font-display text-center text-6xl font-bold leading-tight text-[#1D1D1D]">
              Bringing Joy to Fermentation
            </h1>

            {/* Subheading */}
            <p className="max-w-4xl text-center font-display text-3xl font-bold leading-relaxed text-[#4B4F4A]">
              Making fermentation joyful & accessible while empowering gut health through taste,
              education, and quality handmade foods
            </p>

            {/* Description Paragraphs */}
            <div className="flex w-full text-center flex-col gap-8 bg-white py-12">
              <p className="font-display text-2xl font-normal leading-relaxed text-[#1D1D1D]">
                FermentFreude is a modern Austrian food-tech startup helping people discover
                fermentation through fun workshops and premium fermented products. We combine
                health, enjoyment, and knowledge to make fermentation part of everyday life.
              </p>
              <p className="font-display text-2xl font-normal leading-relaxed text-[#1D1D1D]">
                By merging traditional fermentation methods with modern science and regional
                sourcing, we empower home cooks and professionals to approach food with confidence,
                curiosity, and pleasure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="w-full py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="flex flex-col items-center gap-16">
            {/* Section Label */}
            <h2 className="font-display text-3xl font-bold text-[#E5B765]">Our Team</h2>

            {/* Team Heading */}
            <h3 className="font-display text-center text-5xl font-bold text-[#1D1D1D]">
              Meet the Experts Behind FermentFreude
            </h3>

            {/* Team Members Grid */}
            <div className="grid w-full gap-12 md:grid-cols-2">
              {/* Marcel Rauminger */}
              <div className="flex aspect-[1/2] flex-col overflow-hidden rounded-3xl bg-white shadow-lg">
                <div className="flex-1 w-full overflow-hidden">
                  <img
                    src="/assets/images/marcel-rauminger.jpg"
                    alt="Marcel Rauminger"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-4 px-8 pb-8 pt-6 text-center">
                  <h3 className="font-display text-3xl font-bold text-[#1D1D1D]">
                    Marcel Rauminger
                  </h3>
                  <p className="font-sans text-base font-normal text-[#E5B765]">
                    Fermentation Specialist & Chef
                  </p>
                  <p className="font-sans text-base leading-relaxed text-[#1D1D1D]">
                    With over 17 years as a passionate chef and certificate in vegan cooking
                    enriched by months in a Thai monastery, Marcel discovered the keys to
                    fermentation and has become a specialist in creative fermented cuisine. His
                    desire to expertise through workshops, sharing new discoveries and passion for
                    fine flavor.
                  </p>
                </div>
              </div>

              {/* David Heider */}
              <div className="flex aspect-[1/2] flex-col overflow-hidden rounded-3xl bg-white shadow-lg">
                <div className="flex-1 w-full overflow-hidden">
                  <img
                    src="/assets/images/david-heider.jpg"
                    alt="David Heider"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-4 px-8 pb-8 pt-6 text-center">
                  <h3 className="font-display text-3xl font-bold text-[#1D1D1D]">David Heider</h3>
                  <p className="font-sans text-base font-normal text-[#E5B765]">
                    Nutrition Specialist & Food Developer
                  </p>
                  <p className="font-sans text-base leading-relaxed text-[#1D1D1D]">
                    With a background in food science and economics, David is passionate about
                    making complex scientific concepts digestible for everyone. He develops
                    open-sourced fermentation techniques based fermented foods that taste amazing
                    and support wellbeing, creating the perfect bridge between science and art of
                    FermentFreude.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="w-full bg-[#ECE5DE] py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="flex flex-col items-center gap-12">
            <h2 className="font-display text-center text-3xl font-bold text-[#1D1D1D]">
              This project is supported by:
            </h2>
            <div className="flex w-full flex-wrap items-center justify-center md:justify-between gap-16">
              {/* Sponsor Logo 1 */}
              <div className="flex h-24 w-48 items-center justify-center rounded-lg">
                <img
                  src="/assets/images/sponsor-logo-1.svg"
                  alt="Sponsor Logo 1"
                  className="h-full w-full object-contain"
                />
              </div>
              {/* Sponsor Logo 2 */}
              <div className="flex h-24 w-48 items-center justify-center rounded-lg">
                <img
                  src="/assets/images/sponsor-logo-2.svg"
                  alt="Sponsor Logo 2"
                  className="h-full w-full object-contain"
                />
              </div>
              {/* Science Park Graz */}
              <div className="flex h-24 w-48 items-center justify-center rounded-l">
                <img
                  src="/assets/images/sponsor-logo-3.svg"
                  alt="Science Park Graz"
                  className="h-full w-full object-contain"
                />
              </div>
              {/* Sponsor Logo 4 */}
              <div className="flex h-24 w-48 items-center justify-center rounded-lg">
                <img
                  src="/assets/images/sponsor-logo-4.svg"
                  alt="Sponsor Logo 4"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="relative overflow-hidden rounded-3xl md:rounded-[5rem] bg-white shadow-lg">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Contact Details */}
              <div className="rounded-t-[5rem] md:rounded-l-[5rem] md:rounded-t-none bg-[#FAF2E0] p-6 md:p-16">
                <div className="flex flex-col gap-8 md:gap-12">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1E1E1E]">
                    Contact Detail
                  </h2>

                  <p className="font-display text-lg md:text-2xl font-bold leading-relaxed text-[#555]">
                    If you need any help and prefer to reach out directly, feel free to do it via
                    phone or email.
                  </p>

                  {/* Contact Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Location */}
                    <div className="flex gap-4 md:gap-6">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-10 h-11 md:w-[54px] md:h-[59px]"
                          viewBox="0 0 54 59"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M26.6525 33.1145C25.0053 33.1145 23.3951 32.5751 22.0256 31.5644C20.656 30.5537 19.5885 29.1172 18.9582 27.4365C18.3278 25.7558 18.1629 23.9064 18.4842 22.1222C18.8056 20.338 19.5988 18.6991 20.7635 17.4128C21.9283 16.1264 23.4122 15.2504 25.0278 14.8955C26.6433 14.5406 28.3178 14.7227 29.8396 15.4189C31.3614 16.1151 32.6621 17.294 33.5773 18.8066C34.4924 20.3191 34.9808 22.0975 34.9808 23.9166C34.9782 26.3552 34.0999 28.693 32.5386 30.4173C30.9773 32.1416 28.8605 33.1116 26.6525 33.1145ZM26.6525 18.3979C25.6642 18.3979 24.6981 18.7216 23.8763 19.328C23.0546 19.9344 22.4141 20.7963 22.0359 21.8047C21.6577 22.8131 21.5587 23.9228 21.7516 24.9933C21.9444 26.0638 22.4203 27.0472 23.1191 27.819C23.818 28.5908 24.7083 29.1164 25.6777 29.3293C26.647 29.5423 27.6517 29.433 28.5648 29.0153C29.4779 28.5976 30.2583 27.8902 30.8074 26.9827C31.3564 26.0751 31.6495 25.0081 31.6495 23.9166C31.6482 22.4534 31.1213 21.0506 30.1845 20.0159C29.2476 18.9813 27.9774 18.3994 26.6525 18.3979Z"
                            fill="#6B6B6B"
                          />
                          <path
                            d="M26.6524 55.1878L12.6008 36.8859C12.4056 36.6111 12.2124 36.3345 12.0212 36.0562C9.62095 32.5643 8.32428 28.2991 8.3301 23.915C8.3301 18.5483 10.2605 13.4013 13.6966 9.60648C17.1327 5.81162 21.793 3.67969 26.6524 3.67969C31.5117 3.67969 36.1721 5.81162 39.6081 9.60648C43.0442 13.4013 44.9746 18.5483 44.9746 23.915C44.9804 28.2971 43.6843 32.5604 41.2852 36.0507L41.2835 36.0562C41.2835 36.0562 40.7838 36.781 40.7089 36.8785L26.6524 55.1878ZM14.6813 33.8395C14.6813 33.8395 15.0694 34.4061 15.1576 34.5275L26.6524 49.4998L38.1621 34.5073C38.2354 34.4061 38.6251 33.8358 38.6268 33.834C40.5875 30.981 41.6471 27.4967 41.6433 23.915C41.6433 19.524 40.0639 15.3129 37.2525 12.208C34.4412 9.10314 30.6282 7.35884 26.6524 7.35884C22.6765 7.35884 18.8635 9.10314 16.0522 12.208C13.2408 15.3129 11.6614 19.524 11.6614 23.915C11.6579 27.499 12.7187 30.9853 14.6813 33.8395Z"
                            fill="#6B6B6B"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-display mb-2 text-lg font-bold text-[#1E1E1E]">
                          Location
                        </div>
                        <div className="font-display text-base font-bold text-[#555] break-words">
                          Grabenstraße 15
                          <br />
                          8010 Graz
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex gap-4 md:gap-6">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-10 h-11 md:w-[54px] md:h-[59px]"
                          viewBox="0 0 54 59"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M46.2986 36.4377L36.4899 31.5835L36.4629 31.5697C35.9537 31.3292 35.3982 31.2327 34.8467 31.2889C34.2952 31.3451 33.7651 31.5523 33.3044 31.8917C33.2501 31.9312 33.198 31.9742 33.1482 32.0204L28.0804 36.7918C24.8699 35.0695 21.5552 31.4364 19.9957 27.9366L24.3223 22.2546C24.3639 22.1971 24.4035 22.1396 24.441 22.0775C24.7417 21.5701 24.9241 20.9883 24.9721 20.3842C25.02 19.78 24.932 19.1721 24.7158 18.6145V18.5869L20.308 7.73575C20.0223 7.00743 19.5309 6.40072 18.9072 6.00618C18.2835 5.61165 17.5611 5.45045 16.8476 5.54666C14.0264 5.95667 11.4367 7.48688 9.56232 9.85149C7.68794 12.2161 6.65703 15.2534 6.66213 18.3961C6.66213 36.6539 20.1123 51.5084 36.644 51.5084C39.4896 51.5141 42.2397 50.3755 44.3808 48.3054C46.5219 46.2354 47.9074 43.3753 48.2786 40.2594C48.3659 39.4718 48.2203 38.6741 47.8634 37.9853C47.5066 37.2966 46.9577 36.7537 46.2986 36.4377ZM36.644 47.8293C29.5782 47.8208 22.804 44.717 17.8077 39.1991C12.8115 33.6811 10.0012 26.1996 9.99345 18.3961C9.98562 16.1506 10.7181 13.9788 12.0542 12.2862C13.3902 10.5936 15.2384 9.49592 17.2536 9.19822C17.2528 9.20739 17.2528 9.21663 17.2536 9.22581L21.626 20.0333L17.3224 25.7222C17.2787 25.7777 17.239 25.8369 17.2037 25.8993C16.8904 26.4302 16.7065 27.0416 16.6701 27.6741C16.6336 28.3066 16.7457 28.9388 16.9955 29.5094C18.8818 33.7703 22.7691 38.0313 26.6688 40.1123C27.1892 40.3856 27.765 40.5051 28.3397 40.4591C28.9145 40.4132 29.4687 40.2034 29.9481 39.8501C30.0015 39.8104 30.0529 39.7674 30.1021 39.7214L35.1637 34.9523L44.9494 39.7927H44.9723C44.706 42.0214 43.7136 44.0667 42.1808 45.5459C40.6479 47.0251 38.6796 47.8369 36.644 47.8293Z"
                            fill="#6B6B6B"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-display mb-2 text-lg font-bold text-[#1E1E1E]">
                          Phone
                        </div>
                        <div className="font-display text-base font-bold text-[#555] break-words">
                          +436604943577
                        </div>
                      </div>
                    </div>

                    {/* Mail */}
                    <div className="flex gap-4 md:gap-6">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-10 h-11 md:w-[54px] md:h-[59px]"
                          viewBox="0 0 54 59"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M47.25 9.83333H6.75C3.0225 9.83333 0 12.8558 0 16.5833V42.4167C0 46.1442 3.0225 49.1667 6.75 49.1667H47.25C50.9775 49.1667 54 46.1442 54 42.4167V16.5833C54 12.8558 50.9775 9.83333 47.25 9.83333Z"
                            stroke="#6B6B6B"
                            strokeWidth="1.95603"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M0 16.5833L27 30.25L54 16.5833"
                            stroke="#6B6B6B"
                            strokeWidth="1.95603"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-display mb-2 text-lg font-bold text-[#1E1E1E]">
                          Mail
                        </div>
                        <div className="font-display text-base font-bold text-[#555] break-words">
                          fermentfreude@gmail.com
                        </div>
                      </div>
                    </div>

                    {/* Website */}
                    <div className="flex gap-4 md:gap-6">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-10 h-11 md:w-[54px] md:h-[59px]"
                          viewBox="0 0 54 59"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M46.4638 29.4707C46.4638 35.2635 44.3802 40.819 40.6713 44.9151C36.9624 49.0113 31.9321 51.3124 26.687 51.3124C21.4418 51.3124 16.4115 49.0113 12.7027 44.9151C8.99378 40.819 6.91016 35.2635 6.91016 29.4707M46.4638 29.4707C46.4638 23.6779 44.3802 18.1223 40.6713 14.0262C36.9624 9.93009 31.9321 7.62891 26.687 7.62891C21.4418 7.62891 16.4115 9.93009 12.7027 14.0262C8.99378 18.1223 6.91016 23.6779 6.91016 29.4707M46.4638 29.4707H6.91016"
                            stroke="#6B6B6B"
                            strokeWidth="1.95603"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M34.2911 29.4707C33.9174 37.458 31.2536 45.1072 26.6846 51.3124C22.1156 45.1072 19.4518 37.458 19.0781 29.4707C19.4518 21.4833 22.1156 13.8342 26.6846 7.62891C31.2536 13.8342 33.9174 21.4833 34.2911 29.4707Z"
                            stroke="#6B6B6B"
                            strokeWidth="1.95603"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-display mb-2 text-lg font-bold text-[#1E1E1E]">
                          Website
                        </div>
                        <div className="font-display text-base font-bold text-[#555] break-words">
                          www.fermentfreude.com
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="mt-8">
                    <div className="font-display mb-4 text-xl font-bold text-[#555]">
                      Follow Our Social Media
                    </div>
                    <div className="flex gap-4">
                      <Link
                        href="https://facebook.com"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6B6B6B] transition-colors hover:bg-[#555]"
                      >
                        <span className="sr-only">Facebook</span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M10 0C4.477 0 0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10c0-5.523-4.477-10-10-10z"
                            fill="#FAF2E0"
                          />
                        </svg>
                      </Link>
                      <Link
                        href="https://twitter.com"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6B6B6B] transition-colors hover:bg-[#555]"
                      >
                        <span className="sr-only">Twitter</span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"
                            fill="#FAF2E0"
                          />
                        </svg>
                      </Link>
                      <Link
                        href="https://pinterest.com"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6B6B6B] transition-colors hover:bg-[#555]"
                      >
                        <span className="sr-only">Pinterest</span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M10 0C4.477 0 0 4.477 0 10c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.176-4.068-2.845 0-4.516 2.135-4.516 4.34 0 .859.331 1.781.745 2.281a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.223-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.525-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S15.523 0 10 0z"
                            fill="#FAF2E0"
                          />
                        </svg>
                      </Link>
                      <Link
                        href="https://youtube.com"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6B6B6B] transition-colors hover:bg-[#555]"
                      >
                        <span className="sr-only">YouTube</span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M19.615 6.184c-.233-1.236-1.081-2.202-2.199-2.514C15.63 3.095 10 3.095 10 3.095s-5.63 0-7.416.575C1.466 3.982.618 4.948.385 6.184.004 8.382.004 10 .004 10s0 1.618.381 3.816c.233 1.236 1.081 2.202 2.199 2.514 1.786.575 7.416.575 7.416.575s5.63 0 7.416-.575c1.118-.312 1.966-1.278 2.199-2.514.381-2.198.381-3.816.381-3.816s0-1.618-.381-3.816zM8.126 12.404V7.596L13.02 10l-4.894 2.404z"
                            fill="#FAF2E0"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="flex flex-col gap-6 p-6 md:p-16">
                <h2 className="font-display mb-4 text-2xl md:text-3xl font-semibold text-black">
                  Ask About Anything
                </h2>

                <form className="flex flex-col gap-6">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="rounded-full border border-[rgba(128,128,128,0.55)] px-8 py-6 font-display text-base font-bold text-[#B8B8B8] placeholder:text-[#B8B8B8] focus:border-[#4B4B4B] focus:outline-none"
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      type="email"
                      placeholder="Your Email"
                      className="rounded-full border border-[rgba(128,128,128,0.55)] px-8 py-6 font-display text-base font-bold text-[#B8B8B8] placeholder:text-[#B8B8B8] focus:border-[#4B4B4B] focus:outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Your Phone"
                      className="rounded-full border border-[rgba(128,128,128,0.55)] px-8 py-6 font-display text-base font-bold text-[#B8B8B8] placeholder:text-[#B8B8B8] focus:border-[#4B4B4B] focus:outline-none"
                    />
                  </div>

                  <div className="relative">
                    <select className="w-full appearance-none rounded-full border border-[rgba(128,128,128,0.55)] px-8 py-6 font-display text-base font-bold text-[#B8B8B8] focus:border-[#4B4B4B] focus:outline-none">
                      <option>Subject</option>
                      <option>General Inquiry</option>
                      <option>Workshop Information</option>
                      <option>Product Question</option>
                      <option>Partnership</option>
                    </select>
                    <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2">
                      <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                        <path
                          d="M12.1535 2.54006L1.73538 2.54006C1.6299 2.54035 1.52651 2.56587 1.43634 2.61387C1.34616 2.66187 1.27262 2.73053 1.22362 2.81247C1.17462 2.89441 1.15203 2.98652 1.15827 3.07889C1.16451 3.17125 1.19935 3.26038 1.25904 3.33666L6.46808 9.93697C6.68397 10.2106 7.20372 10.2106 7.42018 9.93697L12.6292 3.33666C12.6895 3.26053 12.7249 3.17137 12.7315 3.07885C12.738 2.98633 12.7156 2.894 12.6665 2.81188C12.6175 2.72977 12.5438 2.66102 12.4533 2.61309C12.3628 2.56517 12.2591 2.53991 12.1535 2.54006Z"
                          fill="#595959"
                        />
                      </svg>
                    </div>
                  </div>

                  <textarea
                    placeholder="Your Message"
                    rows={6}
                    className="resize-none rounded-[2rem] border border-[rgba(128,128,128,0.55)] px-8 py-6 font-display text-base font-bold text-[#B8B8B8] placeholder:text-[#B8B8B8] focus:border-[#4B4B4B] focus:outline-none"
                  ></textarea>

                  <button
                    type="submit"
                    className="rounded-full border border-[#4B4B4B] bg-[#595959] px-8 py-6 font-display text-2xl font-bold text-[#F5F1EE] transition-colors hover:bg-[#4B4B4B]"
                  >
                    Submit Now
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Learn CTA */}
      <section className="w-full py-12 md:py-24 bg-[#F9F0DC]">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="rounded-[2.75rem] bg-[#F9F0DC] px-6 py-12 md:px-24 md:py-20">
            <div className="flex flex-col items-center gap-8 md:gap-12">
              <h2 className="font-display text-center text-2xl md:text-3xl font-bold text-[#1D1D1D]">
                Ready to learn?
              </h2>

              <p className="max-w-4xl text-center font-display text-xl md:text-3xl font-semibold text-[#4B4B4B]">
                Join our workshops and online courses to learn hands-on fermentation techniques, ask
                questions, and connect with a community of learners.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
                <Link
                  href="/workshops"
                  className="rounded-full bg-[#6B6B6B] px-8 py-4 md:px-20 md:py-6 font-display text-lg md:text-2xl font-semibold text-[#F9F0DC] transition-colors hover:bg-[#595959]"
                >
                  View workshops
                </Link>
                <Link
                  href="/courses"
                  className="rounded-full border-4 border-[#4B4B4B] bg-white px-6 py-4 md:px-16 md:py-5 font-display text-lg md:text-2xl font-semibold text-[#4B4B4B] transition-colors hover:bg-[#F9F0DC]"
                >
                  Browse online courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
