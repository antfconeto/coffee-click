import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'app-coffee-1.s3.sa-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      }
    ]
  }
};

export default nextConfig;
