'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

const FAQ_QUESTIONS: Molecules.FAQAccordionItem[] = [
  {
    id: '1',
    question: 'How can I update my profile information?',
    answer: 'Click your avatar (top-right corner), then click "Edit" to update your profile info.',
  },
  {
    id: '2',
    question: 'How can I delete my posts?',
    answer: 'Hover over the three dots on the post you wish to delete and select "Delete Post".',
  },
  {
    id: '3',
    question: 'How can I mute someone?',
    answer: 'Go to their profile, click the three dots, and choose "Mute User".',
  },
  {
    id: '4',
    question: 'How can I restore my account?',
    answer: (
      <>
        When you signed up, you were prompted to back up your identity using one of the following:
        <ul className="list-disc ml-6 mt-2">
          <li>Recovery file (.pkarr)</li>
          <li>Recovery phrase (mnemonic)</li>
          <li>QR code</li>
        </ul>
        <br />
        To restore with a .pkarr file:
        <ol className="list-decimal ml-6 mt-2">
          <li>Select the file you saved.</li>
          <li>Enter your password.</li>
          <li>Click &quot;Sign In&quot;.</li>
        </ol>
      </>
    ),
  },
  {
    id: '5',
    question: 'How is Pubky different from other social platforms?',
    answer: (
      <>
        Pubky is built for self-sovereign, decentralized social interaction. Key differences:
        <ul className="list-disc ml-6 mt-2">
          <li>You are the algorithm: customize what you see with semantic tags and curation.</li>
          <li>No email or phone required: your identity is your public key.</li>
          <li>Full control over your social graph via tagging and trust models.</li>
          <li>Browser-based PWA that respects privacy.</li>
        </ul>
      </>
    ),
  },
];

const SUPPORT_LINKS = {
  userGuide: 'https://support.synonym.to/hc/pubky-app-help-center/en',
  telegram: 'https://t.me/pubkychat',
} as const;

export interface HelpProps {
  className?: string;
}

export function Help({ className }: HelpProps) {
  const handleUserGuideClick = React.useCallback(() => {
    window.open(SUPPORT_LINKS.userGuide, '_blank', 'noopener,noreferrer');
  }, []);

  const handleSupportClick = React.useCallback(() => {
    window.open(SUPPORT_LINKS.telegram, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <Molecules.SettingsSectionCard className={className}>
      {/* FAQ Section */}
      <div className="justify-start items-center gap-2 inline-flex">
        <Libs.HelpCircle size={24} />
        <h2 className="text-2xl font-bold leading-8 text-foreground">FAQ</h2>
      </div>
      <p className="text-base font-medium leading-6 text-foreground">Frequently asked questions from Pubky users</p>
      <Molecules.FAQAccordion items={FAQ_QUESTIONS} />

      <Molecules.SettingsDivider className="w-full h-px bg-white/10 my-6" />

      {/* User Guide Section */}
      <div className="justify-start items-center gap-2 inline-flex">
        <Libs.FileText size={24} />
        <h2 className="text-2xl font-bold leading-8 text-foreground">User Guide</h2>
      </div>
      <p className="text-base font-medium leading-6 text-foreground">
        The Pubky User Guide will help you navigate through the app, utilize its key features, and get the most out of
        your Pubky experience.
      </p>
      <Atoms.Button id="user-guide-btn" variant="secondary" size="default" onClick={handleUserGuideClick}>
        <Libs.FileText size={16} />
        User Guide
      </Atoms.Button>

      <Molecules.SettingsDivider className="w-full h-px bg-white/10 my-6" />

      {/* Support Section */}
      <div className="justify-start items-center gap-2 inline-flex">
        <Libs.MessageCircle size={24} />
        <h2 className="text-2xl font-bold leading-8 text-foreground">Support</h2>
      </div>
      <p className="text-base font-medium leading-6 text-foreground">
        Cannot find the answer you&apos;re looking for? Pubky support will help you out in no time.
      </p>
      <Atoms.Button id="support-btn" variant="secondary" size="default" onClick={handleSupportClick}>
        <Libs.MessageCircle size={16} />
        Support (Telegram)
      </Atoms.Button>
    </Molecules.SettingsSectionCard>
  );
}
