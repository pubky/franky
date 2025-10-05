import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LeftSidebar } from './LeftSidebar';

const meta: Meta<typeof LeftSidebar> = {
  title: 'Organisms/LeftSidebar',
  component: LeftSidebar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A left sidebar component that contains filter controls for reach, sort, content, and layout. It is hidden on mobile and tablet, visible on desktop.',
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
    className: 'bg-gradient-to-b from-blue-50 to-indigo-100',
  },
};

export const WithCustomStyling: Story = {
  args: {
    className: 'border-r border-border/20 bg-background/95 backdrop-blur-sm',
  },
};
