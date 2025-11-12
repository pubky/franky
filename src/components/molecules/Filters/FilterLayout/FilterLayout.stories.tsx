import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { FilterLayout } from './FilterLayout';
import * as Core from '@/core';

const meta: Meta<typeof FilterLayout> = {
  title: 'Molecules/Filter/FilterLayout',
  component: FilterLayout,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Filter preset for switching between layout variations such as columns, wide, or visual.',
      },
    },
  },
  args: {
    selectedTab: 'columns',
  },
  argTypes: {
    selectedTab: {
      control: 'inline-radio',
      options: ['columns', 'wide', 'visual'],
    },
    onTabChange: { action: 'tab changed' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <FilterLayout {...args} />,
};

export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = useState<Core.LayoutType>('columns');

    return <FilterLayout selectedTab={selected} onTabChange={setSelected} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Internal state demo with clickable items toggling between the available layout presets.',
      },
    },
  },
};

export const WideSelected: Story = {
  args: {
    selectedTab: 'wide',
  },
};

export const VisualSelected: Story = {
  args: {
    selectedTab: 'visual',
  },
};
