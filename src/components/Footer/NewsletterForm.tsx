'use client'

export function NewsletterForm() {
  return (
    <form
      className="flex items-center border-b border-[#1d1d1d] pb-1"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="EMAIL"
        className="flex-1 bg-transparent font-sans text-sm tracking-wider placeholder:text-[#1d1d1d]/40 focus:outline-none py-2"
      />
      <button
        type="submit"
        className="font-sans text-sm font-semibold tracking-wider hover:text-[#e6be68] transition-colors py-2 pl-4"
      >
        OK
      </button>
    </form>
  )
}
