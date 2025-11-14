import type { Preview } from '@storybook/nextjs-vite';
import { create } from 'storybook/theming';
import '../src/app/globals.css';

// Custom background theme matching app's background color from globals.css
const customBackgroundTheme = create({
  base: 'dark',
  appBg: 'oklch(0.118 0.014 284.115)', // --background in :root
  appContentBg: 'oklch(0.118 0.014 284.115)',
});

const preview: Preview = {
  parameters: {
    docs: {
      theme: customBackgroundTheme,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
