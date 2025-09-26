import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActionSection } from './ActionSection';

// Mock UI components
vi.mock('@/components/ui', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Button: ({
    children,
    variant,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
    onClick?: () => void;
  }) => (
    <button data-testid={`button-${variant || 'default'}`} className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('ActionSection', () => {
  it('renders with actions', () => {
    const mockAction = vi.fn();
    const actions = [
      { label: 'Continue', onClick: mockAction, variant: 'default' as const },
      { label: 'Back', onClick: mockAction, variant: 'outline' as const },
    ];

    render(<ActionSection actions={actions} />);

    const continueButton = screen.getByTestId('button-default');
    const backButton = screen.getByTestId('button-outline');

    expect(continueButton).toBeInTheDocument();
    expect(continueButton).toHaveTextContent('Continue');
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveTextContent('Back');
  });
});

describe('ActionSection - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<ActionSection />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<ActionSection className="custom-actions" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with children', () => {
    const { container } = render(
      <ActionSection>
        <div>Custom content</div>
      </ActionSection>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with single action', () => {
    const mockAction = vi.fn();

    const { container } = render(<ActionSection actions={[{ label: 'Single Action', onClick: mockAction }]} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with multiple actions', () => {
    const mockAction = vi.fn();

    const { container } = render(
      <ActionSection
        actions={[
          { label: 'Continue', onClick: mockAction, variant: 'default' as const },
          { label: 'Back', onClick: mockAction, variant: 'outline' as const },
        ]}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with action containing icon', () => {
    const mockAction = vi.fn();

    const { container } = render(
      <ActionSection
        actions={[
          {
            label: 'Action with Icon',
            icon: <span>🚀</span>,
            onClick: mockAction,
          },
        ]}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
