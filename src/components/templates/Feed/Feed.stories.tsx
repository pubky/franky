import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Feed } from './Feed';

const meta: Meta<typeof Feed> = {
  title: 'Templates/Feed',
  component: Feed,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main feed template that displays posts from users you follow. Includes placeholder content and a logout button.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
