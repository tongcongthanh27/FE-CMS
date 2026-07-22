import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/cms/:path*',
      },
      {
        source: '/cms/:path*',
        destination: 'http://localhost:8080/cms/:path*',
      }
    ];
  },
};

export default nextConfig;
