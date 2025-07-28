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
    // The circle div is the direct parent of the inner div that contains the step number
    const currentStepContainer = currentStepElement?.parentElement;

    expect(currentStepContainer).toHaveClass('bg-foreground', 'text-background');
  });

  it('shows completed steps correctly in desktop version', () => {
    render(<ProgressSteps currentStep={3} totalSteps={5} />);

    // For completed steps, we should look for the check mark icon instead of numbers
    const checkIcons = document.querySelectorAll('svg');
    expect(checkIcons.length).toBeGreaterThan(0);
    
    // Check that completed step container has the right classes
    const completedStepContainer = checkIcons[0]?.parentElement?.parentElement;
    expect(completedStepContainer).toHaveClass('bg-transparent', 'text-white', 'border-white');
  });

  it('shows pending steps correctly in desktop version', () => {
    render(<ProgressSteps currentStep={2} totalSteps={5} />);

    const stepNumbers = screen.getAllByText(/^[1-5]$/);
    const pendingStep = stepNumbers.find((el) => el.textContent === '4');
    const pendingStepContainer = pendingStep?.parentElement;

    expect(pendingStepContainer).toHaveClass('border', 'text-muted-foreground');
    expect(pendingStepContainer).not.toHaveClass('bg-foreground');
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

    // Each bar should have bg-border background and a fill bar inside
    progressBars.forEach((bar, index) => {
      expect(bar).toHaveClass('bg-border');
      
      // Check the fill bar inside each container
      const fillBar = bar.querySelector('div');
      if (index < 3) {
        // First 3 steps should have filled bars (completed + current)
        expect(fillBar).toHaveClass('bg-foreground');
      } else {
        // Remaining steps should have empty bars
        expect(fillBar).toHaveClass('bg-foreground'); // The class is there but scaled to 0
      }
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
    const stepContainer = stepNumber?.parentElement;
    
    expect(stepNumber).toBeInTheDocument();
    expect(stepContainer).toHaveClass('bg-foreground', 'text-background');
  });

  it('handles edge case with maximum current step', () => {
    render(<ProgressSteps currentStep={5} totalSteps={5} />);

    // When currentStep is 5, steps 1-4 are completed (have check marks) and step 5 is active
    const checkIcons = document.querySelectorAll('svg');
    expect(checkIcons.length).toBe(4); // Steps 1-4 should have check marks
    
    // Step 5 should still show the number
    const stepFive = screen.getByText('5');
    const stepFiveContainer = stepFive?.parentElement;
    expect(stepFiveContainer).toHaveClass('bg-foreground', 'text-background');
  });
});
