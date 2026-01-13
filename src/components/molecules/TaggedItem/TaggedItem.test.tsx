import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaggedItem } from './TaggedItem';
import type { TagWithAvatars } from './TaggedItem.types';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Atoms.Tag
vi.mock('@/atoms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/atoms')>();
  return {
    ...actual,
    Tag: ({ name, count }: { name: string; count?: number }) => (
      <div data-testid="tag">
        {name} {count !== undefined && `(${count})`}
      </div>
    ),
    Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
      <button data-testid="search-button" onClick={onClick}>
        {children}
      </button>
    ),
  };
});

// Mock AvatarWithFallback
vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    AvatarWithFallback: ({ name }: { name: string }) => (
      <div data-testid="avatar" data-name={name}>
        Avatar
      </div>
    ),
  };
});

// Mock hooks - useRequireAuth needs to execute the action for authenticated users
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useRequireAuth: vi.fn(() => ({
      isAuthenticated: true,
      requireAuth: vi.fn((action: () => void) => action()),
    })),
  };
});

const mockTag: TagWithAvatars = {
  label: 'bitcoin',
  taggers: [
    { id: 'user1', avatarUrl: 'https://cdn.example.com/avatar/user1' },
    { id: 'user2', avatarUrl: 'https://cdn.example.com/avatar/user2' },
    { id: 'user3', avatarUrl: 'https://cdn.example.com/avatar/user3' },
  ],
  taggers_count: 3,
  relationship: false,
};

const mockOnTagClick = vi.fn();

describe('TaggedItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it('renders tag label and count', () => {
    render(<TaggedItem tag={mockTag} onTagClick={mockOnTagClick} />);
    expect(screen.getByText('bitcoin (3)')).toBeInTheDocument();
  });

  it('calls onSearchClick when search button is clicked', () => {
    const mockOnSearchClick = vi.fn();
    render(<TaggedItem tag={mockTag} onTagClick={mockOnTagClick} onSearchClick={mockOnSearchClick} />);
    fireEvent.click(screen.getByTestId('search-button'));
    expect(mockOnSearchClick).toHaveBeenCalledTimes(1);
  });

  it('navigates to search with tag when search button clicked without onSearchClick', () => {
    render(<TaggedItem tag={mockTag} onTagClick={mockOnTagClick} />);
    fireEvent.click(screen.getByTestId('search-button'));
    expect(mockPush).toHaveBeenCalledWith('/search?tags=bitcoin');
  });

  it('renders avatars for taggers', () => {
    render(<TaggedItem tag={mockTag} onTagClick={mockOnTagClick} />);
    const avatars = screen.getAllByTestId('avatar');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('hides avatars when hideAvatars is true', () => {
    render(<TaggedItem tag={mockTag} onTagClick={mockOnTagClick} hideAvatars />);
    expect(screen.queryAllByTestId('avatar')).toHaveLength(0);
  });

  it('still shows count in tag when hideAvatars is true', () => {
    render(<TaggedItem tag={mockTag} onTagClick={mockOnTagClick} hideAvatars />);
    expect(screen.getByText('bitcoin (3)')).toBeInTheDocument();
  });

  it('truncates tag label when maxTagLength is set', () => {
    render(<TaggedItem tag={mockTag} onTagClick={mockOnTagClick} maxTagLength={4} />);
    expect(screen.getByText(/bitc\.\.\./)).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<TaggedItem tag={mockTag} onTagClick={mockOnTagClick} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('TaggedItem - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it('matches snapshot with hideAvatars', () => {
    const { container } = render(
      <TaggedItem tag={mockTag} onTagClick={mockOnTagClick} hideAvatars maxTagLength={10} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
