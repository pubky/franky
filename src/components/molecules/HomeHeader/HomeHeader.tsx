'use client';

import { useRouter } from 'next/navigation';
import { AUTH_ROUTES } from '@/app';
import * as Atoms from '@/atoms';
import * as Core from '@/core';

/**
 * Generates a random sentence from a predefined list
 */
const getRandomSentence = (): string => {
  const sentences = [
    'Why do programmers prefer dark mode? Because light attracts bugs! 💡',
    'Recursion: see recursion 🔄',
    'No code is the best code 🎯',
    '99 bugs in the code, 99 bugs... take one down, patch it around, 127 bugs in the code 🎵',
    'Semicolons are optional, tears are not 😢',
    'Deployment successful! Time to panic 🚨',
    'Stack Overflow: the real MVP 🏆',
    'Code review: where friendships go to die 👀',
    'Merge conflict? More like merge anxiety! 😰',
    'Breaking changes? Breaking hearts! 💔',
    'Tabs vs Spaces: the eternal war ⚔️',
    'async/await saved my life today ⏳',
    'Legacy code: enter at your own risk ⚠️',
    'Docker container finally worked! 🐳',
    'npm install: the longest minutes of my life ⏱️',
    'Console.log() debugging is an art form 🎨',
    'Prod is down. This is fine. 🔥',
    'Rubber duck debugging strikes again 🦆',
    'TODO: actually write the TODO 📝',
    "Code works. Don't touch it. 🙏",
    "If it ain't broke, you're not trying hard enough 💪",
    'Premature optimization is the root of all evil 😈',
    "YAGNI: You Aren't Gonna Need It 🚫",
    "DRY: Don't Repeat Yourself... Don't Repeat Yourself 🔁",
    'Weekend? More like debug-end 🎮',
    'The best error message is the one that never shows up ✅',
    'git blame: the code of shame 👻',
    'Compiled on first try! Suspiciously successful 🤨',
    'Stackoverflow driven development in action 📚',
    'Ctrl+Z is my best friend 🔙',
  ];

  return sentences[Math.floor(Math.random() * sentences.length)];
};

/**
 * HomeHeader
 *
 * Self-contained header component for the Home page.
 * Displays the page title and logout button.
 * No props needed - manages its own navigation.
 */
export function HomeHeader() {
  const router = useRouter();

  const handleLogout = () => {
    router.push(AUTH_ROUTES.LOGOUT);
  };

  const handlePostCreation = () => {
    Core.PostController.create({
      authorId: 'idg3qibn87ror49jahc1wt8ecg61y8ip6ydxts6ox9su3ko3wpoy',
      content: getRandomSentence(),
      kind: Core.PubkyAppPostKind.Short,
      // parentPostId: "idg3qibn87ror49jahc1wt8ecg61y8ip6ydxts6ox9su3ko3wpoy:00348DPDEPTF0",
      // tags: ['test', 'test2', 'test3'],
      attachments: [new File(['test'], 'test.txt', { type: 'text/plain' })],
    });
  };

  const handlePostDeletion = () => {
    Core.PostController.delete({
      compositePostId: 'idg3qibn87ror49jahc1wt8ecg61y8ip6ydxts6ox9su3ko3wpoy:00348N937XAK0',
    });
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <Atoms.Heading level={1} size="xl" className="text-2xl">
        Home
      </Atoms.Heading>
      <Atoms.Button id="home-add-post-btn" variant="secondary" size="default" onClick={handlePostCreation}>
        + Post
      </Atoms.Button>
      <Atoms.Button id="home-add-post-btn" variant="secondary" size="default" onClick={handlePostDeletion}>
        - Post
      </Atoms.Button>
      <Atoms.Button id="home-logout-btn" variant="secondary" size="default" onClick={handleLogout}>
        Logout
      </Atoms.Button>
    </div>
  );
}
