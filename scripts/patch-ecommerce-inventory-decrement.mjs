/**
 * @payloadcms/plugin-ecommerce's confirmOrder endpoint (endpoints/confirmOrder.js)
 * decrements product/variant inventory itself via raw payload.db.updateOne
 * calls, unconditionally for every item on the transaction — including
 * workshop products, which don't track physical inventory.
 *
 * This app already has its own Orders afterChange hook for this
 * (src/collections/Orders/decrementInventory.ts) that correctly skips
 * workshop/digital-course products and floors inventory at zero. Running
 * both means every physical-product order decrements inventory TWICE.
 *
 * Since the plugin has no config flag to disable its own decrement, we
 * remove that block directly. Re-applied on postinstall because
 * node_modules is not committed.
 */
import fs from 'fs'
import path from 'path'

const confirmOrderPath = path.join(
  process.cwd(),
  'node_modules/@payloadcms/plugin-ecommerce/dist/endpoints/confirmOrder.js',
)

if (!fs.existsSync(confirmOrderPath)) {
  console.warn('[patch-ecommerce-inventory-decrement] @payloadcms/plugin-ecommerce not found — skip')
  process.exit(0)
}

let content = fs.readFileSync(confirmOrderPath, 'utf8')

const alreadyPatchedMarker = '// [patch-ecommerce-inventory-decrement] removed — see src/collections/Orders/decrementInventory.ts'
if (content.includes(alreadyPatchedMarker)) {
  process.exit(0)
}

const before = `            if (paymentResponse.transactionID) {
                const transaction = await payload.findByID({
                    id: paymentResponse.transactionID,
                    collection: transactionsSlug,
                    depth: 0,
                    select: {
                        id: true,
                        items: true
                    }
                });
                if (transaction && Array.isArray(transaction.items) && transaction.items.length > 0) {
                    for (const item of transaction.items){
                        if (item.variant) {
                            const id = typeof item.variant === 'object' ? item.variant.id : item.variant;
                            await payload.db.updateOne({
                                id,
                                collection: variantsSlug,
                                data: {
                                    inventory: {
                                        $inc: item.quantity * -1
                                    }
                                }
                            });
                        } else if (item.product) {
                            const id = typeof item.product === 'object' ? item.product.id : item.product;
                            await payload.db.updateOne({
                                id,
                                collection: productsSlug,
                                data: {
                                    inventory: {
                                        $inc: item.quantity * -1
                                    }
                                }
                            });
                        }
                    }
                }
            }`

const after = `            ${alreadyPatchedMarker}`

if (!content.includes(before)) {
  console.warn(
    '[patch-ecommerce-inventory-decrement] Expected block not found — plugin version may have changed, manual check needed',
  )
  process.exit(0)
}

content = content.replace(before, after)
fs.writeFileSync(confirmOrderPath, content)
console.log('[patch-ecommerce-inventory-decrement] Removed duplicate inventory decrement from confirmOrder endpoint')
