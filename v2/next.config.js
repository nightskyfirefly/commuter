/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is stable in Next.js 14, no experimental flag needed
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *", // Allow embedding from any origin (for showcase page)
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
