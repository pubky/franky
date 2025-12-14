import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { normaliseRadixIds } from '@/libs/utils/utils';
import { POST_MENU_VARIANT } from '../PostMenuActions.constants';
import type { PostMenuActionItem } from '@/hooks/usePostMenuActions/usePostMenuActions';

// Mutable mock state
let mockReturnValue = { menuItems: [] as PostMenuActionItem[], isLoading: false };

vi.mock('@/hooks', () => ({
  usePostMenuActions: () => mockReturnValue,
}));

// Mock libs
vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(' '),
}));

interface MockContainerProps {
  children: React.ReactNode;
  className?: string;
}

interface MockButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

interface MockDropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

interface MockTypographyProps {
  children: React.ReactNode;
  className?: string;
}

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: MockContainerProps) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Button: ({ children, onClick, disabled, className }: MockButtonProps) => (
    <button onClick={onClick} disabled={disabled} className={className} data-testid="menu-button">
      {children}
    </button>
  ),
  DropdownMenuItem: ({ children, onClick, disabled, className }: MockDropdownMenuItemProps) => (
    <div onClick={onClick} data-disabled={disabled} className={className} data-testid="dropdown-menu-item">
      {children}
    </div>
  ),
  Typography: ({ children, className }: MockTypographyProps) => (
    <span data-testid="typography" className={className}>
      {children}
    </span>
  ),
}));

// Import after mocks
import { PostMenuActionsContent } from './PostMenuActionsContent';

// Helper to create mock menu items
const createMockMenuItems = (isOwnPost: boolean, isArticle = false): PostMenuActionItem[] => {
  const MockIcon = () => <span>Icon</span>;

  if (isOwnPost) {
    return [
      {
        id: 'edit',
        icon: MockIcon,
        label: isArticle ? 'Edit article' : 'Edit post',
        onClick: vi.fn(),
        disabled: true,
        show: true,
      },
      { id: 'copy-pubky', icon: MockIcon, label: 'Copy user pubky', onClick: vi.fn(), show: true },
      { id: 'copy-link', icon: MockIcon, label: 'Copy link to post', onClick: vi.fn(), show: true },
      ...(!isArticle
        ? [{ id: 'copy-text', icon: MockIcon, label: 'Copy text of post', onClick: vi.fn(), show: true }]
        : []),
      { id: 'delete', icon: MockIcon, label: 'Delete post', onClick: vi.fn(), destructive: true, show: true },
    ];
  }

  return [
    { id: 'follow', icon: MockIcon, label: 'Follow Test User', onClick: vi.fn(), show: true },
    { id: 'copy-pubky', icon: MockIcon, label: 'Copy user pubky', onClick: vi.fn(), show: true },
    { id: 'copy-link', icon: MockIcon, label: 'Copy link to post', onClick: vi.fn(), show: true },
    ...(!isArticle
      ? [{ id: 'copy-text', icon: MockIcon, label: 'Copy text of post', onClick: vi.fn(), show: true }]
      : []),
    { id: 'mute', icon: MockIcon, label: 'Mute user', onClick: vi.fn(), show: true },
    { id: 'report', icon: MockIcon, label: 'Report post', onClick: vi.fn(), disabled: true, show: true },
  ];
};

describe('PostMenuActionsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReturnValue = { menuItems: [], isLoading: false };
  });

  it('renders null when loading', () => {
    mockReturnValue = { menuItems: [], isLoading: true };

    const { container } = render(<PostMenuActionsContent postId="pk:test123:post456" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders menu items for own post', () => {
    mockReturnValue = { menuItems: createMockMenuItems(true), isLoading: false };

    render(<PostMenuActionsContent postId="pk:test123:post456" variant={POST_MENU_VARIANT.DROPDOWN} />);

    expect(screen.getByText('Edit post')).toBeInTheDocument();
    expect(screen.getByText('Delete post')).toBeInTheDocument();
    expect(screen.queryByText(/Follow/)).not.toBeInTheDocument();
  });

  it('renders menu items for other user post', () => {
    mockReturnValue = { menuItems: createMockMenuItems(false), isLoading: false };

    render(<PostMenuActionsContent postId="pk:test123:post456" variant={POST_MENU_VARIANT.DROPDOWN} />);

    expect(screen.getByText('Follow Test User')).toBeInTheDocument();
    expect(screen.getByText('Mute user')).toBeInTheDocument();
    expect(screen.getByText('Report post')).toBeInTheDocument();
    expect(screen.queryByText('Edit post')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete post')).not.toBeInTheDocument();
  });

  it('hides copy text for article posts', () => {
    mockReturnValue = { menuItems: createMockMenuItems(false, true), isLoading: false };

    render(<PostMenuActionsContent postId="pk:test123:post456" variant={POST_MENU_VARIANT.DROPDOWN} />);

    expect(screen.queryByText('Copy text of post')).not.toBeInTheDocument();
  });

  it('renders sheet variant correctly', () => {
    mockReturnValue = { menuItems: createMockMenuItems(false), isLoading: false };

    render(<PostMenuActionsContent postId="pk:test123:post456" variant={POST_MENU_VARIANT.SHEET} />);

    expect(screen.getAllByTestId('menu-button').length).toBeGreaterThan(0);
  });
});

describe('PostMenuActionsContent - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReturnValue = { menuItems: [], isLoading: false };
  });

  it('matches snapshot for dropdown variant (other user post)', () => {
    mockReturnValue = { menuItems: createMockMenuItems(false), isLoading: false };

    const { container } = render(
      <PostMenuActionsContent postId="pk:test123:post456" variant={POST_MENU_VARIANT.DROPDOWN} />,
    );
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for dropdown variant (own post)', () => {
    mockReturnValue = { menuItems: createMockMenuItems(true), isLoading: false };

    const { container } = render(
      <PostMenuActionsContent postId="pk:test123:post456" variant={POST_MENU_VARIANT.DROPDOWN} />,
    );
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for sheet variant', () => {
    mockReturnValue = { menuItems: createMockMenuItems(false), isLoading: false };

    const { container } = render(
      <PostMenuActionsContent postId="pk:test123:post456" variant={POST_MENU_VARIANT.SHEET} />,
    );
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });
});
