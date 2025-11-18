import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
  // Empty turbopack config to silence the warning
  // We're using webpack (via --webpack flag) due to our WebAssembly requirements
  turbopack: {},
};

export default nextConfig;
