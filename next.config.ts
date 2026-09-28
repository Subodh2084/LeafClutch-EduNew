import type { NextConfig } from "next";

// Uploaded images are served from Supabase Storage's public URLs; Udemy bonus
// course covers come from Udemy's image CDN.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      ...(supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/**`)] : []),
      { protocol: "https", hostname: "*.udemycdn.com", pathname: "/course/**" },
    ],
  },
  // The curriculum PDF route reads the logo from disk; make sure it ships with the function.
  outputFileTracingIncludes: {
    "/api/courses/*/curriculum/pdf": ["./public/companyLogo/leafclutch-logo.png"],
  },
  experimental: {
    serverActions: {
      // Largest upload is a 10 MB curriculum PDF, plus multipart overhead.
      bodySizeLimit: "11mb",
    },
  },
};

export default nextConfig;
