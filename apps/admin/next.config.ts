import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@omnistay/ui", "@omnistay/shared-types", "@omnistay/api-client"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
