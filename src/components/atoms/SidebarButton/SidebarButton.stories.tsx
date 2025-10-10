import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { FileText, LockKeyhole, Users, Settings, HelpCircle, Bookmark } from 'lucide-react';

import { SidebarButton } from '@/components/atoms/SidebarButton';

const meta = {
  title: 'Atoms/SidebarButton',
  component: SidebarButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: false,
      description: 'Lucide icon component to display',
    },
    children: {
      control: { type: 'text' },
      description: 'Button text content',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler function',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof SidebarButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: FileText,
    children: 'Default Button',
  },
};

export const TermsOfService: Story = {
  args: {
    icon: FileText,
    children: 'Terms of service',
  },
};

export const PrivacyPolicy: Story = {
  args: {
    icon: LockKeyhole,
    children: 'Privacy policy',
  },
};

export const SeeAll: Story = {
  args: {
    icon: Users,
    children: 'See all',
  },
};

export const SettingsButton: Story = {
  args: {
    icon: Settings,
    children: 'Settings',
  },
};

export const HelpButton: Story = {
  args: {
    icon: HelpCircle,
    children: 'Help & Support',
  },
};

export const BookmarkButton: Story = {
  args: {
    icon: Bookmark,
    children: 'Bookmarks',
  },
};

export const WithCustomClassName: Story = {
  args: {
    icon: FileText,
    children: 'Custom Styled',
    className: 'border-red-500 hover:border-red-300',
  },
};

export const LongText: Story = {
  args: {
    icon: HelpCircle,
    children: 'This is a very long button text that might wrap',
  },
};

export const WithClickHandler: Story = {
  args: {
    icon: Settings,
    children: 'Click me',
    onClick: fn(),
  },
};

export const Disabled: Story = {
  args: {
    icon: FileText,
    children: 'Disabled Button',
    disabled: true,
  },
};

export const WithAriaLabel: Story = {
  args: {
    icon: LockKeyhole,
    children: 'Privacy',
    'aria-label': 'Open privacy policy',
  },
};

export const AllVariants: Story = {
  args: {
    icon: FileText,
    children: 'All Variants',
  },
  render: () => (
    <div className="space-y-4 w-64">
      <SidebarButton icon={FileText} onClick={fn()}>
        Terms of service
      </SidebarButton>
      <SidebarButton icon={LockKeyhole} onClick={fn()}>
        Privacy policy
      </SidebarButton>
      <SidebarButton icon={Users} onClick={fn()}>
        See all
      </SidebarButton>
      <SidebarButton icon={Settings} onClick={fn()}>
        Settings
      </SidebarButton>
      <SidebarButton icon={HelpCircle} onClick={fn()}>
        Help & Support
      </SidebarButton>
      <SidebarButton icon={Bookmark} onClick={fn()}>
        Bookmarks
      </SidebarButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A collection of all common SidebarButton variants used throughout the application.',
      },
    },
  },
};
