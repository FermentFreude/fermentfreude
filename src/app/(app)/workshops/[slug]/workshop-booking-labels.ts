import { resolveLocalizedString, type AppLocale } from '@/utilities/resolveLocalizedString'

import type { WorkshopDetailData } from './workshop-data'

/** Extra booking UI + modal labels editable in CMS (booking block → section 6). */
export type WorkshopBookingUILabelsCMS = {
  bookingBookLabel?: string | null
  bookingSpotsLabel?: string | null
  datesDateColumnLabel?: string | null
  datesTimeColumnLabel?: string | null
  datesSpotsColumnLabel?: string | null
  soldOutLabel?: string | null
  noDatesMessage?: string | null
  closeDatesLabel?: string | null
  closeDetailsLabel?: string | null
  bookingImagePlaceholderLabel?: string | null
  detailsAboutEyebrow?: string | null
  detailsScheduleEyebrow?: string | null
  detailsIncludedEyebrow?: string | null
  detailsWhyEyebrow?: string | null
  modalConfirmHeading?: string | null
  modalConfirmSubheading?: string | null
  modalWorkshopLabel?: string | null
  modalDateLabel?: string | null
  modalTimeLabel?: string | null
  modalTotalLabel?: string | null
  modalCancelLabel?: string | null
  modalConfirmLabel?: string | null
  modalGuestCountLabel?: string | null
  modalAvailableSpotsPrefix?: string | null
  modalSpotsUnit?: string | null
  modalCapacityWarning?: string | null
  modalReduceGuestsLabel?: string | null
  modalChooseDifferentDateLabel?: string | null
  modalAddToCartLabel?: string | null
  modalAddingLabel?: string | null
  modalCloseLabel?: string | null
}

export type ResolvedBookingUILabels = {
  bookLabel: string
  spotsLabel: string
  dateColumn: string
  timeColumn: string
  spotsColumn: string
  soldOutLabel: string
  noDatesMessage: string
  closeDatesLabel: string
  closeDetailsLabel: string
  bookingImagePlaceholder: string
  detailsAboutEyebrow: string
  detailsScheduleEyebrow: string
  detailsIncludedEyebrow: string
  detailsWhyEyebrow: string
}

const DE_UI: ResolvedBookingUILabels = {
  bookLabel: 'Buchen',
  spotsLabel: 'Plätze',
  dateColumn: 'Datum',
  timeColumn: 'Zeit',
  spotsColumn: 'Plätze frei',
  soldOutLabel: 'Ausgebucht',
  noDatesMessage: 'Aktuell keine Termine geplant — schau bald wieder vorbei.',
  closeDatesLabel: 'Termine schließen',
  closeDetailsLabel: 'Details schließen',
  bookingImagePlaceholder: 'Workshop Impression',
  detailsAboutEyebrow: 'ÜBER DEN WORKSHOP',
  detailsScheduleEyebrow: 'ABLAUF',
  detailsIncludedEyebrow: 'IM PREIS ENTHALTEN',
  detailsWhyEyebrow: 'DARUM DIESER WORKSHOP',
}

const EN_UI: ResolvedBookingUILabels = {
  bookLabel: 'Book',
  spotsLabel: 'spots',
  dateColumn: 'Date',
  timeColumn: 'Time',
  spotsColumn: 'Spots available',
  soldOutLabel: 'Sold out',
  noDatesMessage: 'No dates scheduled yet — check back soon.',
  closeDatesLabel: 'Close dates',
  closeDetailsLabel: 'Close details',
  bookingImagePlaceholder: 'Workshop impression',
  detailsAboutEyebrow: 'ABOUT THE WORKSHOP',
  detailsScheduleEyebrow: 'SCHEDULE',
  detailsIncludedEyebrow: 'INCLUDED IN THE PRICE',
  detailsWhyEyebrow: 'WHY THIS WORKSHOP',
}

function text(value: unknown, locale: AppLocale, fallback: string): string {
  return resolveLocalizedString(value, locale) ?? fallback
}

