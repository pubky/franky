import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { SinglePostUserDetails } from './SinglePostUserDetails';
import * as Core from '@/core';

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

// Mock Atoms components
vi.mock('@/atoms', () => ({
  Container: vi.fn(({ children, className }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  )),
  Avatar: vi.fn(({ children, className }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  )),
  AvatarImage: vi.fn(({ src }) => <img data-testid="avatar-image" src={src} alt="avatar" />),
  AvatarFallback: vi.fn(({ children }) => <div data-testid="avatar-fallback">{children}</div>),
  Typography: vi.fn(({ children, size, className }) => (
    <div data-testid="typography" data-size={size} className={className}>
      {children}
    </div>
  )),
}));

// Mock Libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

// Mock Core (merge real exports so parsePostCompositeId and types remain available)
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    db: {
      user_details: {
        get: vi.fn(),
      },
      post_details: {
        get: vi.fn(),
      },
    },
  };
});

const mockUseLiveQuery = vi.mocked(useLiveQuery);
const mockDbUserDetailsGet = vi.mocked(Core.db.user_details.get);
const mockDbPostDetailsGet = vi.mocked(Core.db.post_details.get);

describe('SinglePostUserDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDbUserDetailsGet.mockResolvedValue({
      id: '69deadbeef1234567890',
      name: 'John Doe',
      image: 'https://example.com/avatar.jpg',
    });
    mockDbPostDetailsGet.mockResolvedValue({
      uri: 'pubky://author123/pub/example.com/posts/post1',
      indexed_at: new Date('2024-01-01T12:00:00Z').getTime(),
    });
  });

  it('renders with required postId prop', () => {
    mockUseLiveQuery
      .mockReturnValueOnce({
        id: '69deadbeef1234567890',
        name: 'John Doe',
        image: 'https://example.com/avatar.jpg',
      })
      .mockReturnValueOnce({
        uri: 'pubky://author123/pub/example.com/posts/post1',
        indexed_at: new Date('2024-01-01T12:00:00Z').getTime(),
      });

    render(<SinglePostUserDetails postId="author123:post1" />);

    const containers = screen.getAllByTestId('container');
    expect(containers).toHaveLength(5);
  });
});

describe('SinglePostUserDetails - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot with user and post details', () => {
    mockUseLiveQuery
      .mockReturnValueOnce({
        id: '69deadbeef1234567890',
        name: 'John Doe',
        image: 'https://example.com/avatar.jpg',
      }) // userDetails
      .mockReturnValueOnce({
        uri: 'pubky://author123/pub/example.com/posts/post1',
        indexed_at: new Date('2024-01-01T12:00:00Z').getTime(),
      }); // postDetails

    const { container } = render(<SinglePostUserDetails postId="author123:post1" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with no user image', () => {
    mockUseLiveQuery
      .mockReturnValueOnce({
        id: '69deadbeef1234567890',
        name: 'John Doe',
        image: null,
      })
      .mockReturnValueOnce({
        uri: 'pubky://author123/pub/example.com/posts/post1',
        indexed_at: new Date('2024-01-01T12:00:00Z').getTime(),
      });

    const { container } = render(<SinglePostUserDetails postId="author123:post1" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with empty name', () => {
    mockUseLiveQuery
      .mockReturnValueOnce({
        id: '69deadbeef1234567890',
        name: '',
        image: 'https://example.com/avatar.jpg',
      })
      .mockReturnValueOnce({
        uri: 'pubky://author123/pub/example.com/posts/post1',
        indexed_at: new Date('2024-01-01T12:00:00Z').getTime(),
      });

    const { container } = render(<SinglePostUserDetails postId="author123:post1" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with different postId', () => {
    const mockNow = new Date('2025-06-01T12:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);

    mockUseLiveQuery
      .mockReturnValueOnce({
        id: 'different1234567890',
        name: 'Jane Smith',
        image: 'https://example.com/jane.jpg',
      })
      .mockReturnValueOnce({
        uri: 'pubky://different123/pub/example.com/posts/post2',
        indexed_at: new Date('2024-02-01T15:30:00Z').getTime(),
      });

    const { container } = render(<SinglePostUserDetails postId="different123:post2" />);
    expect(container).toMatchSnapshot();

    vi.useRealTimers();
  });

  it('matches snapshot with recent post', () => {
    const recentDate = new Date();
    recentDate.setMinutes(recentDate.getMinutes() - 5); // 5 minutes ago

    mockUseLiveQuery
      .mockReturnValueOnce({
        id: '69deadbeef1234567890',
        name: 'John Doe',
        image: 'https://example.com/avatar.jpg',
      })
      .mockReturnValueOnce({
        uri: 'pubky://author123/pub/example.com/posts/post1',
        indexed_at: recentDate.getTime(),
      });

    const { container } = render(<SinglePostUserDetails postId="author123:post1" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with old post', () => {
    mockUseLiveQuery
      .mockReturnValueOnce({
        id: '69deadbeef1234567890',
        name: 'John Doe',
        image: 'https://example.com/avatar.jpg',
      })
      .mockReturnValueOnce({
        uri: 'pubky://author123/pub/example.com/posts/post1',
        indexed_at: new Date('2020-01-01T12:00:00Z').getTime(),
      });

    const { container } = render(<SinglePostUserDetails postId="author123:post1" />);
    expect(container).toMatchSnapshot();
  });
});
