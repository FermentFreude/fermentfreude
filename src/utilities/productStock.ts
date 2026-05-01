import type { Product, Variant } from '@/payload-types'

/**
 * Returns true only when the product is *explicitly* out of stock.
 *
 * Rules:
 *  • `inventory === 0`                                       → sold out
 *  • `enableVariants` + every populated variant has `inventory === 0` → sold out
 *  • `inventory == null` (never set by founders)             → NOT sold out
 *  • Anything else (positive inventory)                      → NOT sold out
 *
 * Note: variant aggregation only works when the caller fetched the product with
 * enough depth to populate `variants.docs` as full objects (depth >= 2).
 * If variants are not populated, we fall back to the parent `inventory` value.
 */
export function isProductSoldOut(product: Pick<Product, 'inventory' | 'enableVariants' | 'variants'>): boolean {
  if (product.enableVariants) {
    const docs = product.variants?.docs
    if (Array.isArray(docs) && docs.length > 0) {
      const populated = docs.filter(
        (v): v is Variant => typeof v === 'object' && v !== null && 'inventory' in v,
      )
      if (populated.length > 0) {
        const tracked = populated.filter((v) => typeof v.inventory === 'number')
        if (tracked.length === 0) return false
        return tracked.every((v) => (v.inventory ?? 0) === 0)
      }
    }
  }

  return product.inventory === 0
}
