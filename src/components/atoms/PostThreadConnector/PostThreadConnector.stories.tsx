import type { Meta, StoryObj } from '@storybook/nextjs';
import { PostThreadConnector } from './PostThreadConnector';

const meta = {
  title: 'Atoms/PostThreadConnector',
  component: PostThreadConnector,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    height: {
      control: { type: 'number', min: 50, max: 500, step: 10 },
      description: 'Height of the thread connector in pixels',
    },
    variant: {
      control: { type: 'select' },
      options: ['regular', 'last', 'gap-fix'],
      description: 'Visual variant of the thread connector',
    },
  },
} satisfies Meta<typeof PostThreadConnector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Regular: Story = {
  args: {
    height: 150,
    variant: 'regular',
  },
};

export const Last: Story = {
  args: {
    height: 150,
    variant: 'last',
  },
};

export const GapFix: Story = {
  args: {
    height: 12,
    variant: 'gap-fix',
  },
};

export const SmallHeight: Story = {
  args: {
    height: 50,
    variant: 'regular',
  },
};

export const LargeHeight: Story = {
  args: {
    height: 300,
    variant: 'regular',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-start gap-8">
      <div className="flex flex-col items-center gap-2">
        <PostThreadConnector height={150} variant="regular" />
        <span className="text-xs text-muted-foreground">Regular</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PostThreadConnector height={150} variant="last" />
        <span className="text-xs text-muted-foreground">Last</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PostThreadConnector height={12} variant="gap-fix" />
        <span className="text-xs text-muted-foreground">Gap Fix</span>
      </div>
    </div>
  ),
};
