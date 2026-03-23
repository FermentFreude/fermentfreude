// mongosh script: Check production DB for shop page and product IDs
// Usage: mongosh "<prod-connection-string>" --quiet --file scripts/check-prod-shop.js

var shopPage = db.pages.findOne({ slug: 'shop' })
if (!shopPage) {
  print('No shop page found in production')
} else {
  print('Shop page ID: ' + shopPage._id)
  if (shopPage.layout) {
    shopPage.layout.forEach(function (b, i) {
      print('Block ' + i + ': ' + b.blockType)
    })
  }
}

var products = db.products.find({}, { slug: 1, title: 1 }).toArray()
print('\nProducts found: ' + products.length)
products.forEach(function (p) {
  var slug = typeof p.slug === 'object' ? p.slug.de : p.slug
  var title = typeof p.title === 'object' ? p.title.de || '' : p.title || ''
  print(p._id + ' | ' + slug + ' | ' + title)
})
