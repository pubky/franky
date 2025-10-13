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
      { label: 'Website', url: 'https://example.com' },
      { label: 'GitHub', url: 'https://github.com' },
    ],
    tags: [
      { label: 'JavaScript', count: 10 },
      { label: 'React', count: 8 },
      { label: 'Web3', count: 5 },
    ],
  };

  return (
    <Templates.Profile profileCounts={mockProfileCounts} profileInfo={mockProfileInfo}>
      {children}
    </Templates.Profile>
  );
}

