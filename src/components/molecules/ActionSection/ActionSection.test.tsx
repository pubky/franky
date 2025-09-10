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
  it('renders with default props', () => {
    render(<ActionSection />);

    const containers = screen.getAllByTestId('container');
    const mainContainer = containers[0]; // The outer container
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('gap-6');
  });

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

  it('renders actions with default secondary variant', () => {
    const mockAction = vi.fn();
    const actions = [{ label: 'Default Action', onClick: mockAction }];

    render(<ActionSection actions={actions} />);

    const button = screen.getByTestId('button-secondary');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Default Action');
  });

  it('applies custom className', () => {
    render(<ActionSection className="custom-actions" />);

    const containers = screen.getAllByTestId('container');
    const mainContainer = containers[0]; // The outer container
    expect(mainContainer).toHaveClass('custom-actions');
  });

  it('renders with custom children', () => {
    render(
      <ActionSection>
        <div data-testid="custom-content">Custom content</div>
      </ActionSection>,
    );

    const customContent = screen.getByTestId('custom-content');
    expect(customContent).toBeInTheDocument();
    expect(customContent).toHaveTextContent('Custom content');
  });

  it('renders actions with icons', () => {
    const mockAction = vi.fn();
    const actions = [
      {
        label: 'Action with Icon',
        icon: <span data-testid="action-icon">🚀</span>,
        onClick: mockAction,
      },
    ];

    render(<ActionSection actions={actions} />);

    const button = screen.getByTestId('button-secondary');
    const icon = screen.getByTestId('action-icon');

    expect(button).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(button).toHaveTextContent('Action with Icon');
  });
});

describe('ActionSection - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<ActionSection />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different configurations', () => {
    const { container: defaultContainer } = render(<ActionSection />);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customClassContainer } = render(<ActionSection className="custom-actions" />);
    expect(customClassContainer.firstChild).toMatchSnapshot();

    const { container: withChildrenContainer } = render(
      <ActionSection>
        <div>Custom content</div>
      </ActionSection>,
    );
    expect(withChildrenContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different action configurations', () => {
    const mockAction = vi.fn();

    const { container: singleActionContainer } = render(
      <ActionSection actions={[{ label: 'Single Action', onClick: mockAction }]} />,
    );
    expect(singleActionContainer.firstChild).toMatchSnapshot();

    const { container: multipleActionsContainer } = render(
      <ActionSection
        actions={[
          { label: 'Continue', onClick: mockAction, variant: 'default' as const },
          { label: 'Back', onClick: mockAction, variant: 'outline' as const },
        ]}
      />,
    );
    expect(multipleActionsContainer.firstChild).toMatchSnapshot();

    const { container: withIconContainer } = render(
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
    expect(withIconContainer.firstChild).toMatchSnapshot();
  });
});
