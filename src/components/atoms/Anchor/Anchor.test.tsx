import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Anchor } from './Anchor';

describe('Anchor', () => {
  it('renders with default props', () => {
    render(<Anchor href="https://example.com">Default Anchor</Anchor>);
    const anchor = screen.getByText('Default Anchor');
    expect(anchor).toBeInTheDocument();
  });

  it('renders with href attribute', () => {
    render(<Anchor href="https://example.com">Link</Anchor>);
    const anchor = screen.getByText('Link');
    expect(anchor).toHaveAttribute('href', 'https://example.com');
  });

  it('renders with target attribute', () => {
    render(
      <Anchor href="https://example.com" target="_blank">
        External Link
      </Anchor>,
    );
    const anchor = screen.getByText('External Link');
    expect(anchor).toHaveAttribute('target', '_blank');
  });

  it('renders with rel attribute', () => {
    render(
      <Anchor href="https://example.com" rel="noopener noreferrer">
        Secure Link
      </Anchor>,
    );
    const anchor = screen.getByText('Secure Link');
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders with custom className', () => {
    render(
      <Anchor href="https://example.com" className="custom-class">
        Styled Link
      </Anchor>,
    );
    const anchor = screen.getByText('Styled Link');
    expect(anchor).toHaveClass('custom-class');
  });
});

describe('Anchor - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(
      <Anchor href="https://example.com">
        <span>Default Anchor</span>
      </Anchor>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for HTTP link', () => {
    const { container } = render(
      <Anchor href="https://example.com">
        <span>HTTP Link</span>
      </Anchor>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for email link', () => {
    const { container } = render(
      <Anchor href="mailto:test@example.com">
        <span>Email Link</span>
      </Anchor>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for phone link', () => {
    const { container } = render(
      <Anchor href="tel:+1234567890">
        <span>Phone Link</span>
      </Anchor>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with target blank', () => {
    const { container } = render(
      <Anchor href="https://example.com" target="_blank">
        <span>External Link</span>
      </Anchor>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with rel attribute', () => {
    const { container } = render(
      <Anchor href="https://example.com" rel="noopener noreferrer">
        <span>Secure Link</span>
      </Anchor>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with text children', () => {
    const { container } = render(
      <Anchor href="https://example.com">
        <span>Text Link</span>
      </Anchor>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with SVG children', () => {
    const { container } = render(
      <Anchor href="https://example.com">
        <svg data-testid="svg-icon">
          <circle cx="50" cy="50" r="40" />
        </svg>
      </Anchor>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with image children', () => {
    const { container } = render(
      <Anchor href="https://example.com">
        <img src="/icon.png" alt="Icon" />
      </Anchor>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(
      <Anchor href="https://example.com" className="custom-class">
        <span>Custom Class Link</span>
      </Anchor>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with combined props', () => {
    const { container } = render(
      <Anchor href="https://example.com" target="_blank" rel="noopener noreferrer" className="custom-class">
        <span>Combined Props Link</span>
      </Anchor>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with download attribute', () => {
    const { container } = render(
      <Anchor href="/document.pdf" download>
        <span>Download Link</span>
      </Anchor>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
