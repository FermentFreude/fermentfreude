# Performance Optimization - Fermentfreude

## ⚡ Building a High-Performance E-Commerce Website

This guide ensures Fermentfreude achieves **top-tier performance** with fast load times, smooth interactions, and excellent Core Web Vitals scores.

---

## 📋 Table of Contents

1. [Performance Targets](#performance-targets)
2. [Next.js Optimization](#nextjs-optimization)
3. [Image Optimization](#image-optimization)
4. [Code Splitting & Lazy Loading](#code-splitting--lazy-loading)
5. [Caching Strategies](#caching-strategies)
6. [Database Optimization](#database-optimization)
7. [Bundle Size Optimization](#bundle-size-optimization)
8. [Core Web Vitals](#core-web-vitals)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Performance Checklist](#performance-checklist)

---

## 🎯 Performance Targets

### Lighthouse Scores (Target: > 90)

- **Performance:** 90-100
- **Accessibility:** 90-100
- **Best Practices:** 90-100
- **SEO:** 90-100

### Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** (First Input Delay) | ≤ 100ms | 100ms - 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

### Load Time Targets

- **First Contentful Paint (FCP):** < 1.8s
- **Time to Interactive (TTI):** < 3.8s
- **Total Page Size:** < 1.5 MB
- **JavaScript Bundle:** < 500 KB

---

## ⚡ Next.js Optimization

### App Router Best Practices

```tsx
// ✅ Use Server Components by default (faster)
// src/app/products/page.tsx
export default async function ProductsPage() {
  const products = await fetchProducts() // Server-side fetch
  
  return (
    <div>
      <h1>Products</h1>
      <ProductGrid products={products} />
    </div>
  )
}

// ✅ Client Components only when needed
'use client'

export function AddToCartButton({ productId }) {
  const [isAdding, setIsAdding] = useState(false)
  // Interactive logic...
}
```

### Metadata Optimization

```tsx
// src/app/layout.tsx or page.tsx
export const metadata = {
  title: 'Fermentfreude - Artisan Fermented Foods',
  description: 'Austrian fermentation workshops and premium tempeh products',
  openGraph: {
    images: ['/og-image.jpg'],
  },
}

// Dynamic metadata for products
export async function generateMetadata({ params }) {
  const product = await fetchProduct(params.slug)
  
  return {
    title: `${product.title} | Fermentfreude`,
    description: product.description,
  }
}
```

### Static Generation (SSG)

```tsx
// Generate static pages at build time (fastest!)
export async function generateStaticParams() {
  const products = await fetchProducts()
  
  return products.map((product) => ({
    slug: product.slug,
  }))
}

// This page is generated at build time
export default async function ProductPage({ params }) {
  const product = await fetchProduct(params.slug)
  return <ProductDetail product={product} />
}
```

### Incremental Static Regeneration (ISR)

```tsx
// Revalidate every hour
export const revalidate = 3600

export default async function ProductsPage() {
  const products = await fetchProducts()
  return <ProductGrid products={products} />
}
```

---

## 🖼️ Image Optimization

### Next.js Image Component

```tsx
import Image from 'next/image'

// ✅ GOOD - Optimized with Next.js
<Image
  src="/tempeh-workshop.jpg"
  alt="Tempeh making workshop"
  width={800}
  height={600}
  quality={90}
  priority  // For hero images (LCP)
  placeholder="blur"  // Show blur while loading
  blurDataURL="/tempeh-placeholder.jpg"
/>

// ❌ BAD - Regular img tag
<img src="/large-image.jpg" />
```

### Image Best Practices

```tsx
// Priority for above-the-fold images
<Image
  src="/hero.jpg"
  priority  // Loads immediately
  {...props}
/>

// Lazy load for below-the-fold
<Image
  src="/product.jpg"
  loading="lazy"  // Default behavior
  {...props}
/>

// Responsive images
<Image
  src="/product.jpg"
  sizes="(max-width: 768px) 100vw, 50vw"
  {...props}
/>
```

### Image Formats

```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],  // Modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

### Image Compression

```bash
# Optimize images before upload
npm install -g sharp-cli

# Compress JPG
sharp input.jpg -o output.jpg --quality 85

# Convert to WebP
sharp input.jpg -o output.webp
```

**Guidelines:**
- **JPG:** Quality 80-90 for photos
- **PNG:** For graphics with transparency
- **SVG:** For icons and logos
- **WebP/AVIF:** Modern formats (Next.js handles automatically)

---

## 📦 Code Splitting & Lazy Loading

### Dynamic Imports

```tsx
import dynamic from 'next/dynamic'

// ✅ Lazy load heavy components
const WorkshopBookingWidget = dynamic(
  () => import('@/components/BookingWidget'),
  {
    loading: () => <div>Loading booking system...</div>,
    ssr: false,  // Don't render on server
  }
)

// ✅ Load on interaction
const NewsletterModal = dynamic(
  () => import('@/components/NewsletterModal'),
  { ssr: false }
)

export function HomePage() {
  const [showNewsletter, setShowNewsletter] = useState(false)
  
  return (
    <>
      <button onClick={() => setShowNewsletter(true)}>
        Subscribe
      </button>
      
      {showNewsletter && <NewsletterModal />}
    </>
  )
}
```

### Route-Based Code Splitting

```tsx
// Next.js automatically splits by route
// Each page = separate bundle

// src/app/workshops/page.tsx  → workshops.js
// src/app/products/page.tsx   → products.js
// src/app/cart/page.tsx       → cart.js
```

### Component-Level Splitting

```tsx
// Split large third-party libraries
const ReactMarkdown = dynamic(() => import('react-markdown'))
const Chart = dynamic(() => import('react-chartjs-2'), { ssr: false })
```

---

## 💾 Caching Strategies

### HTTP Caching Headers

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=120',
          },
        ],
      },
    ]
  },
}
```

### API Response Caching

```typescript
// Cache product data for 1 hour
export async function GET(request: Request) {
  const products = await fetchProducts()
  
  return new Response(JSON.stringify(products), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
```

### React Query / SWR

```tsx
// Install: npm install swr
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function ProductList() {
  const { data, error, isLoading } = useSWR(
    '/api/products',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 60000, // 1 minute
    }
  )
  
  if (isLoading) return <Loading />
  return <div>{/* Render products */}</div>
}
```

### Service Workers (PWA)

```javascript
// Optional: Add PWA capabilities
// Install next-pwa
module.exports = withPWA({
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  },
})
```

---

## 🗄️ Database Optimization

### MongoDB Indexing

```javascript
// src/payload/collections/Products/index.ts
const Products: CollectionConfig = {
  slug: 'products',
  // Add indexes for frequently queried fields
  indexes: [
    {
      fields: { slug: 1 },
      unique: true,
    },
    {
      fields: { category: 1, price: 1 },
    },
  ],
}
```

### Query Optimization

```typescript
// ✅ GOOD - Select only needed fields
const products = await payload.find({
  collection: 'products',
  depth: 0,  // Don't populate relationships
  select: {
    title: true,
    slug: true,
    price: true,
    image: true,
  },
  limit: 20,
})

// ❌ BAD - Fetch everything
const products = await payload.find({
  collection: 'products',
  depth: 3,  // Expensive population
})
```

### Pagination

```typescript
// Implement pagination for large datasets
const PAGE_SIZE = 24

export async function getProducts(page = 1) {
  const products = await payload.find({
    collection: 'products',
    limit: PAGE_SIZE,
    page: page,
  })
  
  return products
}
```

### Connection Pooling

```javascript
// MongoDB connection automatically pools
// Configure in payload.config.ts
db: mongooseAdapter({
  url: process.env.DATABASE_URI,
  mongooseOptions: {
    maxPoolSize: 10,
    minPoolSize: 2,
  },
}),
```

---

## 📊 Bundle Size Optimization

### Analyze Bundle

```bash
# Install bundle analyzer
npm install @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... config
})

# Run analysis
ANALYZE=true npm run build
```

### Tree Shaking

```typescript
// ✅ GOOD - Import only what you need
import { format } from 'date-fns'

// ❌ BAD - Imports entire library
import _ from 'lodash'

// ✅ GOOD - Import specific function
import debounce from 'lodash/debounce'
```

### Remove Unused Dependencies

```bash
# Find unused dependencies
npm install -g depcheck
depcheck

# Remove unused packages
npm uninstall unused-package
```

### Minification

```javascript
// Next.js minifies automatically in production
// Enabled by default with SWC compiler

// next.config.js
module.exports = {
  swcMinify: true,  // Fast minification
}
```

---

## 📈 Core Web Vitals

### Largest Contentful Paint (LCP)

**Target: < 2.5s**

```tsx
// ✅ Optimize hero images
<Image
  src="/hero.jpg"
  priority  // Preload critical image
  sizes="100vw"
  quality={90}
  {...props}
/>

// ✅ Preload fonts
// src/app/layout.tsx
<link
  rel="preload"
  href="/fonts/inter.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>

// ✅ Use CDN for static assets (Vercel does this automatically)
```

### First Input Delay (FID)

**Target: < 100ms**

```tsx
// ✅ Defer non-critical JavaScript
useEffect(() => {
  // Load analytics after page interactive
  import('./analytics').then(({ initAnalytics }) => {
    initAnalytics()
  })
}, [])

// ✅ Use Web Workers for heavy computation
const worker = new Worker('/worker.js')
worker.postMessage({ data: heavyData })

// ✅ Debounce expensive operations
import { debounce } from 'lodash'

const handleSearch = debounce((query) => {
  searchProducts(query)
}, 300)
```

### Cumulative Layout Shift (CLS)

**Target: < 0.1**

```tsx
// ✅ Set dimensions for images
<Image
  src="/product.jpg"
  width={400}
  height={300}  // Prevents layout shift
  alt="Product"
/>

// ✅ Reserve space for dynamic content
<div style={{ minHeight: '200px' }}>
  {loading ? <Skeleton /> : <Content />}
</div>

// ✅ Use CSS aspect ratio
.video-container {
  aspect-ratio: 16 / 9;
}

// ❌ Avoid inserting content above existing content
// ❌ Avoid ads/embeds without reserved space
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics

```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Web Vitals Tracking

```tsx
// src/app/layout.tsx
import { sendToAnalytics } from './analytics'

export function reportWebVitals(metric) {
  // Send to analytics service
  sendToAnalytics(metric)
  
  // Log locally
  console.log(metric)
}
```

### Google Lighthouse

```bash
# Run Lighthouse audit
# Chrome DevTools → Lighthouse tab

# Or CLI
npm install -g lighthouse
lighthouse https://fermentfreude.com --view
```

### Performance Monitoring Tools

- **Vercel Analytics:** Built-in (recommended)
- **Google Analytics 4:** User behavior
- **Sentry:** Error tracking + performance
- **WebPageTest:** Detailed analysis
- **GTmetrix:** Performance reports

---

## ✅ Performance Checklist

### Images
- [ ] All images use Next.js `<Image>` component
- [ ] Hero images have `priority` attribute
- [ ] Images have `width` and `height` set
- [ ] Modern formats (WebP/AVIF) enabled
- [ ] Images compressed (< 200KB)
- [ ] Lazy loading for below-fold images

### Code
- [ ] Code splitting implemented
- [ ] Dynamic imports for heavy components
- [ ] No unused dependencies
- [ ] Bundle size analyzed
- [ ] Tree shaking optimized
- [ ] CSS properly scoped

### Caching
- [ ] Static assets cached (1 year)
- [ ] API responses cached appropriately
- [ ] ISR enabled for dynamic pages
- [ ] CDN configured (Vercel Edge Network)

### Database
- [ ] Indexes on queried fields
- [ ] Connection pooling configured
- [ ] Pagination implemented
- [ ] Only necessary fields fetched

### Fonts
- [ ] Fonts preloaded
- [ ] Font display: swap or optional
- [ ] Subset fonts (remove unused characters)
- [ ] Self-host fonts (no Google Fonts CDN)

### Third-Party Scripts
- [ ] Analytics loaded after interactive
- [ ] Stripe.js loaded on demand
- [ ] No render-blocking scripts
- [ ] Scripts deferred or async

### Core Web Vitals
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Monitored in production

---

## 🚀 Production Optimizations

### Vercel Deployment

```bash
# Automatic optimizations:
# ✅ Global CDN (Edge Network)
# ✅ Image optimization
# ✅ Automatic caching
# ✅ Edge functions
# ✅ DDoS protection
# ✅ SSL/TLS
```

### Environment Variables

```bash
# Production .env
NODE_ENV=production
NEXT_PUBLIC_IS_LIVE=true

# Enable Vercel optimizations
VERCEL=1
VERCEL_ENV=production
```

### Build Optimization

```json
// package.json
{
  "scripts": {
    "build": "next build",
    "analyze": "ANALYZE=true next build"
  }
}
```

---

## 📚 Resources

- **Next.js Performance:** https://nextjs.org/docs/advanced-features/measuring-performance
- **Web.dev:** https://web.dev/vitals/
- **Vercel Analytics:** https://vercel.com/analytics
- **Lighthouse:** https://developers.google.com/web/tools/lighthouse
- **Bundle Analyzer:** https://www.npmjs.com/package/@next/bundle-analyzer

---

**Last Updated:** February 12, 2026  
**Target Lighthouse Score:** 90+
