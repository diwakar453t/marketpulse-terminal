import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'economictimes.indiatimes.com',
      'images.moneycontrol.com',
      'static.toiimg.com',
      'www.hindustantimes.com',
      'c.ndtvimg.com',
      'bbci.co.uk',
      'images.wsj.net',
      'image.cnbcfm.com',
      's.yimg.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
