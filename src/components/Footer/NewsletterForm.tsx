'use client'

interface Props {
  placeholder?: string
  buttonText?: string
}

export function NewsletterForm({
  placeholder = 'Your Email',
  buttonText = 'Subscribe Now',
}: Props) {
  return (
    <form className="flex flex-col sm:flex-row gap-3 mt-2" onSubmit={(e) => e.preventDefault()}>
      <input
        type="email"
        placeholder={placeholder}
        className="flex-1 h-12 md:h-14 px-5 rounded-full border border-[#1d1d1d] bg-transparent font-sans text-sm md:text-base placeholder:text-[#1d1d1d]/50 focus:outline-none focus:border-[#e5b765]"
      />
      <button
        type="submit"
        className="h-12 md:h-14 px-6 rounded-full bg-[#1d1d1d] text-[#faf2e0] font-sans font-medium text-sm md:text-base hover:bg-black transition-colors whitespace-nowrap"
      >
        {buttonText}
      </button>
    </form>
  )
}
