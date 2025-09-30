import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { FilterReach, type ReachTab } from './FilterReach';

const meta: Meta<typeof FilterReach> = {
  title: 'Molecules/Filter/FilterReach',
  component: FilterReach,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Reach filter preset that lets users refine results by relationship or visibility.',
      },
    },
  },
  args: {
    selectedTab: 'all',
  },
  argTypes: {
    selectedTab: {
      control: 'inline-radio',
      options: ['all', 'following', 'friends', 'me'],
    },
    onTabChange: { action: 'tab changed' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <FilterReach {...args} />,
};

export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = useState<ReachTab>('all');

    return <FilterReach selectedTab={selected} onTabChange={setSelected} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Internal state example demonstrating how tab changes propagate through the component.',
      },
    },
  },
};

export const FriendsSelected: Story = {
  args: {
    selectedTab: 'friends',
  },
};

export const MeSelected: Story = {
  args: {
    selectedTab: 'me',
  },
};
