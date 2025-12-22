import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostMenuActionsContent } from './PostMenuActionsContent';
import { normaliseRadixIds } from '@/libs/utils/utils';

// Mock hooks - use vi.fn() to allow mocking in tests
const mockUsePostMenuActions = vi.fn(() => ({
  menuItems: [],
  isLoading: false,
}));

vi.mock('@/hooks', () => ({
  usePostMenuActions: (postId: string) => mockUsePostMenuActions(postId),
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
vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  Logger: {
    error: vi.fn(),
  },
}));

// Mock libs icons (used by usePostMenuActions)
vi.mock('@/libs', async () => {
  const actual = await vi.importActual('@/libs');
  const MockIcon = ({ className }: { className?: string }) => <span className={className}>Icon</span>;
  return {
    ...actual,
    UserRoundPlus: MockIcon,
    UserRoundMinus: MockIcon,
    Key: MockIcon,
    Link: MockIcon,
    FileText: MockIcon,
    MegaphoneOff: MockIcon,
    Trash: MockIcon,
    Flag: MockIcon,
  };
});

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
    const Libs = await import('@/libs');
    mockUsePostMenuActions.mockReturnValue({
      menuItems: [
        { id: 'copy-pubky', label: 'Copy pubky', icon: Libs.Key, onClick: vi.fn(), variant: 'default' },
        { id: 'copy-link', label: 'Copy link to post', icon: Libs.Link, onClick: vi.fn(), variant: 'default' },
        { id: 'copy-text', label: 'Copy text of post', icon: Libs.FileText, onClick: vi.fn(), variant: 'default' },
        { id: 'delete', label: 'Delete post', icon: Libs.Trash, onClick: vi.fn(), variant: 'destructive' },
      ],
      isLoading: false,
    });

    render(<PostMenuActionsContent postId="pk:test123:post456" variant="dropdown" />);

    expect(screen.getByText('Copy pubky')).toBeInTheDocument();
    expect(screen.getByText('Copy link to post')).toBeInTheDocument();
    expect(screen.getByText('Copy text of post')).toBeInTheDocument();
    expect(screen.getByText('Delete post')).toBeInTheDocument();
    expect(screen.queryByText(/Follow|Unfollow/)).not.toBeInTheDocument();
  });

  it('renders menu items for other user post', async () => {
    const Libs = await import('@/libs');
    mockUsePostMenuActions.mockReturnValue({
      menuItems: [
        { id: 'follow', label: 'Follow Test User', icon: Libs.UserRoundPlus, onClick: vi.fn(), variant: 'default' },
        { id: 'copy-pubky', label: 'Copy pubky', icon: Libs.Key, onClick: vi.fn(), variant: 'default' },
        { id: 'copy-link', label: 'Copy link to post', icon: Libs.Link, onClick: vi.fn(), variant: 'default' },
        { id: 'copy-text', label: 'Copy text of post', icon: Libs.FileText, onClick: vi.fn(), variant: 'default' },
        { id: 'mute', label: 'Mute Test User', icon: Libs.MegaphoneOff, onClick: vi.fn(), variant: 'default' },
        { id: 'report', label: 'Report post', icon: Libs.Flag, onClick: vi.fn(), variant: 'default' },
      ],
      isLoading: false,
    });

    render(<PostMenuActionsContent postId="pk:test123:post456" variant="dropdown" />);

    expect(screen.getByText(/Follow/)).toBeInTheDocument();
    expect(screen.getByText(/Mute/)).toBeInTheDocument();
    expect(screen.getByText('Report post')).toBeInTheDocument();
    expect(screen.queryByText('Delete post')).not.toBeInTheDocument();
  });

  it('hides copy text for article posts', async () => {
    const Libs = await import('@/libs');
    mockUsePostMenuActions.mockReturnValue({
      menuItems: [
        { id: 'follow', label: 'Follow Test User', icon: Libs.UserRoundPlus, onClick: vi.fn(), variant: 'default' },
        { id: 'copy-pubky', label: 'Copy pubky', icon: Libs.Key, onClick: vi.fn(), variant: 'default' },
        { id: 'copy-link', label: 'Copy link to post', icon: Libs.Link, onClick: vi.fn(), variant: 'default' },
        { id: 'mute', label: 'Mute Test User', icon: Libs.MegaphoneOff, onClick: vi.fn(), variant: 'default' },
        { id: 'report', label: 'Report post', icon: Libs.Flag, onClick: vi.fn(), variant: 'default' },
      ],
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
    const Libs = await import('@/libs');
    mockUsePostMenuActions.mockReturnValue({
      menuItems: [
        { id: 'follow', label: 'Follow Test User', icon: Libs.UserRoundPlus, onClick: vi.fn(), variant: 'default' },
        { id: 'copy-pubky', label: 'Copy pubky', icon: Libs.Key, onClick: vi.fn(), variant: 'default' },
        { id: 'copy-link', label: 'Copy link to post', icon: Libs.Link, onClick: vi.fn(), variant: 'default' },
        { id: 'copy-text', label: 'Copy text of post', icon: Libs.FileText, onClick: vi.fn(), variant: 'default' },
        { id: 'mute', label: 'Mute Test User', icon: Libs.MegaphoneOff, onClick: vi.fn(), variant: 'default' },
        { id: 'report', label: 'Report post', icon: Libs.Flag, onClick: vi.fn(), variant: 'default' },
      ],
      isLoading: false,
    });

    const { container } = render(<PostMenuActionsContent postId="pk:test123:post456" variant="dropdown" />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for own post menu items', async () => {
    const Libs = await import('@/libs');
    mockUsePostMenuActions.mockReturnValue({
      menuItems: [
        { id: 'copy-pubky', label: 'Copy pubky', icon: Libs.Key, onClick: vi.fn(), variant: 'default' },
        { id: 'copy-link', label: 'Copy link to post', icon: Libs.Link, onClick: vi.fn(), variant: 'default' },
        { id: 'copy-text', label: 'Copy text of post', icon: Libs.FileText, onClick: vi.fn(), variant: 'default' },
        { id: 'delete', label: 'Delete post', icon: Libs.Trash, onClick: vi.fn(), variant: 'destructive' },
      ],
      isLoading: false,
    });

    const { container } = render(<PostMenuActionsContent postId="pk:test123:post456" variant="dropdown" />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for mobile sheet variant', async () => {
    const Libs = await import('@/libs');
    mockUsePostMenuActions.mockReturnValue({
      menuItems: [
        { id: 'follow', label: 'Follow Test User', icon: Libs.UserRoundPlus, onClick: vi.fn(), variant: 'default' },
        { id: 'copy-pubky', label: 'Copy pubky', icon: Libs.Key, onClick: vi.fn(), variant: 'default' },
        { id: 'copy-link', label: 'Copy link to post', icon: Libs.Link, onClick: vi.fn(), variant: 'default' },
        { id: 'copy-text', label: 'Copy text of post', icon: Libs.FileText, onClick: vi.fn(), variant: 'default' },
        { id: 'mute', label: 'Mute Test User', icon: Libs.MegaphoneOff, onClick: vi.fn(), variant: 'default' },
        { id: 'report', label: 'Report post', icon: Libs.Flag, onClick: vi.fn(), variant: 'default' },
      ],
      isLoading: false,
    });

    const { container } = render(<PostMenuActionsContent postId="pk:test123:post456" variant="sheet" />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });
});
