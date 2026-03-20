import { adminOnly } from '@/access/adminOnly'
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
    group: 'Workshops & Kurse',
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
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Validate dateTime is not in the past
        if (data?.dateTime) {
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
  },
  // TODO: Add unique index on (workshop, location, dateTime) — requires MongoDB setup
  // This prevents duplicate appointments
}
