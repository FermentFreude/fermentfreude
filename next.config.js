import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
      // Vercel Blob storage
      {
        hostname: '*.public.blob.vercel-storage.com',
        protocol: 'https',
      },
      // Unsplash (fallback images for gastronomy slider)
      {
        hostname: 'images.unsplash.com',
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
