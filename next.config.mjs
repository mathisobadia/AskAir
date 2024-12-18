/** @type {import('next').NextConfig} */

const nextConfig = {
  serverExternalPackages: ["airtable"],
  async rewrites() {},
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
