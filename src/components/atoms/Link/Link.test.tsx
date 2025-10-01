import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Link } from './Link';

describe('Link', () => {
  it('renders with default props', () => {
    render(<Link href="https://example.com">Default Link</Link>);
    const link = screen.getByText('Default Link');
    expect(link).toBeInTheDocument();
  });
});

describe('Link - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(
      <Link href="https://example.com">
        <span>Default Link</span>
      </Link>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for default variant', () => {
    const { container } = render(
      <Link href="https://example.com" variant="default">
        <span>Default Variant</span>
      </Link>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for muted variant', () => {
    const { container } = render(
      <Link href="https://example.com" variant="muted">
        <span>Muted Variant</span>
      </Link>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for default size', () => {
    const { container } = render(
      <Link href="https://example.com" size="default">
        <span>Default Size</span>
      </Link>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for large size', () => {
    const { container } = render(
      <Link href="https://example.com" size="lg">
        <span>Large Size</span>
      </Link>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for extra large size', () => {
    const { container } = render(
      <Link href="https://example.com" size="xl">
        <span>Extra Large Size</span>
      </Link>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for HTTP link', () => {
    const { container } = render(
      <Link href="https://example.com">
        <span>HTTP Link</span>
      </Link>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for email link', () => {
    const { container } = render(
      <Link href="mailto:test@example.com">
        <span>Email Link</span>
      </Link>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for phone link', () => {
    const { container } = render(
      <Link href="tel:+1234567890">
        <span>Phone Link</span>
      </Link>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with text children', () => {
    const { container } = render(
      <Link href="https://example.com">
        <span>Text Link</span>
      </Link>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with SVG children', () => {
    const { container } = render(
      <Link href="https://example.com">
        <svg data-testid="svg-icon">
          <circle cx="50" cy="50" r="40" />
        </svg>
      </Link>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with image children', () => {
    const { container } = render(
      <Link href="https://example.com">
        <img src="/icon.png" alt="Icon" />
      </Link>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with combined props', () => {
    const { container } = render(
      <Link href="https://example.com" variant="muted" size="lg" className="custom-class">
        <span>Combined Props Link</span>
      </Link>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
