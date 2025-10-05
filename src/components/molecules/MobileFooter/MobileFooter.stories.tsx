import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MobileFooter } from './MobileFooter';

const meta: Meta<typeof MobileFooter> = {
  title: 'Molecules/MobileFooter',
  component: MobileFooter,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A mobile footer navigation component that provides quick access to main app sections. Hidden on desktop, visible on mobile.',
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
    className: 'bg-primary/10',
  },
};
