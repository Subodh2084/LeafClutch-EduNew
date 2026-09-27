import type { NextConfig } from "next";

// Uploaded images are served from Supabase Storage's public URLs.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/**`)] : [],
  },
  experimental: {
    serverActions: {
      // Largest upload is a 10 MB curriculum PDF, plus multipart overhead.
      bodySizeLimit: "11mb",
    },
  },
};

export default nextConfig;
