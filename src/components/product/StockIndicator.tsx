'use client'
import { Product, Variant } from '@/payload-types'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

type Props = {
  product: Product
  tone?: 'light' | 'dark'
}

export const StockIndicator: React.FC<Props> = ({ product, tone = 'light' }) => {
  const searchParams = useSearchParams()

  const selectedVariant = useMemo<Variant | undefined>(() => {
    const variants = product.variants?.docs || []
    if (product.enableVariants && variants.length) {
      const variantId = searchParams.get('variant')
      const validVariant = variants.find((variant) => {
        if (typeof variant === 'object') {
          return String(variant.id) === variantId
        }
        return String(variant) === variantId
      })

      if (validVariant && typeof validVariant === 'object') {
        return validVariant
      }
    }

    return undefined
  }, [product.enableVariants, product.variants?.docs, searchParams])

  const stockQuantity = useMemo(() => {
    if (product.enableVariants) {
      if (selectedVariant) {
        return selectedVariant.inventory || 0
      }
    }
    return product.inventory || 0
  }, [product.enableVariants, selectedVariant, product.inventory])

  if (product.enableVariants && !selectedVariant) {
    return null
  }

  if (stockQuantity >= 10) {
    return null
  }

  return (
    <div
      className={`text-caption font-medium uppercase tracking-wide ${
        tone === 'dark' ? 'text-white/70' : 'text-ff-gray-text'
      }`}
    >
      {stockQuantity < 10 && stockQuantity > 0 && (
        <span>Only {stockQuantity} left in stock</span>
      )}
      {(stockQuantity === 0 || !stockQuantity) && <span>Out of stock</span>}
    </div>
  )
}
