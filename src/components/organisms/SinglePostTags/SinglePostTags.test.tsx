import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SinglePostTags } from './SinglePostTags';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';

// Mock @/libs - use actual implementations
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
  };
});

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

// Mock the atoms
vi.mock('@/atoms', () => ({
  Container: vi.fn(({ children, className }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  )),
  Input: vi.fn(({ placeholder, className, value, onChange, onKeyDown, disabled }) => (
    <input
      data-testid="input"
      placeholder={placeholder}
      className={className}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
    />
  )),
  Badge: vi.fn(({ children, variant, className, onClick }) => (
    <div data-testid="badge" data-variant={variant} className={className} onClick={onClick}>
      {children}
    </div>
  )),
  Typography: vi.fn(({ children, size, className }) => (
    <span data-testid="typography" data-size={size} className={className}>
      {children}
    </span>
  )),
  Button: vi.fn(({ children, variant, size, className, onClick }) => (
    <button data-testid="button" data-variant={variant} data-size={size} className={className} onClick={onClick}>
      {children}
    </button>
  )),
  Link: vi.fn(({ children, href, className, style }) => (
    <a data-testid="link" href={href} className={className} style={style}>
      {children}
    </a>
  )),
  Avatar: vi.fn(({ children, className }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  )),
  AvatarImage: vi.fn(({ src }) => <img data-testid="avatar-image" src={src} alt="" />),
  AvatarFallback: vi.fn(({ children }) => <div data-testid="avatar-fallback">{children}</div>),
}));

// Mock the core
vi.mock('@/core', async () => {
  const actual = await vi.importActual<typeof import('@/core')>('@/core');
  return {
    ...actual,
    useAuthStore: vi.fn(),
    db: {
      post_tags: {
        get: vi.fn().mockResolvedValue({ tags: [] }),
      },
    },
    TagController: {
      create: vi.fn(),
      delete: vi.fn(),
    },
  };
});

const mockUseLiveQuery = vi.mocked(useLiveQuery);
const mockUseAuthStore = vi.mocked(Core.useAuthStore);
const mockDbGet = vi.mocked(Core.db.post_tags.get);
const mockTagControllerCreate = vi.mocked(Core.TagController.create);
const mockTagControllerDelete = vi.mocked(Core.TagController.delete);

