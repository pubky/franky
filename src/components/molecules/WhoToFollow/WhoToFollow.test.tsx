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

// Mock the libs
vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  UserPlus: ({ className }: { className?: string }) => (
    <div data-testid="user-plus-icon" className={className}>
      UserPlus
    </div>
  ),
  Users: ({ className }: { className?: string }) => (
    <div data-testid="users-icon" className={className}>
      Users
    </div>
  ),
}));

describe('WhoToFollow', () => {
  it('renders with default props', () => {
    render(<WhoToFollow />);

    expect(screen.getByTestId('who-to-follow')).toBeInTheDocument();
    expect(screen.getByText('Who to follow')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<WhoToFollow className="custom-follow" />);

    const container = screen.getByTestId('who-to-follow');
    expect(container).toHaveClass('custom-follow');
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

  it('renders user avatars with correct props', () => {
    render(<WhoToFollow />);

    const avatars = screen.getAllByTestId('avatar');
    expect(avatars).toHaveLength(3);

    const avatarImages = screen.getAllByTestId('avatar-image');
    expect(avatarImages).toHaveLength(3);

    // Check avatar sources
    expect(avatarImages[0]).toHaveAttribute('src', 'https://i.pravatar.cc/150?img=1');
    expect(avatarImages[1]).toHaveAttribute('src', 'https://i.pravatar.cc/150?img=12');
    expect(avatarImages[2]).toHaveAttribute('src', 'https://i.pravatar.cc/150?img=5');

    // Check avatar alt texts
    expect(avatarImages[0]).toHaveAttribute('alt', 'Anna Pleb');
    expect(avatarImages[1]).toHaveAttribute('alt', 'Carl Smith');
    expect(avatarImages[2]).toHaveAttribute('alt', 'Mi Lei');
  });

  it('renders avatar fallbacks with correct initials', () => {
    render(<WhoToFollow />);

    const fallbacks = screen.getAllByTestId('avatar-fallback');
    expect(fallbacks).toHaveLength(3);

    expect(fallbacks[0]).toHaveTextContent('A');
    expect(fallbacks[1]).toHaveTextContent('C');
    expect(fallbacks[2]).toHaveTextContent('M');
  });

  it('renders follow buttons with correct styling', () => {
    render(<WhoToFollow />);

    const followButtons = screen.getAllByTestId('user-plus-icon');
    expect(followButtons).toHaveLength(3);

    followButtons.forEach((button) => {
      const buttonElement = button.closest('button');
      expect(buttonElement).toHaveClass(
        'flex',
        'h-10',
        'w-10',
        'items-center',
        'justify-center',
        'rounded-full',
        'bg-secondary/20',
        'hover:bg-secondary/30',
        'transition-colors',
      );
    });
  });

  it('renders See All button with correct styling', () => {
    render(<WhoToFollow />);

    const seeAllButton = screen.getByText('See all');
    expect(seeAllButton).toBeInTheDocument();
    expect(seeAllButton.closest('button')).toHaveClass(
      'flex',
      'items-center',
      'gap-2',
      'py-2',
      'px-4',
      'rounded-full',
      'border',
      'border-border',
      'hover:bg-secondary/10',
      'transition-colors',
    );
  });

  it('renders See All button with correct icon', () => {
    render(<WhoToFollow />);

    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByText('See all')).toBeInTheDocument();
  });

  it('applies correct container classes', () => {
    render(<WhoToFollow />);

    const container = screen.getByTestId('who-to-follow');
    expect(container).toHaveClass('flex', 'flex-col', 'gap-4');
  });

  it('applies correct heading classes', () => {
    render(<WhoToFollow />);

    const heading = screen.getByText('Who to follow');
    expect(heading).toHaveClass('text-2xl', 'font-light', 'text-muted-foreground');
  });

  it('applies correct user item classes', () => {
    render(<WhoToFollow />);

    const userItems = screen.getAllByText(/7SL4|327F|PL5Z/);
    expect(userItems).toHaveLength(3);

    userItems.forEach((item) => {
      const userContainer = item.closest('div');
      expect(userContainer).toHaveClass('flex', 'items-center', 'justify-between');
    });
  });

  it('applies correct avatar classes', () => {
    render(<WhoToFollow />);

    const avatars = screen.getAllByTestId('avatar');
    avatars.forEach((avatar) => {
      expect(avatar).toHaveClass('h-12', 'w-12');
    });
  });

  it('applies correct user info classes', () => {
    render(<WhoToFollow />);

    const userNames = screen.getAllByText(/Anna Pleb|Carl Smith|Mi Lei/);
    userNames.forEach((name) => {
      expect(name).toHaveClass('text-base', 'font-bold', 'text-foreground');
    });

    const userPubkys = screen.getAllByText(/7SL4|327F|PL5Z/);
    userPubkys.forEach((pubky) => {
      expect(pubky).toHaveClass('text-sm', 'text-muted-foreground', 'opacity-50');
    });
  });

  it('applies correct user info container classes', () => {
    render(<WhoToFollow />);

    const userInfoContainers = screen.getAllByText(/Anna Pleb|Carl Smith|Mi Lei/);
    userInfoContainers.forEach((name) => {
      const userInfo = name.closest('div');
      expect(userInfo).toHaveClass('flex', 'items-center', 'gap-3');
    });
  });

  it('applies correct user details classes', () => {
    render(<WhoToFollow />);

    const userDetails = screen.getAllByText(/Anna Pleb|Carl Smith|Mi Lei/);
    userDetails.forEach((name) => {
      const details = name.closest('div')?.nextElementSibling;
      expect(details).toHaveClass('flex', 'flex-col', 'gap-0.5');
    });
  });

  it('handles button hover states correctly', () => {
    render(<WhoToFollow />);

    const followButtons = screen.getAllByTestId('user-plus-icon');
    followButtons.forEach((button) => {
      const buttonElement = button.closest('button');
      expect(buttonElement).toHaveClass('hover:bg-secondary/30', 'transition-colors');
    });

    const seeAllButton = screen.getByText('See all').closest('button');
    expect(seeAllButton).toHaveClass('hover:bg-secondary/10', 'transition-colors');
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

    const followButtons = screen.getAllByTestId('user-plus-icon');
    expect(followButtons).toHaveLength(3);
  });

  it('applies correct icon classes', () => {
    render(<WhoToFollow />);

    const followIcons = screen.getAllByTestId('user-plus-icon');
    followIcons.forEach((icon) => {
      expect(icon).toHaveClass('h-5', 'w-5');
    });

    const seeAllIcon = screen.getByTestId('users-icon');
    expect(seeAllIcon).toHaveClass('h-4', 'w-4');
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

  it('matches snapshot for individual user items', () => {
    render(<WhoToFollow />);

    const userItems = screen.getAllByText(/Anna Pleb|Carl Smith|Mi Lei/);
    userItems.forEach((item) => {
      const userContainer = item.closest('div');
      expect(userContainer).toMatchSnapshot();
    });
  });

  it('matches snapshot for See All button', () => {
    render(<WhoToFollow />);

    const seeAllButton = screen.getByText('See all').closest('button');
    expect(seeAllButton).toMatchSnapshot();
  });
});
