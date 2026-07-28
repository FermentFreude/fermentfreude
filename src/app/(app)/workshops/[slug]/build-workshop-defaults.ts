import type { Workshop } from '@/payload-types'
import type { FlattenedWorkshopDetail } from '@/utilities/workshopPageUtils'
import { resolveLocalizedString, type AppLocale } from '@/utilities/resolveLocalizedString'
import type { WorkshopDetailData } from './workshop-data'

const EN_LABELS = {
  subtitle: '3-hour hands-on workshop',
  priceSuffix: 'per person',
  currency: '€',
  aboutHeading: 'About this Workshop',
  scheduleHeading: 'Schedule (3 Hours)',
  includedHeading: 'Included in the Price',
  whyHeading: 'Why This Workshop?',
  datesHeading: 'Upcoming Workshops',
  viewDatesLabel: 'View Dates & Book',
  hideDatesLabel: 'Hide Dates',
  moreInfoLabel: 'Learn More',
  bookLabel: 'Book',
  spotsLabel: 'spots available',
  closeLabel: 'Close',
  confirmHeading: 'Confirm Reservation',
  confirmSubheading: 'Review your booking details before proceeding to checkout.',
  workshopLabel: 'Workshop',
  dateLabel: 'Date',
  timeLabel: 'Time',
  totalLabel: 'Total',
  cancelLabel: 'Cancel',
  confirmLabel: 'Confirm Booking',
}

/**
 * Minimal WorkshopDetailData for LaktoBookingCard when no hardcoded defaults exist.
 * CMS fields override these at render time.
 */
export function buildWorkshopDefaults(
  pageSlug: string,
  _dbSlug: string,
  record: Workshop | null,
  detail?: FlattenedWorkshopDetail,
  locale: AppLocale = 'de',
): WorkshopDetailData {
  const isDe = locale === 'de'
  const text = (value: unknown, fallback: string) =>
    resolveLocalizedString(value, locale) ?? fallback

  const title =
    resolveLocalizedString(detail?.bookingTitle, locale) ??
    resolveLocalizedString(record?.title, locale) ??
    pageSlug

  const price = detail?.bookingPrice ?? record?.basePrice ?? 99

  return {
    slug: pageSlug,
    workshopType: undefined,
    title,
    subtitle: text(detail?.bookingEyebrow, EN_LABELS.subtitle),
    description: text(
      detail?.aboutText,
      isDe
        ? 'Hands-on Fermentations-Workshop mit erfahrenen Guides.'
        : 'Hands-on fermentation workshop with experienced guides.',
    ),
    price,
    priceSuffix: text(detail?.bookingPriceSuffix, isDe ? 'pro Person' : EN_LABELS.priceSuffix),
    currency: text(detail?.bookingCurrency, EN_LABELS.currency),
    heroImage: null,
    highlights: [],
    aboutHeading: text(detail?.aboutHeading, isDe ? 'Über den Workshop' : EN_LABELS.aboutHeading),
    aboutText: text(
      detail?.aboutText,
      isDe
        ? 'Entdecke die Welt der Fermentation in einem praxisorientierten Workshop.'
        : 'Discover the world of fermentation in a hands-on workshop.',
    ),
    scheduleHeading: text(
      detail?.scheduleHeading,
      isDe ? 'Ablauf (3 Stunden)' : EN_LABELS.scheduleHeading,
    ),
    schedule: [],
    includedHeading: text(
      detail?.includedHeading,
      isDe ? `Im Preis enthalten (€${price})` : `${EN_LABELS.includedHeading} (€${price})`,
    ),
    includedItems: [],
    whyHeading: text(detail?.whyHeading, isDe ? 'Warum dieser Workshop?' : EN_LABELS.whyHeading),
    whyPoints: [],
    datesHeading: text(detail?.datesHeading, isDe ? 'Nächste Workshops' : EN_LABELS.datesHeading),
    dates: [],
    viewDatesLabel: text(
      detail?.bookingViewDatesLabel,
      isDe ? 'Termine & Buchen' : EN_LABELS.viewDatesLabel,
    ),
    hideDatesLabel: text(
      detail?.bookingHideDatesLabel,
      isDe ? 'Termine ausblenden' : EN_LABELS.hideDatesLabel,
    ),
    moreInfoLabel: text(
      detail?.bookingMoreDetailsLabel,
      isDe ? 'Mehr Informationen' : EN_LABELS.moreInfoLabel,
    ),
    bookLabel: text(detail?.bookingBookLabel, isDe ? 'Buchen' : EN_LABELS.bookLabel),
    spotsLabel: text(detail?.bookingSpotsLabel, isDe ? 'Plätze frei' : EN_LABELS.spotsLabel),
    closeLabel: isDe ? 'Schließen' : EN_LABELS.closeLabel,
    confirmHeading: text(
      detail?.modalConfirmHeading,
      isDe ? 'Reservierung bestätigen' : EN_LABELS.confirmHeading,
    ),
    confirmSubheading: text(
      detail?.modalConfirmSubheading,
      isDe
        ? 'Bitte prüfe deine Buchungsdetails vor dem Checkout.'
        : EN_LABELS.confirmSubheading,
    ),
    workshopLabel: text(detail?.modalWorkshopLabel, EN_LABELS.workshopLabel),
    dateLabel: text(detail?.modalDateLabel, isDe ? 'Datum' : EN_LABELS.dateLabel),
    timeLabel: text(detail?.modalTimeLabel, isDe ? 'Uhrzeit' : EN_LABELS.timeLabel),
    totalLabel: text(detail?.modalTotalLabel, isDe ? 'Gesamtbetrag' : EN_LABELS.totalLabel),
    cancelLabel: text(detail?.modalCancelLabel, isDe ? 'Abbrechen' : EN_LABELS.cancelLabel),
    confirmLabel: text(detail?.modalConfirmLabel, isDe ? 'Bestätigen' : EN_LABELS.confirmLabel),
  }
}
