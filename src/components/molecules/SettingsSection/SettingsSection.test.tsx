import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsSection } from './SettingsSection';

// Mock Atoms
vi.mock('@/atoms', () => ({
  Heading: ({
    children,
    level,
    size,
    className,
  }: {
    children: React.ReactNode;
    level: number;
    size: string;
    className?: string;
  }) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    return (
      <Tag data-testid="heading" data-level={level} data-size={size} className={className}>
        {children}
      </Tag>
    );
  },
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <p data-testid="typography" data-size={size} className={className}>
      {children}
    </p>
  ),
  Button: ({
    children,
    id,
    variant,
    size,
    disabled,
    onClick,
  }: {
    children: React.ReactNode;
    id?: string;
    variant?: string;
    size?: string;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button data-testid="button" id={id} data-variant={variant} data-size={size} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock icon components
const MockIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg data-testid="mock-icon" data-size={size} className={className}>
    <title>Mock Icon</title>
  </svg>
);

const MockButtonIcon = ({ size }: { size?: number }) => (
  <svg data-testid="mock-button-icon" data-size={size}>
    <title>Mock Button Icon</title>
  </svg>
);

const defaultProps = {
  icon: MockIcon,
  title: 'Account Settings',
  description: 'Manage your account preferences and security settings.',
  buttonText: 'Edit Account',
  buttonIcon: MockButtonIcon,
  buttonId: 'edit-account-btn',
  buttonOnClick: vi.fn(),
};

describe('SettingsSection', () => {
  it('renders with default props', () => {
    render(<SettingsSection {...defaultProps} />);

    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    expect(screen.getByTestId('heading')).toHaveTextContent('Account Settings');
    expect(screen.getByTestId('typography')).toHaveTextContent(
      'Manage your account preferences and security settings.',
    );
    expect(screen.getByTestId('button')).toHaveTextContent('Edit Account');
    expect(screen.getByTestId('mock-button-icon')).toBeInTheDocument();
  });

  it('renders button as enabled by default', () => {
    render(<SettingsSection {...defaultProps} />);

    const button = screen.getByTestId('button');
    expect(button).not.toBeDisabled();
  });

  it('renders button as disabled when specified', () => {
    render(<SettingsSection {...defaultProps} buttonDisabled={true} />);

    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
  });

  it('calls buttonOnClick when button is clicked', () => {
    const handleClick = vi.fn();
    render(<SettingsSection {...defaultProps} buttonOnClick={handleClick} />);

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('SettingsSection - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<SettingsSection {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with destructive variant', () => {
    const { container } = render(<SettingsSection {...defaultProps} buttonVariant="destructive" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with disabled button', () => {
    const { container } = render(<SettingsSection {...defaultProps} buttonDisabled={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom classNames', () => {
    const { container } = render(
      <SettingsSection {...defaultProps} titleClassName="custom-title" iconClassName="custom-icon" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
