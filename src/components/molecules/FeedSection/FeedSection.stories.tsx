import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import * as Libs from '@/libs';
import { FeedSection } from './FeedSection';

const meta: Meta<typeof FeedSection> = {
  title: 'Molecules/FeedSection',
  component: FeedSection,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Feed navigation component showing available feeds and option to create new ones.',
      },
    },
  },
  args: {
    showCreateButton: true,
  },
  argTypes: {
    showCreateButton: {
      control: 'boolean',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutCreateButton: Story = {
  args: {
    showCreateButton: false,
  },
};

export const CustomFeeds: Story = {
  args: {
    feeds: [
      { icon: Libs.UsersRound, label: 'Following' },
      { icon: Libs.Pencil, label: 'Based bitcoin' },
      { icon: Libs.Pencil, label: 'Mining industry' },
    ],
    showCreateButton: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Feed section with custom feeds (as used in mobile drawer).',
      },
    },
  },
};
