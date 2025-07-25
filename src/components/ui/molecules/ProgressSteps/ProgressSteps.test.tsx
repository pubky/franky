import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressSteps } from './ProgressSteps';

describe('ProgressSteps', () => {
  it('renders with default props', () => {
    render(<ProgressSteps currentStep={1} totalSteps={5} />);

    // Check that both desktop and mobile versions are rendered
    const desktopSteps = document.querySelector('.hidden.lg\\:flex');
    const mobileSteps = document.querySelector('.flex.lg\\:hidden');

    expect(desktopSteps).toBeInTheDocument();
    expect(mobileSteps).toBeInTheDocument();
  });

  it('highlights current step correctly in desktop version', () => {
    render(<ProgressSteps currentStep={2} totalSteps={5} />);

    const stepNumbers = screen.getAllByText(/^[1-5]$/);
    const currentStepElement = stepNumbers.find((el) => el.textContent === '2');

    expect(currentStepElement).toHaveClass('bg-foreground', 'text-background');
  });

  it('shows completed steps correctly in desktop version', () => {
    render(<ProgressSteps currentStep={3} totalSteps={5} />);

    const stepNumbers = screen.getAllByText(/^[1-5]$/);
    const completedStep = stepNumbers.find((el) => el.textContent === '1');

    expect(completedStep).toHaveClass('bg-foreground', 'text-background');
  });

  it('shows pending steps correctly in desktop version', () => {
    render(<ProgressSteps currentStep={2} totalSteps={5} />);

    const stepNumbers = screen.getAllByText(/^[1-5]$/);
    const pendingStep = stepNumbers.find((el) => el.textContent === '4');

    expect(pendingStep).toHaveClass('border', 'text-muted-foreground');
    expect(pendingStep).not.toHaveClass('bg-foreground');
  });

  it('renders correct number of steps', () => {
    render(<ProgressSteps currentStep={1} totalSteps={3} />);

    const stepNumbers = screen.getAllByText(/^[1-3]$/);
    expect(stepNumbers).toHaveLength(3);
  });

  it('renders mobile progress bars correctly', () => {
    render(<ProgressSteps currentStep={2} totalSteps={5} />);

    const mobileContainer = document.querySelector('.flex.lg\\:hidden');
    const progressBars = mobileContainer?.children;

    expect(progressBars).toHaveLength(5);
  });

  it('highlights current and completed steps in mobile version', () => {
    render(<ProgressSteps currentStep={3} totalSteps={5} />);

    const mobileContainer = document.querySelector('.flex.lg\\:hidden');
    const progressBars = Array.from(mobileContainer?.children || []);

    // First 3 steps should be highlighted (completed + current)
    progressBars.slice(0, 3).forEach((bar) => {
      expect(bar).toHaveClass('bg-foreground');
    });

    // Remaining steps should not be highlighted
    progressBars.slice(3).forEach((bar) => {
      expect(bar).toHaveClass('bg-border');
      expect(bar).not.toHaveClass('bg-foreground');
    });
  });

  it('applies custom className', () => {
    const { container } = render(<ProgressSteps currentStep={1} totalSteps={5} className="custom-class" />);

    const desktopContainer = container.querySelector('.hidden.lg\\:flex.custom-class');
    const mobileContainer = container.querySelector('.flex.lg\\:hidden.custom-class');

    expect(desktopContainer).toBeInTheDocument();
    expect(mobileContainer).toBeInTheDocument();
  });

  it('handles edge case with single step', () => {
    render(<ProgressSteps currentStep={1} totalSteps={1} />);

    const stepNumber = screen.getByText('1');
    expect(stepNumber).toBeInTheDocument();
    expect(stepNumber).toHaveClass('bg-foreground', 'text-background');
  });

  it('handles edge case with maximum current step', () => {
    render(<ProgressSteps currentStep={5} totalSteps={5} />);

    const stepNumbers = screen.getAllByText(/^[1-5]$/);

    // All steps should be highlighted (completed or current)
    stepNumbers.forEach((step) => {
      expect(step).toHaveClass('bg-foreground', 'text-background');
    });
  });
});
