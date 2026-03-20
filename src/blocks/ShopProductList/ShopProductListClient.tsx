'use client'

import { AddToCart } from '@/components/Cart/AddToCart'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import type { Category, Media as MediaType, Product } from '@/payload-types'
import { Eye, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useMemo, useState } from 'react'

import { ProductQuickView } from './ProductQuickView'

function isMediaObject(val: unknown): val is MediaType {
  return typeof val === 'object' && val !== null && 'url' in val
}

function getFirstImage(product: Product): MediaType | null {
  const gallery = product.gallery
  if (gallery && gallery.length > 0) {
    const first = gallery[0]?.image
    if (isMediaObject(first)) return first
  }
  return null
}

function productHasCategory(product: Product, categorySlug: string): boolean {
  if (!product.categories || !Array.isArray(product.categories)) return false
  return product.categories.some((c) => {
    if (typeof c === 'object' && c !== null && 'slug' in c) {
      return c.slug === categorySlug
    }
    return false
  })
}

type Props = {
  products: Product[]
  heading?: string | null
  categories: Category[]
}

export const ShopProductListClient: React.FC<Props> = ({ products, heading, categories }) => {
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  const toggleCategory = useCallback((slug: string) => {
    setActiveCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }, [])

  const filteredProducts = useMemo(() => {
    if (activeCategories.length === 0) return products
    return products.filter((p) => activeCategories.some((cat) => productHasCategory(p, cat)))
  }, [products, activeCategories])

  const resultCount = filteredProducts.length
  const totalCount = products.length

  return (
    <section id="products" className="py-8 md:py-10 lg:py-12 bg-ff-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Heading */}
        {heading && (
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ff-near-black mb-8">
            {heading}
          </h2>
        )}

        {/* Category chips + result count */}
        <div className="flex flex-wrap items-center gap-3 mb-8 lg:mb-10">
          {categories.map((cat) => {
            const isActive = activeCategories.includes(cat.slug)
            return (
              <button
                key={cat.slug}
                onClick={() => toggleCategory(cat.slug)}
                className={`
                  inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'border-ff-near-black bg-ff-near-black text-white'
                      : 'border-ff-charcoal/30 bg-white text-ff-charcoal hover:border-ff-charcoal'
                  }
                `}
              >
                {cat.title}
                {isActive && <span className="text-white/80 text-xs leading-none">✕</span>}
              </button>
            )
          })}

          <span className="ml-auto text-sm text-ff-charcoal/60">
            Showing {resultCount} of {totalCount} Products
          </span>
        </div>

        {/* Product grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={() => setQuickViewProduct(product)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-ff-charcoal/50 text-lg">No products found in this category.</p>
            <button
              onClick={() => setActiveCategories([])}
              className="mt-4 text-sm font-medium text-ff-near-black underline underline-offset-2 hover:no-underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </section>
  )
}

/* ────────────── Product Card ────────────── */

function ProductCard({ product, onQuickView }: { product: Product; onQuickView: () => void }) {
  const image = getFirstImage(product)
  const price = product.priceInEUR
  const stock = product.inventory ?? 0
  const isOutOfStock = stock === 0

  return (
    <div className="group relative rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-3/4 overflow-hidden bg-[#ECE5DE]">
          {isOutOfStock && (
            <div className="absolute top-3 left-3 z-10 rounded-full bg-ff-charcoal/80 text-white text-[11px] font-semibold uppercase tracking-wider px-3 py-1">
              Out of stock
            </div>
          )}
          {!isOutOfStock && stock > 0 && stock < 10 && (
            <div className="absolute top-3 left-3 z-10 rounded-full bg-amber-600/90 text-white text-[11px] font-semibold uppercase tracking-wider px-3 py-1">
              Only {stock} left
            </div>
          )}
          {image ? (
            <Media
              resource={image}
              imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              className="w-full h-full"
              fill
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-ff-charcoal/30 text-sm">No image</span>
            </div>
          )}

          {/* Quick View overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-center pb-4">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onQuickView()
              }}
              className="
                translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                transition-all duration-300
                inline-flex items-center gap-2 rounded-full bg-ff-near-black text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider
                hover:bg-ff-charcoal-dark
              "
            >
              <Eye className="w-4 h-4" />
              Quick View
            </button>
          </div>
        </div>
      </Link>

      {/* Info: name + price + cart */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm font-semibold text-ff-near-black leading-snug">
            {product.title}
          </h3>
          {typeof price === 'number' && (
            <Price amount={price} className="text-sm font-bold text-ff-near-black mt-1" />
          )}
        </div>
        <div
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <AddToCart
            product={product}
            className="w-10 h-10 rounded-full bg-ff-near-black text-white flex items-center justify-center hover:bg-ff-charcoal-dark transition-colors shadow-md"
            ariaLabel={`Add ${product.title} to cart`}
          >
            <ShoppingCart className="w-4 h-4" aria-hidden />
          </AddToCart>
        </div>
      </div>
    </div>
  )
}