export function resolveBookingUILabels(
  cms: WorkshopBookingUILabelsCMS | null | undefined,
  locale: AppLocale,
  headings?: {
    aboutHeading?: string
    scheduleHeading?: string
    includedHeading?: string
    whyHeading?: string
  },
): ResolvedBookingUILabels {
  const base = locale === 'en' ? EN_UI : DE_UI
  const about = headings?.aboutHeading ?? (locale === 'en' ? 'About this Workshop' : 'Über den Workshop')
  const schedule = headings?.scheduleHeading ?? (locale === 'en' ? 'Schedule' : 'Ablauf')
  const included = headings?.includedHeading ?? (locale === 'en' ? 'Included' : 'Im Preis enthalten')
  const why = headings?.whyHeading ?? (locale === 'en' ? 'Why This Workshop?' : 'Warum dieser Workshop?')

  return {
    bookLabel: text(cms?.bookingBookLabel, locale, base.bookLabel),
    spotsLabel: text(cms?.bookingSpotsLabel, locale, base.spotsLabel),
    dateColumn: text(cms?.datesDateColumnLabel, locale, base.dateColumn),
    timeColumn: text(cms?.datesTimeColumnLabel, locale, base.timeColumn),
    spotsColumn: text(cms?.datesSpotsColumnLabel, locale, base.spotsColumn),
    soldOutLabel: text(cms?.soldOutLabel, locale, base.soldOutLabel),
    noDatesMessage: text(cms?.noDatesMessage, locale, base.noDatesMessage),
    closeDatesLabel: text(cms?.closeDatesLabel, locale, base.closeDatesLabel),
    closeDetailsLabel: text(cms?.closeDetailsLabel, locale, base.closeDetailsLabel),
    bookingImagePlaceholder: text(
      cms?.bookingImagePlaceholderLabel,
      locale,
      base.bookingImagePlaceholder,
    ),
    detailsAboutEyebrow: text(cms?.detailsAboutEyebrow, locale, about.toUpperCase()),
    detailsScheduleEyebrow: text(cms?.detailsScheduleEyebrow, locale, schedule.toUpperCase()),
    detailsIncludedEyebrow: text(cms?.detailsIncludedEyebrow, locale, included.toUpperCase()),
    detailsWhyEyebrow: text(cms?.detailsWhyEyebrow, locale, why.toUpperCase()),
  }
}

export function mergeWorkshopForModal(
  workshop: WorkshopDetailData,
  cms: WorkshopBookingUILabelsCMS | null | undefined,
  locale: AppLocale,
): WorkshopDetailData & {
  guestCountLabel: string
  availableSpotsPrefix: string
  spotsUnit: string
  capacityWarning: string
  reduceGuestsLabel: string
  chooseDifferentDateLabel: string
  addToCartLabel: string
  addingLabel: string
  closeLabelAria: string
} {
  const isDe = locale === 'de'
  const t = (value: unknown, de: string, en: string) => text(value, locale, isDe ? de : en)

  return {
    ...workshop,
    confirmHeading: t(cms?.modalConfirmHeading, workshop.confirmHeading, workshop.confirmHeading),
    confirmSubheading: t(
      cms?.modalConfirmSubheading,
      workshop.confirmSubheading,
      workshop.confirmSubheading,
    ),
    workshopLabel: t(cms?.modalWorkshopLabel, workshop.workshopLabel, workshop.workshopLabel),
    dateLabel: t(cms?.modalDateLabel, workshop.dateLabel, workshop.dateLabel),
    timeLabel: t(cms?.modalTimeLabel, workshop.timeLabel, workshop.timeLabel),
    totalLabel: t(cms?.modalTotalLabel, workshop.totalLabel, workshop.totalLabel),
    cancelLabel: t(cms?.modalCancelLabel, workshop.cancelLabel, workshop.cancelLabel),
    confirmLabel: t(cms?.modalConfirmLabel, workshop.confirmLabel, workshop.confirmLabel),
    guestCountLabel: t(cms?.modalGuestCountLabel, 'Anzahl Personen', 'Number of guests'),
    availableSpotsPrefix: t(
      cms?.modalAvailableSpotsPrefix,
      'Verfügbar für dieses Datum:',
      'Available for this date:',
    ),
    spotsUnit: t(cms?.modalSpotsUnit, 'Plätze', 'spots'),
    capacityWarning: t(
      cms?.modalCapacityWarning,
      'Sie möchten {requested} Plätze buchen, aber nur {available} sind verfügbar.',
      'You want to book {requested} spots but only {available} are available.',
    ),
    reduceGuestsLabel: t(
      cms?.modalReduceGuestsLabel,
      'Auf {count} reduzieren',
      'Reduce to {count}',
    ),
    chooseDifferentDateLabel: t(
      cms?.modalChooseDifferentDateLabel,
      'Anderes Datum wählen',
      'Choose a different date',
    ),
    addToCartLabel: t(cms?.modalAddToCartLabel, 'In den Warenkorb', 'Add to cart'),
    addingLabel: t(cms?.modalAddingLabel, 'Wird hinzugefügt...', 'Adding...'),
    closeLabelAria: t(cms?.modalCloseLabel, 'Schließen', 'Close'),
  }
}

export function formatTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''))
}
