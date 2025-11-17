import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ContentLayout } from './ContentLayout';

const meta: Meta<typeof ContentLayout> = {
  title: 'Organisms/ContentLayout',
  component: ContentLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A responsive layout component that provides a consistent structure for content pages with optional sidebars and mobile-friendly navigation.',
      },
    },
  },
  argTypes: {
    showLeftSidebar: {
      control: 'boolean',
      description: 'Whether to show the left sidebar',
    },
    showRightSidebar: {
      control: 'boolean',
      description: 'Whether to show the right sidebar',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
    children: {
      control: 'text',
      description: 'The main content to display',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h1 className="mb-4 text-2xl font-bold">Welcome to Pubky</h1>
        <p className="mb-6 text-muted-foreground">
          This is the main content area. It will be responsive and adapt to different screen sizes.
        </p>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Feature 1</h3>
            <p className="text-sm text-muted-foreground">Description of the first feature.</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Feature 2</h3>
            <p className="text-sm text-muted-foreground">Description of the second feature.</p>
          </div>
        </div>
      </div>
    ),
  },
};

export const WithoutLeftSidebar: Story = {
  args: {
    showLeftSidebar: false,
    children: (
      <div>
        <h1 className="mb-4 text-2xl font-bold">Content Without Left Sidebar</h1>
        <p className="mb-6 text-muted-foreground">
          This layout hides the left sidebar, giving more space to the main content.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Card 1</h3>
            <p className="text-sm text-muted-foreground">Content for the first card.</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Card 2</h3>
            <p className="text-sm text-muted-foreground">Content for the second card.</p>
          </div>
        </div>
      </div>
    ),
  },
};

export const WithoutRightSidebar: Story = {
  args: {
    showRightSidebar: false,
    children: (
      <div>
        <h1 className="mb-4 text-2xl font-bold">Content Without Right Sidebar</h1>
        <p className="mb-6 text-muted-foreground">
          This layout hides the right sidebar, focusing on the main content and left sidebar.
        </p>
        <div className="space-y-4">
          <div className="rounded-lg border bg-secondary/10 p-6">
            <h3 className="mb-2 font-semibold">Main Article</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              This is a longer article that takes advantage of the extra space without the right sidebar.
            </p>
            <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Read More</button>
          </div>
        </div>
      </div>
    ),
  },
};

export const WithoutSidebars: Story = {
  args: {
    showLeftSidebar: false,
    showRightSidebar: false,
    children: (
      <div>
        <h1 className="mb-4 text-2xl font-bold">Full Width Content</h1>
        <p className="mb-6 text-muted-foreground">
          This layout uses the full width without any sidebars, perfect for content that needs maximum space.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Column 1</h3>
            <p className="text-sm text-muted-foreground">Content for the first column.</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Column 2</h3>
            <p className="text-sm text-muted-foreground">Content for the second column.</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Column 3</h3>
            <p className="text-sm text-muted-foreground">Content for the third column.</p>
          </div>
        </div>
      </div>
    ),
  },
};

export const WithCustomClassName: Story = {
  args: {
    className: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    children: (
      <div>
        <h1 className="mb-4 text-2xl font-bold">Custom Styled Layout</h1>
        <p className="mb-6 text-muted-foreground">
          This layout has a custom background gradient applied via className.
        </p>
        <div className="rounded-lg border bg-white/80 p-6 backdrop-blur-sm">
          <h3 className="mb-2 font-semibold">Glass Effect Card</h3>
          <p className="text-sm text-muted-foreground">
            This card has a glass effect that works well with the gradient background.
          </p>
        </div>
      </div>
    ),
  },
};

export const ComplexContent: Story = {
  args: {
    children: (
      <div>
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">Complex Content Layout</h1>
          <p className="mb-6 text-lg text-muted-foreground">
            This example shows how the ContentLayout handles complex content with multiple sections.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <div className="space-y-3">
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary"></div>
                  <div>
                    <p className="font-medium">User posted</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <p className="text-sm">This is a sample post content...</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary"></div>
                  <div>
                    <p className="font-medium">User commented</p>
                    <p className="text-sm text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <p className="text-sm">This is a sample comment...</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="rounded-lg border p-4 transition-colors hover:bg-secondary/10">
                <div className="mb-2 text-2xl">📝</div>
                <p className="font-medium">New Post</p>
              </button>
              <button className="rounded-lg border p-4 transition-colors hover:bg-secondary/10">
                <div className="mb-2 text-2xl">🔍</div>
                <p className="font-medium">Search</p>
              </button>
              <button className="rounded-lg border p-4 transition-colors hover:bg-secondary/10">
                <div className="mb-2 text-2xl">👥</div>
                <p className="font-medium">Friends</p>
              </button>
              <button className="rounded-lg border p-4 transition-colors hover:bg-secondary/10">
                <div className="mb-2 text-2xl">⚙️</div>
                <p className="font-medium">Settings</p>
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
          <h3 className="mb-2 font-semibold">Announcement</h3>
          <p className="text-sm text-muted-foreground">
            This is an important announcement that spans the full width of the content area.
          </p>
        </div>
      </div>
    ),
  },
};
