import { revalidateTag } from 'next/cache'

export async function GET() {
  // Revalidate the header cache tag
  revalidateTag('global_header')
  
  return Response.json({
    status: 'ok',
    message: 'Cache revalidated',
    revalidated: true,
  })
}
