import { isAdmin } from '@/access/isAdmin'
import { sendWorkshopBookingEmail } from '@/hooks/brevo/sendWorkshopBookingEmail'
import { CollectionConfig } from 'payload'

export const WorkshopBookings: CollectionConfig = {
  slug: 'workshop-bookings',
  labels: {
    singular: 'Workshop Booking',
    plural: 'Workshop Bookings',
  },
  hooks: {
    afterChange: [sendWorkshopBookingEmail],
  },
  admin: {
    useAsTitle: 'workshopTitle',
    group: 'Workshops & Kurse',
    defaultColumns: ['workshopTitle', 'date', 'guestCount', 'totalPrice', 'createdAt'],
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'workshopSlug',
      type: 'text',
      required: true,
      label: 'Workshop Slug',
      admin: { description: 'e.g. "kombucha", "lakto", "tempeh"' },
    },
    {
      name: 'appointmentId',
      type: 'text',
      required: true,
      label: 'Appointment ID',
      admin: { description: 'ID of the WorkshopAppointment' },
    },
    {
      name: 'workshopTitle',
      type: 'text',
      required: true,
      label: 'Workshop Title',
      admin: { description: 'e.g. "Kombucha Workshop"' },
    },
    {
      name: 'date',
      type: 'text',
      required: true,
      label: 'Appointment Date',
      admin: { description: 'Formatted date string' },
    },
    {
      name: 'time',
      type: 'text',
      required: true,
      label: 'Appointment Time',
      admin: { description: 'Formatted time string' },
    },
    {
      name: 'guestCount',
      type: 'number',
      required: true,
      label: 'Number of Guests',
      min: 1,
      max: 12,
    },
    {
      name: 'pricePerPerson',
      type: 'number',
      required: true,
      label: 'Price per Person (€)',
    },
    {
      name: 'totalPrice',
      type: 'number',
      required: true,
      label: 'Total Price (€)',
    },
    {
      name: 'cartSlug',
      type: 'text',
      label: 'Temporary Cart ID',
      admin: { description: 'For linking to cart items (temporary until checkout)' },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Customer Email',
      admin: { description: 'Email for booking confirmation' },
    },
    {
      name: 'firstName',
      type: 'text',
      label: 'Customer First Name',
      admin: { description: 'For personalizing the booking confirmation email' },
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Customer Last Name',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
      admin: { description: 'Optional contact number' },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Special Requests / Notes',
      admin: { description: 'Any dietary restrictions, allergies, or special requests' },
    },
  ],
  timestamps: true,
}
