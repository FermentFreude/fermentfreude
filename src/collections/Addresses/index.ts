import type { CollectionConfig } from 'payload'

import { isDocumentOwner } from '@/access/isDocumentOwner'

const COUNTRY_OPTIONS = [
  { label: 'Austria', value: 'AT' },
  { label: 'Australia', value: 'AU' },
  { label: 'Belgium', value: 'BE' },
  { label: 'Brazil', value: 'BR' },
  { label: 'Bulgaria', value: 'BG' },
  { label: 'Canada', value: 'CA' },
  { label: 'Cyprus', value: 'CY' },
  { label: 'Czech Republic', value: 'CZ' },
  { label: 'Denmark', value: 'DK' },
  { label: 'Estonia', value: 'EE' },
  { label: 'Finland', value: 'FI' },
  { label: 'France', value: 'FR' },
  { label: 'Germany', value: 'DE' },
  { label: 'Greece', value: 'GR' },
  { label: 'Hong Kong', value: 'HK' },
  { label: 'Hungary', value: 'HU' },
  { label: 'India', value: 'IN' },
  { label: 'Ireland', value: 'IE' },
  { label: 'Italy', value: 'IT' },
  { label: 'Japan', value: 'JP' },
  { label: 'Latvia', value: 'LV' },
  { label: 'Lithuania', value: 'LT' },
  { label: 'Luxembourg', value: 'LU' },
  { label: 'Malaysia', value: 'MY' },
  { label: 'Malta', value: 'MT' },
  { label: 'Mexico', value: 'MX' },
  { label: 'Netherlands', value: 'NL' },
  { label: 'New Zealand', value: 'NZ' },
  { label: 'Norway', value: 'NO' },
  { label: 'Poland', value: 'PL' },
  { label: 'Portugal', value: 'PT' },
  { label: 'Romania', value: 'RO' },
  { label: 'Singapore', value: 'SG' },
  { label: 'Slovakia', value: 'SK' },
  { label: 'Slovenia', value: 'SI' },
  { label: 'Spain', value: 'ES' },
  { label: 'Sweden', value: 'SE' },
  { label: 'Switzerland', value: 'CH' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'United States', value: 'US' },
]

export const Addresses: CollectionConfig = {
  slug: 'addresses',
  access: {
    create: ({ req: { user } }) => !!user,
    read: isDocumentOwner,
    update: isDocumentOwner,
    delete: isDocumentOwner,
  },
  admin: {
    group: 'Nutzer',
    defaultColumns: ['customer', 'addressLine1', 'city', 'country'],
    useAsTitle: 'addressLine1',
    description: 'Shipping and billing addresses saved by customers.',
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Customer',
      admin: {
        description: 'The user this address belongs to.',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Label',
      admin: {
        description: 'Optional label, e.g. "Home" or "Work".',
        placeholder: 'Home',
      },
    },
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
    },
    {
      name: 'company',
      type: 'text',
      label: 'Company',
    },
    {
      name: 'addressLine1',
      type: 'text',
      label: 'Address Line 1',
      admin: {
        description: 'Street address, P.O. box, company name.',
      },
    },
    {
      name: 'addressLine2',
      type: 'text',
      label: 'Address Line 2',
      admin: {
        description: 'Apartment, suite, unit, building, floor, etc.',
      },
    },
    {
      name: 'city',
      type: 'text',
      label: 'City',
    },
    {
      name: 'state',
      type: 'text',
      label: 'State / Province / Region',
    },
    {
      name: 'postalCode',
      type: 'text',
      label: 'Postal Code',
    },
    {
      name: 'country',
      type: 'select',
      label: 'Country',
      required: true,
      defaultValue: 'DE',
      options: COUNTRY_OPTIONS,
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone',
    },
  ],
}
