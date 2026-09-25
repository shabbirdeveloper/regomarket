import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Modern formats first — important for slower mountain-area connections.
    formats: ["image/avif", "image/webp"],
    qualities: [72, 75],
    deviceSizes: [375, 430, 640, 768, 1024, 1280, 1440, 1920],
    remotePatterns: [
      // Unsplash — interim photography (free commercial licence) until sellers upload their own
      { protocol: "https", hostname: "images.unsplash.com" },
      // Cloudinary (media CDN) — see lib/media.ts
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Supabase Storage
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
