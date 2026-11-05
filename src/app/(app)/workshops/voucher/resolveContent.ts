import type { Media as MediaType, Page } from '@/payload-types'

import type { OccasionKey, OccasionRow, VoucherAmount, VoucherContent } from './content'

/* ═══════════════════════════════════════════════════════════════
 *  Admin → page. Builds the page text from the "Voucher Page" tab,
 *  field by field, with ./content.ts as the fallback for anything
 *  left empty (rule: cmsValue ?? DEFAULT). Lists (points, vouchers,
 *  occasions, questions) come from the admin as a whole once they
 *  have at least one entry.
 * ═══════════════════════════════════════════════════════════════ */

type CMS = NonNullable<Page['voucher']>

const str = (cms: string | null | undefined, fallback: string) => (cms && cms.trim() ? cms : fallback)

const asMedia = (value: unknown): MediaType | null =>
  typeof value === 'object' && value !== null && 'url' in value ? (value as MediaType) : null

const toAmount = (value: string | null | undefined, fallback: VoucherAmount): VoucherAmount => {
  const n = Number(value)
  return n === 99 || n === 50 || n === 30 || n === 20 ? n : fallback
}

type Point = { icon: string; title: string; text: string }
const points = (cms: { icon?: string | null; title: string; text?: string | null }[] | null | undefined, fallback: Point[]) =>
  cms && cms.length > 0
    ? cms.map((p) => ({ icon: p.icon ?? 'gift', title: p.title, text: p.text ?? '' }))
    : fallback

export function resolveVoucherContent(
  cms: Page['voucher'] | null | undefined,
  d: VoucherContent,
  fallbackImages: Partial<Record<OccasionKey, MediaType | null>>,
): VoucherContent {
  const v: CMS = cms ?? {}
  const { hero, ticket, values, occasions, print, how, faq, buy } = v

  const defaultRows: OccasionRow[] = d.occasions.rows.map((row) => ({
    ...row,
    image: fallbackImages[row.key as OccasionKey] ?? null,
  }))
  const rows: OccasionRow[] =
    occasions?.rows && occasions.rows.length > 0
      ? occasions.rows.map((row, i) => ({
          key: row.id ?? `row-${i}`,
          image: asMedia(row.image),
          label: row.label ?? '',
          title: row.title,
          text: row.text ?? '',
          bullets: (row.bullets ?? []).map((b) => b.text),
          cta:
            row.ctaKind === 'link'
              ? { kind: 'link' as const, href: str(row.ctaHref, '/contact'), label: str(row.ctaLabel, d.faq.moreLink) }
              : { kind: 'buy' as const, amount: toAmount(row.ctaAmount, 99), label: str(row.ctaLabel, d.hero.button) },
        }))
      : defaultRows

  return {
    ...d,
    sections: {
      values: values?.show ?? true,
      occasions: occasions?.show ?? true,
      print: print?.show ?? true,
      faq: faq?.show ?? true,
    },
    ticket: {
      workshop: {
        label: str(ticket?.workshopLabel, d.ticket.workshop.label),
        title: str(ticket?.workshopTitle, d.ticket.workshop.title),
        text: str(ticket?.workshopText, d.ticket.workshop.text),
      },
      value: {
        label: str(ticket?.valueLabel, d.ticket.value.label),
        title: str(ticket?.valueTitle, d.ticket.value.title),
        text: str(ticket?.valueText, d.ticket.value.text),
      },
      footer: str(ticket?.footer, d.ticket.footer),
      stub: str(ticket?.stub, d.ticket.stub),
    },
    card: {
      frontEyebrow: str(print?.card?.frontEyebrow, d.card.frontEyebrow),
      frontWords: str(print?.card?.frontWords, d.card.frontWords),
      backEyebrow: str(print?.card?.backEyebrow, d.card.backEyebrow),
      backFor: str(print?.card?.backFor, d.card.backFor),
      backFrom: str(print?.card?.backFrom, d.card.backFrom),
    },
    hero: {
      // a photo layout without a photo falls back to the ticket
      visual: hero?.visual && hero.visual !== 'ticket' && asMedia(hero.image) ? hero.visual : 'ticket',
      image: asMedia(hero?.image),
      ticketOnBackground: hero?.ticketOnBackground ?? true,
      eyebrow: str(hero?.eyebrow, d.hero.eyebrow),
      headline: str(hero?.headline, d.hero.headline),
      text: str(hero?.text, d.hero.text),
      price: str(hero?.price, d.hero.price),
      priceNote: str(hero?.priceNote, d.hero.priceNote),
      button: str(hero?.button, d.hero.button),
      secondary: str(hero?.secondary, d.hero.secondary),
      points: points(hero?.points, d.hero.points),
      ticketAlt: str(hero?.ticketAlt, d.hero.ticketAlt),
    },
    values: {
      eyebrow: str(values?.eyebrow, d.values.eyebrow),
      headline: str(values?.headline, d.values.headline),
      text: str(values?.text, d.values.text),
      items:
        values?.items && values.items.length > 0
          ? values.items.map((item) => ({ amount: toAmount(item.amount, 50) as 50 | 30 | 20, line: item.line ?? '' }))
          : d.values.items,
      button: str(values?.button, d.values.button),
      valueName: str(values?.valueName, d.values.valueName),
    },
    occasions: {
      eyebrow: str(occasions?.eyebrow, d.occasions.eyebrow),
      headline: str(occasions?.headline, d.occasions.headline),
      intro: str(occasions?.intro, d.occasions.intro),
      rows,
    },
    print: {
      ...d.print,
      eyebrow: str(print?.eyebrow, d.print.eyebrow),
      headline: str(print?.headline, d.print.headline),
      text: str(print?.text, d.print.text),
      button: str(print?.button, d.print.button),
      note: str(print?.note, d.print.note),
      cardAlt: str(print?.cardAlt, d.print.cardAlt),
    },
    how: {
      eyebrow: str(how?.eyebrow, d.how.eyebrow),
      points: points(how?.points, d.how.points),
    },
    faq: {
      eyebrow: str(faq?.eyebrow, d.faq.eyebrow),
      title: str(faq?.title, d.faq.title),
      description: str(faq?.description, d.faq.description),
      more: str(faq?.more, d.faq.more),
      moreLink: str(faq?.moreLink, d.faq.moreLink),
      items:
        faq?.items && faq.items.length > 0
          ? faq.items.map((item) => ({ question: item.question, answer: item.answer ?? '' }))
          : d.faq.items,
    },
    buy: {
      ...d.buy,
      title: str(buy?.title, d.buy.title),
      amountLabel: str(buy?.amountLabel, d.buy.amountLabel),
      workshopChip: str(buy?.workshopChip, d.buy.workshopChip),
      deliveryNote: str(buy?.deliveryNote, d.buy.deliveryNote),
      yourName: str(buy?.yourName, d.buy.yourName),
      yourNamePlaceholder: str(buy?.yourNamePlaceholder, d.buy.yourNamePlaceholder),
      yourEmail: str(buy?.yourEmail, d.buy.yourEmail),
      submit: str(buy?.submit, d.buy.submit),
      secure: str(buy?.secure, d.buy.secure),
    },
  }
}
