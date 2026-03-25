import Link from 'next/link'

const hubs = [
  {
    title: 'Admin Hub',
    subtitle: 'Für Redakteure & Gründer',
    description:
      'Schritt-für-Schritt Anleitungen zum Verwalten von Produkten, Workshops, Seiten, Bildern und mehr — direkt im Admin-Dashboard.',
    href: '/hub/admin',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
    color: '#555954',
    items: [
      'Produkte anlegen & bearbeiten',
      'Workshops & Termine verwalten',
      'Seiten & Inhalte pflegen',
      'Bilder hochladen & verwalten',
      'Navigation & Footer anpassen',
      'Gutscheine & Online-Kurse',
    ],
  },
  {
    title: 'Developer Hub',
    subtitle: 'For Developers & Contributors',
    description:
      'Technical documentation covering architecture, collections, blocks, seeding, environments, CLI commands, and the 12 non-negotiable rules.',
    href: '/hub/dev',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
    color: '#1a1a1a',
    items: [
      'Architecture & Stack',
      'Collections & Schema',
      'Blocks & Hero System',
      'Seeding & Localization',
      'E-commerce & Stripe',
      'Commands & Workflows',
    ],
  },
]

export default function HubPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      {/* Hero */}
      <section className="px-6 pt-32 pb-16 text-center md:pt-40 md:pb-20">
        <p
          className="font-display mb-3 text-sm font-medium tracking-widest uppercase"
          style={{ color: '#555954' }}
        >
          FermentFreude
        </p>
        <h1 className="font-display mb-4 text-4xl font-bold md:text-5xl" style={{ color: '#1a1a1a' }}>
          Documentation Hub
        </h1>
        <p className="mx-auto max-w-xl text-lg" style={{ color: '#626160' }}>
          Alles, was du brauchst — ob du Inhalte im Admin bearbeitest oder am Code arbeitest.
        </p>
      </section>

      {/* Cards */}
      <section className="mx-auto max-w-5xl px-6 pb-32">
        <div className="grid gap-8 md:grid-cols-2">
          {hubs.map((hub) => (
            <Link
              key={hub.href}
              href={hub.href}
              className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: '#FFFFFF',
                borderColor: '#E8E4D9',
              }}
            >
              {/* Color bar */}
              <div className="h-1.5" style={{ background: hub.color }} />

              <div className="flex flex-1 flex-col p-8">
                {/* Icon + Title */}
                <div className="mb-4 flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${hub.color}12`, color: hub.color }}
                  >
                    {hub.icon}
                  </div>
                  <div>
                    <h2
                      className="font-display text-xl font-bold"
                      style={{ color: '#1a1a1a' }}
                    >
                      {hub.title}
                    </h2>
                    <p className="text-sm" style={{ color: '#999' }}>
                      {hub.subtitle}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="mb-6 leading-relaxed" style={{ color: '#626160' }}>
                  {hub.description}
                </p>

                {/* Items */}
                <ul className="mb-8 grid grid-cols-2 gap-x-4 gap-y-2">
                  {hub.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm" style={{ color: '#555954' }}>
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: hub.color }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-auto">
                  <span
                    className="font-display inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity group-hover:opacity-90"
                    style={{ background: hub.color }}
                  >
                    Öffnen
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
