import withPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  reactStrictMode: isProd ? false : true,
  images: {
    unoptimized: true,
  },
  assetPrefix: isProd ? '/subtitle-searcher/' : '',
  basePath: isProd ? '/subtitle-searcher' : '',
  output: 'export',
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
})(nextConfig);
