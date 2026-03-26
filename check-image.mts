import path from 'path'
import { IMAGE_PRESETS, optimizedFile } from './src/scripts/seed-image-utils.ts'

async function main() {
  const workshopsDir = path.resolve(process.cwd(), 'seed-assets/media/workshops')
  const result = await optimizedFile(path.join(workshopsDir, 'lakto.png'), IMAGE_PRESETS.card)
  console.log('Name:', result.name)
  console.log('Size:', result.size, 'bytes')
  console.log('Mimetype:', result.mimetype)
  console.log('Data length:', result.data.length, 'bytes')
  console.log('Is Buffer?', Buffer.isBuffer(result.data))
}

main()
