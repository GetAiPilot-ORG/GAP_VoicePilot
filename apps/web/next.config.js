/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  transpilePackages: ["@paper-design/shaders-react"],
  allowedDevOrigins: [
    "localhost:3002",
    "127.0.0.1:3002",
    "192.168.1.37:3002",
    "192.168.1.37",
    "*.loca.lt",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3002",
        "127.0.0.1:3002",
        "192.168.1.37:3002",
      ],
    },
  },
};

export default nextConfig;



