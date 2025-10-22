/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is stable in Next.js 15, no experimental flag needed
  // Removed CSP headers that might be causing redirect loops
  
  // Fix workspace root detection issue
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig
