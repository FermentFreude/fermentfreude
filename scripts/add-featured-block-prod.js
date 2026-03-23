// mongosh script: Add featuredProductCards block to production shop page
// Usage: mongosh "<prod-connection-string>" --quiet --file scripts/add-featured-block-prod.js

var shopPageId = ObjectId('69bc61aeca66db9e1ad045cd')

var kimchiId = ObjectId('69bc80514889efa4f93c7ae0')
var curryId = ObjectId('69bc80504889efa4f93c7ad7')
var roteId = ObjectId('69bc80504889efa4f93c7ace')
var tempehId = ObjectId('69bc80524889efa4f93c7ae9')

var existing = db.pages.findOne({
  _id: shopPageId,
  'layout.blockType': 'featuredProductCards',
})

if (existing) {
  print('featuredProductCards block already exists on shop page - skipping')
} else {
  var featuredBlock = {
    blockType: 'featuredProductCards',
    heading: {
      de: 'Unsere Bestseller',
      en: 'Our Bestsellers',
    },
    subheading: {
      de: 'Handgemachte Fermente aus Wien \u2013 nat\u00fcrlich, lebendig, voller Geschmack.',
      en: 'Handmade ferments from Vienna \u2013 natural, alive, full of flavour.',
    },
    products: [kimchiId, curryId, roteId],
    cardColors: [{ color: '#4b6043' }, { color: '#b8860b' }, { color: '#6b4226' }],
    bannerProduct: tempehId,
    bannerColor: '#555954',
    ctaLabel: {
      de: 'Jetzt bestellen',
      en: 'Order Now',
    },
    id: new ObjectId().toString(),
  }

  var result = db.pages.updateOne(
    { _id: shopPageId },
    {
      $push: {
        layout: {
          $each: [featuredBlock],
          $position: 1,
        },
      },
    },
  )
  print('Update result: ' + JSON.stringify(result))
}

var updated = db.pages.findOne({ _id: shopPageId })
updated.layout.forEach(function (b, i) {
  print('Block ' + i + ': ' + b.blockType)
})
