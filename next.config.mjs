/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Capacitor static export
  output: process.env.BUILD_TARGET === 'capacitor' ? 'export' : undefined,

  images: {
    // Use unoptimized images for static export (Capacitor)
    unoptimized: process.env.BUILD_TARGET === 'capacitor',
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },

  // Trailing slashes help with static file serving
  trailingSlash: process.env.BUILD_TARGET === 'capacitor',
};

export default nextConfig;
