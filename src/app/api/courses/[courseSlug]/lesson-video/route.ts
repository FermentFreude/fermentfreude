import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const COURSE_SLUGS = ['basic-fermentation'] as const
const DEFAULT_TTL_SECONDS = 60

const s3Client =
  process.env.R2_ENDPOINT &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY
    ? new S3Client({
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      })
    : null

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string }> },
) {
  try {
    const { courseSlug } = await params
    if (!COURSE_SLUGS.includes(courseSlug as (typeof COURSE_SLUGS)[number])) {
      return NextResponse.json(
        { error: 'Unknown course' },
        { status: 400 },
      )
    }

    const search = request.nextUrl.searchParams
    const lessonId = search.get('lessonId')
    const videoMediaId = search.get('videoMediaId')

    if (!lessonId || !videoMediaId) {
      return NextResponse.json(
        { error: 'lessonId and videoMediaId are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Login required' },
        { status: 401 },
      )
    }

    // Check that the user has an order for this course
    // 1) Resolve the product by slug, e.g. "basic-fermentation-course"
    const productSlugForCourse =
      courseSlug === 'basic-fermentation'
        ? 'basic-fermentation-course'
        : `${courseSlug}-course`

    const productResult = await payload.find({
      collection: 'products',
      where: { slug: { equals: productSlugForCourse } },
      limit: 1,
      user,
      overrideAccess: false,
    })

    const product = productResult.docs[0] as { id?: string } | undefined
    const productId =
      product && typeof product.id === 'string' ? product.id : null

    if (!productId) {
      return NextResponse.json(
        { error: 'Course product not found' },
        { status: 404 },
      )
    }

    // 2) Verify the user has an order whose items reference this product ID
    const orders = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { customer: { equals: user.id } },
          { status: { in: ['processing', 'completed'] } },
          { 'items.product': { in: [productId] } },
        ],
      },
      limit: 1,
      user,
      overrideAccess: false,
    })

    if (!orders.docs.length) {
      return NextResponse.json(
        { error: 'No access to this course' },
        { status: 403 },
      )
    }

    // Look up the media doc to get filename / URL
    const mediaDoc = await payload.findByID({
      collection: 'media',
      id: videoMediaId,
      depth: 0,
      user,
      overrideAccess: false,
    })

    const filename =
      typeof (mediaDoc as any)?.filename === 'string'
        ? (mediaDoc as any).filename
        : null
    let url =
      typeof (mediaDoc as any)?.url === 'string'
        ? (mediaDoc as any).url
        : null

    if (!filename && !url) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 },
      )
    }

    const bucket = process.env.R2_BUCKET
    const ttl =
      Number(process.env.VIDEO_SIGNED_URL_TTL_SECONDS || '') ||
      DEFAULT_TTL_SECONDS

    if (bucket && filename && s3Client) {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: `media/${filename}`,
      })

      // Cast to any to avoid AWS Smithy v3/v4 type incompatibilities while keeping runtime behavior
      url = await getSignedUrl(s3Client as any, command as any, { expiresIn: ttl })
    }

    if (!url) {
      return NextResponse.json(
        { error: 'Unable to generate video URL' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      url,
      expiresIn: ttl,
      lessonId,
    })
  } catch (err) {
    console.error('lesson-video error', err)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 },
    )
  }
}

