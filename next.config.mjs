/** @type {import('next').NextConfig} */
const r2Hostname = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace("https://", "") ?? "";

const nextConfig = {
  images: {
    remotePatterns: r2Hostname
      ? [{ protocol: "https", hostname: r2Hostname }]
      : [],
  },
};

export default nextConfig;
