import type { NextConfig } from 'next';

type RemotePattern = { protocol: 'http' | 'https'; hostname: string; port?: string; pathname?: string };

// Parse API base URL from env to build the Next.js image remote pattern dynamically.
// Falls back gracefully if the var is missing (e.g. in CI without the .env.local).
function apiRemotePattern(): RemotePattern | null {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) return null;
  try {
    const url = new URL(base);
    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port,
      pathname: '/**',
    };
  } catch {
    return null;
  }
}

const apiPattern = apiRemotePattern();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      ...(apiPattern ? [apiPattern] : []),
      // Catch-all for any backend/CDN over HTTP (static assets, local dev)
      { protocol: 'http',  hostname: '**', pathname: '/**' },
      // Catch-all for any HTTPS host — covers R2, S3, CloudFront, or any CDN
      { protocol: 'https', hostname: '**', pathname: '/**' },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.microsoft.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion', 'framer-motion'],
  webpack: (config, { dev }) => {
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
