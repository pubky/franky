import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ProfileNavigation } from './Profile';

// Mock libs
// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Button: ({
    children,
    variant,
    size,
    className,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button
      data-testid={`button-${variant || 'default'}`}
      data-size={size}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

describe('ProfileNavigation - Snapshots', () => {
  const defaultProps = {
    continueButtonDisabled: false,
    continueText: 'Finish',
    onContinue: vi.fn(),
  };

  it('matches snapshot for default ProfileNavigation', () => {
    const { container } = render(<ProfileNavigation {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for ProfileNavigation with different configurations', () => {
    const { container } = render(
      <ProfileNavigation
        {...defaultProps}
        continueText="Complete"
        backText="Previous"
        className="custom-nav"
        onHandleBackButton={vi.fn()}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for ProfileNavigation with disabled states', () => {
    const { container } = render(
      <ProfileNavigation {...defaultProps} continueButtonDisabled={true} backButtonDisabled={true} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for ProfileNavigation with loading state', () => {
    const { container } = render(<ProfileNavigation {...defaultProps} continueButtonLoading={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for ProfileNavigation with hidden continue button', () => {
    const { container } = render(<ProfileNavigation {...defaultProps} hiddenContinueButton={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
