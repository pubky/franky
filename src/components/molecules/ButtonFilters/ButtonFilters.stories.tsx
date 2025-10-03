import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { ButtonFilters } from './ButtonFilters';

const meta: Meta<typeof ButtonFilters> = {
  title: 'Molecules/ButtonFilters',
  component: ButtonFilters,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A floating filter button that appears on desktop when in wide layout mode. Can be positioned on the left or right side.',
      },
    },
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Position of the button (left or right side)',
    },
    onClick: {
      action: 'clicked',
      description: 'Function called when the button is clicked',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
  },
  args: {
    onClick: fn(),
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftPosition: Story = {
  args: {
    position: 'left',
  },
};

export const RightPosition: Story = {
  args: {
    position: 'right',
  },
};

export const WithCustomClassName: Story = {
  args: {
    position: 'left',
    className: 'bg-primary text-primary-foreground',
  },
};
