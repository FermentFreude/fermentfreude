import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // All pages except /admin and /api
        source: '/((?!admin|api).*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Allow preview iframe in admin (Payload's live preview)
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
      // Cloudflare R2 public URL (production)
      {
        hostname: 'pub-c70f47169a1846d79fdab1a41ed2dc7f.r2.dev',
        protocol: 'https',
      },
      // Cloudflare R2 public URL (staging)
      {
        hostname: 'pub-0cf8a1c18a2f4f6b982dbbbf233430a5.r2.dev',
        protocol: 'https',
      },
    ],
  },
  reactStrictMode: true,
  redirects,
  // Heavy packages resolved once on the server, not re-bundled
  serverExternalPackages: ['sharp', 'graphql'],
  experimental: {
    // Tree-shake large libraries — only import what's used
    // NOTE: Do NOT add @payloadcms/* here — Payload uses its own import map system
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      'date-fns',
      'embla-carousel-react',
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig)
