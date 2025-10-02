import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeedbackCard } from './FeedbackCard';

// Mock the atoms
vi.mock('@/atoms', () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => <img data-testid="avatar-image" src={src} alt={alt} />,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div data-testid="avatar-fallback">{children}</div>,
}));

// Mock the libs
vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  User: ({ className }: { className?: string }) => (
    <div data-testid="user-icon" className={className}>
      User
    </div>
  ),
}));

describe('FeedbackCard', () => {
  it('renders with default props', () => {
    render(<FeedbackCard />);

    expect(screen.getByTestId('feedback-card')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<FeedbackCard className="custom-feedback" />);

    const container = screen.getByTestId('feedback-card');
    expect(container).toHaveClass('custom-feedback');
  });

  it('renders feedback heading correctly', () => {
    render(<FeedbackCard />);

    const heading = screen.getByText('Feedback');
    expect(heading).toHaveClass('text-2xl', 'font-light', 'text-muted-foreground');
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

    const userIcon = screen.getByTestId('user-icon');
    expect(userIcon).toHaveClass('w-5', 'h-5');
  });

  it('renders user name correctly', () => {
    render(<FeedbackCard />);

    const userName = screen.getByText('Your Name');
    expect(userName).toHaveClass('text-base', 'font-bold', 'text-foreground');
  });

  it('renders feedback question correctly', () => {
    render(<FeedbackCard />);

    const question = screen.getByText('What do you think about Pubky?');
    expect(question).toHaveClass(
      'text-sm',
      'text-muted-foreground',
      'cursor-pointer',
      'hover:text-foreground',
      'transition-colors',
      'leading-snug',
    );
  });

  it('applies correct container classes', () => {
    render(<FeedbackCard />);

    const container = screen.getByTestId('feedback-card');
    expect(container).toHaveClass('flex', 'flex-col', 'gap-4');
  });

  it('applies correct feedback form classes', () => {
    render(<FeedbackCard />);

    const feedbackForm = screen.getByText('What do you think about Pubky?').closest('div')?.parentElement;
    expect(feedbackForm).toHaveClass(
      'flex',
      'flex-col',
      'gap-3',
      'p-5',
      'rounded-lg',
      'border-dashed',
      'border',
      'border-border/50',
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

    const question = screen.getByText('What do you think about Pubky?');
    expect(question).toHaveClass('hover:text-foreground', 'transition-colors');
  });

  it('applies correct spacing and layout', () => {
    render(<FeedbackCard />);

    const container = screen.getByTestId('feedback-card');
    expect(container).toHaveClass('gap-4');

    const feedbackForm = screen.getByText('What do you think about Pubky?').closest('div')?.parentElement;
    expect(feedbackForm).toHaveClass('gap-3', 'p-5');
  });
});

describe('FeedbackCard - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<FeedbackCard />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<FeedbackCard className="custom-feedback" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for feedback form', () => {
    render(<FeedbackCard />);

    const feedbackForm = screen.getByText('What do you think about Pubky?').closest('div');
    expect(feedbackForm).toMatchSnapshot();
  });

  it('matches snapshot for user info section', () => {
    render(<FeedbackCard />);

    const userInfo = screen.getByText('Your Name').closest('div');
    expect(userInfo).toMatchSnapshot();
  });
});
