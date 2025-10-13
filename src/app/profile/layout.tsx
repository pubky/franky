import * as Templates from '@/templates';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  // TODO: Fetch actual profile data here
  const mockProfileCounts = {
    posts: 10,
    replies: 5,
    tagged: 3,
    followers: 100,
    following: 50,
    friends: 20,
  };

  const mockProfileInfo = {
    name: 'Satoshi Nakamoto',
    handle: '1QX7...GKW3',
    avatar: undefined,
    bio: 'Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared.',
    links: [
      { label: 'bitcoin.org', url: 'https://bitcoin.org' },
      { label: 'x.com', url: 'https://x.com' },
      { label: 'youtube.com', url: 'https://youtube.com' },
      { label: 'telegram.chat', url: 'https://telegram.chat' },
    ],
    tags: [
      { label: 'satoshi', count: 36 },
      { label: 'bitcoin', count: 21 },
      { label: 'og', count: 5 },
    ],
  };

  return (
    <Templates.Profile profileCounts={mockProfileCounts} profileInfo={mockProfileInfo}>
      {children}
    </Templates.Profile>
  );
}
