import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaggedItem } from './TaggedItem';
import type { NexusTag } from '@/core/services/nexus/nexus.types';

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
  const mockTag: NexusTag = {
    label: 'bitcoin',
    taggers: ['user1', 'user2', 'user3'],
    taggers_count: 3,
    relationship: false,
  };

  it('renders tag label and count', () => {
    render(<TaggedItem tag={mockTag} />);
    expect(screen.getByText('bitcoin (3)')).toBeInTheDocument();
  });

  it('calls onSearchClick when search button is clicked', () => {
    const mockOnSearchClick = vi.fn();
    render(<TaggedItem tag={mockTag} onSearchClick={mockOnSearchClick} />);
    fireEvent.click(screen.getByTestId('search-button'));
    expect(mockOnSearchClick).toHaveBeenCalledTimes(1);
  });

  it('renders avatars for taggers', () => {
    render(<TaggedItem tag={mockTag} />);
    const avatars = screen.getAllByTestId('avatar');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('matches snapshot', () => {
    const { container } = render(<TaggedItem tag={mockTag} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
