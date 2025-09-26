import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Logo } from '@/components/molecules/Logo';

const meta = {
  title: 'Molecules/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: { type: 'number', min: 50, max: 300, step: 10 },
    },
    height: {
      control: { type: 'number', min: 20, max: 100, step: 5 },
    },
    noLink: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    width: 109,
    height: 36,
  },
};

export const Small: Story = {
  args: {
    width: 80,
    height: 26,
  },
};

export const Large: Story = {
  args: {
    width: 150,
    height: 50,
  },
};

export const NoLink: Story = {
  args: {
    width: 109,
    height: 36,
    noLink: true,
  },
};

export const CustomSize: Story = {
  args: {
    width: 200,
    height: 60,
  },
};

export const Square: Story = {
  args: {
    width: 100,
    height: 100,
  },
};
