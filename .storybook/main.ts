import type { StorybookConfig } from '@storybook/nextjs-vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@chromatic-com/storybook', '@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
      '@/atoms': path.resolve(__dirname, '../src/components/atoms'),
      '@/molecules': path.resolve(__dirname, '../src/components/molecules'),
      '@/organisms': path.resolve(__dirname, '../src/components/organisms'),
      '@/templates': path.resolve(__dirname, '../src/components/templates'),
      '@/hooks': path.resolve(__dirname, '../src/hooks'),
      '@/libs': path.resolve(__dirname, '../src/libs'),
      '@/core': path.resolve(__dirname, '../src/core'),
      '@/config': path.resolve(__dirname, '../src/config'),
      '@/components': path.resolve(__dirname, '../src/components'),
    };
    return config;
  },
};
export default config;
