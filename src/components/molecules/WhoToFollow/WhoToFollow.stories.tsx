import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { WhoToFollow } from './WhoToFollow';

const meta: Meta<typeof WhoToFollow> = {
  title: 'Molecules/WhoToFollow',
  component: WhoToFollow,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A component that displays suggested users to follow, showing their names, pubkys, and follow buttons.',
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
    className: 'bg-secondary/10 rounded-lg p-4',
  },
};

export const WithCustomStyling: Story = {
  args: {
    className: 'border border-border rounded-lg p-6',
  },
};
