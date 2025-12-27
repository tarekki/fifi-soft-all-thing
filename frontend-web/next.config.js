/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable file watching in Docker to reduce memory usage
  // تعطيل مراقبة الملفات في Docker لتقليل استهلاك الذاكرة
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000, // Check for changes every second
      aggregateTimeout: 300, // Delay before rebuilding
      ignored: ['**/node_modules', '**/.git', '**/.next'],
    }
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig

