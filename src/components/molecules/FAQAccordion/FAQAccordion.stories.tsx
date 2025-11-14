import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FAQAccordion } from './FAQAccordion';
import type { FAQAccordionItem } from './FAQAccordion';

const meta = {
  title: 'Molecules/FAQAccordion',
  component: FAQAccordion,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FAQAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems: FAQAccordionItem[] = [
  {
    id: '1',
    question: 'What is Pubky?',
    answer: 'Pubky is a decentralized social platform built on Matrix protocol.',
  },
  {
    id: '2',
    question: 'How do I sign up?',
    answer: 'You can sign up by creating a keypair in the Pubky Ring app.',
  },
  {
    id: '3',
    question: 'Is Pubky free to use?',
    answer: 'Yes, Pubky is completely free to use. There are no premium features or subscription fees.',
  },
];

const complexAnswerItems: FAQAccordionItem[] = [
  {
    id: '1',
    question: 'How can I restore my account?',
    answer: (
      <>
        When you signed up, you were prompted to back up your identity using one of the following:
        <ul className="mt-2 ml-6 list-disc">
          <li>Recovery file (.pkarr)</li>
          <li>Recovery phrase (mnemonic)</li>
          <li>QR code</li>
        </ul>
        <br />
        To restore with a .pkarr file:
        <ol className="mt-2 ml-6 list-decimal">
          <li>Select the file you saved.</li>
          <li>Enter your password.</li>
          <li>Click &quot;Sign In&quot;.</li>
        </ol>
      </>
    ),
  },
  {
    id: '2',
    question: 'What are the key differences?',
    answer: (
      <>
        Pubky offers several unique features:
        <ul className="mt-2 ml-6 list-disc">
          <li>You are the algorithm: customize what you see</li>
          <li>No email or phone required</li>
          <li>Full control over your social graph</li>
          <li>Browser-based PWA that respects privacy</li>
        </ul>
      </>
    ),
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
  },
};

export const WithComplexAnswers: Story = {
  args: {
    items: complexAnswerItems,
  },
};

export const SingleItem: Story = {
  args: {
    items: [sampleItems[0]],
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};

export const ManyItems: Story = {
  args: {
    items: [
      ...sampleItems,
      {
        id: '4',
        question: 'How do I delete my account?',
        answer: 'Go to Settings > Account > Delete Account and follow the instructions.',
      },
      {
        id: '5',
        question: 'Can I use Pubky on mobile?',
        answer: 'Yes, Pubky works as a Progressive Web App (PWA) on mobile devices.',
      },
      {
        id: '6',
        question: 'How do I mute someone?',
        answer: 'Visit their profile, click the three dots menu, and select "Mute User".',
      },
    ],
  },
};
