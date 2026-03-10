import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })
await payload.update({
  collection: 'carts',
  id: '69af6dd1fc690b370e04d86e',
  data: { items: [], subtotal: 0 },
})
console.log('✅ Cart cleared!')