// Mock console.log and console.error
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('SinglePostTags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue('test-user-id');
    mockDbGet.mockResolvedValue({ tags: [] });
    mockTagControllerCreate.mockResolvedValue(undefined);
    mockTagControllerDelete.mockResolvedValue(undefined);
    mockUseLiveQuery.mockReturnValue([]);
  });

  it('renders with required postId prop', () => {
    render(<SinglePostTags postId="test-post-123" />);

    const containers = screen.getAllByTestId('container');
    expect(containers).toHaveLength(2);
  });

  it('handles input value changes', () => {
    render(<SinglePostTags postId="test-post-123" />);

    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'new-tag' } });

    expect(input).toHaveValue('new-tag');
  });

  it('handles Enter key to add tag', async () => {
    render(<SinglePostTags postId="test-post-123" />);

    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'new-tag' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockTagControllerCreate).toHaveBeenCalledWith({
        taggedId: 'test-post-123',
        label: 'new-tag',
        taggerId: 'test-user-id',
        taggedKind: Core.TagKind.POST,
      });
    });
  });

  it('does not add tag with empty input', async () => {
    render(<SinglePostTags postId="test-post-123" />);

    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockTagControllerCreate).not.toHaveBeenCalled();
  });

  it('trims whitespace from input before adding tag', async () => {
    render(<SinglePostTags postId="test-post-123" />);

    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: '  new-tag  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockTagControllerCreate).toHaveBeenCalledWith({
        taggedId: 'test-post-123',
        label: 'new-tag',
        taggerId: 'test-user-id',
        taggedKind: Core.TagKind.POST,
      });
    });
  });

  it('clears input after successful tag creation', async () => {
    render(<SinglePostTags postId="test-post-123" />);

    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'new-tag' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('handles tag creation errors', async () => {
    const error = new Error('Tag creation failed');
    mockTagControllerCreate.mockRejectedValueOnce(error);

    render(<SinglePostTags postId="test-post-123" />);

    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'new-tag' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to add tag:', error);
    });
  });

  it('renders tags from data', () => {
    const mockTags = [
      {
        label: 'react',
        taggers_count: 3,
        relationship: true,
        taggers: ['user1', 'user2', 'user3'],
      },
      {
        label: 'javascript',
        taggers_count: 1,
        relationship: false,
        taggers: ['user4'],
      },
    ];
    mockUseLiveQuery.mockReturnValue(mockTags);

    render(<SinglePostTags postId="test-post-123" />);

    const badges = screen.getAllByTestId('badge');
    expect(badges).toHaveLength(3); // 2 tags + 1 mobile add button
  });

  it('handles tag toggle', async () => {
    const mockTags = [
      {
        label: 'react',
        taggers_count: 3,
        relationship: true,
        taggers: ['user1', 'user2', 'user3'],
      },
    ];
    mockUseLiveQuery.mockReturnValue(mockTags);

    render(<SinglePostTags postId="test-post-123" />);

    const badges = screen.getAllByTestId('badge');
    fireEvent.click(badges[0]); // Click on react tag

    await waitFor(() => {
      expect(mockTagControllerDelete).toHaveBeenCalledWith({
        taggedId: 'test-post-123',
        label: 'react',
        taggerId: 'test-user-id',
        taggedKind: Core.TagKind.POST,
      });
    });
  });

  it('handles tag toggle errors', async () => {
    const error = new Error('Tag toggle failed');
    mockTagControllerCreate.mockRejectedValueOnce(error);

    const mockTags = [
      {
        label: 'javascript',
        taggers_count: 1,
        relationship: false,
        taggers: ['user4'],
      },
    ];
    mockUseLiveQuery.mockReturnValue(mockTags);

    render(<SinglePostTags postId="test-post-123" />);

    const badges = screen.getAllByTestId('badge');
    fireEvent.click(badges[0]);

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to toggle tagger:', error);
    });
  });

  it('handles search button click', () => {
    const mockTags = [
      {
        label: 'react',
        taggers_count: 3,
        relationship: true,
        taggers: ['user1', 'user2', 'user3'],
      },
    ];
    mockUseLiveQuery.mockReturnValue(mockTags);

    render(<SinglePostTags postId="test-post-123" />);

    const buttons = screen.getAllByTestId('button');
    fireEvent.click(buttons[0]);

    expect(mockConsoleLog).toHaveBeenCalledWith('TODO: perform search with tag', 'react');
  });

  it('renders remaining count when more than MAX_VISIBLE_USERS', () => {
    const mockTags = [
      {
        label: 'react',
        taggers_count: 8,
        relationship: true,
        taggers: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8'],
      },
    ];
    mockUseLiveQuery.mockReturnValue(mockTags);

    render(<SinglePostTags postId="test-post-123" />);

    expect(screen.getByText('+3')).toBeInTheDocument(); // 8 - 5 = 3 remaining
  });

  it('handles mobile add tag button click', () => {
    render(<SinglePostTags postId="test-post-123" />);

    const badges = screen.getAllByTestId('badge');
    const mobileAddButton = badges.find(
      (badge) => badge.className.includes('lg:hidden') && badge.className.includes('border-dashed'),
    );
    fireEvent.click(mobileAddButton!);

    expect(mockConsoleLog).toHaveBeenCalledWith('TODO: show add tag modal');
  });

  it('does not add tag when currentUserId is null', async () => {
    mockUseAuthStore.mockReturnValue(null);

    render(<SinglePostTags postId="test-post-123" />);

    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'new-tag' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockTagControllerCreate).not.toHaveBeenCalled();
  });

  it('does not toggle tag when currentUserId is null', async () => {
    mockUseAuthStore.mockReturnValue(null);

    const mockTags = [
      {
        label: 'javascript',
        taggers_count: 1,
        relationship: false,
        taggers: ['user4'],
      },
    ];
    mockUseLiveQuery.mockReturnValue(mockTags);

    render(<SinglePostTags postId="test-post-123" />);

    const badges = screen.getAllByTestId('badge');
    fireEvent.click(badges[0]);

    expect(mockTagControllerCreate).not.toHaveBeenCalled();
  });

  it('calls Core.db.post_tags.get with correct postId', async () => {
    render(<SinglePostTags postId="test-post-123" />);

    const callback = mockUseLiveQuery.mock.calls[0][0];
    await callback();

    expect(mockDbGet).toHaveBeenCalledWith('test-post-123');
  });
});

describe('SinglePostTags - Snapshots', () => {
  it('matches snapshot with no tags', () => {
    mockUseLiveQuery.mockReturnValue([]);
    const { container } = render(<SinglePostTags postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with tags', () => {
    const mockTags = [
      {
        label: 'react',
        taggers_count: 3,
        relationship: true,
        taggers: ['user1', 'user2', 'user3'],
      },
      {
        label: 'javascript',
        taggers_count: 1,
        relationship: false,
        taggers: ['user4'],
      },
    ];
    mockUseLiveQuery.mockReturnValue(mockTags);
    const { container } = render(<SinglePostTags postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with many taggers', () => {
    const mockTags = [
      {
        label: 'react',
        taggers_count: 8,
        relationship: true,
        taggers: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8'],
      },
    ];
    mockUseLiveQuery.mockReturnValue(mockTags);
    const { container } = render(<SinglePostTags postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with different postId', () => {
    mockUseLiveQuery.mockReturnValue([]);
    const { container } = render(<SinglePostTags postId="different-post-id" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
