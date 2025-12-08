import type { Meta, StoryObj } from '@storybook/nextjs';
import { POST_THREAD_CONNECTOR_VARIANTS } from './PostThreadConnector.constants';
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
      options: Object.values(POST_THREAD_CONNECTOR_VARIANTS),
      description: 'Visual variant of the thread connector',
    },
  },
} satisfies Meta<typeof PostThreadConnector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Regular: Story = {
  args: {
    height: 150,
    variant: POST_THREAD_CONNECTOR_VARIANTS.REGULAR,
  },
};

export const Last: Story = {
  args: {
    height: 150,
    variant: POST_THREAD_CONNECTOR_VARIANTS.LAST,
  },
};

export const GapFix: Story = {
  args: {
    height: 12,
    variant: POST_THREAD_CONNECTOR_VARIANTS.GAP_FIX,
  },
};

export const DialogReply: Story = {
  args: {
    height: 0, // dialog-reply variant doesn't use height
    variant: POST_THREAD_CONNECTOR_VARIANTS.DIALOG_REPLY,
  },
};

export const SmallHeight: Story = {
  args: {
    height: 50,
    variant: POST_THREAD_CONNECTOR_VARIANTS.REGULAR,
  },
};

export const LargeHeight: Story = {
  args: {
    height: 300,
    variant: POST_THREAD_CONNECTOR_VARIANTS.REGULAR,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-start gap-8">
      <div className="flex flex-col items-center gap-2">
        <PostThreadConnector height={150} variant={POST_THREAD_CONNECTOR_VARIANTS.REGULAR} />
        <span className="text-xs text-muted-foreground">Regular</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PostThreadConnector height={150} variant={POST_THREAD_CONNECTOR_VARIANTS.LAST} />
        <span className="text-xs text-muted-foreground">Last</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PostThreadConnector height={12} variant={POST_THREAD_CONNECTOR_VARIANTS.GAP_FIX} />
        <span className="text-xs text-muted-foreground">Gap Fix</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PostThreadConnector height={0} variant={POST_THREAD_CONNECTOR_VARIANTS.DIALOG_REPLY} />
        <span className="text-xs text-muted-foreground">Dialog Reply</span>
      </div>
    </div>
  ),
};
