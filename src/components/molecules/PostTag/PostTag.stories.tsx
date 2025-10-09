import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PostTag } from './PostTag';

const meta: Meta<typeof PostTag> = {
  title: 'Molecules/Post/PostTag',
  component: PostTag,
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
          'Tag component for posts featuring dynamic colors, counter, and removable state. Uses colors from utils to generate consistent tag colors.',
      },
    },
  },
  args: {
    label: 'bitcoin',
  },
  argTypes: {
    onClick: { action: 'clicked' },
    onClose: { action: 'closed' },
    color: { control: 'color' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <PostTag {...args} />,
};

// States without counter or close
export const Default: Story = {
  args: {
    label: 'bitcoin',
    selected: false,
    showClose: false,
  },
  render: (args) => <PostTag {...args} />,
};

export const Hover: Story = {
  args: {
    label: 'bitcoin',
    selected: false,
    showClose: false,
  },
  render: (args) => <PostTag {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Hover state shows an inset glow effect matching the tag color. Try hovering over the tag.',
      },
    },
    pseudo: { hover: true },
  },
};

export const Selected: Story = {
  args: {
    label: 'bitcoin',
    selected: true,
    showClose: false,
  },
  render: (args) => <PostTag {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Selected state shows a solid border matching the tag color.',
      },
    },
  },
};

// With counter
export const WithCounter: Story = {
  args: {
    label: 'bitcoin',
    count: 16,
    selected: false,
    showClose: false,
  },
  render: (args) => <PostTag {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Tag with counter showing the number of posts.',
      },
    },
  },
};

export const WithCounterSelected: Story = {
  args: {
    label: 'bitcoin',
    count: 16,
    selected: true,
    showClose: false,
  },
  render: (args) => <PostTag {...args} />,
};

// With close button
export const WithClose: Story = {
  args: {
    label: 'bitcoin',
    selected: false,
    showClose: true,
  },
  render: (args) => <PostTag {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Tag with close button for removing the tag.',
      },
    },
  },
};

export const WithCloseSelected: Story = {
  args: {
    label: 'bitcoin',
    selected: true,
    showClose: true,
  },
  render: (args) => <PostTag {...args} />,
};

// All color variants
export const ColorVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PostTag label="bitcoin" color="#FF9900" />
      <PostTag label="synonym" color="#FF0000" />
      <PostTag label="pubky" color="#FC00FF" />
      <PostTag label="nostr" color="#004BFF" />
      <PostTag label="lightning" color="#00F0FF" />
      <PostTag label="sats" color="#00FF5D" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Different color variants. Colors are automatically generated from tag labels using generateRandomColor utility.',
      },
    },
  },
};

// All states showcase
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <PostTag label="bitcoin" />
        <PostTag label="bitcoin" showClose />
        <PostTag label="bitcoin" selected />
        <PostTag label="bitcoin" showClose selected />
      </div>
      <div className="flex flex-wrap gap-2">
        <PostTag label="bitcoin" count={16} />
        <PostTag label="bitcoin" count={16} showClose />
        <PostTag label="bitcoin" count={16} selected />
        <PostTag label="bitcoin" count={16} showClose selected />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all possible states: default, with close, selected, with counter.',
      },
    },
  },
};

// Interactive demo with callbacks
export const WithCallbacks: Story = {
  args: {
    label: 'bitcoin',
    count: 16,
    showClose: true,
    selected: false,
    onClick: () => console.log('Tag clicked'),
    onClose: () => console.log('Close clicked'),
  },
  render: (args) => <PostTag {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive tag with click and close callbacks. Check the console when clicking.',
      },
    },
  },
};

// Real-world usage example
export const TagList: Story = {
  render: () => (
    <div className="flex max-w-md flex-wrap gap-2">
      <PostTag label="bitcoin" count={142} selected />
      <PostTag label="synonym" count={89} />
      <PostTag label="pubky" count={56} />
      <PostTag label="nostr" count={34} />
      <PostTag label="lightning" count={23} />
      <PostTag label="sats" count={12} />
      <PostTag label="hodl" count={8} />
      <PostTag label="btc" count={156} selected />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of a tag list as it might appear in a real application.',
      },
    },
  },
};
