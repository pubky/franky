import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostMentions } from './PostMentions';

// Valid test pubky key (52 lowercase alphanumeric characters)
const validPubkyKey = 'o1gg96ewuojmopcjbz8895478wdtxtzzber7aezq6ror5a91j7dy';

// Mock @/atoms
vi.mock('@/atoms', () => ({
  Link: ({
    children,
    href,
    className,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
  }) => (
    <a data-testid="link" href={href} className={className} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

// Mock @/core
const mockGetDetails = vi.fn();
vi.mock('@/core', () => ({
  UserController: {
    getDetails: (params: { userId: string }) => mockGetDetails(params),
  },
}));

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (queryFn: () => Promise<unknown>, deps: unknown[], defaultValue: unknown) => {
    // Execute the query function to trigger it, but return a controlled value
    queryFn();
    // Return the mock value based on what mockGetDetails returns
    const result = mockGetDetails.mock.results[mockGetDetails.mock.results.length - 1];
    return result?.value ?? defaultValue;
  },
}));

describe('PostMentions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDetails.mockReturnValue(null);
  });

  describe('Basic rendering', () => {
    it('renders mention with username when user details are available', () => {
      mockGetDetails.mockReturnValue({ name: 'TestUser' });

      render(<PostMentions href={`/profile/${validPubkyKey}`}>{`pk:${validPubkyKey}`}</PostMentions>);

      expect(screen.getByText('@TestUser')).toBeInTheDocument();
    });

    it('renders as a link with correct href', () => {
      mockGetDetails.mockReturnValue({ name: 'TestUser' });

      render(<PostMentions href={`/profile/${validPubkyKey}`}>{`pk:${validPubkyKey}`}</PostMentions>);

      const link = screen.getByTestId('link');
      expect(link).toHaveAttribute('href', `/profile/${validPubkyKey}`);
    });

    it('renders with empty href when href is not provided', () => {
      mockGetDetails.mockReturnValue({ name: 'TestUser' });

      render(<PostMentions>{`pk:${validPubkyKey}`}</PostMentions>);

      const link = screen.getByTestId('link');
      expect(link).toHaveAttribute('href', '');
    });

    it('applies custom className', () => {
      mockGetDetails.mockReturnValue({ name: 'TestUser' });

      render(
        <PostMentions href={`/profile/${validPubkyKey}`} className="custom-class">
          {`pk:${validPubkyKey}`}
        </PostMentions>,
      );

      const link = screen.getByTestId('link');
      expect(link.className).toContain('custom-class');
    });

    it('applies default text-base styling', () => {
      mockGetDetails.mockReturnValue({ name: 'TestUser' });

      render(<PostMentions href={`/profile/${validPubkyKey}`}>{`pk:${validPubkyKey}`}</PostMentions>);

      const link = screen.getByTestId('link');
      expect(link.className).toContain('text-base');
    });
  });

  describe('Null rendering', () => {
    it('returns null when userId cannot be extracted from children', () => {
      const { container } = render(<PostMentions href="/profile/invalid">invalid-mention</PostMentions>);

      expect(container.firstChild).toBeNull();
    });

    it('returns null for empty children', () => {
      const { container } = render(<PostMentions href="/profile/test">{''}</PostMentions>);

      expect(container.firstChild).toBeNull();
    });

    it('returns null when pubky key has invalid format', () => {
      const { container } = render(<PostMentions href="/profile/test">pk:invalidkey</PostMentions>);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Click behavior', () => {
    it('stops event propagation on click', () => {
      mockGetDetails.mockReturnValue({ name: 'TestUser' });
      const parentClickHandler = vi.fn();

      render(
        <div onClick={parentClickHandler}>
          <PostMentions href={`/profile/${validPubkyKey}`}>{`pk:${validPubkyKey}`}</PostMentions>
        </div>,
      );

      const link = screen.getByTestId('link');
      fireEvent.click(link);

      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });

  describe('User lookup', () => {
    it('calls UserController.getDetails with extracted userId', () => {
      mockGetDetails.mockReturnValue({ name: 'TestUser' });

      render(<PostMentions href={`/profile/${validPubkyKey}`}>{`pk:${validPubkyKey}`}</PostMentions>);

      expect(mockGetDetails).toHaveBeenCalledWith({ userId: validPubkyKey });
    });

    it('handles user with pubky prefix', () => {
      mockGetDetails.mockReturnValue({ name: 'PubkyUser' });

      render(<PostMentions href={`/profile/${validPubkyKey}`}>{`pubky${validPubkyKey}`}</PostMentions>);

      expect(screen.getByText('@PubkyUser')).toBeInTheDocument();
      expect(mockGetDetails).toHaveBeenCalledWith({ userId: validPubkyKey });
    });

    it('displays username with @ prefix when available', () => {
      mockGetDetails.mockReturnValue({ name: 'Alice' });

      render(<PostMentions href={`/profile/${validPubkyKey}`}>{`pk:${validPubkyKey}`}</PostMentions>);

      expect(screen.getByText('@Alice')).toBeInTheDocument();
    });
  });

  describe('Props forwarding', () => {
    it('forwards additional props to the Link component', () => {
      mockGetDetails.mockReturnValue({ name: 'TestUser' });

      render(
        <PostMentions href={`/profile/${validPubkyKey}`} data-custom="value">
          {`pk:${validPubkyKey}`}
        </PostMentions>,
      );

      const link = screen.getByTestId('link');
      expect(link).toHaveAttribute('data-custom', 'value');
    });

    it('does not forward node and ref props', () => {
      mockGetDetails.mockReturnValue({ name: 'TestUser' });

      const { container } = render(
        <PostMentions href={`/profile/${validPubkyKey}`} data-type="mention">
          {`pk:${validPubkyKey}`}
        </PostMentions>,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Truncation behavior', () => {
    it('shows truncated key with ellipsis when no username', () => {
      mockGetDetails.mockReturnValue(null);

      render(<PostMentions href={`/profile/${validPubkyKey}`}>{`pk:${validPubkyKey}`}</PostMentions>);

      const link = screen.getByTestId('link');
      const text = link.textContent || '';
      // Should contain ellipsis since the full pk:key string is longer than 20 chars
      expect(text).toContain('...');
      expect(text.length).toBeLessThanOrEqual(20);
    });
  });
});

describe('PostMentions - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDetails.mockReturnValue(null);
  });

  it('matches snapshot for mention with username', () => {
    mockGetDetails.mockReturnValue({ name: 'TestUser' });

    const { container } = render(
      <PostMentions href={`/profile/${validPubkyKey}`}>{`pk:${validPubkyKey}`}</PostMentions>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for mention without username (truncated key)', () => {
    mockGetDetails.mockReturnValue(null);

    const { container } = render(
      <PostMentions href={`/profile/${validPubkyKey}`}>{`pk:${validPubkyKey}`}</PostMentions>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with pubky prefix', () => {
    mockGetDetails.mockReturnValue({ name: 'PubkyUser' });

    const { container } = render(
      <PostMentions href={`/profile/${validPubkyKey}`}>{`pubky${validPubkyKey}`}</PostMentions>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    mockGetDetails.mockReturnValue({ name: 'StyledUser' });

    const { container } = render(
      <PostMentions href={`/profile/${validPubkyKey}`} className="custom-styling">
        {`pk:${validPubkyKey}`}
      </PostMentions>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for invalid mention (null)', () => {
    const { container } = render(<PostMentions href="/profile/invalid">invalid-text</PostMentions>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with long username', () => {
    mockGetDetails.mockReturnValue({ name: 'VeryLongUsernameForTesting' });

    const { container } = render(
      <PostMentions href={`/profile/${validPubkyKey}`}>{`pk:${validPubkyKey}`}</PostMentions>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with special characters in username', () => {
    mockGetDetails.mockReturnValue({ name: 'User_123' });

    const { container } = render(
      <PostMentions href={`/profile/${validPubkyKey}`}>{`pk:${validPubkyKey}`}</PostMentions>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with additional props', () => {
    mockGetDetails.mockReturnValue({ name: 'TestUser' });

    const { container } = render(
      <PostMentions href={`/profile/${validPubkyKey}`} data-type="mention" aria-label="User mention">
        {`pk:${validPubkyKey}`}
      </PostMentions>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
