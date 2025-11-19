import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeedbackCard } from './FeedbackCard';

// Mock the atoms
vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    'data-testid': dataTestId,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    'data-testid'?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid={dataTestId || 'container'} className={className} {...props}>
      {children}
    </div>
  ),
  Button: ({
    children,
    className,
    variant,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button data-testid="button" className={className} data-variant={variant} {...props}>
      {children}
    </button>
  ),
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => <img data-testid="avatar-image" src={src} alt={alt} />,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div data-testid="avatar-fallback">{children}</div>,
  Heading: ({
    children,
    level,
    size,
    className,
  }: {
    children: React.ReactNode;
    level?: number;
    size?: string;
    className?: string;
  }) => (
    <div data-testid="heading" data-level={level} data-size={size} className={className}>
      {children}
    </div>
  ),
}));

// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

describe('FeedbackCard', () => {
  it('renders with default props', () => {
    render(<FeedbackCard />);

    expect(screen.getByTestId('feedback-card')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });

  it('renders feedback heading correctly', () => {
    render(<FeedbackCard />);

    const heading = screen.getByText('Feedback');
    expect(heading).toHaveClass('font-light', 'text-muted-foreground');
  });

  it('renders user avatar with correct props', () => {
    render(<FeedbackCard />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('h-12', 'w-12');

    const avatarImage = screen.getByTestId('avatar-image');
    expect(avatarImage).toHaveAttribute('src', 'https://i.pravatar.cc/150?img=68');
    expect(avatarImage).toHaveAttribute('alt', 'User');
  });

  it('renders avatar fallback with user icon', () => {
    render(<FeedbackCard />);

    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toBeInTheDocument();

    expect(document.querySelector('.lucide-user')).toBeInTheDocument();
  });

  it('renders user name correctly', () => {
    render(<FeedbackCard />);

    const userName = screen.getByText('Your Name');
    expect(userName).toHaveClass('text-base', 'font-bold', 'text-foreground');
  });

  it('renders feedback question correctly as an unstyled button', () => {
    render(<FeedbackCard />);

    const button = screen.getByTestId('button');
    expect(button).toHaveTextContent('What do you think about Pubky?');
    expect(button).toHaveClass(
      'text-base',
      'leading-normal',
      'font-medium',
      'text-muted-foreground',
      'hover:text-foreground',
      'text-left',
    );
    expect(button).toHaveAttribute('data-variant', 'unstyled');
  });

  it('applies correct container classes', () => {
    render(<FeedbackCard />);

    const container = screen.getByTestId('feedback-card');
    expect(container).toHaveClass('flex', 'flex-col', 'gap-2');
  });

  it('applies correct feedback form classes', () => {
    render(<FeedbackCard />);

    const button = screen.getByTestId('button');
    const feedbackForm = button.parentElement;
    expect(feedbackForm).toHaveClass(
      'flex',
      'flex-col',
      'gap-4',
      'p-6',
      'rounded-lg',
      'border-dashed',
      'border',
      'border-input',
    );
  });

  it('applies correct user info classes', () => {
    render(<FeedbackCard />);

    const userInfo = screen.getByText('Your Name').closest('div')?.parentElement;
    expect(userInfo).toHaveClass('flex', 'items-center', 'gap-2');
  });

  it('renders with correct data structure', () => {
    render(<FeedbackCard />);

    // Verify all expected elements are present
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Your Name')).toBeInTheDocument();
    expect(screen.getByText('What do you think about Pubky?')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
  });

  it('handles hover states correctly', () => {
    render(<FeedbackCard />);

    const button = screen.getByTestId('button');
    expect(button).toHaveClass('hover:text-foreground');
  });

  it('applies correct spacing and layout', () => {
    render(<FeedbackCard />);

    const container = screen.getByTestId('feedback-card');
    expect(container).toHaveClass('gap-2');

    const button = screen.getByTestId('button');
    const feedbackForm = button.parentElement;
    expect(feedbackForm).toHaveClass('gap-4', 'p-6');
  });
});

describe('FeedbackCard - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<FeedbackCard />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for feedback form', () => {
    render(<FeedbackCard />);

    const button = screen.getByTestId('button');
    const feedbackForm = button.parentElement;
    expect(feedbackForm).toMatchSnapshot();
  });

  it('matches snapshot for user info section', () => {
    render(<FeedbackCard />);

    const userInfo = screen.getByText('Your Name').closest('div');
    expect(userInfo).toMatchSnapshot();
  });
});
