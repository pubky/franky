import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProfileLayout } from './ProfileLayout';

const meta: Meta<typeof ProfileLayout> = {
  title: 'Templates/ProfileLayout',
  component: ProfileLayout,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/profile/posts',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPostsContent: Story = {
  args: {
    children: (
      <div className="flex flex-col gap-4">
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="font-bold mb-2">Sample Post 1</h3>
          <p className="text-muted-foreground">This is a sample post content...</p>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="font-bold mb-2">Sample Post 2</h3>
          <p className="text-muted-foreground">Another sample post content...</p>
        </div>
      </div>
    ),
  },
};

export const WithEmptyState: Story = {
  args: {
    children: (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-bold mb-2">No posts yet</h3>
        <p className="text-muted-foreground mb-4">Share your thoughts and ideas with the community.</p>
        <button className="px-4 py-2 bg-brand text-white rounded-lg">Create your first post</button>
      </div>
    ),
  },
};

export const WithLoadingState: Story = {
  args: {
    children: (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    ),
  },
};

export const WithUserList: Story = {
  args: {
    children: (
      <div className="flex flex-col gap-3">
        {['Alice', 'Bob', 'Charlie', 'David'].map((name, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-card rounded-lg border">
            <div className="w-12 h-12 bg-brand/20 rounded-full flex items-center justify-center">
              <span className="font-bold text-brand">{name[0]}</span>
            </div>
            <div className="flex-1">
              <div className="font-bold">{name}</div>
              <div className="text-sm text-muted-foreground">@{name.toLowerCase()}</div>
            </div>
            <button className="px-4 py-2 bg-secondary rounded-lg text-sm">Follow</button>
          </div>
        ))}
      </div>
    ),
  },
};
