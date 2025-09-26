import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge } from '@/components/atoms/Badge';

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
    asChild: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

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

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <span>🎉</span>
        <span>New Feature</span>
      </>
    ),
  },
};

export const LongText: Story = {
  args: {
    children: 'This is a very long badge text that might wrap',
  },
};
