// Fix products in the current database
// Usage: mongosh <connection-string> scripts/fix-products.js

// 1. Set productType on all products
print('--- Setting productType ---')

db.products.updateOne({ slug: 'classic-kimchi' }, { $set: { productType: 'jarred' } })
print('Classic Kimchi → jarred')

db.products.updateOne({ slug: 'fermentierte-curryzwiebel' }, { $set: { productType: 'jarred' } })
print('Curryzwiebel → jarred')

db.products.updateOne({ slug: 'fermentierte-rote-rueben' }, { $set: { productType: 'jarred' } })
print('Rote Rüben → jarred')

db.products.updateOne({ slug: 'kaeferbohnen-tempeh' }, { $set: { productType: 'fresh' } })
print('Tempeh → fresh')

db.products.updateOne({ slug: 'kombucha-apple-carrot-2' }, { $set: { productType: 'bottled' } })
print('Kombucha → bottled')

db.products.updateOne(
  { slug: 'basic-fermentation-course' },
  { $set: { productType: 'digital-course' } },
)
print('Grundkurs → digital-course')

db.products.updateOne({ slug: 'workshop-kombucha' }, { $set: { productType: 'workshop' } })
db.products.updateOne({ slug: 'workshop-lakto' }, { $set: { productType: 'workshop' } })
db.products.updateOne({ slug: 'workshop-tempeh' }, { $set: { productType: 'workshop' } })
print('3 Workshops → workshop')

// 2. Fix Tempeh price (was wrong, should be 790 = €7.90)
print('\n--- Fixing prices ---')
db.products.updateOne(
  { slug: 'kaeferbohnen-tempeh' },
  { $set: { priceInEUR: 790, priceInEUREnabled: true } },
)
print('Tempeh price → 790 (€7.90)')

// 3. Fix Kombucha (set price, fix slug, set inventory)
db.products.updateOne(
  { slug: 'kombucha-apple-carrot-2' },
  {
    $set: {
      slug: 'organic-kombucha',
      priceInEUR: 590,
      priceInEUREnabled: true,
      inventory: 50,
      generateSlug: false,
    },
  },
)
print('Kombucha → slug:organic-kombucha, price:590 (€5.90), inv:50')

// 4. Enable priceInEUR on all products that have a price
db.products.updateMany(
  { priceInEUR: { $exists: true, $ne: null } },
  { $set: { priceInEUREnabled: true } },
)
print('priceInEUREnabled set on all priced products')

// 5. Add Workshop + Online-Kurs categories if missing
print('\n--- Categories ---')
if (!db.categories.findOne({ 'title.de': 'Workshop' })) {
  db.categories.insertOne({
    title: { de: 'Workshop', en: 'Workshop' },
    slug: 'workshop',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  print('Created Workshop category')
} else {
  print('Workshop category already exists')
}

if (!db.categories.findOne({ 'title.de': 'Online-Kurs' })) {
  db.categories.insertOne({
    title: { de: 'Online-Kurs', en: 'Online Course' },
    slug: 'online-kurs',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  print('Created Online-Kurs category')
} else {
  print('Online-Kurs category already exists')
}

// 6. Assign categories to workshop and course products
const wCat = db.categories.findOne({ 'title.de': 'Workshop' })
const cCat = db.categories.findOne({ 'title.de': 'Online-Kurs' })

if (wCat) {
  db.products.updateMany(
    { slug: { $in: ['workshop-kombucha', 'workshop-lakto', 'workshop-tempeh'] } },
    { $set: { categories: [wCat._id] } },
  )
  print('Assigned Workshop category to 3 workshops')
}

if (cCat) {
  db.products.updateOne({ slug: 'basic-fermentation-course' }, { $set: { categories: [cCat._id] } })
  print('Assigned Online-Kurs to Grundkurs')
}

// 7. Verify
print('\n--- Final state ---')
db.products
  .find({}, { title: 1, slug: 1, productType: 1, priceInEUR: 1, inventory: 1, categories: 1 })
  .sort({ 'title.de': 1 })
  .forEach((doc) => {
    const t = typeof doc.title === 'object' ? doc.title.de : doc.title
    print(
      t +
        ' | type:' +
        (doc.productType || 'MISSING') +
        ' | €' +
        (doc.priceInEUR ? (doc.priceInEUR / 100).toFixed(2) : 'NONE') +
        ' | inv:' +
        (doc.inventory || 0) +
        ' | cats:' +
        (doc.categories || []).length,
    )
  })

print('\n=== DONE ===')
