import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Lets phones and laptops on your Wi-Fi or Tailscale open the dev server.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "100.*.*.*", "*.local", "**.ts.net"],
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
