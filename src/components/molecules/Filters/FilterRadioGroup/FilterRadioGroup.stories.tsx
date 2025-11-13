import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import * as Libs from '@/libs';

import { FilterRadioGroup } from './FilterRadioGroup';

const meta: Meta<typeof FilterRadioGroup> = {
  title: 'Molecules/Filters/FilterRadioGroup',
  component: FilterRadioGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Generic base component for all filter radiogroups in the application.

## Features

- **Controlled/Uncontrolled State**: Supports both controlled (via \`selectedValue\`) and uncontrolled (via \`defaultValue\`) patterns
- **Full Keyboard Navigation**: Arrow keys, Home/End, Space/Enter for selection
- **Complete Accessibility**: WAI-ARIA radiogroup pattern with proper ARIA attributes
- **Disabled Items**: Support for disabled options that are skipped during keyboard navigation
- **Performance**: Optimized with memoized handlers and state management hooks
- **Type Safety**: TypeScript generics for compile-time type checking

## Usage

This is the base component used by all specific filters (FilterSort, FilterContent, FilterLayout, FilterReach).
You can use it directly to create custom filter components.

## Accessibility

Implements WAI-ARIA radiogroup pattern:
- \`role="radiogroup"\` on the container
- \`role="radio"\` on each option
- \`aria-checked\` indicates selected state
- \`aria-labelledby\` links radiogroup to header
- \`aria-disabled\` for disabled options
- \`tabIndex\` management (0 for selected, -1 for others)

## Keyboard Navigation

- **Arrow Up/Down** or **Arrow Left/Right**: Navigate between options
- **Space** or **Enter**: Select the focused option
- **Home**: Jump to first option
- **End**: Jump to last option
        `,
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Filter title displayed in the header',
    },
    selectedValue: {
      control: 'text',
      description: 'Controlled selected value',
    },
    defaultValue: {
      control: 'text',
      description: 'Default value for uncontrolled mode',
    },
    onChange: {
      action: 'value changed',
      description: 'Callback fired when selection changes',
    },
    onClose: {
      action: 'close requested',
      description: 'Callback fired when filter should close (optional)',
    },
    testId: {
      control: 'text',
      description: 'Custom test ID for the radiogroup',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample items for stories
const sampleItems = [
  { key: 'recent', label: 'Recent', icon: Libs.SquareAsterisk },
  { key: 'popular', label: 'Popular', icon: Libs.Flame },
  { key: 'trending', label: 'Trending', icon: Libs.TrendingUp },
  { key: 'featured', label: 'Featured', icon: Libs.Star },
];

const sampleItemsWithDisabled = [
  { key: 'option1', label: 'Enabled Option 1', icon: Libs.Check },
  { key: 'option2', label: 'Disabled Option', icon: Libs.X, disabled: true },
  { key: 'option3', label: 'Enabled Option 2', icon: Libs.CheckCircle },
];

const largeItemList = [
  { key: 'all', label: 'All', icon: Libs.Layers },
  { key: 'posts', label: 'Posts', icon: Libs.StickyNote },
  { key: 'articles', label: 'Articles', icon: Libs.Newspaper },
  { key: 'images', label: 'Images', icon: Libs.Image },
  { key: 'videos', label: 'Videos', icon: Libs.CirclePlay },
  { key: 'links', label: 'Links', icon: Libs.Link },
  { key: 'files', label: 'Files', icon: Libs.Download },
];

export const Playground: Story = {
  args: {
    title: 'Sample Filter',
    items: sampleItems,
    defaultValue: 'recent',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground to explore all component props. Try changing values and interacting with the filter.',
      },
    },
  },
};

export const Controlled: Story = {
  render: () => {
    const [selected, setSelected] = useState('recent');

    return (
      <div className="space-y-4">
        <FilterRadioGroup
          title="Controlled Filter"
          items={sampleItems}
          selectedValue={selected}
          onChange={setSelected}
        />
        <div className="text-sm text-muted-foreground">
          Current selection: <strong className="text-foreground">{selected}</strong>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Controlled component example where the parent manages state via `selectedValue` prop. The selection state is displayed below the filter.',
      },
    },
  },
};

