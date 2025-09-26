import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HomeserverHeader, HomeserverFooter, HomeserverNavigation } from './Homeserver';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  PageTitle: ({ children, size }: { children: React.ReactNode; size?: string }) => (
    <div data-testid="page-title" data-size={size}>
      {children}
    </div>
  ),
  DialogTerms: () => <span data-testid="dialog-terms">Terms of Service</span>,
  DialogPrivacy: () => <span data-testid="dialog-privacy">Privacy Policy</span>,
  DialogAge: () => <span data-testid="dialog-age">over 18 years old.</span>,
  ButtonsNavigation: ({
    className,
    onHandleBackButton,
    onHandleContinueButton,
    continueButtonDisabled,
    continueText,
  }: {
    className?: string;
    onHandleBackButton: () => void;
    onHandleContinueButton: () => void;
    continueButtonDisabled: boolean;
    continueText: string;
  }) => (
    <div data-testid="buttons-navigation" className={className}>
      <button data-testid="back-button" onClick={onHandleBackButton}>
        Back
      </button>
      <button data-testid="continue-button" onClick={onHandleContinueButton} disabled={continueButtonDisabled}>
        {continueText}
      </button>
    </div>
  ),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  PageHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="page-header">{children}</div>,
  PageSubtitle: ({ children }: { children: React.ReactNode }) => <div data-testid="page-subtitle">{children}</div>,
  FooterLinks: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="footer-links" className={className}>
      {children}
    </div>
  ),
}));

describe('Homeserver Components - Snapshots', () => {
  describe('HomeserverHeader - Snapshots', () => {
    it('matches snapshot for default HomeserverHeader', () => {
      const { container } = render(<HomeserverHeader />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('HomeserverFooter - Snapshots', () => {
    it('matches snapshot for default HomeserverFooter', () => {
      const { container } = render(<HomeserverFooter />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('HomeserverNavigation - Snapshots', () => {
    const defaultProps = {
      continueButtonDisabled: false,
      onHandleContinueButton: vi.fn(),
      continueText: 'Continue',
    };

    it('matches snapshot for default HomeserverNavigation', () => {
      const { container } = render(<HomeserverNavigation {...defaultProps} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for HomeserverNavigation with disabled continue button', () => {
      const { container } = render(<HomeserverNavigation {...defaultProps} continueButtonDisabled={true} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for HomeserverNavigation with custom continue text', () => {
      const { container } = render(<HomeserverNavigation {...defaultProps} continueText="Join Server" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
