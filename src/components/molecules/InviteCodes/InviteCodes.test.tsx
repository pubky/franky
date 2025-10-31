import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InviteCodes } from './InviteCodes';

// Mock hooks
const mockCopyToClipboard = vi.fn();
vi.mock('@/hooks', async () => {
  const actual = await vi.importActual('@/hooks');
  return {
    ...actual,
    useCopyToClipboard: () => ({
      copyToClipboard: mockCopyToClipboard,
    }),
  };
});

// Mock atoms
vi.mock('@/atoms', async () => {
  const actual = await vi.importActual('@/atoms');
  return {
    ...actual,
    Heading: ({ level, children, className }: { level?: number; children: React.ReactNode; className?: string }) => (
      <h5 data-testid="heading" data-level={level} className={className}>
        {children}
      </h5>
    ),
    Typography: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <p data-testid="typography" className={className}>
        {children}
      </p>
    ),
    Badge: ({
      children,
      className,
      onClick,
      'data-testid': dataTestId,
    }: {
      children: React.ReactNode;
      className?: string;
      onClick?: () => void;
      'data-testid'?: string;
    }) => (
      <div data-testid={dataTestId || 'badge'} className={className} onClick={onClick}>
        {children}
      </div>
    ),
  };
});

describe('InviteCodes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with default invite codes', () => {
    render(<InviteCodes />);

    expect(screen.getByTestId('invite-codes')).toBeInTheDocument();
    expect(screen.getByText('Invite codes')).toBeInTheDocument();
    expect(screen.getByText('Use these codes to invite your friends to Pubky!')).toBeInTheDocument();
  });

  it('displays default invite codes when none provided', () => {
    render(<InviteCodes />);

    expect(screen.getByText('K8M5-3X9S-27PS')).toBeInTheDocument();
    expect(screen.getByText('X4RS-3G1K-56HS')).toBeInTheDocument();
    expect(screen.getByText('9PUM-2JNG-37ER')).toBeInTheDocument();
  });

  it('displays custom invite codes when provided', () => {
    const customCodes = ['CODE1-ABCD-1234', 'CODE2-EFGH-5678'];
    render(<InviteCodes inviteCodes={customCodes} />);

    expect(screen.getByText('CODE1-ABCD-1234')).toBeInTheDocument();
    expect(screen.getByText('CODE2-EFGH-5678')).toBeInTheDocument();
    expect(screen.queryByText('K8M5-3X9S-27PS')).not.toBeInTheDocument();
  });

  it('all codes have cursor-pointer and hover styles', () => {
    render(<InviteCodes />);

    const firstCode = screen.getByTestId('invite-code-0');
    const secondCode = screen.getByTestId('invite-code-1');
    const thirdCode = screen.getByTestId('invite-code-2');

    expect(firstCode).toHaveClass('cursor-pointer', 'hover:opacity-80', 'transition-opacity');
    expect(secondCode).toHaveClass('cursor-pointer', 'hover:opacity-80', 'transition-opacity');
    expect(thirdCode).toHaveClass('cursor-pointer', 'hover:opacity-80', 'transition-opacity');
  });

  it('calls copyToClipboard when a code is clicked', async () => {
    const user = userEvent.setup();
    render(<InviteCodes />);

    const firstCode = screen.getByTestId('invite-code-0');
    await user.click(firstCode);

    expect(mockCopyToClipboard).toHaveBeenCalledWith('K8M5-3X9S-27PS');
  });

  it('calls copyToClipboard with correct code for each badge', async () => {
    const user = userEvent.setup();
    render(<InviteCodes />);

    const secondCode = screen.getByTestId('invite-code-1');
    await user.click(secondCode);

    expect(mockCopyToClipboard).toHaveBeenCalledWith('X4RS-3G1K-56HS');
  });

  it('renders heading with correct props', () => {
    render(<InviteCodes />);

    const heading = screen.getByTestId('heading');
    expect(heading).toHaveAttribute('data-level', '5');
    expect(heading).toHaveClass('text-muted-foreground');
  });

  it('renders typography with correct props', () => {
    render(<InviteCodes />);

    const typography = screen.getByTestId('typography');
    expect(typography).toHaveClass('text-secondary-foreground');
    expect(typography).toHaveTextContent('Use these codes to invite your friends to Pubky!');
  });

  it('applies custom className when provided', () => {
    render(<InviteCodes className="custom-class" />);

    const container = screen.getByTestId('invite-codes');
    expect(container).toHaveClass('custom-class');
  });

  it('renders empty array without errors', () => {
    render(<InviteCodes inviteCodes={[]} />);

    // Should fall back to default codes
    expect(screen.getByText('K8M5-3X9S-27PS')).toBeInTheDocument();
  });
});
