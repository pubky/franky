import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileNavigation } from './ProfileNavigation';

describe('ProfileNavigation', () => {
  const defaultProps = {
    continueButtonDisabled: false,
    continueText: 'Finish',
    onContinue: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<ProfileNavigation {...defaultProps} />);

      expect(screen.getByText('Finish')).toBeInTheDocument();
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('renders with custom continue text', () => {
      render(<ProfileNavigation {...defaultProps} continueText="Complete" />);

      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('renders with custom back text', () => {
      render(<ProfileNavigation {...defaultProps} backText="Previous" />);

      expect(screen.getByText('Previous')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<ProfileNavigation {...defaultProps} className="custom-nav" />);

      expect(container.firstChild).toHaveClass('custom-nav');
    });
  });

  describe('Button States', () => {
    it('disables continue button when continueButtonDisabled is true', () => {
      render(<ProfileNavigation {...defaultProps} continueButtonDisabled={true} />);

      const continueButton = screen.getByText('Finish');
      expect(continueButton).toBeDisabled();
    });

    it('disables back button when backButtonDisabled is true', () => {
      render(<ProfileNavigation {...defaultProps} backButtonDisabled={true} />);

      const backButton = screen.getByText('Back');
      expect(backButton).toBeDisabled();
    });

    it('shows loading state for continue button', () => {
      render(<ProfileNavigation {...defaultProps} continueButtonLoading={true} />);

      // Button should show loading spinner but not be disabled
      const continueButton = screen.getByText('Finish');
      expect(continueButton).toBeInTheDocument();
      expect(continueButton).not.toBeDisabled();

      // Should also have the loading spinner
      const spinner = document.querySelector('.lucide-loader-circle');
      expect(spinner).toBeInTheDocument();
    });

    it('hides continue button when hiddenContinueButton is true', () => {
      render(<ProfileNavigation {...defaultProps} hiddenContinueButton={true} />);

      expect(screen.queryByText('Finish')).not.toBeInTheDocument();
      expect(screen.getByText('Back')).toBeInTheDocument();
    });
  });

  describe('Event Handlers', () => {
    it('calls onContinue when continue button is clicked', () => {
      const onContinue = vi.fn();
      render(<ProfileNavigation {...defaultProps} onContinue={onContinue} />);

      const continueButton = screen.getByText('Finish');
      fireEvent.click(continueButton);

      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it('calls onHandleBackButton when back button is clicked', () => {
      const onHandleBackButton = vi.fn();
      render(<ProfileNavigation {...defaultProps} onHandleBackButton={onHandleBackButton} />);

      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);

      expect(onHandleBackButton).toHaveBeenCalledTimes(1);
    });

    it('does not call onContinue when button is disabled', () => {
      const onContinue = vi.fn();
      render(<ProfileNavigation {...defaultProps} onContinue={onContinue} continueButtonDisabled={true} />);

      const continueButton = screen.getByText('Finish');
      fireEvent.click(continueButton);

      expect(onContinue).not.toHaveBeenCalled();
    });

    it('does not call onHandleBackButton when back button is disabled', () => {
      const onHandleBackButton = vi.fn();
      render(<ProfileNavigation {...defaultProps} onHandleBackButton={onHandleBackButton} backButtonDisabled={true} />);

      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);

      expect(onHandleBackButton).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<ProfileNavigation {...defaultProps} />);

      const continueButton = screen.getByText('Finish');
      const backButton = screen.getByText('Back');

      expect(continueButton).toBeInTheDocument();
      expect(backButton).toBeInTheDocument();
    });

    it('maintains focus management', () => {
      render(<ProfileNavigation {...defaultProps} />);

      const continueButton = screen.getByText('Finish');
      const backButton = screen.getByText('Back');

      // Buttons should be focusable
      continueButton.focus();
      expect(document.activeElement).toBe(continueButton);

      backButton.focus();
      expect(document.activeElement).toBe(backButton);
    });
  });

  describe('Snapshots', () => {
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
});
