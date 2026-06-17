import { getServerSideURL } from '@/utilities/getURL'

export default function robots() {
  const baseUrl = getServerSideURL()
  return {
    host: baseUrl,
    rules: [
      {
        userAgent: '*',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
