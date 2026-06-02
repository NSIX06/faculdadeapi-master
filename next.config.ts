import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/proxy/:path*",
        destination: "https://faculdadeapi.vercel.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;
