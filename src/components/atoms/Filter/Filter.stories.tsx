import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import {
  FilterHeader,
  FilterItem,
  FilterItemIcon,
  FilterItemLabel,
  FilterList,
  FilterRoot,
} from '@/components/atoms/Filter/Filter';
import * as Libs from '@/libs';

const meta: Meta<typeof FilterRoot> = {
  title: 'Atoms/Filter',
  component: FilterRoot,
  subcomponents: {
    FilterHeader,
    FilterList,
    FilterItem,
    FilterItemIcon,
    FilterItemLabel,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Foundational filter layout primitives used to assemble consistent filter groups across the product.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const RootOnly: Story = {
  name: 'Root Layout',
  render: () => (
    <FilterRoot className="max-w-sm rounded-xl border bg-background p-4">
      <p className="text-sm text-muted-foreground">Place any filter elements inside this container.</p>
    </FilterRoot>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The base container element that provides consistent spacing and background for filter groups.',
      },
    },
  },
};

export const WithHeaderAndList: Story = {
  name: 'Header + List',
  render: () => (
    <FilterRoot className="max-w-sm rounded-xl border bg-background p-4">
      <FilterHeader title="Content" />
      <FilterList>
        <FilterItem>
          <FilterItemIcon icon={Libs.Layers} />
          <FilterItemLabel>All</FilterItemLabel>
        </FilterItem>
        <FilterItem>
          <FilterItemIcon icon={Libs.StickyNote} />
          <FilterItemLabel>Posts</FilterItemLabel>
        </FilterItem>
        <FilterItem>
          <FilterItemIcon icon={Libs.Image} />
          <FilterItemLabel>Images</FilterItemLabel>
        </FilterItem>
      </FilterList>
    </FilterRoot>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A composed example combining the header and list primitives to form a complete filter block.',
      },
    },
  },
};

export const InteractiveSelection: Story = {
  name: 'Interactive Selection',
  render: () => {
    const [selected, setSelected] = useState('all');

    const items = [
      { key: 'all', label: 'All', icon: Libs.Layers },
      { key: 'posts', label: 'Posts', icon: Libs.StickyNote },
      { key: 'articles', label: 'Articles', icon: Libs.Newspaper },
    ];

    return (
      <FilterRoot className="max-w-sm rounded-xl border bg-background p-4">
        <FilterHeader title="Content" />
        <FilterList>
          {items.map(({ key, label, icon: Icon }) => (
            <FilterItem key={key} isSelected={selected === key} onClick={() => setSelected(key)}>
              <FilterItemIcon icon={Icon} />
              <FilterItemLabel>{label}</FilterItemLabel>
            </FilterItem>
          ))}
        </FilterList>
      </FilterRoot>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how the primitives work together to highlight the currently selected filter option.',
      },
    },
  },
};
