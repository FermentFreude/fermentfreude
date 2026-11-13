import type { BookingOrigin } from './bookingOrigin'

export type ArchivePayment = 'stripe' | 'voucher' | 'manual' | 'wix' | 'none'

export type ArchiveSeat = { name: string; status: string }

export type ArchiveBooking = {
  id: string
  buyer: string
  email: string
  guestCount: number
  seatsHeld: number
  seats: ArchiveSeat[]
  origin: BookingOrigin
  payment: ArchivePayment
  invoiceNumber: string
  orderStatus: string
  pricePerPerson: number
  notes: string
}

export type ArchiveAppointment = {
  id: string
  workshopTitle: string
  dateTime: string
  date: string
  time: string
  location: string
  capacity: number
  seatsHeld: number
  noShows: number
  bookings: ArchiveBooking[]
}

export type ArchiveResponse = {
  year: number
  years: number[]
  appointments: ArchiveAppointment[]
}
