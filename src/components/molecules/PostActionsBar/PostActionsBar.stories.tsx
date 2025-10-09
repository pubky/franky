import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PostActionsBar } from './PostActionsBar';

const meta: Meta<typeof PostActionsBar> = {
  title: 'Molecules/Post/PostActionsBar',
  component: PostActionsBar,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#05050A' },
        { name: 'light', value: '#F2F2F7' },
      ],
    },
    docs: {
      description: {
        component:
          'Post action buttons bar featuring tag, reply, repost, bookmark, and more options. Used to interact with posts in the feed.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
  args: {
    tagCount: 15,
    replyCount: 7,
    repostCount: 3,
    isBookmarked: false,
  },
  argTypes: {
    tagCount: {
      control: { type: 'number', min: 0 },
      description: 'Number of tags on the post',
    },
    replyCount: {
      control: { type: 'number', min: 0 },
      description: 'Number of replies to the post',
    },
    repostCount: {
      control: { type: 'number', min: 0 },
      description: 'Number of reposts',
    },
    isBookmarked: {
      control: 'boolean',
      description: 'Whether the post is bookmarked',
    },
    onTagClick: { action: 'tag clicked' },
    onReplyClick: { action: 'reply clicked' },
    onRepostClick: { action: 'repost clicked' },
    onBookmarkClick: { action: 'bookmark clicked' },
    onMoreClick: { action: 'more clicked' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <PostActionsBar {...args} />,
};

export const Default: Story = {
  args: {
    tagCount: 15,
    replyCount: 7,
    repostCount: 3,
    isBookmarked: false,
  },
  render: (args) => <PostActionsBar {...args} />,
};

export const Bookmarked: Story = {
  args: {
    tagCount: 15,
    replyCount: 7,
    repostCount: 3,
    isBookmarked: true,
  },
  render: (args) => <PostActionsBar {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Shows the post actions bar with the bookmark button in active/filled state.',
      },
    },
  },
};

export const NoInteractions: Story = {
  args: {
    tagCount: 0,
    replyCount: 0,
    repostCount: 0,
    isBookmarked: false,
  },
  render: (args) => <PostActionsBar {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'A fresh post with no tags, replies, or reposts yet.',
      },
    },
  },
};

export const HighEngagement: Story = {
  args: {
    tagCount: 142,
    replyCount: 89,
    repostCount: 56,
    isBookmarked: true,
  },
  render: (args) => <PostActionsBar {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'A popular post with high engagement numbers.',
      },
    },
  },
};

export const WithCallbacks: Story = {
  args: {
    tagCount: 15,
    replyCount: 7,
    repostCount: 3,
    isBookmarked: false,
    onTagClick: () => console.log('Tag clicked'),
    onReplyClick: () => console.log('Reply clicked'),
    onRepostClick: () => console.log('Repost clicked'),
    onBookmarkClick: () => console.log('Bookmark clicked'),
    onMoreClick: () => console.log('More clicked'),
  },
  render: (args) => <PostActionsBar {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates all callbacks being triggered. Check the console when clicking buttons.',
      },
    },
  },
};
