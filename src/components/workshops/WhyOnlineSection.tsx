type Feature = {
  icon: 'lightning' | 'clock' | 'home' | 'book'
  title: string
  description: string
}

type Props = {
  heading: string
  features: Feature[]
}

const IconSvg = ({ type }: { type: Feature['icon'] }) => {
  switch (type) {
    case 'lightning':
      return (
        <svg className="size-6 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    case 'clock':
      return (
        <svg className="size-6 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'home':
      return (
        <svg className="size-6 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'book':
      return (
        <svg className="size-6 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    default:
      return null
  }
}

export function WhyOnlineSection({ heading, features }: Props) {
  return (
    <section className="section-padding-md container-padding bg-white">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center font-display text-3xl font-bold text-[#1a1a1a] md:text-4xl">
          {heading}
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#F5F4F2]">
                <IconSvg type={feature.icon} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-[#1a1a1a]">{feature.title}</h3>
              <p className="mt-2 text-center text-sm text-[#666]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
