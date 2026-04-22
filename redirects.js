const redirects = async () => {
  return [
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
  ]
}

export default redirects
