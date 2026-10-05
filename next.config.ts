import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 ships a native .node binary. Next.js's file tracer
  // (used to build the Vercel serverless function bundle) can miss it,
  // so force it to be included for every route that might touch the DB.
  outputFileTracingIncludes: {
    "/*": ["node_modules/better-sqlite3/build/Release/**/*"],
  },
};

export default nextConfig;
