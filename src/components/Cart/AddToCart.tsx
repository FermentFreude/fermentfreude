'use client'

import { Button } from '@/components/ui/button'
import { gtmAddToCart } from '@/lib/gtm'
import type { Product, Variant } from '@/payload-types'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
type Props = {
  product: Product
  className?: string
  ariaLabel?: string
  children?: React.ReactNode
  quantity?: number
  disabled?: boolean
}

export function AddToCart({ product, className, ariaLabel, children, quantity = 1, disabled: externalDisabled = false }: Props) {
  const { addItem, cart, isLoading, incrementItem } = useCart()
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

  const addToCart = useCallback(
    async (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      try {
        await addItem({
          product: product.id,
          variant: selectedVariant?.id ?? undefined,
        } as any)

        // If quantity > 1, wait for cart to update and then increment
        if (quantity > 1) {
          // Give the UI time to update
          await new Promise((resolve) => setTimeout(resolve, 100))

          // Find the newly added item and increment it the required times
          const findNewItem = () => {
            return cart?.items?.find((item: any) => {
              const productID = typeof item.product === 'object' ? item.product?.id : item.product
              const variantID = item.variant
                ? typeof item.variant === 'object'
                  ? item.variant?.id
                  : item.variant
                : undefined

              if (productID === product.id) {
                if (product.enableVariants) {
                  return variantID === selectedVariant?.id
                }
                return true
              }
              return false
            })
          }

          // Increment the item
          const newItem = findNewItem()
          if (newItem?.id) {
            for (let i = 1; i < quantity; i++) {
              await incrementItem(newItem.id as any)
            }
          }
        }

        toast.success('Item added to cart.')
        gtmAddToCart({
          item_id: String(product.id),
          item_name: product.title ?? '',
          item_category: product.productType ?? undefined,
          price: (product as unknown as Record<string, unknown>).priceInEUR as number | undefined,
          quantity,
        })
      } catch (error) {
        console.error('Failed to add to cart:', error)
        toast.error(
          (error as any)?.message ||
            'Failed to add item to cart. Please check the browser console for details.',
        )
      }
    },
    [addItem, product, selectedVariant, quantity, incrementItem, cart?.items],
  )

  const disabled = useMemo<boolean>(() => {
    const existingItem = cart?.items?.find((item) => {
      const productID = typeof item.product === 'object' ? item.product?.id : item.product
      const variantID = item.variant
        ? typeof item.variant === 'object'
          ? item.variant?.id
          : item.variant
        : undefined

      if (productID === product.id) {
        if (product.enableVariants) {
          return variantID === selectedVariant?.id
        }
        return true
      }
    })

    if (existingItem) {
      const existingQuantity = existingItem.quantity

      if (product.enableVariants) {
        return existingQuantity >= (selectedVariant?.inventory || 0)
      }
      return existingQuantity >= (product.inventory || 0)
    }

    if (product.enableVariants) {
      if (!selectedVariant) {
        return true
      }

      if (selectedVariant.inventory === 0) {
        return true
      }
    } else {
      if (product.inventory === 0) {
        return true
      }
    }

    return false
  }, [selectedVariant, cart?.items, product])

  return (
    <Button
      aria-label={ariaLabel ?? 'Add to cart'}
      variant="outline"
      className={clsx(
        {
          'hover:opacity-90': !children,
        },
        className,
      )}
      disabled={disabled || isLoading || externalDisabled}
      onClick={addToCart}
      type="button"
    >
      {children ?? 'Add To Cart'}
    </Button>
  )
}
