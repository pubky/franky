import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackupNavigation } from './BackupNavigation';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  ButtonsNavigation: ({
    onHandleBackButton,
    onHandleContinueButton,
    backText,
    continueText,
  }: {
    onHandleBackButton: () => void;
    onHandleContinueButton: () => void;
    backText: string;
    continueText: string;
  }) => (
    <div data-testid="buttons-navigation">
      <button data-testid="back-button" onClick={onHandleBackButton}>
        {backText}
      </button>
      <button data-testid="continue-button" onClick={onHandleContinueButton}>
        {continueText}
      </button>
    </div>
  ),
}));

// Mock console.log
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('BackupNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<BackupNavigation />);
    expect(screen.getByTestId('buttons-navigation')).toBeInTheDocument();
  });

  it('renders with correct button texts', () => {
    render(<BackupNavigation />);
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('handles back button click', () => {
    render(<BackupNavigation />);
    const backButton = screen.getByTestId('back-button');

    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/onboarding/pubky');
  });

  it('handles continue button click', () => {
    render(<BackupNavigation />);
    const continueButton = screen.getByTestId('continue-button');

    fireEvent.click(continueButton);

    expect(mockConsoleLog).toHaveBeenCalledWith('handleContinue');
  });

  it('passes correct props to ButtonsNavigation', () => {
    render(<BackupNavigation />);

    // Check that all expected elements are present
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
    expect(screen.getByTestId('continue-button')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });
});
