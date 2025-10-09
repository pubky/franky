import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PostMain } from './PostMain';

const meta: Meta<typeof PostMain> = {
  title: 'Molecules/Post/PostMain',
  component: PostMain,
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
    displayName: 'Satoshi Nakamoto',
    label: '1YXP...7R32',
    timeLabel: '15m',
    text: 'I have said it before: If you don’t believe me or don’t get it, I don’t have time to try to convince you.',
    tags: [
      { label: 'bitcoin', count: 21, color: '#FF9900' },
      { label: 'based', count: 7, color: '#FF0000' },
      { label: '👀', count: 5, color: '#00F0FF' },
    ],
    showAddButton: true,
    showEmojiPicker: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[720px]">
      <PostMain {...args} />
    </div>
  ),
};

export const Mobile: Story = {
  render: (args) => (
    <div className="w-[375px]">
      <PostMain {...args} />
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story: 'Mobile layout with stacked Tags and Actions and tighter paddings.',
      },
    },
  },
};
