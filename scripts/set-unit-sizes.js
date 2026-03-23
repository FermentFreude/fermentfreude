// mongosh script: Set unitSize, weightGrams, volumeML for food products
// Run: mongosh "$DB_URL" scripts/set-unit-sizes.js

const updates = [
  { slug: 'classic-kimchi', unitSize: { de: '260g Glas', en: '260g jar' }, weightGrams: 260 },
  {
    slug: 'fermentierte-curryzwiebel',
    unitSize: { de: '260g Glas', en: '260g jar' },
    weightGrams: 260,
  },
  {
    slug: 'fermentierte-rote-rueben',
    unitSize: { de: '260g Glas', en: '260g jar' },
    weightGrams: 260,
  },
  {
    slug: 'kaeferbohnen-tempeh',
    unitSize: { de: '200g Frischpackung', en: '200g fresh pack' },
    weightGrams: 200,
  },
  {
    slug: 'organic-kombucha',
    unitSize: { de: '250ml Flasche', en: '250ml bottle' },
    volumeML: 250,
  },
]

print('\n=== Setting unit sizes ===\n')

updates.forEach(function (u) {
  var setObj = { unitSize: u.unitSize }
  if (u.weightGrams) setObj.weightGrams = u.weightGrams
  if (u.volumeML) setObj.volumeML = u.volumeML
  var r = db.products.updateOne({ slug: u.slug }, { $set: setObj })
  print((r.modifiedCount > 0 ? '  ok ' : '  -- ') + u.slug)
})

print('\nDone.\n')
