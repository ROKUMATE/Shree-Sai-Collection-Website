/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a self-contained server in .next/standalone for the Docker image
  output: "standalone",
};

module.exports = nextConfig;
