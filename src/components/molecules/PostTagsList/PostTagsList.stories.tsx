import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PostTagsList } from './PostTagsList';

const meta: Meta<typeof PostTagsList> = {
  title: 'Molecules/Post/PostTagsList',
  component: PostTagsList,
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
          'Complete tag management component. Displays a list of tags with optional counters, selection state, and an input to add new tags.',
      },
    },
  },
  args: {
    showInput: true,
    showEmojiPicker: false,
    showTagClose: false,
  },
  argTypes: {
    onTagClick: { action: 'tag clicked' },
    onTagClose: { action: 'tag closed' },
    onTagAdd: { action: 'tag added' },
    onEmojiClick: { action: 'emoji clicked' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className="w-96">
      <PostTagsList {...args} />
    </div>
  ),
};

// Empty state - just input
export const Empty: Story = {
  args: {
    tags: [],
    showInput: true,
  },
  render: (args) => (
    <div className="w-96">
      <PostTagsList {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Empty state showing only the add tag input.',
      },
    },
  },
};

// With tags and counters
export const WithTags: Story = {
  args: {
    tags: [
      { label: 'bitcoin', count: 21, selected: true },
      { label: 'based', count: 7 },
      { label: '👀', count: 3 },
    ],
    showInput: true,
  },
  render: (args) => (
    <div className="w-96">
      <PostTagsList {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tag list with counters. First tag is selected.',
      },
    },
  },
};

// With tags and close buttons
export const WithCloseButtons: Story = {
  args: {
    tags: [
      { label: 'bitcoin', count: 21 },
      { label: 'based', count: 7 },
      { label: '👀', count: 3 },
    ],
    showInput: true,
    showTagClose: true,
  },
  render: (args) => (
    <div className="w-96">
      <PostTagsList {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tags with close buttons for removal.',
      },
    },
  },
};

// With emoji picker
export const WithEmojiPicker: Story = {
  args: {
    tags: [
      { label: 'bitcoin', count: 21 },
      { label: 'based', count: 7 },
    ],
    showInput: true,
    showEmojiPicker: true,
  },
  render: (args) => (
    <div className="w-96">
      <PostTagsList {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tag list with emoji picker button in the input.',
      },
    },
  },
};

// Without input
export const WithoutInput: Story = {
  args: {
    tags: [
      { label: 'bitcoin', count: 21 },
      { label: 'based', count: 7 },
      { label: '👀', count: 3 },
    ],
    showInput: false,
  },
  render: (args) => (
    <div className="w-96">
      <PostTagsList {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Display-only mode without input.',
      },
    },
  },
};

// Many tags (wrapping)
export const ManyTags: Story = {
  args: {
    tags: [
      { label: 'bitcoin', count: 142, selected: true },
      { label: 'synonym', count: 89 },
      { label: 'pubky', count: 56 },
      { label: 'nostr', count: 34 },
      { label: 'lightning', count: 23 },
      { label: 'sats', count: 12 },
      { label: 'hodl', count: 8 },
      { label: 'btc', count: 156 },
      { label: 'crypto', count: 45 },
      { label: 'web3', count: 28 },
    ],
    showInput: true,
    showEmojiPicker: true,
  },
  render: (args) => (
    <div className="w-96">
      <PostTagsList {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Many tags demonstrating wrap behavior.',
      },
    },
  },
};

// Interactive demo
export const Interactive: Story = {
  args: {
    tags: [
      { label: 'bitcoin', count: 21 },
      { label: 'based', count: 7 },
    ],
    showInput: true,
    showEmojiPicker: true,
    showTagClose: true,
    onTagClick: (tag, index) => console.log('Tag clicked:', tag, 'at index:', index),
    onTagClose: (tag, index) => console.log('Tag closed:', tag, 'at index:', index),
    onTagAdd: (label) => console.log('Tag added:', label),
    onEmojiClick: () => console.log('Emoji picker clicked'),
  },
  render: (args) => (
    <div className="w-96">
      <PostTagsList {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive demo. Check console for all events.',
      },
    },
  },
};

// Custom colors
export const CustomColors: Story = {
  args: {
    tags: [
      { label: 'bitcoin', count: 21, color: '#FF9900' },
      { label: 'ethereum', count: 15, color: '#627EEA' },
      { label: 'cardano', count: 8, color: '#0033AD' },
    ],
    showInput: true,
  },
  render: (args) => (
    <div className="w-96">
      <PostTagsList {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tags with custom colors.',
      },
    },
  },
};

// With add button instead of input
export const WithAddButton: Story = {
  args: {
    tags: [
      { label: 'bitcoin', count: 21 },
      { label: 'based', count: 7 },
      { label: '👀', count: 3 },
    ],
    showInput: false,
    showAddButton: true,
    addMode: true,
    onAddButtonClick: () => console.log('Add button clicked'),
  },
  render: (args) => (
    <div className="w-96">
      <PostTagsList {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Starts with a plus button; on click it transforms into the input.',
      },
    },
  },
};
