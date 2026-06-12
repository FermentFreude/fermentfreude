export type RosterStats = {
  upcomingWorkshops: number
  totalParticipants: number
  openPickups: number
  workshopRevenue: number
}

export type AppointmentRow = {
  id: string
  workshopTitle: string
  workshopDescription: string
  dateTime: string
  date: string
  time: string
  locationName: string
  pricePerPerson: number
  totalBooked: number
  capacity: number
  isPast: boolean
}

export type BookingRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  guestCount: number
  notes: string
  createdAt: string
}

export type ParticipantRow = {
  name: string
  email: string
  phone: string
  workshopTitle: string
  bookingDate: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

export type PickupItem = {
  title: string
  qty: number
  price: number
}

export type PickupOrderRow = {
  id: string
  invoiceNumber: string
  createdAt: string
  customerFirstName: string
  customerLastName: string
  email: string
  phone: string
  items: PickupItem[]
  pickupDate: string
  pickupTime: string
  pickupLocation: string
  pickupStatus: 'pending' | 'ready' | 'collected'
  totalAmount: number
  notes: string
}

export type VoucherRow = {
  id: string
  code: string
  value: number
  status: 'active' | 'redeemed' | 'expired'
  purchaserName: string
  purchaserEmail: string
  recipientName: string
  recipientEmail: string
  personalNote: string
  deliveryMethod: string
  redeemedOn: string
  redeemedForWorkshop: string
  invoiceNumber: string
  createdAt: string
}

export type RosterData = {
  stats: RosterStats
  appointments: AppointmentRow[]
  bookingsByAppointment: Record<string, BookingRow[]>
  participants: ParticipantRow[]
  pickupOrders: PickupOrderRow[]
  vouchers: VoucherRow[]
}
