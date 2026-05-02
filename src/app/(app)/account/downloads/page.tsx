import { accountI18n } from '@/app/(app)/account/i18n'
import type { Download, Media, Product } from '@/payload-types'
import { formatDate } from '@/utilities/form/formatters'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export async function generateMetadata() {
  const locale = await getLocale()
  const t = locale === 'de' ? accountI18n.de : accountI18n.en
  return { title: t.downloads }
}

export default async function DownloadsPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const locale = await getLocale()
  const t = locale === 'de' ? accountI18n.de : accountI18n.en

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent(t.loginRequiredDownloads)}`)
  }

  const result = await payload.find({
    collection: 'downloads',
    where: { user: { equals: user.id } },
    overrideAccess: true,
    depth: 1,
    sort: '-createdAt',
  })

  const downloads = result.docs as Download[]

  if (downloads.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f3f0]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight mb-2">
              {t.downloads}
            </h1>
            <p className="text-[14px] text-[#626160]">{t.downloadsSubtitle}</p>
          </div>
          <div className="bg-white border border-[#1a1a1a]/20 rounded-xl p-16 text-center">
            <p className="text-[13px] text-[#626160] mb-6">{t.noDownloads}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f3f0]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight mb-2">
            {t.downloads}
          </h1>
          <p className="text-[14px] text-[#626160]">{t.downloadsSubtitle}</p>
        </div>

        <div className="bg-white border border-[#e8e4d9] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e8e4d9]">
                {['Produkt', 'Datei', 'Downloads', 'Gültig bis'].map((h) => (
                  <th
                    key={h}
                    className="py-3.5 px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#c4bbb3] text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {downloads.map((item, i) => {
                const product = typeof item.product === 'object' && item.product !== null
                  ? (item.product as Product)
                  : null
                const file = typeof item.file === 'object' && item.file !== null
                  ? (item.file as Media)
                  : null
                const usageText = `${item.downloadCount ?? 0} / ${item.downloadLimit ?? '∞'}`
                const expiresText = item.expiresAt ? formatDate(item.expiresAt) : '—'

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#faf9f7] transition-colors ${i < downloads.length - 1 ? 'border-b border-[#f5f3f0]' : ''}`}
                  >
                    <td className="py-4 px-5 text-[13px] text-[#1a1a1a] font-medium">
                      {product?.title ?? '—'}
                    </td>
                    <td className="py-4 px-5 text-[13px] text-[#626160]">
                      {file?.url ? (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#e6be68] hover:underline"
                        >
                          {file.filename ?? 'Herunterladen'}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-4 px-5 text-[13px] text-[#626160]">{usageText}</td>
                    <td className="py-4 px-5 text-[13px] text-[#626160]">{expiresText}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
