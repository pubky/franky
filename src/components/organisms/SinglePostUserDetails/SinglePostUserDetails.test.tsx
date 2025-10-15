import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { SinglePostUserDetails } from './SinglePostUserDetails';

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

describe('SinglePostUserDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders snapshot with user and post details', () => {
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
});
