import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RightSidebar } from './RightSidebar';

const meta: Meta<typeof RightSidebar> = {
  title: 'Organisms/RightSidebar',
  component: RightSidebar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A right sidebar component that contains social features like who to follow, active users, and feedback card. It is hidden on mobile and tablet, visible on desktop.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
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
    className: 'bg-gradient-to-b from-purple-50 to-pink-100',
  },
};

export const WithCustomStyling: Story = {
  args: {
    className: 'border-l border-border/20 bg-background/95 backdrop-blur-sm',
  },
};
