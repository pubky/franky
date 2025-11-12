import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { FilterSort } from './FilterSort';
import * as Core from '@/core';

const meta: Meta<typeof FilterSort> = {
  title: 'Molecules/Filter/FilterSort',
  component: FilterSort,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Preset for switching sort order between recent content and popularity.',
      },
    },
  },
  args: {
    selectedTab: 'timeline',
  },
  argTypes: {
    selectedTab: {
      control: 'inline-radio',
      options: ['timeline', 'total_engagement'],
    },
    onTabChange: { action: 'tab changed' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <FilterSort {...args} />,
};

export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = useState<Core.SortType>('timeline');

    return <FilterSort selectedTab={selected} onTabChange={setSelected} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example showing the component controlling its own selected sort state.',
      },
    },
  },
};

export const PopularitySelected: Story = {
  args: {
    selectedTab: 'total_engagement',
  },
};
