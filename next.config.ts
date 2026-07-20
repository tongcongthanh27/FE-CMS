import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8081/cms/:path*',
      },
    ];
  },
};

export default nextConfig;
