import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { FilterDrawer } from './FilterDrawer';
import { Button } from '@/components';

const meta: Meta<typeof FilterDrawer> = {
  title: 'Molecules/FilterDrawer',
  component: FilterDrawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A slide-out drawer component that can be positioned on the left or right side. Includes backdrop overlay and smooth animations.',
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the drawer is open',
    },
    position: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Position of the drawer (left or right side)',
    },
    onOpenChangeAction: {
      action: 'openChange',
      description: 'Function called when the drawer open state changes',
    },
    children: {
      control: 'text',
      description: 'Content to display inside the drawer',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const FilterDrawerWithState = ({ position = 'left' }: { position?: 'left' | 'right' }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      <FilterDrawer open={open} onOpenChangeAction={setOpen} position={position}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Filter Options</h2>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" />
              <span>Option 1</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" />
              <span>Option 2</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" />
              <span>Option 3</span>
            </label>
          </div>
          <div className="pt-4">
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </div>
      </FilterDrawer>
    </div>
  );
};

export const LeftPosition: Story = {
  render: () => <FilterDrawerWithState position="left" />,
};

export const RightPosition: Story = {
  render: () => <FilterDrawerWithState position="right" />,
};

export const WithComplexContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="p-4">
        <Button onClick={() => setOpen(true)}>Open Complex Drawer</Button>
        <FilterDrawer open={open} onOpenChangeAction={setOpen} position="left">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Advanced Filters</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select className="w-full p-2 border rounded">
                    <option>All Categories</option>
                    <option>Technology</option>
                    <option>Design</option>
                    <option>Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date Range</label>
                  <div className="space-y-2">
                    <input type="date" className="w-full p-2 border rounded" />
                    <input type="date" className="w-full p-2 border rounded" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span>React</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span>TypeScript</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span>Next.js</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 pt-4">
              <Button onClick={() => setOpen(false)}>Apply Filters</Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </FilterDrawer>
      </div>
    );
  },
};
