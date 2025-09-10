import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FooterLinks } from './FooterLinks';

// Mock UI components
vi.mock('@/components/ui', () => ({
  Typography: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <p data-testid="typography" className={className} {...props}>
      {children}
    </p>
  ),
}));

describe('FooterLinks', () => {
  it('renders with default props', () => {
    render(<FooterLinks>Footer text</FooterLinks>);

    const typography = screen.getByTestId('typography');
    expect(typography).toBeInTheDocument();
    expect(typography).toHaveClass('text-muted-foreground', 'opacity-80', 'font-medium', 'text-sm', 'leading-light');
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<FooterLinks className="custom-footer">Footer content</FooterLinks>);

    const typography = screen.getByTestId('typography');
    expect(typography).toHaveClass('custom-footer');
  });

  it('renders children correctly', () => {
    render(
      <FooterLinks>
        <span>Copyright 2024</span> | <a href="/privacy">Privacy</a>
      </FooterLinks>,
    );

    expect(screen.getByText('Copyright 2024')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    render(
      <FooterLinks data-testid="custom-footer-links" id="footer-id">
        Footer
      </FooterLinks>,
    );

    const typography = screen.getByTestId('custom-footer-links');
    expect(typography).toHaveAttribute('id', 'footer-id');
  });

  it('renders without children', () => {
    render(<FooterLinks />);

    const typography = screen.getByTestId('typography');
    expect(typography).toBeInTheDocument();
    expect(typography).toBeEmptyDOMElement();
  });
});

describe('FooterLinks - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<FooterLinks>Footer text</FooterLinks>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different configurations', () => {
    const { container: defaultContainer } = render(<FooterLinks>Default footer</FooterLinks>);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customContainer } = render(<FooterLinks className="custom-footer">Custom footer</FooterLinks>);
    expect(customContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different children types', () => {
    const { container: textContainer } = render(<FooterLinks>Simple text</FooterLinks>);
    expect(textContainer.firstChild).toMatchSnapshot();

    const { container: complexContainer } = render(
      <FooterLinks>
        <span>Copyright 2024</span> | <a href="/privacy">Privacy</a>
      </FooterLinks>,
    );
    expect(complexContainer.firstChild).toMatchSnapshot();

    const { container: emptyContainer } = render(<FooterLinks />);
    expect(emptyContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for additional props', () => {
    const { container: withIdContainer } = render(<FooterLinks id="footer-id">Footer with ID</FooterLinks>);
    expect(withIdContainer.firstChild).toMatchSnapshot();

    const { container: withDataTestIdContainer } = render(
      <FooterLinks data-testid="custom-footer-links">Footer with test ID</FooterLinks>,
    );
    expect(withDataTestIdContainer.firstChild).toMatchSnapshot();
  });
});
