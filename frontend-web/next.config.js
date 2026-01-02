/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable Turbopack
  // تعطيل Turbopack
  experimental: {
    turbo: false,
  },
  // Disable file watching in Docker to reduce memory usage
  // تعطيل مراقبة الملفات في Docker لتقليل استهلاك الذاكرة
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 2000, // Check for changes every 2 seconds (reduced frequency)
      aggregateTimeout: 500, // Delay before rebuilding
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.next/**',
        '**/dist/**',
        '**/build/**',
        '**/.turbo/**',
        '**/coverage/**',
        '**/*.log',
      ],
    }
    return config
  },
  // Optimize webpack for Docker
  // تحسين webpack لـ Docker
  webpack: (config, { isServer }) => {
    // Reduce memory usage
    // تقليل استهلاك الذاكرة
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
          },
        },
      }
    }
    
    // Reduce memory usage during build
    // تقليل استهلاك الذاكرة أثناء البناء
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    }
    
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
}

module.exports = nextConfig

