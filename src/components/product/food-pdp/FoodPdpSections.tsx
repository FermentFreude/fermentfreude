'use client'

import type { Product } from '@/payload-types'

import { FadeIn } from '@/components/FadeIn'
import { RichText } from '@/components/RichText'
import {
  getBadgeLabel,
  type AppLocale,
} from '@/utilities/productDetailDisplay'
import type { FoodPdpContent } from '@/utilities/foodPdpContent'
import { getHeroBadges, stripTrustPointEmoji } from '@/utilities/foodPdpContent'
import { cn } from '@/utilities/cn'
import { ArrowRight, CalendarClock, Package } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import React from 'react'

import { FOOD_BADGE_ICONS, GLANCE_ICONS, PANEL_ICONS, TRUST_ICONS, USAGE_ICONS } from './icons'
import { FOOD_PDP_PANEL_BG } from './theme'

type GlanceItem = { key: string; label: string; value: string }

export function FoodPdpCategoryRow({
  categoryLabel,
  categories,
  locale,
}: {
  categoryLabel: string | null
  categories: string[]
  locale: AppLocale
}) {
  if (!categoryLabel && categories.length === 0) return null

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {categoryLabel && (
        <span className="rounded-full bg-ff-warm-gray px-3 py-1 text-caption font-medium uppercase tracking-wider text-ff-charcoal">
          {categoryLabel}
        </span>
      )}
      {categories.map((title) => (
        <span
          key={title}
          className="rounded-full border border-ff-near-black/12 px-3 py-1 text-caption text-ff-gray-text"
        >
          {title}
        </span>
      ))}
    </div>
  )
}

export function FoodPdpHeroBadges({ product, locale }: { product: Product; locale: AppLocale }) {
  const badges = getHeroBadges(product)
  const reduceMotion = useReducedMotion()

  if (!badges.length && !product.isSeasonal) return null

  return (
    <motion.ul
      className="mt-4 flex flex-wrap gap-2"
      initial={reduceMotion ? false : 'hidden'}
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.06 } },
      }}
    >
      {product.isSeasonal && (
        <motion.li
          variants={{
            hidden: { opacity: 0, y: 6 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ff-gold-accent/20 px-3 py-1.5 text-caption font-semibold uppercase tracking-wide text-ff-charcoal ring-1 ring-ff-gold-accent/35">
            <CalendarClock className="size-3.5" strokeWidth={2} aria-hidden />
            {locale === 'de' ? 'Saisonal' : 'Seasonal'}
          </span>
        </motion.li>
      )}
      {badges.map((badge) => {
        const config = FOOD_BADGE_ICONS[badge]
        const Icon = config?.icon
        return (
          <motion.li
            key={badge}
            variants={{
              hidden: { opacity: 0, y: 6 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-caption font-medium text-ff-near-black ring-1 ring-ff-near-black/10"
              style={config ? { color: config.accent } : undefined}
            >
              {Icon && <Icon className="size-3.5" strokeWidth={2} aria-hidden />}
              {getBadgeLabel(badge, locale)}
            </span>
          </motion.li>
        )
      })}
    </motion.ul>
  )
}

export function FoodPdpTrustPoints({ points }: { points: string[] }) {
  if (!points.length) return null

  return (
    <FadeIn className="mt-8">
      <ul className="grid gap-3 sm:grid-cols-2">
        {points.map((point, index) => {
          const Icon = TRUST_ICONS[index % TRUST_ICONS.length]
          const label = stripTrustPointEmoji(point)
          return (
            <li
              key={point}
              className="flex items-start gap-3 rounded-xl px-4 py-3 ring-1 ring-ff-near-black/8"
              style={{ backgroundColor: FOOD_PDP_PANEL_BG }}
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-ff-warm-gray/60 text-ff-near-black">
                <Icon className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="text-body-sm leading-snug text-ff-gray-text">{label}</span>
            </li>
          )
        })}
      </ul>
    </FadeIn>
  )
}

export function FoodPdpGlanceGrid({
  title,
  items,
  sectionId = 'glance',
  showTitle = true,
}: {
  title: string
  items: GlanceItem[]
  sectionId?: string
  showTitle?: boolean
}) {
  if (!items.length) return null

  return (
    <div id={showTitle ? sectionId : undefined}>
      {showTitle && (
        <h3 className="mb-5 font-display text-body font-bold text-ff-near-black">{title}</h3>
      )}
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = GLANCE_ICONS[item.key] ?? Package
          return (
            <div
              key={item.key}
              className="flex flex-col gap-3 rounded-2xl p-4 ring-1 ring-ff-near-black/8 sm:p-5"
              style={{ backgroundColor: FOOD_PDP_PANEL_BG }}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ff-warm-gray/60 text-ff-near-black">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <dt className="text-caption font-medium uppercase tracking-wide text-ff-gray-text">
                  {item.label}
                </dt>
                <dd className="mt-1 font-display text-body font-semibold text-ff-near-black">
                  {item.value}
                </dd>
              </div>
            </div>
          )
        })}
      </dl>
    </div>
  )
}

export function FoodPdpIngredientsPanel({
  ingredients,
  allergens,
  ingredientsHeading,
  allergensLabel,
  disclaimer,
  seasonalNotice,
  isSeasonal,
}: {
  ingredients?: string | null
  allergens?: string | null
  ingredientsHeading: string
  allergensLabel: string
  disclaimer: string
  seasonalNotice?: string
  isSeasonal?: boolean | null
}) {
  if (!ingredients && !allergens) return null

  const IngredientsIcon = PANEL_ICONS.ingredients
  const AllergensIcon = PANEL_ICONS.allergens

  return (
    <div id="zutaten" className="grid gap-4 md:grid-cols-2">
      {ingredients && (
        <article
          className="flex gap-4 rounded-2xl p-6 ring-1 ring-ff-near-black/8 lg:p-7"
          style={{ backgroundColor: FOOD_PDP_PANEL_BG }}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ff-warm-gray/60 text-ff-near-black">
            <IngredientsIcon className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-body font-bold text-ff-near-black">
              {ingredientsHeading}
            </h3>
            {isSeasonal && seasonalNotice && (
              <p className="mb-3 mt-3 rounded-lg bg-white/60 px-3 py-2 text-caption leading-relaxed text-ff-gray-text">
                {seasonalNotice}
              </p>
            )}
            <p className="mt-3 text-body leading-[1.85] text-ff-gray-text">{ingredients}</p>
          </div>
        </article>
      )}

      {allergens && (
        <article
          className="flex gap-4 rounded-2xl p-6 ring-1 ring-ff-near-black/8 lg:p-7"
          style={{ backgroundColor: FOOD_PDP_PANEL_BG }}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ff-warm-gray/60 text-ff-near-black">
            <AllergensIcon className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-body font-bold text-ff-near-black">
              {allergensLabel}
            </h3>
            <p className="mt-3 text-body leading-[1.85] text-ff-gray-text">{allergens}</p>
          </div>
        </article>
      )}

      <p className="text-caption leading-relaxed text-ff-gray-text/90 md:col-span-2">{disclaimer}</p>
    </div>
  )
}

export function FoodPdpTasteStory({
  pdp,
  sectionLabel,
}: {
  pdp: FoodPdpContent
  sectionLabel: string
}) {
  const reduceMotion = useReducedMotion()
  const show =
    pdp.tasteHeadline || pdp.storyIntro || pdp.flavorNotes.length > 0 || pdp.storyDetail

  if (!show) return null

  const showFlavorStrip = pdp.flavorNotes.length > 0 && !pdp.tasteHeadline
  const TasteIcon = PANEL_ICONS.taste

  return (
    <div>
      {pdp.tasteHeadline && (
        <div className="flex items-start gap-4">
          <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-xl bg-ff-warm-gray/60 text-ff-near-black">
            <TasteIcon className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <h3 className="font-display text-section-heading font-bold leading-tight text-ff-near-black">
            {pdp.tasteHeadline}
          </h3>
        </div>
      )}

      {pdp.storyIntro && (
        <p className="mt-5 text-body leading-[1.85] text-ff-gray-text">{pdp.storyIntro}</p>
      )}

      {showFlavorStrip && pdp.flavorNotes.length > 0 && (
            <motion.div
              className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
              aria-label={sectionLabel}
              initial={reduceMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } },
              }}
            >
              {pdp.flavorNotes.map((note, index) => (
                <React.Fragment key={note}>
                  {index > 0 && (
                    <>
                      <ArrowRight
                        className="hidden size-4 shrink-0 text-ff-gray-text/40 sm:block"
                        aria-hidden
                      />
                      <ArrowRight
                        className="mx-2 size-4 shrink-0 rotate-90 text-ff-gray-text/40 sm:hidden"
                        aria-hidden
                      />
                    </>
                  )}
                  <motion.span
                    className="rounded-full bg-ff-near-black px-4 py-2 font-display text-caption font-semibold uppercase tracking-[0.12em] text-white"
                    variants={{
                      hidden: { opacity: 0, scale: 0.92, y: 8 },
                      visible: { opacity: 1, scale: 1, y: 0 },
                    }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {note}
                  </motion.span>
                </React.Fragment>
              ))}
            </motion.div>
          )}

      {pdp.storyDetail && (
        <p className="mt-8 text-body leading-[1.85] text-ff-gray-text">{pdp.storyDetail}</p>
      )}
    </div>
  )
}

