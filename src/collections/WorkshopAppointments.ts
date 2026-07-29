import { adminOnly } from '@/access/adminOnly'
import { handleOrganiserCancellation } from '@/hooks/handleOrganiserCancellation'
import type { CollectionConfig } from 'payload'

export const WorkshopAppointments: CollectionConfig = {
  slug: 'workshop-appointments',
  access: {
    read: () => true, // Public read
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'dateTime',
    group: 'Workshops',
    defaultColumns: ['workshop', 'location', 'dateTime', 'availableSpots', 'isPublished'],
    description:
      '⭐ Manage workshop availability. **This is where you control dates, times, and available spots.** Changes here instantly update the booking pages.',
    listSearchableFields: ['workshop', 'location', 'dateTime'],
  },
  defaultSort: 'dateTime', // Sort by date ascending (soonest first)
  fields: [
    {
      name: 'workshop',
      type: 'relationship',
      relationTo: 'workshops',
      required: true,
      admin: {
        description: 'Select the workshop (Kombucha, Lakto, Tempeh, Basics)',
      },
      filterOptions: () => {
        // Show all workshops for filtering
        return {}
      },
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'workshop-locations',
      required: true,
      admin: {
        description: 'Select the location where this workshop takes place',
      },
    },
    {
      name: 'dateTime',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'd MMM yyy, HH:mm',
        },
        description: 'Workshop date and time (must be in the future)',
      },
    },
    {
      name: 'availableSpots',
      type: 'number',
      required: true,
      defaultValue: 12,
      min: 0,
      max: 12,
      admin: {
        description: 'Number of spots available for booking (0 = sold out, max 12 per workshop)',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description:
          'Uncheck to hide this date from the website (useful for sold-out or cancelled sessions)',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes (not visible to customers)',
      },
    },
    // ── Organiser cancellation (refund/rebooking system, plan §7) ────────
    {
      name: 'cancellationStatus',
      type: 'select',
      defaultValue: 'scheduled',
      options: [
        { label: 'Geplant', value: 'scheduled' },
        { label: 'Abgesagt (von uns)', value: 'cancelled_by_organiser' },
      ],
      admin: {
        position: 'sidebar',
        description:
          '⚠️ Auf "Abgesagt" setzen benachrichtigt automatisch JEDE Person mit einer bestätigten Buchung auf diesen Termin per E-Mail, mit einem Link zur Auswahl: Ersatztermin oder volle Rückerstattung. Der Termin wird dabei auch automatisch von der Website genommen (unpublished). Das kann nicht einfach rückgängig gemacht werden — nur für echte Absagen verwenden.',
      },
    },
    {
      name: 'cancellationReason',
      type: 'text',
      admin: {
        position: 'sidebar',
        condition: (_data, siblingData) => siblingData?.cancellationStatus === 'cancelled_by_organiser',
        description: 'Grund, der den Kund:innen in der Absage-E-Mail angezeigt wird (z.B. "Krankheitsbedingt").',
      },
    },
    {
      name: 'cancellationInternalNote',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        condition: (_data, siblingData) => siblingData?.cancellationStatus === 'cancelled_by_organiser',
        description: 'Nur intern sichtbar — nicht Teil der Kunden-E-Mail.',
      },
    },
    {
      name: 'cancelledAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (_data, siblingData) => siblingData?.cancellationStatus === 'cancelled_by_organiser',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        // Validate dateTime is not in the past — only on create
        if (operation === 'create' && data?.dateTime) {
          const appointmentDate = new Date(data.dateTime)
          const now = new Date()
          if (appointmentDate < now) {
            throw new Error('Cannot create appointment in the past')
          }
        }

        // Validate availableSpots does not exceed maxCapacityPerSlot (12)
        if (data?.availableSpots && data.availableSpots > 12) {
          throw new Error('Available spots cannot exceed 12 per workshop')
        }

        return data
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        // Cancelling always takes the appointment off the public site too —
        // "notify existing bookings" and "stop taking new ones" are the same
        // decision from an admin's perspective, no reason to make it two
        // separate steps that could be left half-done.
        const isNewlyCancelled =
          data?.cancellationStatus === 'cancelled_by_organiser' &&
          originalDoc?.cancellationStatus !== 'cancelled_by_organiser'
        if (isNewlyCancelled) {
          data.isPublished = false
          data.cancelledAt = new Date().toISOString()
        }
        return data
      },
    ],
    afterChange: [handleOrganiserCancellation],
  },
  // TODO: Add unique index on (workshop, location, dateTime) — requires MongoDB setup
  // This prevents duplicate appointments
}
