import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FollowingEmpty } from './FollowingEmpty';

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
  UserRoundPlus: ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
    <svg data-testid="user-round-plus-icon" className={className} data-stroke-width={strokeWidth}>
      UserRoundPlus
    </svg>
  ),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img data-testid="background-image" src={src} alt={alt} className={className} />
  ),
}));

describe('FollowingEmpty', () => {
  it('renders title', () => {
    render(<FollowingEmpty />);
    expect(screen.getByText(/You are the algorithm/i)).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<FollowingEmpty />);
    expect(screen.getByText(/Following account is a simple way to curate your timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/Stay updated on the topics and people that interest you/i)).toBeInTheDocument();
  });

  it('renders UserRoundPlus icon', () => {
    render(<FollowingEmpty />);
    const icons = screen.getAllByTestId('user-round-plus-icon');
    expect(icons.length).toBeGreaterThan(0);
    // Check for the main icon (size-12)
    const mainIcon = icons.find((icon) => icon.getAttribute('class')?.includes('size-12'));
    expect(mainIcon).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<FollowingEmpty />);
    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBe(2);
    expect(screen.getByText(/Who to Follow/i)).toBeInTheDocument();
    expect(screen.getByText(/Popular Users/i)).toBeInTheDocument();
    expect(screen.getAllByTestId('user-round-plus-icon').length).toBeGreaterThan(1);
  });

  it('renders background image', () => {
    render(<FollowingEmpty />);
    const image = screen.getByTestId('background-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Following - Empty state');
  });
});

describe('FollowingEmpty - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<FollowingEmpty />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
