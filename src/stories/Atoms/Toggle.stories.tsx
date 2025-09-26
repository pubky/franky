import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Toggle } from '@/components/atoms/Toggle/Toggle';
import { Home, Settings, Heart, Star } from 'lucide-react';

const meta: Meta<typeof Toggle> = {
  title: 'Atoms/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A toggle component built on Radix UI primitives with customizable variants and sizes.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
      description: 'The visual style variant of the toggle',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: 'The size of the toggle',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled',
    },
    pressed: {
      control: 'boolean',
      description: 'Whether the toggle is in pressed/on state',
    },
    children: {
      control: 'text',
      description: 'The content inside the toggle',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: 'Toggle',
  },
};

// Variants
export const DefaultVariant: Story = {
  args: {
    children: 'Default Toggle',
    variant: 'default',
  },
};

export const OutlineVariant: Story = {
  args: {
    children: 'Outline Toggle',
    variant: 'outline',
  },
};

// Sizes
export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Toggle',
    size: 'lg',
  },
};

// States
export const Pressed: Story = {
  args: {
    children: 'Pressed Toggle',
    pressed: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Toggle',
    disabled: true,
  },
};

export const DisabledPressed: Story = {
  args: {
    children: 'Disabled Pressed',
    disabled: true,
    pressed: true,
  },
};

// With Icons
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Home className="size-4" />
        Home
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    children: <Settings className="size-4" />,
    'aria-label': 'Settings',
  },
};

export const WithIconPressed: Story = {
  args: {
    children: (
      <>
        <Heart className="size-4" />
        Liked
      </>
    ),
    pressed: true,
  },
};

// Interactive examples
export const Interactive: Story = {
  args: {
    children: 'Click me',
  },
  parameters: {
    docs: {
      description: {
        story: 'An interactive toggle that you can click to see state changes.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Toggle variant="default">Default</Toggle>
        <Toggle variant="default" pressed>
          Default Pressed
        </Toggle>
      </div>
      <div className="flex gap-2">
        <Toggle variant="outline">Outline</Toggle>
        <Toggle variant="outline" pressed>
          Outline Pressed
        </Toggle>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available variants in both normal and pressed states.',
      },
    },
  },
};

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle size="sm">Small</Toggle>
      <Toggle size="default">Default</Toggle>
      <Toggle size="lg">Large</Toggle>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available sizes for comparison.',
      },
    },
  },
};

// Icon showcase
export const IconShowcase: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle aria-label="Home">
        <Home className="size-4" />
      </Toggle>
      <Toggle aria-label="Settings">
        <Settings className="size-4" />
      </Toggle>
      <Toggle aria-label="Like">
        <Heart className="size-4" />
      </Toggle>
      <Toggle aria-label="Star">
        <Star className="size-4" />
      </Toggle>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon-only toggles with proper accessibility labels.',
      },
    },
  },
};

// Accessibility example
export const AccessibilityExample: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="notifications" className="block text-sm font-medium mb-2">
          Notifications
        </label>
        <Toggle id="notifications" aria-label="Toggle notifications">
          <Settings className="size-4" />
        </Toggle>
      </div>
      <div>
        <label htmlFor="dark-mode" className="block text-sm font-medium mb-2">
          Dark Mode
        </label>
        <Toggle id="dark-mode" aria-label="Toggle dark mode">
          Dark Mode
        </Toggle>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples showing proper accessibility with labels and ARIA attributes.',
      },
    },
  },
};
