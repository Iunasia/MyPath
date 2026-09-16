import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin.",
        destination: "/admin",
        permanent: true,
      },
      {
        source: "/universities.",
        destination: "/universities",
        permanent: true,
      },
      {
        source: "/scholarships.",
        destination: "/scholarships",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
