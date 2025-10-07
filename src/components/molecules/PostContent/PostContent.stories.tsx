import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PostContent } from './PostContent';

const meta: Meta<typeof PostContent> = {
  title: 'Molecules/Post/PostContent',
  component: PostContent,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#05050A' },
        { name: 'light', value: '#F2F2F7' },
      ],
    },
  },
  args: {
    text: 'I have said it before: If you don’t believe me or don’t get it, I don’t have time to try to convince you.',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <PostContent {...args} /> };
