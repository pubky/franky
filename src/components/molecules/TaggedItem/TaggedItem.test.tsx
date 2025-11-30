import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaggedItem } from './TaggedItem';
import type { TagWithAvatars } from './TaggedItem.types';

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

describe('TaggedItem', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
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

  it('renders avatars for taggers', () => {
    render(<TaggedItem tag={mockTag} onTagClick={mockOnTagClick} />);
    const avatars = screen.getAllByTestId('avatar');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('matches snapshot', () => {
    const { container } = render(<TaggedItem tag={mockTag} onTagClick={mockOnTagClick} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
