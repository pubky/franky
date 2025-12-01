import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Home } from './Home';

const meta: Meta<typeof Home> = {
  title: 'Templates/Home',
  component: Home,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main home template that displays posts from users you follow. Includes placeholder content and a logout button.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};
