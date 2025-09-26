/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['ar'],
    defaultLocale: 'ar',
  },
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;