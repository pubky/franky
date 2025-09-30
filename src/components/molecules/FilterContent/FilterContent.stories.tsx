import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { FilterContent, type ContentTab } from './FilterContent';

const meta: Meta<typeof FilterContent> = {
  title: 'Molecules/Filter/FilterContent',
  component: FilterContent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Preset content filter with iconography built from the filter atom primitives.',
      },
    },
  },
  args: {
    selectedTab: 'all',
  },
  argTypes: {
    selectedTab: {
      control: 'select',
      options: ['all', 'posts', 'articles', 'images', 'videos', 'links', 'files'],
    },
    onTabChange: { action: 'tab changed' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <FilterContent {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Adjust the controls to simulate different selected tabs through args.',
      },
    },
  },
};

export const Interactive: Story = {
  render: () => {
    const [selectedTab, setSelectedTab] = useState<ContentTab>('all');

    return (
      <FilterContent
        selectedTab={selectedTab}
        onTabChange={(tab) => {
          setSelectedTab(tab);
        }}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Internal state example showing how user interaction changes the selected content filter.',
      },
    },
  },
};

export const VideosSelected: Story = {
  args: {
    selectedTab: 'videos',
  },
};

export const LinksSelected: Story = {
  args: {
    selectedTab: 'links',
  },
};
