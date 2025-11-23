import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

const nextConfig = withPWA({
  dest: "public",
  disable: !isProd, // disable PWA in development
})({
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },

  // ⛔ Required for next-pwa (forces Webpack mode)
  webpack: (config: any) => {
    return config;
  },

  // ✅ Tell Next.js NOT to auto-use Turbopack
  // Otherwise build fails
  webpackBuildWorker: false,
  turbo: false,
});

export default nextConfig;
