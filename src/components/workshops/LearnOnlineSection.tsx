import Link from 'next/link'

type Props = {
  heading: string
  description: string
  buttonLabel: string
  buttonHref: string
}

export function LearnOnlineSection({ heading, description, buttonLabel, buttonHref }: Props) {
  return (
    <section className="section-padding-md container-padding">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-[#1a1a1a] px-8 py-16 text-center md:px-16 md:py-20">
          <h2 className="whitespace-pre-line font-display text-3xl font-bold text-[#F5F4F2] md:text-4xl">
            {heading}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-body-lg text-[#F5F4F2]/90">
            {description}
          </p>
          <Link
            href={buttonHref}
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-[#E5B765] px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-[#1a1a1a] transition-colors hover:bg-[#d4a654]"
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
