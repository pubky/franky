'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

type QuestionType = {
  id: number;
  question: string;
  answer: React.ReactNode;
};

type SectionType = {
  id: string;
  title: string;
  questions: QuestionType[];
};

const createAnswer = (content: React.ReactNode) => (
  <p className="text-base font-medium leading-6 text-muted-foreground">{content}</p>
);

const sections: SectionType[] = [
  {
    id: 'onboarding',
    title: '1. Getting Started & Onboarding',
    questions: [
      {
        id: 1,
        question: 'Why does Pubky require invite codes?',
        answer: createAnswer(
          "Pubky uses invite codes as a temporary measure to prevent spam and server overload. Users need an invite code to create a user on our Homeserver. We don't create a user for the Pubky App, but on our Homeserver. As the infrastructure improves and more homeservers come online, invite codes may no longer be necessary.",
        ),
      },
      {
        id: 2,
        question: 'How do I use Pubky Ring with the web app?',
        answer: createAnswer(
          'First, create your keypair in the Pubky Ring app. Then visit the Pubky web app and log in using the same keypair. The apps are connected through your cryptographic identity.',
        ),
      },
      {
        id: 3,
        question: 'Why does login sometimes fail when using the PWA on Android?',
        answer: createAnswer(
          <>
            Some browsers focused on security and privacy, like Vanadium or Tor, disable Just-In-Time (JIT) compilation
            for JavaScript by default, which prevents Pubky App from functioning properly.
            <br />
            <br />
            To enable it, go to: Settings &gt; Site settings &gt; JavaScript JIT &gt; Allowed.
          </>,
        ),
      },
    ],
  },
  {
    id: 'backup',
    title: '2. Backups & Account Recovery',
    questions: [
      {
        id: 4,
        question: 'How can I restore my account?',
        answer: createAnswer(
          <>
            When you signed up, you were prompted to back up your identity using one of the following:
            <ul className="list-disc ml-6">
              <li>Recovery file (.pkarr)</li>
              <li>Recovery phrase (mnemonic)</li>
              <li>QR code</li>
            </ul>
            <br />
            To restore with a .pkarr file:{' '}
            <ol className="list-decimal ml-6">
              <li>Select the file you saved.</li>
              <li>Enter your password.</li>
              <li>Click &ldquo;Sign In&rdquo;.</li>
            </ol>
          </>,
        ),
      },
      {
        id: 5,
        question: 'Can I restore my Pubky account on another device?',
        answer: createAnswer(
          'Yes, if you have your .pkarr file or seed phrase. (Seed phrase support will be added in future versions of Pubky Ring.)',
        ),
      },
    ],
  },
  {
    id: 'profile',
    title: '3. Profile & Social Features',
    questions: [
      {
        id: 10,
        question: 'How can I update my profile information?',
        answer: createAnswer(
          'Click your avatar (top-right corner), then click &ldquo;Edit&rdquo; to update your profile info',
        ),
      },
      {
        id: 11,
        question: 'How can I delete my post?',
        answer: createAnswer(
          'Hover over the three dots on the post you wish to delete and select &ldquo;Delete Post&rdquo;.',
        ),
      },
      {
        id: 12,
        question: 'How do I mute someone?',
        answer: createAnswer('Go to their profile, click the three dots, and choose &ldquo;Mute User&rdquo;.'),
      },
    ],
  },
  {
    id: 'pubky',
    title: '4. How Pubky App Works',
    questions: [
      {
        id: 13,
        question: 'How is Pubky different from other social media platforms?',
        answer: createAnswer(
          <>
            Pubky is built for self-sovereign, decentralized social interaction. Key differences:
            <ul className="list-disc ml-6">
              <li>You are the algorithm: customize what you see with semantic tags and curation.</li>
              <li>No email or phone required: your identity is your public key.</li>
              <li>Full control over your social graph via tagging and trust models.</li>
              <li>Browser-based PWA that respects privacy.</li>
            </ul>
          </>,
        ),
      },
      {
        id: 14,
        question: 'How does Pubky differ from Nostr?',
        answer: createAnswer(
          'Pubky uses Ed25519 keys for compatibility and avoids centralized relays. Instead, it uses a Distributed Hash Table (DHT) for decentralized lookup and identity resolution.',
        ),
      },
    ],
  },
];

interface FAQItemProps {
  question: QuestionType;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="w-full border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors"
      >
        <span className="text-base font-semibold text-left">{question.question}</span>
        <Libs.ChevronDown
          size={20}
          className={Libs.cn('transition-transform flex-shrink-0 ml-4', isOpen && 'transform rotate-180')}
        />
      </button>
      {isOpen && <div className="px-6 pb-4 pt-2">{question.answer}</div>}
    </div>
  );
}

export interface SettingsHelpProps {
  className?: string;
}

export function SettingsHelp({ className }: SettingsHelpProps) {
  const [openQuestionId, setOpenQuestionId] = React.useState<number | null>(null);

  const handleQuestionToggle = (id: number) => {
    setOpenQuestionId(openQuestionId === id ? null : id);
  };

  return (
    <Molecules.SettingsSectionCard
      icon={Libs.HelpCircle}
      title="FAQ"
      description="Frequently asked questions from Pubky users"
      className={className}
    >
      {sections.map((section) => (
        <div key={section.id} className="w-full flex-col gap-4 flex">
          <h2 className="text-2xl font-bold leading-8 text-foreground">{section.title}</h2>
          {section.questions.map((question) => (
            <FAQItem
              key={question.id}
              question={question}
              isOpen={openQuestionId === question.id}
              onToggle={() => handleQuestionToggle(question.id)}
            />
          ))}
        </div>
      ))}

      <div className="w-full h-px bg-white/10 my-6" />

      <div className="justify-start items-center gap-2 inline-flex">
        <Libs.FileText size={24} />
        <h2 className="text-2xl font-bold leading-8 text-foreground">User Guide</h2>
      </div>
      <p className="text-base font-medium leading-6 text-muted-foreground">
        The Pubky User Guide will help you navigate through the app, utilize its key features, and get the most out of
        your Pubky experience.
      </p>
      <Atoms.Button
        variant="secondary"
        size="default"
        onClick={() => window.open('https://support.synonym.to/hc/pubky-app-help-center/en')}
      >
        <Libs.FileText size={16} />
        User Guide
      </Atoms.Button>

      <div className="w-full h-px bg-white/10 my-6" />

      <div className="justify-start items-center gap-2 inline-flex">
        <Libs.MessageCircle size={24} />
        <h2 className="text-2xl font-bold leading-8 text-foreground">Support</h2>
      </div>
      <p className="text-base font-medium leading-6 text-muted-foreground">
        Cannot find the answer you&apos;re looking for? Pubky support will help you out in no time.
      </p>
      <Atoms.Button variant="secondary" size="default" onClick={() => window.open('https://t.me/pubkychat', '_blank')}>
        <Libs.MessageCircle size={16} />
        Pubky Support (Telegram)
      </Atoms.Button>
    </Molecules.SettingsSectionCard>
  );
}
