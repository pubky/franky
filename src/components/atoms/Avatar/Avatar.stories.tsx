import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/atoms/Avatar';
import { User, Settings, Heart, Star, Mail, Phone } from 'lucide-react';

const meta: Meta<typeof Avatar> = {
  title: 'Atoms/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile avatar component built on Radix UI primitives with customizable sizes and fallback support.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl'],
      description: 'The size of the avatar',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    size: 'default',
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const BrokenImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://broken-link.png" alt="Broken" />
      <AvatarFallback>BR</AvatarFallback>
    </Avatar>
  ),
};

// Size Variants
export const Small: Story = {
  args: {
    size: 'sm',
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

// All Sizes Showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <Avatar size="sm">
          <AvatarImage src="https://github.com/shadcn.png" alt="Small" />
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <p className="mt-1 text-xs">Small (24px)</p>
      </div>
      <div className="text-center">
        <Avatar size="default">
          <AvatarImage src="https://github.com/shadcn.png" alt="Default" />
          <AvatarFallback>DF</AvatarFallback>
        </Avatar>
        <p className="mt-1 text-xs">Default (40px)</p>
      </div>
      <div className="text-center">
        <Avatar size="lg">
          <AvatarImage src="https://github.com/shadcn.png" alt="Large" />
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>
        <p className="mt-1 text-xs">Large (48px)</p>
      </div>
      <div className="text-center">
        <Avatar size="xl">
          <AvatarImage src="https://github.com/shadcn.png" alt="Extra Large" />
          <AvatarFallback>XL</AvatarFallback>
        </Avatar>
        <p className="mt-1 text-xs">Extra Large (64px)</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available avatar sizes for comparison.',
      },
    },
  },
};

// With Icons
export const WithIcon: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>
        <User className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>
        <Settings className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  ),
};

// Icon Showcase
export const IconShowcase: Story = {
  render: () => (
    <div className="flex gap-3">
      <Avatar>
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>
          <Settings className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>
          <Heart className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>
          <Star className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>
          <Mail className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>
          <Phone className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar with various icons as fallback content.',
      },
    },
  },
};

// Custom Styled Fallbacks
export const CustomStyledFallback: Story = {
  render: () => (
    <div className="flex gap-3">
      <Avatar>
        <AvatarFallback className="bg-blue-100 font-semibold text-blue-600">JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-green-100 font-semibold text-green-600">SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-purple-100 font-semibold text-purple-600">AL</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-red-100 font-semibold text-red-600">MJ</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatars with custom styled fallback backgrounds and colors.',
      },
    },
  },
};

// Avatar Stack
export const AvatarStack: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar className="border-2 border-background">
        <AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
        <AvatarFallback>U1</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarImage src="https://github.com/vercel.png" alt="User 2" />
        <AvatarFallback>U2</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback>U3</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background bg-muted">
        <AvatarFallback>+2</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overlapping avatars commonly used in team displays.',
      },
    },
  },
};

// Real-world Examples
export const UserProfile: Story = {
  render: () => (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <Avatar size="lg">
        <AvatarImage src="https://github.com/shadcn.png" alt="John Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold">John Doe</p>
        <p className="text-sm text-muted-foreground">Product Designer</p>
        <p className="text-xs text-muted-foreground">john@company.com</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar in a user profile card context.',
      },
    },
  },
};

export const CommentSection: Story = {
  render: () => (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex gap-3">
        <Avatar size="sm">
          <AvatarImage src="https://github.com/vercel.png" alt="Sarah" />
          <AvatarFallback>SW</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">Sarah Wilson</p>
          <p className="text-sm text-muted-foreground">Great work on this feature!</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Avatar size="sm">
          <AvatarFallback>MJ</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">Mike Johnson</p>
          <p className="text-sm text-muted-foreground">Thanks for the feedback.</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatars in a comments section with different sizes.',
      },
    },
  },
};

// Team List
export const TeamList: Story = {
  render: () => {
    const team = [
      { name: 'John Doe', initials: 'JD', image: 'https://github.com/shadcn.png' },
      { name: 'Jane Smith', initials: 'JS', image: 'https://github.com/vercel.png' },
      { name: 'Mike Johnson', initials: 'MJ', image: null },
      { name: 'Sarah Wilson', initials: 'SW', image: 'https://github.com/nextjs.png' },
    ];

    return (
      <div className="space-y-2">
        {team.map((member, index) => (
          <div key={index} className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarImage src={member.image || ''} alt={member.name} />
              <AvatarFallback>{member.initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{member.name}</span>
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatars in a team member list.',
      },
    },
  },
};

// Interactive Example
export const Interactive: Story = {
  render: () => (
    <div className="space-y-4">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="Interactive" />
        <AvatarFallback>IN</AvatarFallback>
      </Avatar>
      <p className="text-sm text-muted-foreground">Click to interact with the avatar</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'An interactive avatar example.',
      },
    },
  },
};

// Accessibility Example
export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="user-avatar" className="mb-2 block text-sm font-medium">
          User Avatar
        </label>
        <Avatar id="user-avatar" aria-label="User profile picture">
          <AvatarImage src="https://github.com/shadcn.png" alt="User profile" />
          <AvatarFallback>UP</AvatarFallback>
        </Avatar>
      </div>
      <div>
        <label htmlFor="team-avatar" className="mb-2 block text-sm font-medium">
          Team Member
        </label>
        <Avatar id="team-avatar" aria-label="Team member avatar">
          <AvatarFallback>TM</AvatarFallback>
        </Avatar>
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
