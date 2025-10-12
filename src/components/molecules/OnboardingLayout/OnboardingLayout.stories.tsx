import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { OnboardingLayout } from './OnboardingLayout';

const meta: Meta<typeof OnboardingLayout> = {
  title: 'Molecules/Layout/OnboardingLayout',
  component: OnboardingLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A reusable layout component for onboarding pages that provides consistent structure with optional navigation.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    testId: 'playground-content',
    children: (
      <>
        <div className="rounded-lg bg-gray-800 p-6">
          <h1 className="mb-4 text-2xl font-bold">Page Header</h1>
          <p className="text-gray-400">This is the main content area of the template.</p>
        </div>
        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="mb-2 text-xl font-semibold">Content Section</h2>
          <p className="text-gray-400">Additional content can be added here.</p>
        </div>
      </>
    ),
  },
};

export const WithNavigation: Story = {
  args: {
    testId: 'with-nav-content',
    children: (
      <div className="rounded-lg bg-gray-800 p-6">
        <h1 className="mb-4 text-2xl font-bold">Page with Navigation</h1>
        <p className="text-gray-400">Content with navigation buttons at the bottom.</p>
      </div>
    ),
    navigation: (
      <div className="flex justify-between gap-4">
        <button className="rounded-lg bg-gray-700 px-6 py-3 hover:bg-gray-600">Back</button>
        <button className="rounded-lg bg-blue-600 px-6 py-3 hover:bg-blue-700">Next</button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Template with navigation buttons displayed at the bottom.',
      },
    },
  },
};

export const WithoutNavigation: Story = {
  args: {
    testId: 'no-nav-content',
    children: (
      <>
        <div className="rounded-lg bg-gray-800 p-6">
          <h1 className="mb-4 text-2xl font-bold">Simple Template</h1>
          <p className="text-gray-400">Template without navigation section.</p>
        </div>
        <div className="rounded-lg bg-gray-800 p-6">
          <p className="text-gray-400">Content flows naturally without bottom navigation.</p>
        </div>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Template without navigation component.',
      },
    },
  },
};

export const MultipleContentSections: Story = {
  args: {
    testId: 'multiple-sections',
    children: (
      <>
        <div className="rounded-lg bg-gray-800 p-6">
          <h1 className="text-2xl font-bold">Section 1</h1>
        </div>
        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="text-xl font-semibold">Section 2</h2>
        </div>
        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-lg">Section 3</h3>
        </div>
        <div className="rounded-lg bg-gray-800 p-6">
          <p className="text-gray-400">Section 4</p>
        </div>
      </>
    ),
    navigation: <button className="w-full rounded-lg bg-blue-600 px-6 py-3 hover:bg-blue-700">Continue</button>,
  },
  parameters: {
    docs: {
      description: {
        story: 'Template with multiple content sections and single navigation button.',
      },
    },
  },
};

export const BackupPageExample: Story = {
  args: {
    testId: 'backup-content',
    children: (
      <>
        <div className="rounded-lg bg-gray-800 p-6">
          <h1 className="mb-4 text-2xl font-bold">Backup Your Account</h1>
          <p className="text-gray-400">Choose your preferred backup method.</p>
        </div>
        <div className="rounded-lg bg-gray-800 p-6">
          <div className="space-y-4">
            <button className="w-full rounded-lg border border-gray-700 p-4 text-left hover:bg-gray-700">
              Backup with Recovery Phrase
            </button>
            <button className="w-full rounded-lg border border-gray-700 p-4 text-left hover:bg-gray-700">
              Backup with File
            </button>
          </div>
        </div>
      </>
    ),
    navigation: (
      <div className="flex justify-between gap-4">
        <button className="rounded-lg bg-gray-700 px-6 py-3 hover:bg-gray-600">Back</button>
        <button className="rounded-lg bg-blue-600 px-6 py-3 hover:bg-blue-700">Continue</button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing how the Backup template uses this layout component.',
      },
    },
  },
};
