'use client'

import React from 'react'

const inputBase =
  'w-full rounded-lg border border-black/10 bg-white px-4 py-3 font-sans text-base text-ff-charcoal placeholder:text-ff-gray-text transition-all duration-200 focus:border-ff-gold focus:outline-none focus:ring-1 focus:ring-ff-gold'

type Labels = {
  heading: string
  firstName: string
  company: string
  email: string
  phone: string
  businessType: string
  businessOptions: string[]
  interest: string
  interestOptions: string[]
  quantity: string
  message: string
  submit: string
  contactLine?: string | null
}

type Props = {
  labels: Labels
}

export function GastronomyInquiry({ labels }: Props) {
  return (
    <section id="contact" className="scroll-mt-24 bg-[#F6F0E8] section-padding-md">
      <div className="container mx-auto container-padding">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] md:p-10">
          <h2 className="font-display text-section-heading font-bold tracking-tight text-ff-black">
            {labels.heading}
          </h2>
          {labels.contactLine ? (
            <p className="mt-2 text-body-sm text-ff-gray-text">{labels.contactLine}</p>
          ) : null}
          <form
            className="mt-8 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="sr-only">{labels.firstName}</span>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={labels.firstName}
                  autoComplete="name"
                  className={inputBase}
                />
              </label>
              <label className="block">
                <span className="sr-only">{labels.company}</span>
                <input
                  type="text"
                  name="company"
                  required
                  placeholder={labels.company}
                  autoComplete="organization"
                  className={inputBase}
                />
              </label>
            </div>
            <label className="block">
              <span className="sr-only">{labels.email}</span>
              <input
                type="email"
                name="email"
                required
                placeholder={labels.email}
                className={inputBase}
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="sr-only">{labels.phone}</span>
              <input
                type="tel"
                name="phone"
                placeholder={labels.phone}
                className={inputBase}
                autoComplete="tel"
              />
            </label>
            <label className="block">
              <span className="sr-only">{labels.businessType}</span>
              <select name="business" className={`${inputBase} appearance-none`} defaultValue="" required>
                <option value="" disabled>
                  {labels.businessType}
                </option>
                {labels.businessOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="sr-only">{labels.interest}</span>
              <select name="interest" className={`${inputBase} appearance-none`} defaultValue="" required>
                <option value="" disabled>
                  {labels.interest}
                </option>
                {labels.interestOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="sr-only">{labels.quantity}</span>
              <input type="text" name="quantity" placeholder={labels.quantity} className={inputBase} />
            </label>
            <label className="block">
              <span className="sr-only">{labels.message}</span>
              <textarea
                name="message"
                placeholder={labels.message}
                rows={4}
                className={`${inputBase} min-h-28 resize-y`}
              />
            </label>
            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-ff-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-[#1b1b1b] transition-transform hover:scale-[1.01] hover:bg-[#EDD195] active:scale-[0.99]"
            >
              {labels.submit}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
