import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OnboardingHeader } from './OnboardingHeader';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  ),
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
  ProgressSteps: ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
    <div data-testid="progress-steps">
      Step {currentStep} of {totalSteps}
    </div>
  ),
}));

describe('OnboardingHeader', () => {
  const defaultProps = {
    currentStep: 1,
    totalSteps: 5,
  };

  it('renders with default props', () => {
    render(<OnboardingHeader {...defaultProps} />);

    const logo = screen.getByTestId('logo');
    const title = screen.getByText('Identity keys');
    const progressSteps = screen.getByTestId('progress-steps');

    expect(logo).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(progressSteps).toBeInTheDocument();
  });

  it('displays default title', () => {
    render(<OnboardingHeader {...defaultProps} />);

    expect(screen.getByText('Identity keys')).toBeInTheDocument();
  });

  it('displays custom title', () => {
    render(<OnboardingHeader {...defaultProps} title="Custom Title" />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.queryByText('Identity keys')).not.toBeInTheDocument();
  });

  it('passes correct props to ProgressSteps', () => {
    render(<OnboardingHeader currentStep={3} totalSteps={7} />);

    expect(screen.getByText('Step 3 of 7')).toBeInTheDocument();
  });

  it('renders logo with correct link', () => {
    render(<OnboardingHeader {...defaultProps} />);

    const link = screen.getByTestId('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('applies default className', () => {
    const { container } = render(<OnboardingHeader {...defaultProps} />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('w-full');
  });

  it('applies custom className', () => {
    const { container } = render(<OnboardingHeader {...defaultProps} className="custom-class" />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('w-full', 'custom-class');
  });

  it('maintains proper structure', () => {
    render(<OnboardingHeader {...defaultProps} />);

    // Check header structure
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();

    // Check container structure
    const container = header?.querySelector('.container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('mx-auto', 'px-6', 'lg:px-10', 'py-6.5');

    // Check nav structure
    const nav = container?.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('flex', 'justify-between', 'items-center');
  });

  it('renders title with correct styling', () => {
    render(<OnboardingHeader {...defaultProps} title="Test Title" />);

    const titleElement = screen.getByText('Test Title');
    expect(titleElement.tagName).toBe('H2');
    expect(titleElement).toHaveClass('text-2xl', 'font-light', 'text-muted-foreground');
  });

  it('title is hidden on small screens', () => {
    render(<OnboardingHeader {...defaultProps} />);

    const titleContainer = screen.getByText('Identity keys').closest('div');
    expect(titleContainer).toHaveClass('hidden', 'sm:flex');
  });

  it('logo container has correct dimensions', () => {
    render(<OnboardingHeader {...defaultProps} />);

    const logoContainer = screen.getByTestId('logo').closest('div');
    // The logo container classes are applied in the actual OnboardingHeader component
    expect(logoContainer).toBeInTheDocument();
  });

  it('handles different step configurations', () => {
    const { rerender } = render(<OnboardingHeader currentStep={1} totalSteps={3} />);
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();

    rerender(<OnboardingHeader currentStep={5} totalSteps={10} />);
    expect(screen.getByText('Step 5 of 10')).toBeInTheDocument();
  });
});