export function FoodPdpUsageSteps({
  title,
  steps,
  embedded = false,
  showDivider = false,
}: {
  title: string
  steps: Array<{ title: string; description: string | null }>
  embedded?: boolean
  showDivider?: boolean
}) {
  if (!steps.length) return null

  const UsageIcon = PANEL_ICONS.usage

  const content = (
    <>
      {embedded && title && (
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ff-warm-gray/60 text-ff-near-black">
            <UsageIcon className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <h3 className="font-display text-body font-bold text-ff-near-black">{title}</h3>
        </div>
      )}
      {!embedded && (
        <h2 className="mb-10 font-display text-body-lg font-bold text-ff-near-black md:mb-12">
          {title}
        </h2>
      )}
      <ol
        className={cn(
          'relative grid gap-10 sm:grid-cols-3 sm:gap-6',
          embedded && title && 'mt-8',
        )}
      >
          <div
            className="absolute left-[16.666%] right-[16.666%] top-5 hidden h-px bg-ff-near-black/10 sm:block"
            aria-hidden
          />
          {steps.map((step, index) => {
            const Icon = USAGE_ICONS[index % USAGE_ICONS.length]
            return (
              <FadeIn key={step.title} delay={index * 100}>
                <li className="relative text-center sm:text-left">
                  <div className="relative mx-auto mb-5 flex size-14 items-center justify-center sm:mx-0">
                    <span className="relative flex size-14 items-center justify-center rounded-full bg-white ring-1 ring-ff-near-black/10">
                      <Icon className="size-6 text-ff-near-black" strokeWidth={1.75} />
                    </span>
                    <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-ff-gold-accent font-display text-[10px] font-bold text-ff-near-black">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-display text-body font-bold uppercase tracking-wide text-ff-near-black">
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="mt-2 text-body-sm leading-relaxed text-ff-gray-text">
                      {step.description}
                    </p>
                  )}
                </li>
              </FadeIn>
            )
          })}
        </ol>
    </>
  )

  if (embedded) {
    return (
      <div
        id="zubereitung"
        className={cn(showDivider && 'border-t border-ff-near-black/8 pt-8')}
      >
        {content}
      </div>
    )
  }

  return (
    <FadeIn>
      <section id="zubereitung" className="scroll-mt-[8.5rem]">
        {content}
      </section>
    </FadeIn>
  )
}

export function FoodPdpStoragePanel({
  storageLabel,
  shelfLifeLabel,
  bestBeforeLabel,
  afterOpeningLabel,
  storageInstructions,
  shelfLife,
  bestBefore,
  userInstructions,
  hasUserInstructions,
  embedded = false,
}: {
  storageLabel: string
  shelfLifeLabel: string
  bestBeforeLabel: string
  afterOpeningLabel: string
  storageInstructions?: string | null
  shelfLife?: string | null
  bestBefore?: string | null
  userInstructions?: Product['userInstructions']
  hasUserInstructions: boolean
  embedded?: boolean
}) {
  const bestBeforeValue = bestBefore?.trim() || null
  const shelfLifeValue = shelfLife?.trim() || null
  const showBestBefore = Boolean(bestBeforeValue)
  const showShelfLife = Boolean(shelfLifeValue) && shelfLifeValue !== bestBeforeValue

  if (!storageInstructions && !showShelfLife && !showBestBefore && !hasUserInstructions) return null

  const headingTag = embedded ? 'h3' : 'h2'
  const Heading = headingTag as 'h2' | 'h3'
  const StorageIcon = PANEL_ICONS.storage
  const AfterOpeningIcon = PANEL_ICONS.afterOpening

  const content = (
    <div className="grid gap-4 md:grid-cols-2">
          {(storageInstructions || showShelfLife || showBestBefore) && (
            <article
              className="flex gap-4 rounded-2xl p-6 ring-1 ring-ff-near-black/8"
              style={{ backgroundColor: FOOD_PDP_PANEL_BG }}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ff-warm-gray/60 text-ff-near-black">
                <StorageIcon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <Heading className="font-display text-body font-bold text-ff-near-black">
                  {storageLabel}
                </Heading>
                <div className="mt-3 space-y-2 text-body-sm leading-[1.85] text-ff-gray-text">
                  {storageInstructions && <p>{storageInstructions}</p>}
                  {showBestBefore && (
                    <p>
                      <span className="font-medium text-ff-near-black">{bestBeforeLabel}:</span>{' '}
                      {bestBeforeValue}
                    </p>
                  )}
                  {showShelfLife && (
                    <p>
                      <span className="font-medium text-ff-near-black">{shelfLifeLabel}:</span>{' '}
                      {shelfLifeValue}
                    </p>
                  )}
                </div>
              </div>
            </article>
          )}

          {hasUserInstructions && userInstructions && (
            <article
              className="flex gap-4 rounded-2xl p-6 ring-1 ring-ff-near-black/8"
              style={{ backgroundColor: FOOD_PDP_PANEL_BG }}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ff-warm-gray/60 text-ff-near-black">
                <AfterOpeningIcon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <Heading className="font-display text-body font-bold text-ff-near-black">
                  {afterOpeningLabel}
                </Heading>
                <RichText
                  className="prose prose-sm mt-3 max-w-none prose-p:my-1 prose-p:font-sans prose-p:text-ff-gray-text prose-p:leading-[1.75]"
                  data={userInstructions}
                  enableGutter={false}
                />
              </div>
            </article>
          )}
        </div>
  )

  if (embedded) {
    return content
  }

  return (
    <FadeIn>
      <section id="lagerung" className="scroll-mt-[8.5rem]">
        {content}
      </section>
    </FadeIn>
  )
}
