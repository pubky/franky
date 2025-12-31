import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostMenuActionsContent } from './PostMenuActionsContent';
import { normaliseRadixIds } from '@/libs/utils/utils';

// Mock hooks - use vi.fn() to allow mocking in tests
const mockUsePostDetails = vi.fn(() => ({ postDetails: { kind: 'short', content: 'Test post' }, isLoading: false }));
const mockUseUserDetails = vi.fn(() => ({ userDetails: { name: 'Test User', id: 'pk:test123' }, isLoading: false }));
const mockUseCurrentUserProfile = vi.fn(() => ({ currentUserPubky: 'pk:current123' }));

vi.mock('@/hooks', () => ({
  usePostDetails: () => mockUsePostDetails(),
  useUserDetails: () => mockUseUserDetails(),
  useCurrentUserProfile: () => mockUseCurrentUserProfile(),
}));

// Mock core
vi.mock('@/core', () => ({
  useAuthStore: vi.fn(() => ({ currentUserPubky: 'pk:current123' })),
  parseCompositeId: vi.fn((id: string) => {
    const [pubky, postId] = id.split(':');
    return { pubky, id: postId };
  }),
  PostController: {
    delete: vi.fn(),
  },
}));

// Mock libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    Logger: { error: vi.fn() },
  };
});

// Mock icons
vi.mock('@/libs/icons', () => ({
  UserPlus: () => <span data-testid="icon-user-plus">UserPlus</span>,
  UserMinus: () => <span data-testid="icon-user-minus">UserMinus</span>,
  Pencil: () => <span data-testid="icon-pencil">Pencil</span>,
  KeyRound: () => <span data-testid="icon-key-round">KeyRound</span>,
  Link: () => <span data-testid="icon-link">Link</span>,
  FileText: () => <span data-testid="icon-file-text">FileText</span>,
  MegaphoneOff: () => <span data-testid="icon-megaphone-off">MegaphoneOff</span>,
  Trash: () => <span data-testid="icon-trash">Trash</span>,
  Flag: () => <span data-testid="icon-flag">Flag</span>,
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    overrideDefaults,
  }: {
    children: React.ReactNode;
    className?: string;
    overrideDefaults?: boolean;
  }) => (
    <div
      data-testid="container"
      data-class-name={className}
      data-override-defaults={overrideDefaults ? 'true' : 'false'}
    >
      {children}
    </div>
  ),
  Button: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} className={className} data-testid="menu-button">
      {children}
    </button>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <div
      onClick={disabled ? undefined : onClick}
      className={className}
      data-testid="dropdown-menu-item"
      data-disabled={disabled ? 'true' : 'false'}
    >
      {children}
    </div>
  ),
  Typography: ({ children, as, className }: { children: React.ReactNode; as?: string; className?: string }) => (
    <span data-testid="typography" data-as={as} className={className}>
      {children}
    </span>
  ),
}));

describe('PostMenuActionsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders menu items for own post', async () => {
    const Core = await import('@/core');
    mockUseCurrentUserProfile.mockReturnValue({ currentUserPubky: 'pk:test123' });
    mockUsePostDetails.mockReturnValue({
      postDetails: { kind: 'short', content: 'Test post' },
      isLoading: false,
    });
    mockUseUserDetails.mockReturnValue({
      userDetails: { name: 'Test User', id: 'pk:test123' },
      isLoading: false,
    });
    vi.mocked(Core.parseCompositeId).mockReturnValue({ pubky: 'pk:test123', id: 'post456' });

    render(<PostMenuActionsContent postId="pk:test123:post456" variant="dropdown" />);

    expect(screen.getByText('Edit post')).toBeInTheDocument();
    expect(screen.getByText('Delete post')).toBeInTheDocument();
    expect(screen.queryByText(/Follow|Unfollow/)).not.toBeInTheDocument();
  });

  it('renders menu items for other user post', async () => {
    mockUseCurrentUserProfile.mockReturnValue({ currentUserPubky: 'pk:current123' });
    mockUsePostDetails.mockReturnValue({
      postDetails: { kind: 'short', content: 'Test post' },
      isLoading: false,
    });
    mockUseUserDetails.mockReturnValue({
      userDetails: { name: 'Test User', id: 'pk:test123' },
      isLoading: false,
    });

    render(<PostMenuActionsContent postId="pk:test123:post456" variant="dropdown" />);

    expect(screen.getByText(/Follow/)).toBeInTheDocument();
    expect(screen.getByText('Mute user')).toBeInTheDocument();
    expect(screen.getByText('Report post')).toBeInTheDocument();
    expect(screen.queryByText('Edit post')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete post')).not.toBeInTheDocument();
  });

  it('hides copy text for article posts', async () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: { kind: 'long', content: 'Article content' },
      isLoading: false,
    });
    mockUseUserDetails.mockReturnValue({
      userDetails: { name: 'Test User', id: 'pk:test123' },
      isLoading: false,
    });

    render(<PostMenuActionsContent postId="pk:test123:post456" variant="dropdown" />);

    expect(screen.queryByText('Copy text of post')).not.toBeInTheDocument();
  });
});

// Note: Radix UI generates incremental IDs (radix-«r0», radix-«r1», etc.) for aria-controls attributes.
// These IDs are deterministic within an identical test suite run but may change when a subset of tests are run or are run in a different order.
// Use normaliseRadixIds to ensure the snapshots are consistent.
describe('PostMenuActionsContent - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot for all menu items visible (other user post)', async () => {
    mockUseCurrentUserProfile.mockReturnValue({ currentUserPubky: 'pk:current123' });
    mockUsePostDetails.mockReturnValue({
      postDetails: { kind: 'short', content: 'Test post' },
      isLoading: false,
    });
    mockUseUserDetails.mockReturnValue({
      userDetails: { name: 'Test User', id: 'pk:test123' },
      isLoading: false,
    });

    const { container } = render(<PostMenuActionsContent postId="pk:test123:post456" variant="dropdown" />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for own post menu items', async () => {
    const Core = await import('@/core');
    mockUseCurrentUserProfile.mockReturnValue({ currentUserPubky: 'pk:test123' });
    mockUsePostDetails.mockReturnValue({
      postDetails: { kind: 'short', content: 'Test post' },
      isLoading: false,
    });
    mockUseUserDetails.mockReturnValue({
      userDetails: { name: 'Test User', id: 'pk:test123' },
      isLoading: false,
    });
    vi.mocked(Core.parseCompositeId).mockReturnValue({ pubky: 'pk:test123', id: 'post456' });

    const { container } = render(<PostMenuActionsContent postId="pk:test123:post456" variant="dropdown" />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for mobile sheet variant', async () => {
    mockUseCurrentUserProfile.mockReturnValue({ currentUserPubky: 'pk:current123' });
    mockUsePostDetails.mockReturnValue({
      postDetails: { kind: 'short', content: 'Test post' },
      isLoading: false,
    });
    mockUseUserDetails.mockReturnValue({
      userDetails: { name: 'Test User', id: 'pk:test123' },
      isLoading: false,
    });

    const { container } = render(<PostMenuActionsContent postId="pk:test123:post456" variant="sheet" />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });
});
