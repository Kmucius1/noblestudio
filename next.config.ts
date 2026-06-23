import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.higgsfield.ai" },
      { protocol: "https", hostname: "*.klingai.com" },
      { protocol: "https", hostname: "*.runwayml.com" },
      { protocol: "https", hostname: "*.fal.run" },
    ],
  },
};

export default nextConfig;
