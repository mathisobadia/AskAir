/** @type {import('next').NextConfig} */

const nextConfig = {
  serverExternalPackages: ["airtable"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
