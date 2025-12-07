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

describe('FollowersEmpty', () => {
  it('renders title', () => {
    render(<FollowersEmpty />);
    expect(screen.getByText(/Looking for followers?/i)).toBeInTheDocument();
  });
});

describe('FollowersEmpty - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<FollowersEmpty />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
