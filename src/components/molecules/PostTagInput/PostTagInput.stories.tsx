import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PostTagInput } from './PostTagInput';

const meta: Meta<typeof PostTagInput> = {
  title: 'Molecules/Post/PostTagInput',
  component: PostTagInput,
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
          'Input component for adding new tags. Features a dashed border, placeholder text, and optional emoji picker button.',
      },
    },
  },
  args: {
    placeholder: 'add tag',
  },
  argTypes: {
    onChange: { action: 'changed' },
    onSubmit: { action: 'submitted' },
    onEmojiClick: { action: 'emoji clicked' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <PostTagInput {...args} />,
};

// Empty state (hint)
export const Empty: Story = {
  args: {
    value: '',
    showEmojiPicker: false,
  },
  render: (args) => <PostTagInput {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Empty input showing placeholder text.',
      },
    },
  },
};

// With text (filled)
export const Filled: Story = {
  args: {
    value: 'bitcoin',
    showEmojiPicker: false,
  },
  render: (args) => <PostTagInput {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Input with text entered.',
      },
    },
  },
};

// With emoji picker
export const WithEmojiPicker: Story = {
  args: {
    value: '',
    showEmojiPicker: true,
  },
  render: (args) => <PostTagInput {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Input with emoji picker button.',
      },
    },
  },
};

export const WithEmojiPickerFilled: Story = {
  args: {
    value: 'bitcoin',
    showEmojiPicker: true,
  },
  render: (args) => <PostTagInput {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Input with text and emoji picker button.',
      },
    },
  },
};

// Interactive demo
export const Interactive: Story = {
  args: {
    showEmojiPicker: true,
    onChange: (value) => console.log('Changed:', value),
    onSubmit: (value) => console.log('Submitted:', value),
    onEmojiClick: () => console.log('Emoji picker clicked'),
  },
  render: (args) => <PostTagInput {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive input. Type and press Enter to submit. Check console for events.',
      },
    },
  },
};

// Custom placeholder
export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'enter tag name...',
    showEmojiPicker: false,
  },
  render: (args) => <PostTagInput {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Input with custom placeholder text.',
      },
    },
  },
};

// Auto focus
export const AutoFocus: Story = {
  args: {
    autoFocus: true,
    showEmojiPicker: false,
  },
  render: (args) => <PostTagInput {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Input with auto focus enabled.',
      },
    },
  },
};
