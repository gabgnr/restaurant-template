/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mnlikcoiyzlhdbotesjz.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
