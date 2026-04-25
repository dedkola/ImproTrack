import type { NextConfig } from "next";

const allowedDevOrigins = Array.from(
  new Set(
    [
      "127.0.0.1",
      "localhost",
      ...(process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(",").map((origin) =>
        origin.trim(),
      ) ?? []),
    ].filter(Boolean),
  ),
);

const nextConfig: NextConfig = {
  allowedDevOrigins,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year in seconds
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
