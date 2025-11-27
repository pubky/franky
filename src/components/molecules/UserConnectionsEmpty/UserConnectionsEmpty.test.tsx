import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserConnectionsEmpty } from './UserConnectionsEmpty';

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
  Button: ({
    children,
    className,
    variant,
    size,
    onClick,
  }: {
    children: React.ReactNode;
    className?: string;
    variant?: string;
    size?: string;
    onClick?: () => void;
  }) => (
    <button data-testid="button" className={className} data-variant={variant} data-size={size} onClick={onClick}>
      {children}
    </button>
  ),
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

describe('UserConnectionsEmpty', () => {
  it('renders title', () => {
    render(<UserConnectionsEmpty title="Test Title" description="Test description" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders string description', () => {
    render(<UserConnectionsEmpty title="Test Title" description="Test description" />);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders ReactNode description', () => {
    render(
      <UserConnectionsEmpty
        title="Test Title"
        description={
          <>
            <p>First paragraph</p>
            <p>Second paragraph</p>
          </>
        }
      />,
    );
    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
  });

  it('renders UserRoundPlus icon', () => {
    render(<UserConnectionsEmpty title="Test Title" description="Test description" />);
    expect(screen.getByTestId('user-round-plus-icon')).toBeInTheDocument();
  });

  it('renders background image', () => {
    render(<UserConnectionsEmpty title="Test Title" description="Test description" />);
    const image = screen.getByTestId('background-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Empty state');
  });

  it('does not render action buttons by default', () => {
    render(<UserConnectionsEmpty title="Test Title" description="Test description" />);
    const buttons = screen.queryAllByTestId('button');
    expect(buttons).toHaveLength(0);
  });

  it('renders action buttons when showActionButtons is true', () => {
    render(
      <UserConnectionsEmpty
        title="Test Title"
        description="Test description"
        showActionButtons={true}
        onWhoToFollow={vi.fn()}
        onPopularUsers={vi.fn()}
      />,
    );
    const buttons = screen.getAllByTestId('button');
    expect(buttons).toHaveLength(2);
    expect(screen.getByText('Who to Follow')).toBeInTheDocument();
    expect(screen.getByText('Popular Users')).toBeInTheDocument();
  });

  it('calls onWhoToFollow when button is clicked', () => {
    const onWhoToFollow = vi.fn();
    render(
      <UserConnectionsEmpty
        title="Test Title"
        description="Test description"
        showActionButtons={true}
        onWhoToFollow={onWhoToFollow}
        onPopularUsers={vi.fn()}
      />,
    );
    const button = screen.getByText('Who to Follow').closest('button');
    button?.click();
    expect(onWhoToFollow).toHaveBeenCalledTimes(1);
  });

  it('calls onPopularUsers when button is clicked', () => {
    const onPopularUsers = vi.fn();
    render(
      <UserConnectionsEmpty
        title="Test Title"
        description="Test description"
        showActionButtons={true}
        onWhoToFollow={vi.fn()}
        onPopularUsers={onPopularUsers}
      />,
    );
    const button = screen.getByText('Popular Users').closest('button');
    button?.click();
    expect(onPopularUsers).toHaveBeenCalledTimes(1);
  });
});

describe('UserConnectionsEmpty - Snapshots', () => {
  it('matches snapshot with string description', () => {
    const { container } = render(<UserConnectionsEmpty title="Test Title" description="Test description" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with ReactNode description', () => {
    const { container } = render(
      <UserConnectionsEmpty
        title="Test Title"
        description={
          <>
            <p>First paragraph</p>
            <p>Second paragraph</p>
          </>
        }
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with action buttons', () => {
    const { container } = render(
      <UserConnectionsEmpty
        title="Test Title"
        description="Test description"
        showActionButtons={true}
        onWhoToFollow={vi.fn()}
        onPopularUsers={vi.fn()}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without action buttons', () => {
    const { container } = render(<UserConnectionsEmpty title="Test Title" description="Test description" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
