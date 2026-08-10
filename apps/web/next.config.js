/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow accessing Next.js dev server over local network IP addresses
  allowedDevHosts: ["localhost", "127.0.0.1", "192.168.1.19"],
  devIndicators: false,
};

export default nextConfig;


