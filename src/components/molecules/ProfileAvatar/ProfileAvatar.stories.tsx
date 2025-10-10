import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProfileAvatar } from './ProfileAvatar';

const meta: Meta<typeof ProfileAvatar> = {
  title: 'Molecules/ProfileAvatar',
  component: ProfileAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    alt: 'John Doe',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    alt: 'John Doe',
  },
};

export const Clickable: Story = {
  args: {
    alt: 'John Doe',
    onClick: () => alert('Avatar clicked!'),
  },
};

export const Small: Story = {
  args: {
    alt: 'John Doe',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    alt: 'John Doe',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    alt: 'John Doe',
    size: 'xl',
  },
};
