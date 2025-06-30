import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stepper } from './stepper';

const mockSteps = [
  { id: 1, title: 'Step 1', description: 'First step' },
  { id: 2, title: 'Step 2', description: 'Second step' },
  { id: 3, title: 'Step 3', description: 'Third step' },
  { id: 4, title: 'Step 4', description: 'Fourth step' },
  { id: 5, title: 'Step 5', description: 'Fifth step' },
];

describe('Stepper', () => {
  it('should render all step titles', () => {
    render(<Stepper steps={mockSteps} currentStep={2} />);

    // Desktop view shows all steps, mobile only shows current step
    expect(screen.getAllByText('Step 1')).toHaveLength(1); // Desktop only (completed)
    expect(screen.getAllByText('Step 2')).toHaveLength(2); // Mobile (current) + Desktop
    expect(screen.getAllByText('Step 3')).toHaveLength(1); // Desktop only
    expect(screen.getAllByText('Step 4')).toHaveLength(1); // Desktop only
    expect(screen.getAllByText('Step 5')).toHaveLength(1); // Desktop only
  });

  it('should show correct progress on mobile view', () => {
    render(<Stepper steps={mockSteps} currentStep={2} />);

    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('should display current step title prominently on mobile', () => {
    render(<Stepper steps={mockSteps} currentStep={3} />);

    expect(screen.getAllByText('Step 3')).toHaveLength(2); // Mobile + Desktop
    // Descriptions are no longer displayed
    expect(screen.queryByText('Third step')).not.toBeInTheDocument();
  });

  it('should show step numbers for incomplete steps', () => {
    render(<Stepper steps={mockSteps} currentStep={2} />);

    // Step 3 and 4 should show numbers (not completed)
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should handle first step correctly', () => {
    render(<Stepper steps={mockSteps} currentStep={1} />);

    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('should handle last step correctly', () => {
    render(<Stepper steps={mockSteps} currentStep={5} />);

    expect(screen.getByText('Step 5 of 5')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Stepper steps={mockSteps} currentStep={1} className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should not display step descriptions', () => {
    render(<Stepper steps={mockSteps} currentStep={2} />);

    // Verify step titles are displayed
    expect(screen.getAllByText('Step 2')).toHaveLength(2); // Mobile + Desktop

    // Verify descriptions are NOT displayed
    expect(screen.queryByText('First step')).not.toBeInTheDocument();
    expect(screen.queryByText('Second step')).not.toBeInTheDocument();
    expect(screen.queryByText('Third step')).not.toBeInTheDocument();
    expect(screen.queryByText('Fourth step')).not.toBeInTheDocument();
    expect(screen.queryByText('Fifth step')).not.toBeInTheDocument();
  });
});
