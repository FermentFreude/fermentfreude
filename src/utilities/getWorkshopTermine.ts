/**
 * Workshop appointment (Termin) data.
 * TODO: Replace with CMS collection when WorkshopAppointments exists.
 */

export type WorkshopTermin = {
  id: string
  workshopSlug: string
  workshopTitle: string
  date: string
  timeStart: string
  timeEnd: string
  slotsFree: number
}

/** Mock appointments — replace with CMS query when collection exists. */
export function getWorkshopTermine(locale: 'de' | 'en'): WorkshopTermin[] {
  const isDe = locale === 'de'
  return [
    {
      id: '1',
      workshopSlug: 'lakto-gemuese',
      workshopTitle: isDe ? 'Lakto-Gemüse' : 'Lacto-Vegetables',
      date: isDe ? '15. Februar 2026' : 'February 15, 2026',
      timeStart: '14:00',
      timeEnd: '16:30',
      slotsFree: 5,
    },
    {
      id: '2',
      workshopSlug: 'kombucha',
      workshopTitle: 'Kombucha',
      date: isDe ? '18. Februar 2026' : 'February 18, 2026',
      timeStart: '14:00',
      timeEnd: '16:30',
      slotsFree: 4,
    },
    {
      id: '3',
      workshopSlug: 'tempeh',
      workshopTitle: 'Tempeh',
      date: isDe ? '4. März 2026' : 'March 4, 2026',
      timeStart: '14:00',
      timeEnd: '16:30',
      slotsFree: 6,
    },
    {
      id: '4',
      workshopSlug: 'lakto-gemuese',
      workshopTitle: isDe ? 'Lakto-Gemüse' : 'Lacto-Vegetables',
      date: isDe ? '22. März 2026' : 'March 22, 2026',
      timeStart: '10:00',
      timeEnd: '12:30',
      slotsFree: 3,
    },
    {
      id: '5',
      workshopSlug: 'kombucha',
      workshopTitle: 'Kombucha',
      date: isDe ? '28. März 2026' : 'March 28, 2026',
      timeStart: '14:00',
      timeEnd: '16:30',
      slotsFree: 8,
    },
  ]
}
