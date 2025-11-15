import type { Meta, StoryObj } from '@storybook/nextjs';
import { PostThreadSpacer } from './PostThreadSpacer';

const meta = {
  title: 'Atoms/PostThreadSpacer',
  component: PostThreadSpacer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    'data-testid': {
      control: 'text',
      description: 'Optional test ID for testing purposes',
    },
  },
} satisfies Meta<typeof PostThreadSpacer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithTestId: Story = {
  args: {
    'data-testid': 'spacer-test',
  },
};

export const InContext: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-0 rounded-lg border border-border bg-background p-4">
      <div className="rounded bg-muted p-4">
        <div className="text-sm font-semibold">Parent Post</div>
        <div className="mt-1 text-xs text-muted-foreground">This is the original post</div>
      </div>

      <div className="ml-3">
        <PostThreadSpacer />
        <div className="rounded bg-muted p-4">
          <div className="text-sm font-semibold">Reply 1</div>
          <div className="mt-1 text-xs text-muted-foreground">First reply to the post</div>
        </div>

        <PostThreadSpacer />
        <div className="rounded bg-muted p-4">
          <div className="text-sm font-semibold">Reply 2</div>
          <div className="mt-1 text-xs text-muted-foreground">Second reply to the post</div>
        </div>
      </div>
    </div>
  ),
};

export const MultipleSpacers: Story = {
  render: () => (
    <div className="ml-3 w-full max-w-md space-y-0">
      <PostThreadSpacer />
      <div className="flex h-16 items-center justify-center rounded bg-muted text-xs">Content</div>
      <PostThreadSpacer />
      <div className="flex h-16 items-center justify-center rounded bg-muted text-xs">Content</div>
      <PostThreadSpacer />
      <div className="flex h-16 items-center justify-center rounded bg-muted text-xs">Content</div>
      <PostThreadSpacer />
    </div>
  ),
};

export const SpacerComparison: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col items-center gap-2">
        <div className="rounded border border-border p-2">
          <PostThreadSpacer />
        </div>
        <span className="text-xs text-muted-foreground">Default (h-4 = 16px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="rounded border border-border p-2">
          <div className="flex h-4">
            <div className="w-3 border-l border-border bg-primary/10" />
            <div className="flex-1" />
          </div>
        </div>
        <span className="text-xs text-muted-foreground">With highlight</span>
      </div>
    </div>
  ),
};
