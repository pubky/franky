import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PostHeader } from './PostHeader';

const meta: Meta<typeof PostHeader> = {
  title: 'Molecules/Post/PostHeader',
  component: PostHeader,
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
    avatarSrc: '/images/avatar.png',
    displayName: 'This is a text',
    label: 'Label',
    timeLabel: '15m',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <PostHeader {...args} /> };
