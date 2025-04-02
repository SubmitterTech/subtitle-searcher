/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  reactStrictMode: isProd ? false : true,
  images: {
    unoptimized: true,
  },
  assetPrefix: isProd ? '/subtitle-searcher/' : '',
  basePath: isProd ? '/subtitle-searcher' : '',
  output: 'export'
};

export default nextConfig;
