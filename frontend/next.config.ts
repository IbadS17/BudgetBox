import type { NextConfig } from "next";
import withPWA from "next-pwa";

const config: NextConfig = {
  experimental: {
    serverActions: {},
  },
  turbopack: {}, // <-- IMPORTANT fix
  webpack: undefined, // disable webpack custom config completely
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
})(config);
