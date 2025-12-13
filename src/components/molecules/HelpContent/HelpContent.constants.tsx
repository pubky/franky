import type { FAQAccordionItem } from '../FAQAccordion/FAQAccordion';

export const FAQ_QUESTIONS: FAQAccordionItem[] = [
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
    id: '5',
    question: 'How is Pubky different from other social platforms?',
    answer: (
      <>
        Pubky is built for self-sovereign, decentralized social interaction. Key differences:
        <ul className="mt-2 ml-6 list-disc">
          <li>You are the algorithm: customize what you see with semantic tags and curation.</li>
          <li>No email or phone required: your identity is your public key.</li>
          <li>Full control over your social graph via tagging and trust models.</li>
          <li>Browser-based PWA that respects privacy.</li>
        </ul>
      </>
    ),
  },
];

export const SUPPORT_LINKS = {
  userGuide: 'https://support.synonym.to/hc/pubky-app-help-center/en',
  telegram: 'https://t.me/pubkychat',
} as const;
