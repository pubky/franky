import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PopoverInvite } from './PopoverInvite';

const meta: Meta<typeof PopoverInvite> = {
  title: 'Molecules/Popover/PopoverInvite',
  component: PopoverInvite,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Invite popover providing quick links to Pubky contact channels.',
      },
    },
  },
  args: {
    className: 'hover:bg-brand/10',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <PopoverInvite {...args} />,
};

export const CustomTriggerStyle: Story = {
  args: {
    className: 'hover:bg-secondary/20 text-secondary-foreground',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing how to adapt the trigger button styling using className.',
      },
    },
  },
};
