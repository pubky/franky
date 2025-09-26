import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Button } from '@/components/atoms/Button';
import { Download, Heart, Settings, Star, Trash2, ExternalLink, Plus, Minus } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile button component with multiple variants and sizes, built for flexibility and accessibility.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'brand', 'link', 'dark', 'dark-outline'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as a child component using Radix Slot',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    children: {
      control: 'text',
      description: 'The content inside the button',
    },
  },
  args: { onClick: fn() },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Variants
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Button',
  },
};

export const Brand: Story = {
  args: {
    variant: 'brand',
    children: 'Button',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Button',
  },
};

export const Dark: Story = {
  args: {
    variant: 'dark',
    children: 'Dark Button',
  },
};

export const DarkOutline: Story = {
  args: {
    variant: 'dark-outline',
    children: 'Dark Outline',
  },
};

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="brand">Brand</Button>
      <Button variant="link">Link</Button>
      <Button variant="dark">Dark</Button>
      <Button variant="dark-outline">Dark Outline</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants for comparison.',
      },
    },
  },
};

// Size Variants
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: <Settings className="h-4 w-4" />,
  },
};

// All Sizes Showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button sizes for comparison.',
      },
    },
  },
};

// With Icons
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button>
        <Download className="h-4 w-4" />
        Download
      </Button>
      <Button variant="destructive">
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
      <Button variant="outline">
        <Heart className="h-4 w-4" />
        Like
      </Button>
      <Button variant="secondary">
        <Star className="h-4 w-4" />
        Star
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with various icons to indicate different actions.',
      },
    },
  },
};

// Icon Only Buttons
export const IconOnly: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button size="icon" variant="ghost">
        <Settings className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="outline">
        <Heart className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="brand">
        <Star className="h-4 w-4" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon-only buttons for compact interfaces.',
      },
    },
  },
};

// States
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button disabled>Disabled Default</Button>
      <Button variant="destructive" disabled>
        Disabled Destructive
      </Button>
      <Button variant="outline" disabled>
        Disabled Outline
      </Button>
      <Button variant="ghost" disabled>
        Disabled Ghost
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled state buttons across different variants.',
      },
    },
  },
};

// Interactive Examples
export const Interactive: Story = {
  render: () => (
    <div className="space-y-4">
      <Button onClick={() => alert('Button clicked!')}>Click Me</Button>
      <Button variant="outline" onClick={() => console.log('Outline clicked')}>
        Console Log
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive buttons with click handlers.',
      },
    },
  },
};

// Loading States
export const LoadingStates: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button disabled>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Loading...
      </Button>
      <Button variant="outline" disabled>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Processing
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons in loading states with spinners.',
      },
    },
  },
};

// Button Groups
export const ButtonGroup: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <Minus className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm">
        1
      </Button>
      <Button variant="outline" size="sm">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button groups for related actions.',
      },
    },
  },
};

// Real-world Examples
export const ActionButtons: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button>Save Changes</Button>
        <Button variant="outline">Cancel</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="destructive">Delete Account</Button>
        <Button variant="outline">Keep Account</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="brand">Upgrade Plan</Button>
        <Button variant="ghost">Learn More</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common button combinations for different scenarios.',
      },
    },
  },
};

export const NavigationButtons: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline">Previous</Button>
        <Button>Next</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="link">Back to Dashboard</Button>
        <Button variant="outline">
          <ExternalLink className="h-4 w-4" />
          External Link
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Navigation and link-style buttons.',
      },
    },
  },
};

// Accessibility Example
export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <Button aria-label="Close dialog">×</Button>
        <p className="text-sm text-muted-foreground mt-1">Icon button with aria-label</p>
      </div>
      <div>
        <Button aria-describedby="save-help">Save</Button>
        <p id="save-help" className="text-sm text-muted-foreground mt-1">
          This will save your changes to the database
        </p>
      </div>
      <div>
        <Button disabled aria-disabled="true">
          Processing...
        </Button>
        <p className="text-sm text-muted-foreground mt-1">Disabled button with proper ARIA</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples showing proper accessibility with ARIA attributes.',
      },
    },
  },
};
