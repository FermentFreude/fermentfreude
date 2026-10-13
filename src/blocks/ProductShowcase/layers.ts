/**
 * Product Showcase image layers — kept in code, not in the CMS (only the text
 * of the showcase is editable there).
 *
 * Files live in `public/showcase/<shop-product-slug>/`:
 *   product.png      the product alone, transparent background
 *   ingredients.png  the floating ingredients, transparent background,
 *                    same canvas size as product.png so the layers line up
 *
 * A product only uses these once it's listed here (width/height = the PNG's
 * pixel size). Until then the slide falls back to the CMS cut-out.
 */
export type ShowcaseLayer = { src: string; width: number; height: number }

export const SHOWCASE_LAYERS: Record<
  string,
  { product: ShowcaseLayer; ingredients?: ShowcaseLayer }
> = {}
