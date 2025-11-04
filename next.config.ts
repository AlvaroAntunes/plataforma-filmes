// next.config.js - More flexible version
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // OBRIGATÓRIO para Docker
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Remove console.* no build de produção
  compiler: {
    removeConsole: true,
  },
  
  images: {
    remotePatterns: [
      // Google Drive domains - ADICIONE ESTES
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.usercontent.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      // Allow any HTTPS domain (more flexible for testing)
      {
        protocol: 'https',
        hostname: '**',
      },
      // Specific domains (more secure for production)
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'commondatastorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
}

module.exports = nextConfig