export const Uncontrolled: Story = {
  render: () => {
    return (
      <div className="space-y-4">
        <FilterRadioGroup
          title="Uncontrolled Filter"
          items={sampleItems}
          defaultValue="popular"
          onChange={(value) => console.log('Changed to:', value)}
        />
        <p className="text-sm text-muted-foreground">
          This component manages its own state. Check the Actions panel or console for change events.
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uncontrolled component example using `defaultValue` prop. The component manages its own internal state.',
      },
    },
  },
};

export const WithDisabledItems: Story = {
  args: {
    title: 'Filter with Disabled',
    items: sampleItemsWithDisabled,
    defaultValue: 'option1',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example with disabled items. Disabled items cannot be selected and are skipped during keyboard navigation. They are visually distinguished with reduced opacity.',
      },
    },
  },
};

export const WithOnClose: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <div className="space-y-4">
        {isOpen ? (
          <FilterRadioGroup
            title="Filter with Close"
            items={sampleItems}
            defaultValue="recent"
            onClose={() => {
              setIsOpen(false);
              setTimeout(() => setIsOpen(true), 1000);
            }}
          />
        ) : (
          <div className="text-sm text-muted-foreground">Filter closed. Will reopen in 1 second...</div>
        )}
        <p className="text-sm text-muted-foreground">
          Click any option to trigger <code>onClose</code> callback.
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example demonstrating the `onClose` callback. Useful for closing dialogs/drawers after selection. In this demo, the filter temporarily closes and reopens.',
      },
    },
  },
};

export const KeyboardNavigationDemo: Story = {
  render: () => {
    const [selected, setSelected] = useState('recent');
    const [lastAction, setLastAction] = useState<string>('None');

    return (
      <div className="space-y-4">
        <FilterRadioGroup
          title="Keyboard Navigation"
          items={sampleItems}
          selectedValue={selected}
          onChange={(value) => {
            setSelected(value);
            setLastAction(`Selected: ${value}`);
          }}
        />
        <div className="text-sm space-y-2">
          <p className="text-muted-foreground">
            <strong>Try keyboard navigation:</strong>
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Tab to focus, then use Arrow keys to navigate</li>
            <li>Press Space or Enter to select</li>
            <li>Press Home/End to jump to first/last</li>
          </ul>
          <p className="text-foreground">
            Last action: <strong>{lastAction}</strong>
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo showcasing full keyboard navigation support. Focus on the filter and use keyboard controls to navigate and select options.',
      },
    },
  },
};

export const LargeItemList: Story = {
  args: {
    title: 'Content Filter',
    items: largeItemList,
    defaultValue: 'all',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example with many items demonstrating vertical scrolling and keyboard navigation through a longer list.',
      },
    },
  },
};

export const CustomTestId: Story = {
  args: {
    title: 'Custom Test ID',
    items: sampleItems,
    defaultValue: 'recent',
    testId: 'my-custom-filter-id',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example with a custom test ID. By default, the test ID is generated from the title (`filter-{title}-radiogroup`), but you can provide a custom one for testing purposes.',
      },
    },
  },
};

export const MinimalExample: Story = {
  args: {
    title: 'Sort',
    items: [
      { key: 'recent', label: 'Recent', icon: Libs.SquareAsterisk },
      { key: 'popular', label: 'Popular', icon: Libs.Flame },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Minimal example with just title and items. The first item is selected by default, and the component operates in uncontrolled mode.',
      },
    },
  },
};

export const AllStates: Story = {
  render: () => {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-semibold mb-2">First Item Selected</h3>
          <FilterRadioGroup title="Filter" items={sampleItems} selectedValue="recent" />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Middle Item Selected</h3>
          <FilterRadioGroup title="Filter" items={sampleItems} selectedValue="popular" />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Last Item Selected</h3>
          <FilterRadioGroup title="Filter" items={sampleItems} selectedValue="featured" />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">With Disabled Item</h3>
          <FilterRadioGroup title="Filter" items={sampleItemsWithDisabled} selectedValue="option1" />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Visual comparison of different states for design review and visual regression testing.',
      },
    },
  },
};
