'use client'

interface StepItem {
  title: string
  description?: string | null
}

interface VoucherHowSectionProps {
  heading: string
  steps: StepItem[]
}

export function VoucherHowSection({ heading, steps }: VoucherHowSectionProps) {
  const items = steps.slice(0, 4)

  return (
    <section className="w-full bg-white py-12 md:py-14">
      <div className="mx-auto max-w-[var(--content-wide)] px-[var(--space-container-x)]">
        <header className="flex flex-col items-center text-center animate-fade-in-up" style={{ animationFillMode: 'both' }}>
          <h2 className="font-display text-[length:var(--text-heading)] font-semibold tracking-tight text-ff-near-black">
            {heading}
          </h2>
          <div
            className="mt-4 h-1 w-16 rounded-full bg-ff-gold-accent/80 transition-all duration-500"
            aria-hidden
          />
        </header>
        <div className="mt-12 flex flex-col items-stretch gap-0 sm:flex-row sm:items-start sm:justify-center sm:gap-0">
          {items.map((step, i) => (
            <div
              key={i}
              className="group flex flex-1 flex-col items-center px-4 py-6 text-center sm:px-5 sm:py-0 animate-fade-in-up"
              style={{
                animationDelay: `${120 + i * 80}ms`,
                animationFillMode: 'both',
                opacity: 0,
              }}
            >
              <span
                className="font-display text-[clamp(3rem,8vw,5rem)] font-bold leading-none tabular-nums text-ff-gold-accent transition-transform duration-200 group-hover:scale-105"
                aria-hidden
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-display text-[length:var(--text-body-lg)] font-normal tracking-tight text-ff-near-black">
                {step.title}
              </h3>
              {step.description?.trim() && (
                <p className="mt-1.5 font-sans text-[length:var(--text-body-sm)] leading-relaxed text-ff-gray-text">
                  {step.description.trim()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
