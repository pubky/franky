import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { DialogFeedback } from '@/components/molecules/DialogFeedback/DialogFeedback';

const meta = {
  title: 'Molecules/DialogFeedback',
  component: DialogFeedback,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    avatar: { control: 'text' },
  },
  args: {
    name: 'John Doe',
    avatar: '',
  },
} satisfies Meta<typeof DialogFeedback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'John Doe',
    avatar: '',
  },
};

export const WithAvatar: Story = {
  args: {
    name: 'Jane Doe',
    // Replace with a valid image URL if available in the project
    avatar: '/images/logo-pubky-ring.svg',
  },
};
