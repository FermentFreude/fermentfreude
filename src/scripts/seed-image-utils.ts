/**
 * Shared image utility for seed scripts.
 *
 * Reads a local image file and returns a Payload-compatible File object,
 * optionally optimizing it with sharp (resize + WebP conversion).
 *
 * This keeps storage small and fast — important even on Cloudflare R2 free tier (10 GB).
 *
 * Usage:
 *   import { optimizedFile } from '@/scripts/seed-image-utils'
 *   const file = await optimizedFile(path.join(imagesDir, 'photo.png'))
 *   // → returns { name: 'photo.webp', data: Buffer, mimetype: 'image/webp', size: ... }
 *
 *   // With custom max width:
 *   const file = await optimizedFile(path.join(imagesDir, 'Banner.png'), { maxWidth: 1920 })
 *
 *   // Skip optimization (SVGs, already-optimized files):
 *   const file = readLocalFile(path.join(imagesDir, 'logo.svg'))
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

// ── Max dimensions by image role ──────────────────────────────
// Hero/banner full-width images: max 1920px wide (covers any screen)
// Product/card images: max 1200px on longest side
// Thumbnails/logos: max 600px
// These match Next.js <Image> device sizes and keep blob storage lean.
export const IMAGE_PRESETS = {
  /** Full-width hero/banner images */
  hero: { maxWidth: 1920, quality: 80 },
  /** Product photos, cards, team portraits */
  card: { maxWidth: 1200, quality: 80 },
  /** Sponsor logos, icons, small UI images */
  logo: { maxWidth: 600, quality: 80 },
} as const

interface OptimizeOptions {
  /** Max width in pixels — image is resized proportionally if wider (default: 1920) */
  maxWidth?: number
  /** WebP quality 1-100 (default: 80 — visually lossless for photos) */
  quality?: number
  /** Force output format. Default: 'webp'. Use 'png' only for images requiring transparency with hard edges */
  format?: 'webp' | 'png' | 'jpeg'
}

/**
 * Read a local image, resize + convert to WebP, return Payload-compatible File object.
 * SVGs are passed through without conversion.
 *
 * Average savings: 80-90% vs raw PNGs from design tools.
 */
export async function optimizedFile(
  filePath: string,
  options?: OptimizeOptions,
): Promise<{ name: string; data: Buffer; mimetype: string; size: number }> {
  const ext = path.extname(filePath).slice(1).toLowerCase()

  // SVGs can't be rasterized — pass through as-is
  if (ext === 'svg') {
    return readLocalFile(filePath)
  }

  const { maxWidth = 1920, quality = 80, format = 'webp' } = options ?? {}

  const inputBuffer = fs.readFileSync(filePath)

  let pipeline = sharp(inputBuffer)

  // Resize if wider than maxWidth (proportional, never upscale)
  const metadata = await pipeline.metadata()
  if (metadata.width && metadata.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true })
  }

  // Convert to target format
  let outputBuffer: Buffer
  let mimetype: string
  let outputExt: string

  switch (format) {
    case 'jpeg':
      outputBuffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer()
      mimetype = 'image/jpeg'
      outputExt = 'jpg'
      break
    case 'png':
      outputBuffer = await pipeline.png({ quality, compressionLevel: 9 }).toBuffer()
      mimetype = 'image/png'
      outputExt = 'png'
      break
    case 'webp':
    default:
      outputBuffer = await pipeline.webp({ quality, effort: 6 }).toBuffer()
      mimetype = 'image/webp'
      outputExt = 'webp'
      break
  }

  // Replace extension in filename
  const baseName = path.basename(filePath, path.extname(filePath))
  const outputName = `${baseName}.${outputExt}`

  const originalKB = (inputBuffer.byteLength / 1024).toFixed(0)
  const outputKB = (outputBuffer.byteLength / 1024).toFixed(0)
  const savings = (((inputBuffer.byteLength - outputBuffer.byteLength) / inputBuffer.byteLength) * 100).toFixed(0)
  console.log(`   📦 ${path.basename(filePath)}: ${originalKB}KB → ${outputKB}KB (${savings}% smaller)`)

  return {
    name: outputName,
    data: outputBuffer,
    mimetype,
    size: outputBuffer.byteLength,
  }
}

/**
 * Read a local file without optimization — for SVGs, already-optimized files,
 * or any file that shouldn't be converted.
 */
export function readLocalFile(filePath: string): {
  name: string
  data: Buffer
  mimetype: string
  size: number
} {
  const data = fs.readFileSync(filePath)
  const ext = path.extname(filePath).slice(1).toLowerCase()
  const mimeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    gif: 'image/gif',
  }
  return {
    name: path.basename(filePath),
    data,
    mimetype: mimeMap[ext] || 'application/octet-stream',
    size: data.byteLength,
  }
}
