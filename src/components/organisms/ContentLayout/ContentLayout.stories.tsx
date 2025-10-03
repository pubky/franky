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
        <h1 className="text-2xl font-bold mb-4">Welcome to Pubky</h1>
        <p className="text-muted-foreground mb-6">
          This is the main content area. It will be responsive and adapt to different screen sizes.
        </p>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Feature 1</h3>
            <p className="text-sm text-muted-foreground">Description of the first feature.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Feature 2</h3>
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
        <h1 className="text-2xl font-bold mb-4">Content Without Left Sidebar</h1>
        <p className="text-muted-foreground mb-6">
          This layout hides the left sidebar, giving more space to the main content.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Card 1</h3>
            <p className="text-sm text-muted-foreground">Content for the first card.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Card 2</h3>
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
        <h1 className="text-2xl font-bold mb-4">Content Without Right Sidebar</h1>
        <p className="text-muted-foreground mb-6">
          This layout hides the right sidebar, focusing on the main content and left sidebar.
        </p>
        <div className="space-y-4">
          <div className="p-6 border rounded-lg bg-secondary/10">
            <h3 className="font-semibold mb-2">Main Article</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This is a longer article that takes advantage of the extra space without the right sidebar.
            </p>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Read More</button>
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
        <h1 className="text-2xl font-bold mb-4">Full Width Content</h1>
        <p className="text-muted-foreground mb-6">
          This layout uses the full width without any sidebars, perfect for content that needs maximum space.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Column 1</h3>
            <p className="text-sm text-muted-foreground">Content for the first column.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Column 2</h3>
            <p className="text-sm text-muted-foreground">Content for the second column.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Column 3</h3>
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
        <h1 className="text-2xl font-bold mb-4">Custom Styled Layout</h1>
        <p className="text-muted-foreground mb-6">
          This layout has a custom background gradient applied via className.
        </p>
        <div className="p-6 bg-white/80 backdrop-blur-sm border rounded-lg">
          <h3 className="font-semibold mb-2">Glass Effect Card</h3>
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
          <h1 className="text-3xl font-bold mb-4">Complex Content Layout</h1>
          <p className="text-lg text-muted-foreground mb-6">
            This example shows how the ContentLayout handles complex content with multiple sections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <div className="space-y-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary rounded-full"></div>
                  <div>
                    <p className="font-medium">User posted</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <p className="text-sm">This is a sample post content...</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-secondary rounded-full"></div>
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
              <button className="p-4 border rounded-lg hover:bg-secondary/10 transition-colors">
                <div className="text-2xl mb-2">📝</div>
                <p className="font-medium">New Post</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-secondary/10 transition-colors">
                <div className="text-2xl mb-2">🔍</div>
                <p className="font-medium">Search</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-secondary/10 transition-colors">
                <div className="text-2xl mb-2">👥</div>
                <p className="font-medium">Friends</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-secondary/10 transition-colors">
                <div className="text-2xl mb-2">⚙️</div>
                <p className="font-medium">Settings</p>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <h3 className="font-semibold mb-2">Announcement</h3>
          <p className="text-sm text-muted-foreground">
            This is an important announcement that spans the full width of the content area.
          </p>
        </div>
      </div>
    ),
  },
};
