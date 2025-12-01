import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FollowersEmpty } from './FollowersEmpty';

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Typography: ({ children, as, className }: { children: React.ReactNode; as?: string; className?: string }) => {
    const Tag = as || 'p';
    return (
      <Tag data-testid="typography" className={className}>
        {children}
      </Tag>
    );
  },
  Button: ({ children, className, variant }: { children: React.ReactNode; className?: string; variant?: string }) => (
    <button data-testid="button" className={className} data-variant={variant}>
      {children}
    </button>
  ),
  ButtonVariant: {
    DEFAULT: 'default',
    DESTRUCTIVE: 'destructive',
    OUTLINE: 'outline',
    SECONDARY: 'secondary',
    GHOST: 'ghost',
    BRAND: 'brand',
    LINK: 'link',
  },
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Plus: ({ className }: { className?: string }) => (
    <svg data-testid="plus-icon" className={className}>
      Plus
    </svg>
  ),
  UsersRound: ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
    <svg data-testid="users-round-icon" className={className} data-stroke-width={strokeWidth}>
      UsersRound
    </svg>
  ),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img data-testid="background-image" src={src} alt={alt} className={className} />
  ),
}));

describe('FollowersEmpty', () => {
  it('renders title', () => {
    render(<FollowersEmpty />);
    expect(screen.getByText(/Looking for followers?/i)).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<FollowersEmpty />);
    expect(screen.getByText(/When someone follows this account, their profile will appear here/i)).toBeInTheDocument();
    expect(screen.getByText(/Start posting and engaging with others to grow your followers!/i)).toBeInTheDocument();
  });

  it('renders UsersRound icon', () => {
    render(<FollowersEmpty />);
    expect(screen.getByTestId('users-round-icon')).toBeInTheDocument();
  });

  it('renders Create a Post button', () => {
    render(<FollowersEmpty />);
    const button = screen.getByTestId('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/Create a Post/i);
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });

  it('renders background image', () => {
    render(<FollowersEmpty />);
    const image = screen.getByTestId('background-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Followers - Empty state');
  });
});

describe('FollowersEmpty - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<FollowersEmpty />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
