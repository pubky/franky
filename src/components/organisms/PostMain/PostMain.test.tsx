import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostMain } from './PostMain';
import { useLiveQuery } from 'dexie-react-hooks';

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

// Use real libs, only stub cn for deterministic class joining
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

// Minimal atoms used by PostMain
vi.mock('@/atoms', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" data-class-name={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" data-class-name={className}>
      {children}
    </div>
  ),
}));

// Stub organisms composed inside PostMain
vi.mock('@/organisms', () => ({
  PostHeader: ({ postId }: { postId: string }) => <div data-testid="post-header">PostHeader {postId}</div>,
  PostContent: ({ postId }: { postId: string }) => <div data-testid="post-content">PostContent {postId}</div>,
  PostActionsBar: ({ postId, className }: { postId: string; className?: string }) => (
    <div data-testid="post-actions" data-class-name={className}>
      Actions {postId}
    </div>
  ),
}));

// Stub molecules used by PostMain
vi.mock('@/molecules', () => ({
  PostTagsList: ({ tags }: { tags: Array<{ id: string; label: string }> }) => (
    <ul data-testid="post-tags-list">
      {tags.map((t) => (
        <li key={t.id}>{t.label}</li>
      ))}
    </ul>
  ),
}));

// Keep Core shape only for potential spying if needed
vi.mock('@/core', () => ({
  PostTagsModel: {
    findById: vi.fn(),
  },
}));

const mockUseLiveQuery = vi.mocked(useLiveQuery);

describe('PostMain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header, content, tags and actions', () => {
    mockUseLiveQuery.mockReturnValue({ tags: [{ label: 'alpha' }, { label: 'beta' }] });

    render(<PostMain postId="post-123" />);

    expect(screen.getByTestId('post-header')).toHaveTextContent('PostHeader post-123');
    expect(screen.getByTestId('post-content')).toHaveTextContent('PostContent post-123');
    expect(screen.getByTestId('post-tags-list')).toBeInTheDocument();
    expect(screen.getByText('alpha')).toBeInTheDocument();
    expect(screen.getByText('beta')).toBeInTheDocument();
    expect(screen.getByTestId('post-actions')).toBeInTheDocument();
  });

  it('invokes onClick handler when root is clicked', () => {
    mockUseLiveQuery.mockReturnValue({ tags: [] });
    const onClick = vi.fn();

    const { container } = render(<PostMain postId="post-abc" onClick={onClick} />);

    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('PostMain - Snapshots', () => {
  it('matches snapshot with tags', () => {
    mockUseLiveQuery.mockReturnValue({ tags: [{ label: 'alpha' }, { label: 'beta' }, { label: 'gamma' }] });

    const { container } = render(<PostMain postId="post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without tags', () => {
    mockUseLiveQuery.mockReturnValue({ tags: [] });

    const { container } = render(<PostMain postId="post-789" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
