import { accountI18n } from '@/app/(app)/account/i18n'
import { getRecipesPage } from '@/app/(app)/rezepte/data'
import { GalleryCard } from '@/app/(app)/rezepte/gallery'
import { resolveLabels } from '@/app/(app)/rezepte/shared'
import type { Recipe } from '@/payload-types'
import { getLocale } from '@/utilities/getLocale'
import { normalizeAppLocale } from '@/utilities/payloadLocaleQuery'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

/* "Gespeicherte Rezepte": the ♥ list of the logged-in customer (newest first).
   Hearts here work like on /rezepte; an un-hearted card stays until the next visit. */

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const locale = await getLocale()
  const t = locale === 'de' ? accountI18n.de : accountI18n.en
  return { title: t.savedRecipes }
}

export default async function SavedRecipesPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const rawLocale = await getLocale()
  const t = rawLocale === 'de' ? accountI18n.de : accountI18n.en

  if (!user) redirect(`/login?warning=${encodeURIComponent(t.loginRequired)}`)

  const locale = normalizeAppLocale(rawLocale)
  const me = await payload.findByID({ collection: 'users', id: user.id, depth: 0, overrideAccess: true, select: { savedRecipes: true } })
  const ids = (me.savedRecipes ?? []).map((r) => (typeof r === 'object' && r !== null ? String(r.id) : String(r)))

  let recipes: Recipe[] = []
  if (ids.length) {
    const { docs } = await payload.find({
      collection: 'recipes',
      where: { id: { in: ids }, _status: { equals: 'published' } },
      pagination: false,
      depth: 1,
      locale,
    })
    const byId = new Map(docs.map((d) => [String(d.id), d]))
    recipes = ids.map((id) => byId.get(id)).filter((r): r is Recipe => Boolean(r))
  }
  const labels = resolveLabels((await getRecipesPage(locale)).labels, locale)

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="mb-2 text-[28px] font-bold tracking-tight text-[#1a1a1a]">{t.savedRecipes}</h1>
        <p className="text-[14px] text-[#626160]">{t.savedRecipesSubtitle}</p>
      </div>

      {recipes.length === 0 ? (
        <div className="rounded-xl border border-[#1a1a1a]/20 bg-white p-12 text-center">
          <p className="mb-6 text-[13px] text-[#626160]">{t.noSavedRecipes}</p>
          <Link
            href="/rezepte"
            className="inline-flex rounded-full bg-[#1a1a1a] px-6 py-3 font-display text-[14px] font-bold text-white transition-colors hover:bg-[#333]"
          >
            {t.browseRecipes}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:gap-x-5 md:gap-y-8">
          {recipes.map((r) => (
            <GalleryCard key={r.id} recipe={r} locale={locale} labels={labels} />
          ))}
        </div>
      )}
    </div>
  )
}
