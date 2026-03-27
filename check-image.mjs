import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

// Test: simulate what happens when seed processes an image then Payload re-processes it
const filePath = path.join(process.cwd(), 'seed-assets/media/workshops/lakto.png')
const inputBuffer = fs.readFileSync(filePath)

console.log('--- Step 1: Seed optimizedFile processing ---')
let pipeline = sharp(inputBuffer)
const meta = await pipeline.metadata()
console.log('Source:', meta.width, 'x', meta.height, '(' + inputBuffer.length + ' bytes)')

pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true })
const seedOutput = await pipeline.webp({ quality: 80, effort: 6 }).toBuffer()
const seedMeta = await sharp(seedOutput).metadata()
console.log(
  'After seed:',
  seedMeta.width,
  'x',
  seedMeta.height,
  '(' + seedOutput.length + ' bytes)',
)

console.log('\n--- Step 2: Simulating Payload resizeOptions (2560x2560 inside) ---')
const payloadResize = await sharp(seedOutput)
  .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
  .toBuffer()
const prMeta = await sharp(payloadResize).metadata()
console.log(
  'After resize:',
  prMeta.width,
  'x',
  prMeta.height,
  '(' + payloadResize.length + ' bytes)',
)

console.log('\n--- Step 3: Simulating Payload formatOptions (webp q82) ---')
const payloadFormat = await sharp(payloadResize).webp({ quality: 82 }).toBuffer()
const pfMeta = await sharp(payloadFormat).metadata()
console.log(
  'After format:',
  pfMeta.width,
  'x',
  pfMeta.height,
  '(' + payloadFormat.length + ' bytes)',
)

console.log('\n--- Step 4: Simulating Payload card imageSize (800x800 inside, webp q80) ---')
const cardSize = await sharp(payloadFormat)
  .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 80 })
  .toBuffer()
const csMeta = await sharp(cardSize).metadata()
console.log('Card size:', csMeta.width, 'x', csMeta.height, '(' + cardSize.length + ' bytes)')
