import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['pubky-app-specs'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@synonymdev/pubky');
    }

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
};

export default nextConfig;
