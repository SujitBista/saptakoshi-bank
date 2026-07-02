import type { NextConfig } from "next";
import path from "path";

const backendUrl = (
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:4000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Required when accessing the dev server through nginx on 127.0.0.1:8081.
  allowedDevOrigins: ["127.0.0.1"],
  transpilePackages: ["@saptakoshi/shared"],
  turbopack: {
    root: path.join(__dirname, ".."),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
