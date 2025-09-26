import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Heading } from '@/components/atoms/Heading';

const meta = {
  title: 'Atoms/Heading',
  component: Heading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: { type: 'select' },
      options: [1, 2, 3, 4, 5, 6],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', '2xl'],
    },
    children: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Heading',
  },
};

export const H1: Story = {
  args: {
    level: 1,
    children: 'Heading 1',
  },
};

export const H2: Story = {
  args: {
    level: 2,
    children: 'Heading 2',
  },
};

export const H3: Story = {
  args: {
    level: 3,
    children: 'Heading 3',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Heading',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium Heading',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Heading',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    children: 'Extra Large Heading',
  },
};

export const TwoXLarge: Story = {
  args: {
    size: '2xl',
    children: '2XL Heading',
  },
};

export const CustomClass: Story = {
  args: {
    children: 'Custom Styled Heading',
    className: 'text-blue-500',
  },
};
