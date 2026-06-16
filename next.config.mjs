/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace("https://", "") ?? "",
      },
    ],
  },
};

export default nextConfig;
