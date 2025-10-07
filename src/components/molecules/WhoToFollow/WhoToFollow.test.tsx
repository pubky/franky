import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WhoToFollow } from './WhoToFollow';

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

// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

describe('WhoToFollow', () => {
  it('renders with default props', () => {
    render(<WhoToFollow />);

    expect(screen.getByTestId('who-to-follow')).toBeInTheDocument();
    expect(screen.getByText('Who to follow')).toBeInTheDocument();
  });

  it('renders all user data correctly', () => {
    render(<WhoToFollow />);

    // Check that all users are rendered
    expect(screen.getByText('Anna Pleb')).toBeInTheDocument();
    expect(screen.getByText('Carl Smith')).toBeInTheDocument();
    expect(screen.getByText('Mi Lei')).toBeInTheDocument();

    // Check user pubkys
    expect(screen.getByText('7SL4...98V5')).toBeInTheDocument();
    expect(screen.getByText('327F...2YM4')).toBeInTheDocument();
    expect(screen.getByText('PL5Z...2JSL')).toBeInTheDocument();
  });

  it('renders See All button with correct icon', () => {
    render(<WhoToFollow />);

    expect(screen.getByText('See all')).toBeInTheDocument();
  });

  it('renders with correct data structure', () => {
    render(<WhoToFollow />);

    // Verify the structure matches the expected mock data
    const users = [
      { name: 'Anna Pleb', pubky: '7SL4...98V5' },
      { name: 'Carl Smith', pubky: '327F...2YM4' },
      { name: 'Mi Lei', pubky: 'PL5Z...2JSL' },
    ];

    users.forEach((user) => {
      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.pubky)).toBeInTheDocument();
    });
  });

  it('renders correct number of follow buttons', () => {
    render(<WhoToFollow />);

    const followButtons = document.querySelectorAll('.lucide-user-plus');
    expect(followButtons).toHaveLength(3);
  });
});

describe('WhoToFollow - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<WhoToFollow />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<WhoToFollow className="custom-follow" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
