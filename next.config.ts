import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Note: For large file uploads in session 5, we use Route Handlers
  // (default body size limit is 1MB). To increase it for very large
  // documents, configure in the upload route itself using formData().
};

export default nextConfig;
