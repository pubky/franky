import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { MobileHeader } from './MobileHeader';

const meta: Meta<typeof MobileHeader> = {
  title: 'Molecules/MobileHeader',
  component: MobileHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A mobile header component that provides navigation and branding for mobile devices. Hidden on desktop, visible on mobile.',
      },
    },
  },
  argTypes: {
    onLeftIconClick: {
      action: 'leftIconClick',
      description: 'Function called when the left icon (filters) is clicked',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
  },
  args: {
    onLeftIconClick: fn(),
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomClassName: Story = {
  args: {
    className: 'bg-primary/10',
  },
};
