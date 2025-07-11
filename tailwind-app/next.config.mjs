/** @type {import('next').NextConfig} */
const nextConfig = {
  // 配置静态文件目录
  async rewrites() {
    return [
      {
        source: '/practice/:path*',
        destination: '/api/static?path=practice/:path*',
      },
      {
        source: '/images/:path*',
        destination: '/api/static?path=images/:path*',
      },
    ];
  },
  webpack: (config) => {
    // 确保路径别名配置正确
    return config;
  },
};

export default nextConfig;
