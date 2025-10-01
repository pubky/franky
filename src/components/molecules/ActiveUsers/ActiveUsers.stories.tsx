import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ActiveUsers } from './ActiveUsers';

const meta: Meta<typeof ActiveUsers> = {
  title: 'Molecules/ActiveUsers',
  component: ActiveUsers,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A component that displays a list of active users with their post and tag counts, along with a "See All" button.',
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
