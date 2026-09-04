// Old Wix site -> new site. Both the bare domain and the www subdomain are covered
// since Wix's DNS instructions typically set up both. Destinations MUST be full URLs
// (https://fermentfreude.at/...), not relative paths — a relative path would keep the
// visitor on the old domain instead of moving them to the new one.
const OLD_HOSTS = ['ferment-freude.at', 'www.ferment-freude.at']
const NEW_ORIGIN = 'https://fermentfreude.at'

function oldDomainRedirect(source, destinationPath) {
  return OLD_HOSTS.map((host) => ({
    source,
    has: [{ type: 'host', value: host }],
    destination: `${NEW_ORIGIN}${destinationPath}`,
    permanent: true,
  }))
}

// Confirmed against the old site's sitemap.xml — see the migration plan.
// Both the literal accented path and its percent-encoded form are mapped, since
// browsers/servers can send /über-mich as either depending on how the link was written.
const OLD_SITE_PATH_MAP = [
  ['/dienstleistungen', '/workshops'],
  ['/über-mich', '/about'],
  ['/%C3%BCber-mich', '/about'],
  ['/impressum', '/impressum'],
  ['/datenschutz', '/datenschutz'],
  ['/tempeh', '/workshops/tempeh'],
  ['/service-page/tempeh', '/workshops/tempeh'],
  ['/service-page/kombucha', '/workshops/kombucha'],
  ['/service-page/lakto-gemüse', '/workshops/lakto-gemuese'],
  ['/service-page/lakto-gem%C3%BCse', '/workshops/lakto-gemuese'],
  ['/service-page/vom-feld-ins-glas', '/workshops/vom-feld-ins-glas'],
  ['/shop-1', '/shop'],
  ['/gift-card', '/workshops/voucher'],
  ['/product-page/gutschein', '/workshops/voucher'],
]

const redirects = async () => {
  return [
    // --- Wix domain migration: specific old-page -> new-page rules ---
    // Must come first: Next.js applies the first matching rule, and these are more
    // specific than both the generic same-domain rules and the catch-all below.
    // In particular this /tempeh rule must precede the generic /tempeh rule further
    // down, otherwise an old-domain visitor to /tempeh never leaves the old domain.
    ...OLD_SITE_PATH_MAP.flatMap(([source, dest]) => oldDomainRedirect(source, dest)),

    // --- Existing generic rules (apply regardless of host) ---
    {
      source: '/press',
      destination: '/presse',
      permanent: true,
    },
    {
      source: '/products',
      destination: '/shop',
      permanent: true,
    },
    {
      source: '/voucher',
      destination: '/workshops/voucher',
      permanent: true,
    },
    {
      source: '/tempeh',
      destination: '/workshops/tempeh',
      permanent: true,
    },
    {
      source: '/lakto-gemuese',
      destination: '/workshops/lakto-gemuese',
      permanent: true,
    },
    {
      source: '/kombucha',
      destination: '/workshops/kombucha',
      permanent: true,
    },

    // --- Wix domain migration: catch-all fallback ---
    // Anything on the old domain not matched above (including the bare homepage "/")
    // lands on the new homepage instead of a 404.
    ...OLD_HOSTS.map((host) => ({
      source: '/:path*',
      has: [{ type: 'host', value: host }],
      destination: NEW_ORIGIN,
      permanent: true,
    })),
  ]
}

export default redirects
