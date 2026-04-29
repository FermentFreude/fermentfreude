'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-[70vh] w-full flex items-center justify-center px-4 py-12 sm:py-16 md:py-24">
      <div className="w-full max-w-xl mx-auto flex flex-col items-start bg-[#FAF7F2] border border-[#1d1d1d]/10 rounded-2xl p-6 sm:p-8 md:p-10">
        <span className="font-sans text-[10px] uppercase tracking-widest font-semibold bg-[#e6be68] px-1.5 py-0.5 mb-4">
          Error
        </span>
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl uppercase leading-[1.05] tracking-tight text-[#1d1d1d]">
          Oh no!
        </h1>
        <p className="mt-3 font-sans text-sm sm:text-base text-[#1d1d1d]/75">
          There was an issue with our storefront. This could be a temporary issue, please try your
          action again.
        </p>
        {error?.digest ? (
          <p className="mt-2 font-sans text-xs text-[#1d1d1d]/40">Ref: {error.digest}</p>
        ) : null}
        <button
          className="mt-6 w-full sm:w-auto inline-flex items-center justify-center bg-[#1d1d1d] hover:bg-[#000] text-white font-display font-bold tracking-wide uppercase text-sm px-6 py-3 rounded-full transition-colors"
          onClick={() => reset()}
          type="button"
        >
          Try Again
        </button>
      </div>
    </main>
  )
}
