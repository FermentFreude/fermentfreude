/**
 * build-showcase-images.ts — turns the Kittl layer exports into web-ready,
 * aligned layers for the Product Showcase.
 *
 *   pnpm showcase:images
 *
 * Input  (large originals, NOT committed):  public/showcase/<slug>/product.png
 *                                            public/showcase/<slug>/ingredients.png
 * Output (committed, used by the site):      public/showcase/<slug>/product.webp
 *                                            public/showcase/<slug>/ingredients.webp
 *                                            src/blocks/ProductShowcase/layers.ts
 *
 * Both layers of a product end up on the same canvas (the ingredients canvas,
 * OUT_WIDTH px wide) so they line up when stacked. If the two exports have the
 * same proportions they are simply scaled together. If not (e.g. the product
 * was exported cropped tight), the product is placed in the middle of the
 * ingredients at FALLBACK_SCALE of their width — check it visually and export
 * both from the same artboard for an exact match.
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = path.resolve(process.cwd(), 'public/showcase')
const LAYERS_FILE = path.resolve(process.cwd(), 'src/blocks/ProductShowcase/layers.ts')
const OUT_WIDTH = 2400
/** Product width as a share of the ingredients' content width, when canvases differ */
const FALLBACK_SCALE = 0.44
/** Vertical position of the product centre in that case (0 top → 1 bottom) */
const FALLBACK_CENTER_Y = 0.55

type Box = { x0: number; y0: number; x1: number; y1: number }

/** Bounding box of the visible (non-transparent) pixels */
async function contentBox(input: Buffer): Promise<Box> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  let x0 = info.width,
    y0 = info.height,
    x1 = 0,
    y1 = 0
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (data[(y * info.width + x) * 4 + 3] > 24) {
        if (x < x0) x0 = x
        if (y < y0) y0 = y
        if (x > x1) x1 = x
        if (y > y1) y1 = y
      }
  return { x0, y0, x1, y1 }
}

const webp = (img: sharp.Sharp) => img.webp({ quality: 88, alphaQuality: 95, effort: 6 })

async function buildProduct(slug: string) {
  const dir = path.join(ROOT, slug)
  const productSrc = path.join(dir, 'product.png')
  const ingredientsSrc = path.join(dir, 'ingredients.png')
  if (!fs.existsSync(productSrc)) {
    console.log(`⏭  ${slug}: no product.png — skipped`)
    return null
  }
  const hasIngredients = fs.existsSync(ingredientsSrc)

  // Canvas = the ingredients export (or the product's, without ingredients)
  const canvasMeta = await sharp(hasIngredients ? ingredientsSrc : productSrc).metadata()
  const scale = OUT_WIDTH / canvasMeta.width!
  const W = OUT_WIDTH
  const H = Math.round(canvasMeta.height! * scale)

  const productMeta = await sharp(productSrc).metadata()
  const sameRatio =
    !hasIngredients ||
    Math.abs(productMeta.width! / productMeta.height! - canvasMeta.width! / canvasMeta.height!) <
      0.01

  let product: Buffer
  if (sameRatio) {
    product = await sharp(productSrc).resize(W, H, { fit: 'fill' }).png().toBuffer()
  } else {
    // Tight-cropped product: trim it, size it relative to the ingredients, centre it
    const ingr = await sharp(ingredientsSrc).resize(W, H, { fit: 'fill' }).png().toBuffer()
    const ib = await contentBox(ingr)
    const trimmed = await sharp(productSrc).trim({ threshold: 1 }).png().toBuffer()
    const targetW = Math.round((ib.x1 - ib.x0) * FALLBACK_SCALE)
    const resized = await sharp(trimmed).resize({ width: targetW }).png().toBuffer()
    const rm = await sharp(resized).metadata()
    const left = Math.round((ib.x0 + ib.x1) / 2 - rm.width! / 2)
    const top = Math.round(H * FALLBACK_CENTER_Y - rm.height! / 2)
    product = await sharp({
      create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: resized, left: Math.max(0, left), top: Math.max(0, top) }])
      .png()
      .toBuffer()
    console.log(
      `⚠️  ${slug}: product and ingredients have different canvases — product centred automatically, please check`,
    )
  }
  await webp(sharp(product)).toFile(path.join(dir, 'product.webp'))
  if (hasIngredients) {
    await webp(sharp(ingredientsSrc).resize(W, H, { fit: 'fill' })).toFile(
      path.join(dir, 'ingredients.webp'),
    )
  }
  const kb = (f: string) => Math.round(fs.statSync(path.join(dir, f)).size / 1024)
  console.log(
    `✅ ${slug}: ${W}×${H} — product ${kb('product.webp')} KB${hasIngredients ? `, ingredients ${kb('ingredients.webp')} KB` : ''}`,
  )
  return { slug, W, H, hasIngredients }
}

async function main() {
  const slugs = fs
    .readdirSync(ROOT)
    .filter((f) => fs.statSync(path.join(ROOT, f)).isDirectory())
    .sort()
  const built = []
  for (const slug of slugs) {
    const r = await buildProduct(slug)
    if (r) built.push(r)
  }
  const entries = built
    .map(
      (b) =>
        `  '${b.slug}': {\n    product: { src: '/showcase/${b.slug}/product.webp', width: ${b.W}, height: ${b.H} },\n` +
        (b.hasIngredients
          ? `    ingredients: { src: '/showcase/${b.slug}/ingredients.webp', width: ${b.W}, height: ${b.H} },\n`
          : '') +
        `  },`,
    )
    .join('\n')
  const header = fs.readFileSync(LAYERS_FILE, 'utf8').split('export const SHOWCASE_LAYERS')[0]
  fs.writeFileSync(
    LAYERS_FILE,
    `${header}export const SHOWCASE_LAYERS: Record<\n  string,\n  { product: ShowcaseLayer; ingredients?: ShowcaseLayer }\n> = {\n${entries}\n}\n`,
  )
  console.log(`\n📝 layers.ts updated (${built.length} products)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
