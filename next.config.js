/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a self-contained server in .next/standalone for the Docker image.
  // Vercel builds its own serverless output and standalone only confuses it,
  // so it is disabled there (VERCEL=1 is set automatically on every build).
  output: process.env.VERCEL ? undefined : "standalone",
};

module.exports = nextConfig;
