import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from '@/components/atoms/Badge';
import { Check, X, Star, Heart, AlertCircle, Info, Zap } from 'lucide-react';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile badge component for displaying status, labels, and notifications with customizable variants.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'The visual style variant of the badge',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as a child component using Radix Slot',
    },
    children: {
      control: 'text',
      description: 'The content inside the badge',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Variants
export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available badge variants for comparison.',
      },
    },
  },
};

// With Icons
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>
        <Check className="h-3 w-3" />
        Success
      </Badge>
      <Badge variant="destructive">
        <X className="h-3 w-3" />
        Error
      </Badge>
      <Badge variant="secondary">
        <Star className="h-3 w-3" />
        Featured
      </Badge>
      <Badge variant="outline">
        <Heart className="h-3 w-3" />
        Liked
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges with various icons to indicate different states or actions.',
      },
    },
  },
};

// Status Indicators
export const StatusIndicators: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge>
          <Check className="h-3 w-3" />
          Active
        </Badge>
        <span className="text-sm text-muted-foreground">User is currently online</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          <AlertCircle className="h-3 w-3" />
          Pending
        </Badge>
        <span className="text-sm text-muted-foreground">Waiting for approval</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="destructive">
          <X className="h-3 w-3" />
          Failed
        </Badge>
        <span className="text-sm text-muted-foreground">Operation failed</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          <Info className="h-3 w-3" />
          Info
        </Badge>
        <span className="text-sm text-muted-foreground">Additional information</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges used as status indicators with descriptive text.',
      },
    },
  },
};

// Notification Badges
export const NotificationBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge>New</Badge>
        <span className="text-sm">Latest feature announcement</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="destructive">3</Badge>
        <span className="text-sm">Unread messages</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          <Zap className="h-3 w-3" />
          Beta
        </Badge>
        <span className="text-sm">Experimental feature</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges used for notifications and feature labels.',
      },
    },
  },
};

// Interactive Examples
export const Interactive: Story = {
  render: () => (
    <div className="space-y-4">
      <Badge asChild>
        <a href="#" className="hover:no-underline">
          Clickable Badge
        </a>
      </Badge>
      <Badge className="cursor-pointer transition-opacity hover:opacity-80">Hover Badge</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive badges that can be clicked or hovered.',
      },
    },
  },
};

// Long Text Handling
export const LongText: Story = {
  render: () => (
    <div className="space-y-2">
      <Badge>Short</Badge>
      <Badge>Medium length badge</Badge>
      <Badge>This is a very long badge text that demonstrates how the component handles longer content</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'How badges handle different text lengths with proper overflow handling.',
      },
    },
  },
};

// Custom Styling
export const CustomStyling: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="border-blue-200 bg-blue-100 text-blue-800">Custom Blue</Badge>
      <Badge className="border-green-200 bg-green-100 text-green-800">Custom Green</Badge>
      <Badge className="border-purple-200 bg-purple-100 text-purple-800">Custom Purple</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges with custom styling using className overrides.',
      },
    },
  },
};

// Real-world Examples
export const UserProfile: Story = {
  render: () => (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        <div>
          <p className="font-semibold">John Doe</p>
          <div className="flex gap-2">
            <Badge>Admin</Badge>
            <Badge variant="secondary">Verified</Badge>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges in a user profile context showing roles and status.',
      },
    },
  },
};

export const ProductCard: Story = {
  render: () => (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold">Premium Plan</h3>
        <Badge variant="destructive">Sale</Badge>
      </div>
      <p className="text-sm text-muted-foreground">Advanced features for professionals</p>
      <div className="flex gap-2">
        <Badge variant="outline">Popular</Badge>
        <Badge variant="secondary">Limited Time</Badge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges in a product card showing pricing and feature information.',
      },
    },
  },
};

// Accessibility Example
export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="status-badge" className="mb-2 block text-sm font-medium">
          Status
        </label>
        <Badge id="status-badge" aria-label="Current status: Active">
          <Check className="h-3 w-3" />
          Active
        </Badge>
      </div>
      <div>
        <label htmlFor="priority-badge" className="mb-2 block text-sm font-medium">
          Priority Level
        </label>
        <Badge id="priority-badge" variant="destructive" aria-label="High priority task">
          High Priority
        </Badge>
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
