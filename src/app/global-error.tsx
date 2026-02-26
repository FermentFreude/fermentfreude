'use client'

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto my-8 flex max-w-xl flex-col rounded-lg border border-neutral-200 bg-white p-8 md:p-12">
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="my-2 text-neutral-600">
            An unexpected error occurred. Please try again.
          </p>
          <button
            className="mx-auto mt-4 flex w-full items-center justify-center rounded-full bg-[#333333] p-4 font-display font-bold tracking-wide text-white hover:bg-[#1a1a1a]"
            onClick={() => reset()}
            type="button"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
