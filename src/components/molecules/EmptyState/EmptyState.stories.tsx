import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { EmptyState } from './EmptyState';
import * as Libs from '@/libs';

const meta: Meta<typeof EmptyState> = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: Libs.Inbox,
    title: 'No items found',
    description: 'Try adjusting your filters or search criteria.',
  },
};

export const WithAction: Story = {
  args: {
    icon: Libs.StickyNote,
    title: 'No posts yet',
    description: 'Share your thoughts and ideas with the world.',
    action: {
      label: 'Create your first post',
      onClick: () => alert('Create post clicked!'),
    },
  },
};

export const NoPosts: Story = {
  args: {
    icon: Libs.StickyNote,
    title: 'No posts yet',
    description: 'Your posts will appear here.',
  },
};

export const NoFollowers: Story = {
  args: {
    icon: Libs.Users,
    title: 'No followers yet',
    description: 'People who follow you will appear here.',
  },
};

export const NoNotifications: Story = {
  args: {
    icon: Libs.Bell,
    title: 'No notifications yet',
    description: "When you get notifications, they'll show up here.",
  },
};

export const WithoutIcon: Story = {
  args: {
    title: 'No results',
    description: 'Try a different search term.',
  },
};
