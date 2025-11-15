import type { Meta, StoryObj } from '@storybook/nextjs';
import { PostMain } from './PostMain';
import { PostThreadSpacer } from '@/atoms';

const meta = {
  title: 'Organisms/PostMain',
  component: PostMain,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    postId: {
      control: 'text',
      description: 'The ID of the post to display',
    },
    isReply: {
      control: 'boolean',
      description: 'Whether to show the thread connector on the left',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof PostMain>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    postId: 'user123:post456',
    isReply: false,
    hasReplies: false,
  },
};

export const WithThreadConnector: Story = {
  args: {
    postId: 'user123:post789',
    isReply: true,
    hasReplies: false,
  },
};

export const WithReplies: Story = {
  args: {
    postId: 'user123:post-with-replies',
    isReply: false,
    hasReplies: true,
  },
};

export const TimelineExample: Story = {
  args: {
    postId: 'timeline-example',
  },
  render: () => {
    return (
      <>
        {/* Post with replies - bottom-left radius removed */}
        <PostMain postId="user123:post1" isReply={false} hasReplies={true} />
        <PostThreadSpacer />
        <PostMain postId="user456:post2" isReply={true} hasReplies={false} />
        <PostThreadSpacer />
        <PostMain postId="user789:post3" isReply={true} hasReplies={false} />
        <div className="h-4" />
        {/* Standalone post - normal border radius */}
        <PostMain postId="user101:post4" isReply={false} hasReplies={false} />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of posts in a timeline with thread connectors. Note how the first post has its bottom-left border radius removed to connect with the replies below.',
      },
    },
  },
};

export const ThreadedConversation: Story = {
  args: {
    postId: 'threaded-conversation',
  },
  render: () => {
    return (
      <>
        <PostMain postId="user123:original-post" isReply={false} hasReplies={true} />
        <PostThreadSpacer />
        <PostMain postId="user456:reply1" isReply={true} hasReplies={false} isLastReply={false} />
        <PostThreadSpacer />
        <PostMain postId="user789:reply2" isReply={true} hasReplies={false} isLastReply={true} />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstration of a threaded conversation with connecting lines between posts. The original post has its bottom-left corner flattened to connect visually with replies. The last reply uses the "last" variant, stopping the line at the curve.',
      },
    },
  },
};
