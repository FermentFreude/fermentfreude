import type { Order, Product, Variant } from '@/payload-types'
import type { CollectionAfterChangeHook } from 'payload'

/**
 * afterChange hook on Orders.
 * When a new order is created, decrement inventory for each line item.
 * Skips workshops and digital courses (they don't have physical inventory).
 * Sequential writes for MongoDB Atlas M0 (no transactions).
 */
export const decrementInventory: CollectionAfterChangeHook<Order> = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const items = doc.items
  if (!items || items.length === 0) return doc

  for (const item of items) {
    const { product, variant, quantity } = item
    if (!product || !quantity) continue

    // Resolve product to get productType
    const productId = typeof product === 'string' ? product : product.id
    const productDoc =
      typeof product === 'object' && product !== null
        ? (product as Product)
        : await req.payload.findByID({ collection: 'products', id: productId, depth: 0, req })

    // Skip workshop and digital-course products — no physical inventory
    if (productDoc.productType === 'workshop' || productDoc.productType === 'digital-course') {
      continue
    }

    // If the item has a variant, decrement variant inventory
    if (variant) {
      const variantId = typeof variant === 'string' ? variant : variant.id
      const variantDoc =
        typeof variant === 'object' && variant !== null
          ? (variant as Variant)
          : await req.payload.findByID({ collection: 'variants', id: variantId, depth: 0, req })

      if (variantDoc.inventory != null && variantDoc.inventory > 0) {
        const newInventory = Math.max(0, variantDoc.inventory - quantity)
        await req.payload.update({
          collection: 'variants',
          id: variantId,
          data: { inventory: newInventory },
          req,
          context: { skipRevalidate: true, skipAutoTranslate: true },
        })
      }
    } else {
      // No variant — decrement product-level inventory
      if (productDoc.inventory != null && productDoc.inventory > 0) {
        const newInventory = Math.max(0, productDoc.inventory - quantity)
        await req.payload.update({
          collection: 'products',
          id: productId,
          data: { inventory: newInventory },
          req,
          context: { skipRevalidate: true, skipAutoTranslate: true },
        })
      }
    }
  }

  return doc
}
