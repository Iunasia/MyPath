import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
