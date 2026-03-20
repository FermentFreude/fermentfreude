'use client'

import { AddToCart } from '@/components/Cart/AddToCart'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import type { Media as MediaType, Product } from '@/payload-types'
import { Minus, Plus, X } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

function isMediaObject(val: unknown): val is MediaType {
  return typeof val === 'object' && val !== null && 'url' in val
}

/** Parse product description to extract weight and main text */
function parseProductInfo(product: Product): {
  description: string
  weight: string | null
} {
  const desc = product.description as
    | { root?: { children?: Array<{ children?: Array<{ text?: string }> }> } }
    | undefined
  if (!desc?.root?.children) return { description: '', weight: null }

  const fullText = desc.root.children
    .flatMap((p) => p.children?.map((c) => c.text) ?? [])
    .filter(Boolean)
    .join(' ')

  // Extract weight (e.g. "260g" or "180g")
  const weightMatch = fullText.match(/(\d+)\s*g[.\s]*/i)
  const weight = weightMatch ? `${weightMatch[1]}g` : null

  // Main description = everything before "Zutaten:" / "Ingredients:" (if present)
  const descParts = fullText.split(/(?:Zutaten|Ingredients):/i)
  let mainDesc = descParts[0]?.replace(/\s*\d+\s*g\.?\s*$/, '').trim() ?? ''

  // Remove the title from the description if it starts with it (avoids repeating)
  const titleNorm = product.title.toLowerCase().replace(/[^a-zäöüß0-9]/g, '')
  const descStart = mainDesc.toLowerCase().replace(/[^a-zäöüß0-9]/g, '')
  if (descStart.startsWith(titleNorm)) {
    mainDesc = mainDesc
      .slice(product.title.length)
      .replace(/^[.\s,\-–—]+/, '')
      .trim()
  }

  return { description: mainDesc, weight }
}

type Props = {
  product: Product
  onClose: () => void
}

export const ProductQuickView: React.FC<Props> = ({ product, onClose }) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const gallery = product.gallery ?? []
  const images = gallery.map((g) => g.image).filter(isMediaObject)

  const activeImage = images[activeImageIndex] ?? null
  const { description, weight } = useMemo(() => parseProductInfo(product), [product])
  const price = product.priceInEUR

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose()
    },
    [onClose],
  )

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={product.title}
    >
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-ff-near-black" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left: Image gallery */}
          <div className="md:w-1/2 p-6 flex gap-3">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 shrink-0">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeImageIndex
                        ? 'border-ff-near-black'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Media
                      resource={img}
                      imgClassName="w-full h-full object-cover"
                      className="w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 relative aspect-3/4 rounded-xl overflow-hidden bg-[#ECE5DE]">
              {activeImage ? (
                <Media
                  resource={activeImage}
                  imgClassName="w-full h-full object-cover"
                  className="w-full h-full"
                  fill
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ff-charcoal/30 text-sm">
                  No image
                </div>
              )}
            </div>
          </div>

          {/* Right: Editorial product info */}
          <div className="md:w-1/2 p-6 md:py-8 md:pr-8 md:pl-2 flex flex-col">
            {/* Title */}
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-ff-near-black leading-tight">
              {product.title}
            </h2>

            {/* Divider */}
            <div className="mt-4 mb-4 h-px bg-linear-to-r from-ff-charcoal/10 via-ff-charcoal/20 to-transparent" />

            {/* Description */}
            {description && (
              <p className="text-ff-charcoal text-sm leading-relaxed italic mb-4">{description}</p>
            )}

            {/* Spacer pushes bottom section down on desktop */}
            <div className="flex-1" />

            {/* Price · Weight · Quantity — aligned row above button */}
            <div className="flex items-end gap-8 mb-5">
              {typeof price === 'number' && (
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ff-charcoal/50 mb-1">
                    Price
                  </span>
                  <Price
                    amount={price}
                    as="span"
                    className="text-xl font-bold text-ff-near-black leading-none"
                  />
                </div>
              )}

              {weight && (
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ff-charcoal/50 mb-1">
                    Weight
                  </span>
                  <span className="text-xl font-bold text-ff-near-black leading-none">
                    {weight}
                  </span>
                </div>
              )}

              <div className="flex flex-col ml-auto">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ff-charcoal/50 mb-1">
                  Quantity
                </span>
                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 h-9 flex items-center justify-center text-sm font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <AddToCart
              product={product}
              className="w-full rounded-full bg-ff-near-black text-white font-display font-bold text-sm uppercase tracking-wider py-3.5 hover:bg-ff-charcoal-dark transition-colors"
            >
              Add to Cart
            </AddToCart>

            {/* Categories */}
            {product.categories &&
              Array.isArray(product.categories) &&
              product.categories.length > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ff-charcoal/50">
                    Category
                  </span>
                  {product.categories
                    .filter(
                      (c): c is Exclude<typeof c, string> =>
                        typeof c === 'object' && c !== null && 'title' in c,
                    )
                    .map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex rounded-full border border-ff-charcoal/20 px-3 py-0.5 text-xs text-ff-charcoal"
                      >
                        {c.title}
                      </span>
                    ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
