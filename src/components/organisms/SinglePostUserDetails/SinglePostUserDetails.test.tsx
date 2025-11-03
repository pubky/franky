import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { SinglePostUserDetails } from './SinglePostUserDetails';
import * as Core from '@/core';

const FIXED_NOW = '2024-03-15T10:00:00Z';

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
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('matches snapshot with user and post details', () => {
    const fixedNow = new Date(FIXED_NOW);
    const fourteenDaysAgo = new Date(fixedNow);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    mockUseLiveQuery
      .mockReturnValueOnce({
        id: '69deadbeef1234567890',
        name: 'John Doe',
        image: 'https://example.com/avatar.jpg',
      }) // userDetails
      .mockReturnValueOnce({
        uri: 'pubky://author123/pub/example.com/posts/post1',
        indexed_at: fourteenDaysAgo.getTime(),
      }); // postDetails

    const { container } = render(<SinglePostUserDetails postId="author123:post1" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with no user image', () => {
    const fixedNow = new Date(FIXED_NOW);
    const fourteenDaysAgo = new Date(fixedNow);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    mockUseLiveQuery
      .mockReturnValueOnce({
        id: '69deadbeef1234567890',
        name: 'John Doe',
        image: null,
      })
      .mockReturnValueOnce({
        uri: 'pubky://author123/pub/example.com/posts/post1',
        indexed_at: fourteenDaysAgo.getTime(),
      });

    const { container } = render(<SinglePostUserDetails postId="author123:post1" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with empty name', () => {
    const fixedNow = new Date(FIXED_NOW);
    const fourteenDaysAgo = new Date(fixedNow);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    mockUseLiveQuery
      .mockReturnValueOnce({
        id: '69deadbeef1234567890',
        name: '',
        image: 'https://example.com/avatar.jpg',
      })
      .mockReturnValueOnce({
        uri: 'pubky://author123/pub/example.com/posts/post1',
        indexed_at: fourteenDaysAgo.getTime(),
      });

    const { container } = render(<SinglePostUserDetails postId="author123:post1" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with different postId', () => {
    const fixedNow = new Date(FIXED_NOW);
    const sevenDaysAgo = new Date(fixedNow);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    mockUseLiveQuery
      .mockReturnValueOnce({
        id: 'different1234567890',
        name: 'Jane Smith',
        image: 'https://example.com/jane.jpg',
      })
      .mockReturnValueOnce({
        uri: 'pubky://different123/pub/example.com/posts/post2',
        indexed_at: sevenDaysAgo.getTime(),
      });

    const { container } = render(<SinglePostUserDetails postId="different123:post2" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with recent post', () => {
    const fixedNow = new Date(FIXED_NOW);
    const fiveMinutesAgo = new Date(fixedNow);
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    mockUseLiveQuery
      .mockReturnValueOnce({
        id: '69deadbeef1234567890',
        name: 'John Doe',
        image: 'https://example.com/avatar.jpg',
      })
      .mockReturnValueOnce({
        uri: 'pubky://author123/pub/example.com/posts/post1',
        indexed_at: fiveMinutesAgo.getTime(),
      });

    const { container } = render(<SinglePostUserDetails postId="author123:post1" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with old post', () => {
    const fixedNow = new Date(FIXED_NOW);
    const fourYearsAgo = new Date(fixedNow);
    fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);

    mockUseLiveQuery
      .mockReturnValueOnce({
        id: '69deadbeef1234567890',
        name: 'John Doe',
        image: 'https://example.com/avatar.jpg',
      })
      .mockReturnValueOnce({
        uri: 'pubky://author123/pub/example.com/posts/post1',
        indexed_at: fourYearsAgo.getTime(),
      });

    const { container } = render(<SinglePostUserDetails postId="author123:post1" />);
    expect(container).toMatchSnapshot();
  });
});
